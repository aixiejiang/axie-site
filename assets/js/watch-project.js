/* =============================================================
   首页「观看作品」→ 内页（关于我们）带声播放

   链路：
     首页某屏的按钮 href="about.html?play=vNN"
        → 跳到 about.html
        → 本脚本读到 ?play=vNN，立刻把该片以**有声**方式全屏弹出
        → 弹层里包含：品牌广告项目介绍（客户 / 片名 / 类目 / 年份 /
          规格 / 导演 / 简介）+ 一枚「后退」按键
        → 点「后退」：关掉视频、留在 about.html（并把 URL 上的 ?play 抹掉）

   为什么自己做一个弹层，而不是复用 player.js 的 SLPlayer？
     SLPlayer 是「从当前页面的某个画面生长出来」的 FLIP 播放器，
     进场依赖 originEl（源画面）的矩形；跨页跳转后没有源画面可用。
     这里的需求是「落地即播 + 项目介绍 + 后退」，所以单独做一层。

   有声播放的兜底（重要）：
     跨页跳转会**丢掉用户手势**，Chrome 可能拒绝带声自动播放。
     处理顺序：
       1. 先 muted=false 直接 play()
       2. 被拒 → muted=true 起播（画面照常动），并在中央显示「开启声音」
       3. 之后页面上任意一次点击 / 按键 → 自动解除静音（一次性监听）
     这样最差也只是"点一下才出声"，不会出现黑屏卡死。
   ============================================================= */

window.SLWatchProject = (function () {
  var D = window.SL_DATA || {};
  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function T(k, f) {
    return window.SLi18n ? window.SLi18n.t(k, f) : f || k;
  }
  function lang() {
    return window.SLi18n ? window.SLi18n.lang() : "zh";
  }
  /* 页面上已有的 <symbol>：play / pause / sound-on / sound-off / close。
     注意 window.SLicon 在全站其实没定义（player.js 里只是"有就用"），
     所以这里自己拼，别指望它。 */
  function icon(name) {
    return '<svg class="wp-ic" aria-hidden="true"><use href="#' + name + '"></use></svg>';
  }
  /* 后退键用一支朝左的箭头（#arrow 是斜向右上，旋转也对不上） */
  var BACK_ARROW =
    '<svg class="wp-ic" aria-hidden="true" viewBox="0 0 24 24">' +
      '<path d="M20 12H4M4 12l6-6M4 12l6 6" stroke="currentColor" stroke-width="2.2" fill="none" ' +
        'stroke-linecap="round" stroke-linejoin="round"></path>' +
    "</svg>";

  var overlay = null;
  var videoEl = null;
  var isOpen = false;
  var current = null;      /* 当前这部片的数据 */
  var unmuteBound = false;

  /* ---------- 建 DOM ---------- */
  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "wp-modal js-wp-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", T("project.film", "项目影片"));
    overlay.innerHTML =
      '<div class="wp-backdrop js-wp-backdrop"></div>' +
      '<div class="wp-stage js-wp-stage">' +
        '<button class="wp-back js-wp-back" type="button">' +
          '<span class="wp-back-icon">' + BACK_ARROW + "</span>" +
          '<span class="wp-back-label js-wp-back-label">' + T("btn.back", "后退") + "</span>" +
        "</button>" +
        '<div class="wp-body">' +
          '<div class="wp-frame js-wp-frame">' +
            '<video class="wp-video js-wp-video" playsinline webkit-playsinline preload="auto"></video>' +
            '<button class="wp-bigplay js-wp-bigplay" type="button">' +
              '<span class="wp-bigplay-icon js-wp-bigplay-icon"></span>' +
              '<span class="wp-bigplay-hint js-wp-hint"></span>' +
            "</button>" +
          "</div>" +
          '<div class="wp-info">' +
            '<div class="wp-info-head">' +
              '<span class="wp-cat js-wp-cat type-label"></span>' +
              '<h2 class="wp-title js-wp-title"></h2>' +
              '<p class="wp-client js-wp-client"></p>' +
            "</div>" +
            '<div class="wp-section-label">' + T("project.about", "项目介绍") + "</div>" +
            '<p class="wp-blurb js-wp-blurb type-sm"></p>' +
            '<dl class="wp-credits">' +
              "<div><dt>" + T("project.director", "导演") + '</dt><dd class="js-wp-director"></dd></div>' +
              "<div><dt>" + T("project.format", "规格") + '</dt><dd class="js-wp-format"></dd></div>' +
              "<div><dt>" + T("project.year", "年份") + '</dt><dd class="js-wp-year"></dd></div>' +
            "</dl>" +
          "</div>" +
        "</div>" +
        '<div class="wp-controls">' +
          '<button class="wp-btn js-wp-toggle" type="button" aria-label="Play">' +
            '<span class="js-wp-toggle-icon"></span>' +
          "</button>" +
          '<div class="wp-scrub js-wp-scrub" role="slider" aria-label="Seek" tabindex="0">' +
            '<span class="wp-scrub-fill js-wp-scrub-fill"></span>' +
          "</div>" +
          '<button class="wp-btn js-wp-sound" type="button">' +
            '<span class="js-wp-sound-icon"></span>' +
          "</button>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    videoEl = overlay.querySelector(".js-wp-video");

    /* ---- 关闭入口：后退键 / 点遮罩 / ESC ---- */
    overlay.querySelector(".js-wp-back").addEventListener("click", function () { close(); });
    overlay.querySelector(".js-wp-backdrop").addEventListener("click", function () { close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        e.preventDefault();
        close();
      }
    }, true);

    /* ---- 播放 / 暂停 ---- */
    function toggle() {
      if (!videoEl) return;
      if (videoEl.paused) tryPlay(false);
      else videoEl.pause();
    }
    overlay.querySelector(".js-wp-toggle").addEventListener("click", toggle);
    overlay.querySelector(".js-wp-bigplay").addEventListener("click", function () {
      /* 中央大键：既是「重播」也是「解除静音」的入口 */
      if (videoEl && videoEl.ended) videoEl.currentTime = 0;
      tryPlay(true);
    });
    if (videoEl) videoEl.addEventListener("click", toggle);

    videoEl.addEventListener("play", function () {
      overlay.classList.remove("is-paused");
      paintIcons();
    });
    videoEl.addEventListener("pause", function () {
      if (!videoEl.ended) overlay.classList.add("is-paused");
      paintIcons();
    });
    videoEl.addEventListener("ended", function () {
      overlay.classList.add("is-paused");
      paintIcons();
    });

    /* ---- 声音开关 ---- */
    overlay.querySelector(".js-wp-sound").addEventListener("click", function () {
      if (!videoEl) return;
      videoEl.muted = !videoEl.muted;
      if (!videoEl.muted) {
        try { videoEl.volume = 1; } catch (e) {}
        bindUnmute(false);
      }
      paintIcons();
    });

    /* ---- 进度条 ---- */
    var scrub = overlay.querySelector(".js-wp-scrub");
    var fill = overlay.querySelector(".js-wp-scrub-fill");
    var dragging = false;
    function seek(e) {
      var r = scrub.getBoundingClientRect();
      if (!r.width) return;
      var ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (isFinite(videoEl.duration) && videoEl.duration > 0) {
        try { videoEl.currentTime = ratio * videoEl.duration; } catch (e) {}
      }
      if (fill) fill.style.width = (ratio * 100).toFixed(2) + "%";
    }
    scrub.addEventListener("pointerdown", function (e) {
      dragging = true;
      try { scrub.setPointerCapture(e.pointerId); } catch (e2) {}
      seek(e);
    });
    scrub.addEventListener("pointermove", function (e) { if (dragging) seek(e); });
    scrub.addEventListener("pointerup", function () { dragging = false; });
    scrub.addEventListener("pointercancel", function () { dragging = false; });

    videoEl.addEventListener("timeupdate", function () {
      if (!fill) return;
      var d = videoEl.duration;
      if (!isFinite(d) || d <= 0) return;
      fill.style.width = Math.min(100, (videoEl.currentTime / d) * 100).toFixed(2) + "%";
    });

    paintIcons();
  }

  /* 图标 / 状态文案随播放与静音状态刷新 */
  function paintIcons() {
    if (!overlay || !videoEl) return;
    var playing = videoEl && !videoEl.paused && !videoEl.ended;

    var ti = overlay.querySelector(".js-wp-toggle-icon");
    if (ti) ti.innerHTML = icon(playing ? "pause" : "play");
    var bi = overlay.querySelector(".js-wp-bigplay-icon");
    if (bi) bi.innerHTML = icon(playing ? "pause" : "play");
    var si = overlay.querySelector(".js-wp-sound-icon");
    if (si) si.innerHTML = icon(videoEl.muted || !videoEl.volume ? "sound-off" : "sound-on");

    var tb = overlay.querySelector(".js-wp-toggle");
    if (tb) tb.setAttribute("aria-label", playing ? "Pause" : "Play");
    var sb = overlay.querySelector(".js-wp-sound");
    if (sb) sb.setAttribute("aria-label", videoEl.muted ? T("sound.turnOn", "打开声音") : T("sound.turnOff", "关闭声音"));

    overlay.classList.toggle("is-playing", !!playing);
    overlay.classList.toggle("is-muted", !!videoEl.muted);

    /* 静音时才提示「点击开启声音」 */
    var hint = overlay.querySelector(".js-wp-hint");
    if (hint) hint.textContent = videoEl.muted ? T("sound.turnOn", "打开声音") : "";
  }

  /* ---------- 播放（带兜底） ---------- */
  function tryPlay(forceUnmute) {
    if (!videoEl) return;
    if (forceUnmute) {
      videoEl.muted = false;
      try { videoEl.volume = 1; } catch (e) {}
    }
    var p = videoEl.play();
    if (p && p.catch) {
      p.catch(function () {
        /* 被自动播放策略拦了：退回静音起播，等下一次手势再解除 */
        videoEl.muted = true;
        var p2 = videoEl.play();
        if (p2 && p2.catch) p2.catch(function () {});
        bindUnmute(true);
        paintIcons();
      });
    }
    paintIcons();
  }

  /* 一次性：页面上任意手势 → 解除静音（跨页跳转丢了手势时的兜底） */
  function bindUnmute(on) {
    if (on) {
      if (unmuteBound) return;
      unmuteBound = true;
      document.addEventListener("click", onFirstGesture, true);
      document.addEventListener("keydown", onFirstGesture, true);
      document.addEventListener("touchstart", onFirstGesture, true);
    } else {
      if (!unmuteBound) return;
      unmuteBound = false;
      document.removeEventListener("click", onFirstGesture, true);
      document.removeEventListener("keydown", onFirstGesture, true);
      document.removeEventListener("touchstart", onFirstGesture, true);
    }
  }

  function onFirstGesture() {
    if (!isOpen || !videoEl) return;
    videoEl.muted = false;
    try { videoEl.volume = 1; } catch (e) {}
    bindUnmute(false);
    paintIcons();
  }

  /* ---------- 打开 ---------- */
  function open(film) {
    if (!film) return;
    build();
    if (isOpen) close(true);

    current = film;
    var L = lang();

    overlay.querySelector(".js-wp-cat").textContent = film.category || "";
    overlay.querySelector(".js-wp-title").textContent = film.title || "";
    overlay.querySelector(".js-wp-client").textContent = film.client || "";
    overlay.querySelector(".js-wp-director").textContent = film.director || "—";
    overlay.querySelector(".js-wp-format").textContent = film.format || "—";
    overlay.querySelector(".js-wp-year").textContent = film.year || "—";

    var blurb = film.blurb;
    overlay.querySelector(".js-wp-blurb").textContent =
      blurb ? (blurb[L] !== undefined ? blurb[L] : blurb.zh || blurb.en || "") : "";

    videoEl.src = film.src || "";
    videoEl.loop = false;
    videoEl.muted = false;                     /* 需求：带声音 */
    try { videoEl.volume = 1; } catch (e) {}
    overlay.classList.remove("is-paused");

    document.documentElement.classList.add("is-video-open");
    overlay.classList.add("is-open");
    isOpen = true;

    tryPlay(false);

    var back = overlay.querySelector(".js-wp-back");
    if (back) back.focus({ preventScroll: true });
  }

  /* ---------- 关闭：停播 + 卸载视频 + 留在当前页 ---------- */
  function close(silent) {
    if (!isOpen || !overlay) return;
    isOpen = false;

    if (videoEl) {
      try { videoEl.pause(); } catch (e) {}
      videoEl.removeAttribute("src");
      try { videoEl.load(); } catch (e) {}
    }
    bindUnmute(false);
    overlay.classList.remove("is-open", "is-paused", "is-playing");
    document.documentElement.classList.remove("is-video-open");
    current = null;

    if (!silent) {
      /* 抹掉 URL 上的 ?play=…，刷新 / 复制链接都不会再自动弹一次 */
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState({}, "", window.location.pathname + (window.location.hash || ""));
        } catch (e) {}
      }
    }
  }

  /* ---------- 换语言时重刷文案 ---------- */
  if (window.SLi18n) {
    window.SLi18n.onChange(function () {
      if (!overlay) return;
      var bl = overlay.querySelector(".js-wp-back-label");
      if (bl) bl.textContent = T("btn.back", "后退");
      if (current) {
        var L = lang();
        var b = current.blurb;
        var node = overlay.querySelector(".js-wp-blurb");
        if (node && b) node.textContent = b[L] !== undefined ? b[L] : b.zh || b.en || "";
      }
      paintIcons();
    });
  }

  /* ---------- 落地即播：读 ?play=vNN ---------- */
  function boot() {
    var m = /[?&]play=([^&#]+)/.exec(window.location.search || "");
    if (!m) return null;
    var key = decodeURIComponent(m[1]);
    var films = D.homeFilms || {};
    var film = films[key];
    if (!film) {
      /* 兜底：只给了文件名（如 v21）也能播，只是没有项目介绍文案 */
      if (/^v\d{2}$/.test(key)) {
        film = { src: "assets/media/videos/" + key + ".mp4", title: key, client: "", category: "", year: "", format: "", director: "", blurb: null };
      } else {
        return null;
      }
    }
    open(film);
    return film;
  }

  /* DOM 就绪后再开：要等 body 存在，也要等 i18n 装好（否则文案是英文） */
  function start() {
    try { boot(); } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  return {
    open: open,
    close: close,
    isOpen: function () { return isOpen; },
    boot: boot
  };
})();
