/* =============================================================
   全屏视频播放器（SLPlayer）
   需求：
     1. 每个视频点击进去都能正常播放并且有声音
     2. 可以自由退出（ESC / 关闭按钮 / 点空白 / 播完自动退）
     3. 每个视频播放期间互不影响（独立 <video> 实例，退出即释放）
     4. 点击视频时「丝滑弹出和退出」

   丝滑的做法 = FLIP（First-Last-Invert-Play）：
     先量出被点击背景画面在屏幕上的位置/尺寸（First），
     再量出播放器舞台的最终位置/尺寸（Last），
     用 transform 把舞台"倒推"回原来画面的大小放在原位（Invert），
     最后动画到 transform:none（Play）。
     视觉上就是视频从被点的地方长出来、缩回去，
     而不是简单地淡入一个居中的盒子。

   对外接口：
     SLPlayer.open(opts)   opts: { src, title, client, poster, originEl }
     SLPlayer.close()
     SLPlayer.isOpen()
     SLPlayer.bindScenes(root)
   ============================================================= */

window.SLPlayer = (function () {
  var T = function (k, f) {
    return window.SLi18n ? window.SLi18n.t(k, f) : f || k;
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var overlay = null;
  var videoEl = null;
  var stage = null;
  var titleEl = null;
  var clientEl = null;
  var isOpen = false;
  var returnFocus = null;
  var originEl = null;       /* 触发打开的背景画面，用于退出时反向生长 */
  var openRect = null;       /* 打开瞬间舞台的目标矩形 */
  var closing = false;

  var OPEN_DUR = 0.62;
  var CLOSE_DUR = 0.44;

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "video-modal js-video-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="video-modal-backdrop js-video-backdrop"></div>' +
      '<div class="video-modal-stage js-video-stage">' +
        '<video class="video-modal-el js-video-el" playsinline webkit-playsinline preload="auto"></video>' +
        /* 自绘播放控制：原生 controls 在这套视觉里太抢，这里做一条细控制带 */
        '<div class="video-modal-scrub js-video-scrub" role="slider" aria-label="Seek" tabindex="0">' +
          '<span class="video-modal-scrub-fill js-video-scrub-fill"></span>' +
        '</div>' +
        '<div class="video-modal-bar">' +
          '<div class="video-modal-meta">' +
            '<span class="video-modal-client js-video-client"></span>' +
            '<span class="video-modal-title js-video-title"></span>' +
          '</div>' +
          '<div class="video-modal-actions">' +
            /* 注意：这里刻意不放声音开关。
               需求是「视频区域不要有声音开关按钮」——声音在进入播放器的那一刻
               就已经按用户手势解锁（open() 里 muted=false），播放期间不再暴露开关。 */
            '<button class="video-modal-btn js-video-toggle" type="button" aria-label="Pause">' +
              '<span class="js-video-toggle-icon"></span>' +
            "</button>" +
            '<button class="video-modal-close js-video-close" type="button">' +
              '<span class="video-modal-close-label js-video-close-label"></span>' +
              '<span class="video-modal-close-icon js-video-close-icon"></span>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<button class="video-modal-bigplay js-video-bigplay" type="button" aria-label="Play">' +
          '<span class="video-modal-bigplay-icon js-video-bigplay-icon"></span>' +
        "</button>" +
        '<div class="video-modal-spinner js-video-spinner" aria-hidden="true"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    videoEl = overlay.querySelector(".js-video-el");
    stage = overlay.querySelector(".js-video-stage");
    titleEl = overlay.querySelector(".js-video-title");
    clientEl = overlay.querySelector(".js-video-client");

    var closeLabel = overlay.querySelector(".js-video-close-label");
    var closeIcon = overlay.querySelector(".js-video-close-icon");
    if (closeLabel) closeLabel.textContent = T("btn.exitFull", "Exit");
    if (closeIcon && window.SLicon) closeIcon.innerHTML = window.SLicon("close");

    paintIcons();

    /* ---- 关闭入口 ---- */
    overlay.querySelector(".js-video-close").addEventListener("click", function () { close(); });
    overlay.querySelector(".js-video-backdrop").addEventListener("click", function () { close(); });
    /* 点舞台空白（视频外的留白）也退出 */
    stage.addEventListener("click", function (e) {
      if (e.target === stage) close();
    });

    /* ---- ESC：先退出播放器，其次才轮到抽屉 ---- */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !isOpen) return;
      e.stopPropagation();
      e.preventDefault();
      close();
    }, true);

    /* ---- 播放 / 暂停 ---- */
    function togglePlay() {
      if (videoEl.paused) {
        var p = videoEl.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        videoEl.pause();
      }
    }
    overlay.querySelector(".js-video-toggle").addEventListener("click", togglePlay);
    overlay.querySelector(".js-video-bigplay").addEventListener("click", togglePlay);
    videoEl.addEventListener("click", togglePlay);

    videoEl.addEventListener("play", function () {
      overlay.classList.remove("is-paused");
      paintIcons();
    });
    videoEl.addEventListener("pause", function () {
      if (!videoEl.ended) overlay.classList.add("is-paused");
      paintIcons();
    });

    /* ---- 声音 ---- */
    /* 不在视频区域提供开关：进入播放器本身就是用户手势，直接有声起播，
       播放期间保持有声，退出时统一由 close() 释放。 */
    videoEl.muted = false;
    try { videoEl.volume = 1; } catch (err) {}

    /* ---- 进度条 ---- */
    var scrub = overlay.querySelector(".js-video-scrub");
    var scrubFill = overlay.querySelector(".js-video-scrub-fill");
    var scrubbing = false;

    function seekFromEvent(e) {
      var r = scrub.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (isFinite(videoEl.duration) && videoEl.duration > 0) {
        try { videoEl.currentTime = ratio * videoEl.duration; } catch (err) {}
      }
      if (scrubFill) scrubFill.style.width = (ratio * 100).toFixed(2) + "%";
    }
    scrub.addEventListener("pointerdown", function (e) {
      scrubbing = true;
      try { scrub.setPointerCapture(e.pointerId); } catch (err) {}
      seekFromEvent(e);
    });
    scrub.addEventListener("pointermove", function (e) { if (scrubbing) seekFromEvent(e); });
    scrub.addEventListener("pointerup", function () { scrubbing = false; });
    scrub.addEventListener("pointercancel", function () { scrubbing = false; });

    videoEl.addEventListener("loadedmetadata", paintIcons);
    videoEl.addEventListener("timeupdate", function () {
      if (!scrubFill) return;
      var d = videoEl.duration;
      if (!isFinite(d) || d <= 0) return;
      scrubFill.style.width = Math.min(100, (videoEl.currentTime / d) * 100).toFixed(2) + "%";
    });

    /* 播放失败时不要卡在黑屏，直接提示 */
    videoEl.addEventListener("error", function () {
      stage.classList.add("is-error");
    });
  }

  /* 图标随状态刷新（播放/暂停、声音开/关） */
  function paintIcons() {
    if (!overlay || !window.SLicon) return;
    var playing = videoEl && !videoEl.paused;

    var ti = overlay.querySelector(".js-video-toggle-icon");
    if (ti) ti.innerHTML = window.SLicon(playing ? "pause" : "play");
    var bi = overlay.querySelector(".js-video-bigplay-icon");
    if (bi) bi.innerHTML = window.SLicon("play");

    overlay.classList.toggle("is-playing", !!playing);

    var tb = overlay.querySelector(".js-video-toggle");
    if (tb) tb.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  /* ---------- 背景：暂停 / 恢复 ---------- */
  function pauseBackground() {
    Array.prototype.forEach.call(document.querySelectorAll("video.media-el"), function (v) {
      try { v.pause(); } catch (e) {}
    });
  }

  function resumeBackground() {
    Array.prototype.forEach.call(document.querySelectorAll(".scene[data-media-src]"), function (el) {
      var entry = el.__mediaEntry;
      if (entry && entry.inView && !entry.dead && el.__videoEl) {
        try { el.__videoEl.play().catch(function () {}); } catch (e) {}
      }
    });
  }

  /* ---------- 舞台最终矩形（等比 16:9，居中） ---------- */
  function stageRect() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var maxW = Math.min(vw * 0.94, vw - 96);
    var maxH = vh * 0.88;
    var w = maxW;
    var h = w * 9 / 16;
    if (h > maxH) {
      h = maxH;
      w = h * 16 / 9;
    }
    return {
      left: (vw - w) / 2,
      top: (vh - h) / 2,
      width: w,
      height: h
    };
  }

  /* ---------- 打开 ---------- */
  function open(opts) {
    opts = opts || {};
    build();
    if (!opts.src) return;

    /* 同一时刻只保留一路：先收掉可能已存在的 */
    if (isOpen) close(true);

    returnFocus = document.activeElement;
    originEl = opts.originEl || null;

    titleEl.textContent = opts.title || "";
    clientEl.textContent = opts.client || "";
    stage.classList.toggle("is-error", false);
    overlay.classList.remove("is-paused");

    videoEl.src = opts.src;
    if (opts.poster) videoEl.setAttribute("poster", opts.poster);
    else videoEl.removeAttribute("poster");
    /* 点击即手势，可以直接带声播放 */
    videoEl.muted = false;
    videoEl.volume = 1;
    videoEl.loop = false;   /* 正片不循环，播完自动退出 */

    pauseBackground();

    document.documentElement.classList.add("is-video-open");
    overlay.classList.add("is-open");
    overlay.style.visibility = "visible";
    isOpen = true;
    closing = false;

    /* 先让浏览器算出舞台的最终布局，再量它的矩形 */
    var rect = stageRect();
    openRect = rect;
    stage.style.width = rect.width + "px";
    stage.style.height = rect.height + "px";
    stage.style.left = rect.left + "px";
    stage.style.top = rect.top + "px";

    /* ---------- FLIP 的 Invert：把舞台倒推回源画面的位置 ---------- */
    if (!reduce && originEl) {
      var o = originEl.getBoundingClientRect();
      /* 源画面可能只露出部分（滚出视口），先夹到视口内，避免飞进来太远 */
      var ox = Math.max(-60, Math.min(vw(), o.left));
      var oy = Math.max(-60, Math.min(vh(), o.top));
      var ow = Math.max(80, Math.min(vw() - ox, o.width));
      var oh = Math.max(45, Math.min(vh() - oy, o.height));

      var sx = ow / rect.width;
      var sy = oh / rect.height;
      var dx = ox - rect.left;
      var dy = oy - rect.top;

      /* 关键：起点必须**先落地**再启动过渡。
         如果起点、transition、终态写在同一批样式里，浏览器会直接
         计算到终态，过渡不会发生（实测采样只拿到 1 个状态）。
         所以分两帧：本帧只写起点 + transition:none，下一帧再开过渡。 */
      stage.style.transition = "none";
      stage.style.transformOrigin = "0 0";
      stage.style.transform =
        "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) " +
        "scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
      stage.style.opacity = "0.35";
      stage.style.borderRadius = "4px";

      /* 读一次布局属性，强制浏览器落实起点 */
      void stage.offsetWidth;

      var ease = "cubic-bezier(0.16, 1, 0.3, 1)"; // expo-out
      var self = stage;
      /* 下一帧再启动动画 */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (!isOpen) return;   /* 期间被关掉就别启动了 */
          self.style.transition =
            "transform " + OPEN_DUR + "s " + ease + ", " +
            "opacity " + (OPEN_DUR * 0.6) + "s linear, " +
            "border-radius " + OPEN_DUR + "s " + ease;
          self.style.transform = "translate3d(0,0,0) scale(1)";
          self.style.opacity = "1";
          self.style.borderRadius = "0px";
        });
      });
    } else {
      stage.style.transition = "none";
      stage.style.transform = "none";
      stage.style.opacity = "1";
    }

    /* 信息条延后一点出现，避免和生长动画抢注意力 */
    if (!reduce) {
      overlay.classList.add("is-entering");
      setTimeout(function () { overlay.classList.remove("is-entering"); }, OPEN_DUR * 900);
    }

    var playPromise = videoEl.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        /* 极少数情况下策略仍拦截：退回静音播放，至少画面能动 */
        videoEl.muted = true;
        paintIcons();
        var p2 = videoEl.play();
        if (p2 && p2.catch) p2.catch(function () { stage.classList.add("is-error"); });
      });
    }

    videoEl.addEventListener("ended", onEnded);
    paintIcons();

    var closeBtn = overlay.querySelector(".js-video-close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function vw() { return window.innerWidth; }
  function vh() { return window.innerHeight; }

  function onEnded() { close(); }

  /* ---------- 关闭（反向生长） ---------- */
  function close(silent) {
    if (!isOpen || closing) return;
    closing = true;
    isOpen = false;

    videoEl.removeEventListener("ended", onEnded);
    overlay.classList.remove("is-playing");

    var finish = function () {
      /* 清 src 释放解码器与内存，这是"互不影响"的关键 */
      try { videoEl.pause(); } catch (e) {}
      videoEl.removeAttribute("src");
      try { videoEl.load(); } catch (e) {}

      overlay.classList.remove("is-open", "is-entering", "is-paused");
      overlay.style.visibility = "hidden";
      stage.style.transition = "none";
      stage.style.transform = "none";
      stage.style.opacity = "0";
      document.documentElement.classList.remove("is-video-open");
      closing = false;

      if (!silent) {
        resumeBackground();
        if (returnFocus && returnFocus.focus) {
          try { returnFocus.focus({ preventScroll: true }); } catch (e) {}
        }
      }
      returnFocus = null;
      originEl = null;
    };

    /* 缩小回源画面 */
    if (!reduce && originEl && openRect) {
      var o = originEl.getBoundingClientRect();
      var ox = Math.max(-60, Math.min(vw(), o.left));
      var oy = Math.max(-60, Math.min(vh(), o.top));
      var ow = Math.max(80, Math.min(vw() - ox, o.width));
      var oh = Math.max(45, Math.min(vh() - oy, o.height));

      var sx = ow / openRect.width;
      var sy = oh / openRect.height;
      var dx = ox - openRect.left;
      var dy = oy - openRect.top;

      /* 与打开方向同样的处理：先把"当前态"作为过渡起点落实，
         下一帧再写目标态，否则浏览器直接跳到终点、看不到收缩。
         这里先确保 transform 是执行到一半的实际值（打开动画可能还没播完）。 */
      var cur = getComputedStyle(stage).transform;
      stage.style.transition = "none";
      stage.style.transformOrigin = "0 0";
      stage.style.transform = cur === "none" ? "translate3d(0,0,0) scale(1)" : cur;
      void stage.offsetWidth;

      var self = stage;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var ease = "cubic-bezier(0.4, 0, 0.2, 1)";
          self.style.transition =
            "transform " + CLOSE_DUR + "s " + ease + ", " +
            "opacity " + CLOSE_DUR + "s linear, " +
            "border-radius " + CLOSE_DUR + "s linear";
          self.style.transform =
            "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) " +
            "scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
          self.style.opacity = "0";
          self.style.borderRadius = "4px";
        });
      });

      clearTimeout(stage.__closeTimer);
      stage.__closeTimer = setTimeout(finish, CLOSE_DUR * 1000 + 120);
    } else {
      finish();
    }

    /* 立刻松掉页面滚动锁，避免"退出了但页面还锁着" */
    document.documentElement.classList.remove("is-video-open");
  }

  /* ---------- 首页唯一入口：只能从按钮点进去 ----------
     需求原文：「每个视频都只能通过 WATCH SHOWREEL 按钮点击进去」。
     所以首页不再给背景画面挂点击（点画面不会打开播放器），
     只接管 WATCH SHOWREEL / WATCH PROJECT 这类指向 work.html?p=slug
     的按钮，改成原地丝滑弹出项目页（有声播放 + 可自由退出）。
     Cmd/Ctrl/Shift+点击、中键仍然走原来的 href，保留"新标签打开"能力。 */
  /* 同 scene.js：绑定标记用本次会话的 token，别用固定值。
     编辑器一旦把 data-entry="1" 写死进 HTML，bindButtons 就会以为绑过了，
     按钮从此变成整页跳转（违反「每个视频只能通过样片按钮进入播放器」）。 */
  var ENTRY_TOKEN = "e" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);

  function bindButtons(root) {
    root = root || document;
    var links = root.querySelectorAll('a[href*="work.html?p="]');
    Array.prototype.forEach.call(links, function (a) {
      if (a.getAttribute("data-entry") === ENTRY_TOKEN) return;
      a.setAttribute("data-entry", ENTRY_TOKEN);
      var m = /[?&]p=([^&#]+)/.exec(a.getAttribute("href") || "");
      if (!m) return;
      var slug = decodeURIComponent(m[1]);
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!window.SLProjectView) return;
        e.preventDefault();
        window.SLProjectView.open({ slug: slug, originEl: a });
      });
    });
  }

  /* ---------- 给场景挂点击入口 ----------
     注：首页已改为「只能从按钮进入」，不再调用本函数；
     保留实现供其他需要"点画面即播"的页面使用。 */
  function bindScenes(root) {
    root = root || document;
    var scenes = root.querySelectorAll(".scene[data-media-src]");
    Array.prototype.forEach.call(scenes, function (el) {
      if (el.getAttribute("data-playable") === ENTRY_TOKEN) return;
      el.setAttribute("data-playable", ENTRY_TOKEN);
      el.classList.add("is-playable");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");

      /* 每屏的标题 / 客户名从同屏文案里取，用作播放器信息条 */
      function meta() {
        var section = el.closest(".js-snap-item") || el.closest("section");
        var titleNode = section && section.querySelector(".snap-title-accent");
        var clientNode = section && section.querySelector(".snap-client-accent");
        return {
          src: el.getAttribute("data-media-src"),
          title: titleNode ? titleNode.textContent.trim() : el.getAttribute("data-media-alt") || "",
          client: clientNode ? clientNode.textContent.trim() : "",
          poster: "",
          originEl: el
        };
      }

      /* 点击：只认"点在了画面本身"，避免误触文案与按钮 */
      el.addEventListener("click", function (e) {
        if (e.target.closest("a, button, .btn, .js-btn, .sound-toggle")) return;
        open(meta());
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(meta());
        }
      });
    });
  }

  /* 视口尺寸变化时，已打开的舞台要跟着重新定位 */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (!isOpen) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var r = stageRect();
      openRect = r;
      stage.style.width = r.width + "px";
      stage.style.height = r.height + "px";
      stage.style.left = r.left + "px";
      stage.style.top = r.top + "px";
      stage.style.transform = "none";
    }, 150);
  });

  /* 换语言时刷新退出按钮文案 */
  if (window.SLi18n) {
    window.SLi18n.onChange(function () {
      if (!overlay) return;
      var l = overlay.querySelector(".js-video-close-label");
      if (l) l.textContent = window.SLi18n.t("btn.exitFull", "Exit");
    });
  }

  return {
    open: open,
    close: close,
    isOpen: function () { return isOpen; },
    bindScenes: bindScenes,
    bindButtons: bindButtons
  };
})();
