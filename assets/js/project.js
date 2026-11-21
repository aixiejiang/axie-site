/* =============================================================
   项目详情（项目页 / 丝滑弹层两用）—— SLProjectView
   来源：品牌页 GRID / CAROUSEL 点击视频卡片

   两种呈现方式，同一个内容结构：
     A. 「丝滑弹层」 open(opts)
        从被点击的卡片位置 FLIP 生长出来，含：
        - 视频播放（有声、可暂停、可拖动进度）
        - 项目介绍（client / category / year / 正文 / 制作信息）
        - 剧照带（横向滚动）
        - 其他项目（点击可切换成那一个）
        - 退出按钮（ESC / 关闭键 / 点背景）
     B. 独立页面 work.html?p=slug
        同一份 DOM 结构渲染在页面里，滚动浏览，不必弹层。

   关键点：
     - 每个视频一个独立 <video>，切换/退出即 removeAttribute("src") + load()，
       解码器立刻释放 —— 这是"播放期间互不影响"的实现方式。
     - 默认带声：打开动作本身是用户手势，直接 muted=false 起播；
       若被策略拦截，退回静音并让用户点一下画面解除。
   ============================================================= */

window.SLProjectView = (function () {
  var T = function (k, f) {
    return window.SLi18n ? window.SLi18n.t(k, f) : f || k;
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 弹层右上角的「后退」键：文案随语言切换，口径统一为「后退」 */
  function paintCloseLabel() {
    if (!overlay) return;
    var label = T("btn.back", "Back");
    var l = overlay.querySelector(".js-pv-close-label");
    if (l) l.textContent = label;
    var b = overlay.querySelector(".js-pv-close");
    if (b) {
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label);
    }
  }

  var overlay = null;
  var active = null;      /* 当前展示的 work 对象 */
  var activeIndex = -1;
  var list = [];          /* 用于「其他项目」 */
  var isOpen = false;
  var closing = false;
  var originEl = null;
  var openRect = null;
  var returnFocus = null;

  var OPEN_DUR = 0.66;
  var CLOSE_DUR = 0.46;
  var EASE_OPEN = "cubic-bezier(0.16, 1, 0.3, 1)";   /* expo-out */
  var EASE_CLOSE = "cubic-bezier(0.4, 0, 0.2, 1)";

  /* 播放器在「舞台扣除顶栏后」的高度占比；剩下的留给下方介绍区。
     调大 = 片子更大但介绍区变矮，别超过 ~0.62，否则窄屏兜不住 */
  var PLAYER_SHARE = 0.52;

  /* ---------- 数据辅助 ---------- */

  function allVideos() {
    var D = window.SL_DATA;
    if (!D || !D.brand || !D.brand.works) return [];
    return D.brand.works.filter(function (w) {
      return w && w.media && w.media.kind === "video";
    });
  }

  function posterOf(w) {
    if (!w || !w.media) return "";
    if (w.media.poster) return w.media.poster;
    var m = /videos\/(v\d+)\.mp4$/.exec(w.media.src || "");
    return m ? "assets/media/posters/" + m[1] + ".jpg" : "";
  }

  /* 剧照：从 32 张静帧里按作品序号确定性取 8 张，保证每支片子有不同的剧照带 */
  function stillsFor(index) {
    var out = [];
    for (var i = 0; i < 8; i++) {
      var n = ((index * 8 + i) % 32) + 1;
      var id = n < 10 ? "0" + n : String(n);
      out.push("assets/media/stills/s" + id + ".jpg");
    }
    return out;
  }

  function i18nCategory(cat) {
    var extra = window.SL_DATA && window.SL_DATA.i18n && window.SL_DATA.i18n.categories;
    var e = extra && extra[cat];
    if (e && window.SLi18n) return window.SLi18n.lang() === "zh" ? e.zh : e.en;
    return cat;
  }

  /* ---------- DOM 片段 ---------- */

  function creditsHtml(w) {
    var c = w.credits || {};
    var rows = [
      ["Client", w.client],
      [T("project.category", "Category"), i18nCategory(w.category)],
      [T("project.year", "Year"), w.year],
      [T("project.director", "Director"), c.director],
      [T("project.agency", "Agency"), c.agency],
      [T("project.format", "Format"), c.format]
    ].filter(function (r) { return r[1]; });

    return rows.map(function (r) {
      /* dt/dd + 固定宽的第一列：多行也不会错位 */
      return '<div class="pv-meta-row">' +
        '<dt class="pv-meta-key">' + r[0] + "</dt>" +
        '<dd class="pv-meta-val">' + r[1] + "</dd>" +
      "</div>";
    }).join("");
  }

  function stillsHtml(index) {
    return stillsFor(index).map(function (src) {
      return '<figure class="pv-still"><img src="' + src + '" alt="" loading="lazy" decoding="async" /></figure>';
    }).join("");
  }

  function othersHtml(index) {
    /* 坑：模块里的 list 是在 open() 里才填充的（弹层路径一定会先 open）。
       但独立页 work.html 走的是 project-page.js，它调的是 PV.contentHtml()，
       从来没进过 open() —— 这时 list 还是空数组，「其他项目」就一格都没有。
       所以这里兜一层：list 没东西时就用 allVideos() 现算，两条路径都成立。 */
    var pool = list.length ? list : allVideos();
    var others = pool.filter(function (_, i) { return i !== index; }).slice(0, 5);
    return others.map(function (w) {
      return '<button class="pv-other js-pv-other" type="button" data-slug="' + w.slug + '">' +
        '<span class="pv-other-media">' +
          '<img src="' + posterOf(w) + '" alt="" loading="lazy" decoding="async" />' +
        "</span>" +
        '<span class="pv-other-client">' + w.client + "</span>" +
        '<span class="pv-other-title">' + w.title + "</span>" +
      "</button>";
    }).join("");
  }

  /* 完整内容结构：弹层与独立页面共用 */
  function contentHtml(w, index) {
    return (
      '<div class="pv-body">' +
        '<header class="pv-head">' +
          '<span class="pv-client">' + w.client + "</span>" +
          '<h2 class="pv-title">' + w.title + "</h2>" +
          /* class 里带上 js- 钩子：语言切换要按它重刷文案
             （历史上这里只有 pv-cat，切换语言的回调会 querySelector 到 null 后报错） */
          '<span class="pv-cat js-pv-cat">' + i18nCategory(w.category) + " &middot; " + (w.year || "") + "</span>" +
        "</header>" +

        /* 项目介绍：左「简介」右「制作信息」两栏。
           之前 section-title / blurb / meta 都是 pv-intro 的直接子元素，
           在两栏模板下会按 DOM 顺序被塞进 (1,1) (1,2) (2,1) —— 标题和正文
           分散在两列里，看起来就是"排版不齐"。现在各自包一层列容器。 */
        '<div class="pv-intro">' +
          '<div class="pv-intro-main">' +
            '<h3 class="pv-section-title">' + T("project.about", "The Brief") + "</h3>" +
            '<p class="pv-blurb">' + (w.blurb || "") + "</p>" +
          "</div>" +
          '<dl class="pv-meta">' + creditsHtml(w) + "</dl>" +
        "</div>" +

        '<section class="pv-section">' +
          '<h3 class="pv-section-title">' + T("project.stills", "Stills") + "</h3>" +
          '<div class="pv-stills js-pv-stills" data-lenis-prevent>' + stillsHtml(index) + "</div>" +
        "</section>" +

        '<section class="pv-section">' +
          '<h3 class="pv-section-title">' + T("project.others", "Other Projects") + "</h3>" +
          '<div class="pv-others js-pv-others">' + othersHtml(index) + "</div>" +
        "</section>" +
      "</div>"
    );
  }

  /* ---------- 弹层构建 ---------- */

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "pv-modal js-pv-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="pv-backdrop js-pv-backdrop"></div>' +

      '<div class="pv-stage js-pv-stage">' +

        /* 顶部：退出
           第三十一轮：左上角**只留品牌名称**（原来 client + title 并排，
           片名在小窗里会被 ellipsis 截成半截，反而更乱）。 */
        '<div class="pv-topbar">' +
          '<div class="pv-topbar-meta">' +
            '<span class="pv-topbar-client js-pv-top-client"></span>' +
          "</div>" +
          '<button class="pv-close js-pv-close" type="button">' +
            '<span class="pv-close-label js-pv-close-label"></span>' +
            '<span class="pv-close-icon js-pv-close-icon"></span>' +
          "</button>" +
        "</div>" +

        /* 播放器 */
        '<div class="pv-player js-pv-player">' +
          '<video class="pv-video js-pv-video" playsinline webkit-playsinline preload="auto"></video>' +
          '<div class="pv-poster js-pv-poster"></div>' +
          '<button class="pv-bigplay js-pv-bigplay" type="button" aria-label="Play">' +
            '<span class="pv-bigplay-icon js-pv-bigplay-icon"></span>' +
          "</button>" +
          '<div class="pv-controls">' +
            '<button class="pv-ctl js-pv-toggle" type="button" aria-label="Pause">' +
              '<span class="js-pv-toggle-icon"></span>' +
            "</button>" +
            '<div class="pv-scrub js-pv-scrub" role="slider" tabindex="0" aria-label="Seek">' +
              '<span class="pv-scrub-fill js-pv-scrub-fill"></span>' +
            "</div>" +
            '<span class="pv-time js-pv-time">00:00 / 00:00</span>' +
            /* 第三十一轮：声音键**左边**新增放大键 ——
               点开后面画里只剩视频（16:9 原比例铺满视口，其它 UI 全隐） */
            '<button class="pv-ctl js-pv-expand" type="button" aria-label="Expand">' +
              '<span class="js-pv-expand-icon"></span>' +
            "</button>" +
            '<button class="pv-ctl js-pv-sound" type="button" aria-label="Mute">' +
              '<span class="js-pv-sound-icon"></span>' +
            "</button>" +
          "</div>" +
        "</div>" +

        /* 可滚动内容区（项目介绍 / 剧照 / 其他项目）
           data-lenis-prevent 是关键：全站平滑滚动（Lenis）在 window 上监听
           wheel 并 preventDefault，结果是鼠标划过这里时**整页**在滚、
           内容区纹丝不动（实测 scrollTop 恒为 0，window.scrollY 反而变了）。
           加上这个属性后 Lenis 会跳过该分支，交给浏览器原生滚动。 */
        '<div class="pv-scroll js-pv-scroll" data-lenis-prevent>' +
          '<div class="pv-scroll-inner js-pv-content"></div>' +
        "</div>" +

      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".js-pv-close").addEventListener("click", function () { close(); });
    overlay.querySelector(".js-pv-backdrop").addEventListener("click", function () { close(); });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !isOpen) return;
      e.stopPropagation();
      e.preventDefault();
      /* 第三十一轮：放大态下 ESC 先「还原」，再按一次才关掉整个播放页 */
      if (isExpanded()) setExpanded(false);
      else close();
    }, true);

    /* 播放 / 暂停 */
    var v = overlay.querySelector(".js-pv-video");
    function togglePlay() {
      if (v.paused) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    }
    overlay.querySelector(".js-pv-toggle").addEventListener("click", togglePlay);
    overlay.querySelector(".js-pv-bigplay").addEventListener("click", togglePlay);
    v.addEventListener("click", togglePlay);

    /* 声音（播放器内控制，不在视频区域上） */
    var soundBtn = overlay.querySelector(".js-pv-sound");
    soundBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      v.muted = !v.muted;
      v.volume = v.muted ? 0 : 1;
      paintIcons();
    });

    /* 放大 / 还原（第三十一轮）：声音键左边那一颗。
       放大态由 CSS 把舞台撑到整个视口，并隐掉顶栏与下面的介绍区 ——
       画面上只剩视频，16:9 原比例 letterbox，不会拉伸也不会裁切。 */
    var expandBtn = overlay.querySelector(".js-pv-expand");
    if (expandBtn) {
      expandBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setExpanded(!isExpanded());
      });
    }

    /* 进度条 */
    var scrub = overlay.querySelector(".js-pv-scrub");
    var fill = overlay.querySelector(".js-pv-scrub-fill");
    var timeEl = overlay.querySelector(".js-pv-time");
    var scrubbing = false;

    function fmt(t) {
      if (!isFinite(t) || t < 0) t = 0;
      var m = Math.floor(t / 60);
      var s = Math.floor(t % 60);
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }

    function seek(e) {
      var r = scrub.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (isFinite(v.duration) && v.duration > 0) {
        try { v.currentTime = ratio * v.duration; } catch (err) {}
      }
    }
    scrub.addEventListener("pointerdown", function (e) {
      scrubbing = true;
      try { scrub.setPointerCapture(e.pointerId); } catch (err) {}
      seek(e);
    });
    scrub.addEventListener("pointermove", function (e) { if (scrubbing) seek(e); });
    scrub.addEventListener("pointerup", function () { scrubbing = false; });
    scrub.addEventListener("pointercancel", function () { scrubbing = false; });

    v.addEventListener("timeupdate", function () {
      var d = v.duration;
      if (isFinite(d) && d > 0) {
        fill.style.width = Math.min(100, (v.currentTime / d) * 100).toFixed(2) + "%";
      }
      timeEl.textContent = fmt(v.currentTime) + " / " + fmt(d);
    });
    v.addEventListener("play", paintIcons);
    v.addEventListener("pause", paintIcons);
    v.addEventListener("loadedmetadata", paintIcons);

    /* 「其他项目」点击 → 就地切换成那一个（不关闭弹层） */
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-pv-other");
      if (!btn) return;
      var slug = btn.getAttribute("data-slug");
      var idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].slug === slug) { idx = i; break; }
      if (idx >= 0) show(idx, null);
    });

    /* 横向：鼠标停在「剧照」条上时，竖向滚轮转成横向滚（这样纯滚轮也能左右看）。
       到了左/右尽头就把事件放回去，让内容区继续上下滚 —— 否则用户会卡在这里。 */
    overlay.addEventListener("wheel", function (e) {
      var strip = e.target.closest ? e.target.closest(".js-pv-stills") : null;
      if (!strip) return;
      var max = strip.scrollWidth - strip.clientWidth;
      if (max <= 1) return;

      var amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!amount) return;

      var atStart = amount < 0 && strip.scrollLeft <= 0.5;
      var atEnd = amount > 0 && strip.scrollLeft >= max - 0.5;
      if (atStart || atEnd) return;   // 到边界：交还给外层内容区

      e.preventDefault();
      var next = strip.scrollLeft + amount;
      strip.scrollLeft = next < 0 ? 0 : next > max ? max : next;
    }, { passive: false });
  }

  function paintIcons() {
    if (!overlay || !window.SLicon) return;
    var v = overlay.querySelector(".js-pv-video");
    var playing = v && !v.paused;
    var ti = overlay.querySelector(".js-pv-toggle-icon");
    if (ti) ti.innerHTML = window.SLicon(playing ? "pause" : "play");
    var bi = overlay.querySelector(".js-pv-bigplay-icon");
    if (bi) bi.innerHTML = window.SLicon("play");
    var si = overlay.querySelector(".js-pv-sound-icon");
    if (si) si.innerHTML = window.SLicon(v && v.muted ? "sound-off" : "sound-on");
    /* 放大态按钮图标翻成「还原」（箭头朝内） */
    var xi = overlay.querySelector(".js-pv-expand-icon");
    if (xi) xi.innerHTML = window.SLicon(isExpanded() ? "collapse" : "expand");
    overlay.classList.toggle("is-playing", !!playing);
    var lbl = overlay.querySelector(".js-pv-bigplay");
    if (lbl) lbl.style.opacity = playing ? "0" : "1";
  }

  /* ---------- 放大 / 还原（第三十一轮） ----------
     放大：舞台铺满视口，隐掉顶栏与介绍区，视频按 16:9 原比例居中 ——
          即「只显示视频」（v01 这类片源就是 1980×1080 / 1920×1080）。
     还原：把 open() 算好的舞台矩形原样写回去。 */
  function isExpanded() {
    return !!(overlay && overlay.classList.contains("is-expanded"));
  }
  function setExpanded(on) {
    if (!overlay) return;
    overlay.classList.toggle("is-expanded", !!on);
    var stage = overlay.querySelector(".js-pv-stage");
    if (stage) {
      stage.style.transition = "none";
      stage.style.transform = "none";
      if (!on && openRect) {
        stage.style.width = openRect.width + "px";
        stage.style.height = openRect.height + "px";
        stage.style.left = openRect.left + "px";
        stage.style.top = openRect.top + "px";
      }
    }
    paintIcons();
  }

  /* ---------- 渲染某个作品 ---------- */
  function show(index, origin) {
    if (!overlay) build();
    var w = list[index];
    if (!w) return;

    var prevVideo = overlay.querySelector(".js-pv-video");
    /* 切到另一个作品：先把上一支彻底释放，避免两路解码器叠加 */
    releaseVideo(prevVideo);

    active = w;
    activeIndex = index;

    overlay.querySelector(".js-pv-top-client").textContent = w.client || "";
    overlay.querySelector(".js-pv-content").innerHTML = contentHtml(w, index);

    var poster = posterOf(w);
    var posterEl = overlay.querySelector(".js-pv-poster");
    posterEl.style.backgroundImage = poster ? 'url("' + poster + '")' : "none";

    var v = prevVideo;
    v.muted = false;
    v.volume = 1;
    v.loop = false;
    v.src = w.media.src;

    overlay.querySelector(".js-pv-scrub-fill").style.width = "0%";
    overlay.querySelector(".js-pv-time").textContent = "00:00 / 00:00";

    var p = v.play();
    if (p && p.catch) {
      p.catch(function () {
        /* 被自动播放策略拦住：退回静音先让画面动起来 */
        v.muted = true;
        paintIcons();
        var p2 = v.play();
        if (p2 && p2.catch) p2.catch(function () {});
      });
    }
    paintIcons();

    /* 换作品后内容区回到顶部 */
    var sc = overlay.querySelector(".js-pv-scroll");
    if (sc) sc.scrollTop = 0;

    if (origin) originEl = origin;
  }

  function releaseVideo(v) {
    if (!v) return;
    try { v.pause(); } catch (e) {}
    v.removeAttribute("src");
    try { v.load(); } catch (e) {}
  }

  /* ---------- 打开 ---------- */
  function open(opts) {
    opts = opts || {};
    build();
    list = allVideos();
    if (!list.length) return;

    var index = opts.index;
    if (index === undefined && opts.slug) {
      index = list.findIndex(function (w) { return w.slug === opts.slug; });
    }
    if (index === undefined || index < 0) index = 0;

    if (isOpen) { hardClose(); }

    returnFocus = document.activeElement;
    originEl = opts.originEl || null;

    document.documentElement.classList.add("is-video-open");
    overlay.classList.add("is-open");
    overlay.style.visibility = "visible";
    isOpen = true;
    closing = false;

    /* 先算舞台最终位置，再 FLIP 倒推回卡片位置 */
    var rect = stageRect();
    openRect = rect;
    var stage = overlay.querySelector(".js-pv-stage");
    stage.style.width = rect.width + "px";
    stage.style.height = rect.height + "px";
    stage.style.left = rect.left + "px";
    stage.style.top = rect.top + "px";

    show(index, null);

    if (!reduce && originEl) {
      var o = originEl.getBoundingClientRect();
      var ox = Math.max(-80, Math.min(window.innerWidth, o.left));
      var oy = Math.max(-80, Math.min(window.innerHeight, o.top));
      var ow = Math.max(80, Math.min(window.innerWidth - ox, o.width));
      var oh = Math.max(45, Math.min(window.innerHeight - oy, o.height));

      /* 起点必须"先落地"再启动过渡：写成同一批样式会被直接算到终态 */
      stage.style.transition = "none";
      stage.style.transformOrigin = "0 0";
      stage.style.transform =
        "translate3d(" + (ox - rect.left).toFixed(1) + "px," +
                       (oy - rect.top).toFixed(1) + "px,0) " +
        "scale(" + (ow / rect.width).toFixed(4) + "," + (oh / rect.height).toFixed(4) + ")";
      stage.style.opacity = "0.3";
      stage.style.borderRadius = "6px";
      void stage.offsetWidth;

      var self = stage;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (!isOpen) return;
          self.style.transition =
            "transform " + OPEN_DUR + "s " + EASE_OPEN + ", " +
            "opacity " + (OPEN_DUR * 0.55).toFixed(2) + "s linear, " +
            "border-radius " + OPEN_DUR + "s " + EASE_OPEN;
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

    paintCloseLabel();
    var closeBtn = overlay.querySelector(".js-pv-close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    return true;
  }

  /* 舞台尺寸的计算入口：弹层里的「项目介绍 / 剧照 / 其他项目」能不能看得见，
     全看这里的高度账算没算对。

     布局是上下堆叠（见 components.css 的 .pv-stage）：
       顶栏 → 播放器(16:9) → 项目介绍区
     所以舞台宽度一旦定下来，播放器高度就等于 w*9/16，剩下的才是介绍区。
     老版本先按 16:9 把舞台撑满，结果介绍区被挤成 clientHeight=0。

     这里同时给两个上限，取最小：
       1) want：播放器只占「扣除顶栏后剩余高度」的 52%，下方永远留得住一段介绍
       2) cap ：极端窄高视口下，至少保住 contentMin 的介绍区，不让它被压成 0 */
  function stageRect() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var availH = vh * 0.92;
    /* 顶栏高度实测：拿不到（还没 build）就用一个接近的估值 */
    var topbar = 0;
    if (overlay) {
      var tb = overlay.querySelector(".pv-topbar");
      if (tb && tb.offsetHeight) topbar = tb.offsetHeight;
    }
    if (!topbar) topbar = 54;

    var rest = Math.max(200, availH - topbar);
    var contentMin = Math.min(300, Math.max(180, availH * 0.28));
    var maxW = Math.min(vw * 0.94, vw - 80);

    var want = rest * PLAYER_SHARE * 16 / 9;          /* 理想：播放器占 52% */
    var cap = (rest - contentMin) * 16 / 9;           /* 兜底：介绍区不小于 contentMin */
    var w = Math.max(340, Math.min(maxW, want, cap));
    var h = availH;

    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }

  /* 立即收掉，无动画（切换作品 / 重复打开时用） */
  function hardClose() {
    var stage = overlay && overlay.querySelector(".js-pv-stage");
    releaseVideo(overlay && overlay.querySelector(".js-pv-video"));
    if (overlay) {
      overlay.classList.remove("is-open", "is-playing", "is-expanded");
      overlay.style.visibility = "hidden";
    }
    if (stage) {
      stage.style.transition = "none";
      stage.style.transform = "none";
      stage.style.opacity = "0";
    }
    document.documentElement.classList.remove("is-video-open");
    isOpen = false;
  }

  /* ---------- 关闭（缩回来源卡片） ---------- */
  function close() {
    if (!isOpen || closing) return;
    closing = true;
    isOpen = false;

    var stage = overlay.querySelector(".js-pv-stage");
    overlay.classList.remove("is-playing");

    var finish = function () {
      releaseVideo(overlay.querySelector(".js-pv-video"));
      overlay.classList.remove("is-open", "is-pv-entering", "is-expanded");
      overlay.style.visibility = "hidden";
      stage.style.transition = "none";
      stage.style.transform = "none";
      stage.style.opacity = "0";
      document.documentElement.classList.remove("is-video-open");
      closing = false;
      if (returnFocus && returnFocus.focus) {
        try { returnFocus.focus({ preventScroll: true }); } catch (e) {}
      }
      returnFocus = null;
      originEl = null;
    };

    if (!reduce && originEl && openRect && originEl.isConnected) {
      /* 来源卡片可能已经滚走了：夹到视口边，别让动画飞太远 */
      var o = originEl.getBoundingClientRect();
      var ox = Math.max(-80, Math.min(window.innerWidth, o.left));
      var oy = Math.max(-80, Math.min(window.innerHeight, o.top));
      var ow = Math.max(80, Math.min(window.innerWidth - ox, o.width));
      var oh = Math.max(45, Math.min(window.innerHeight - oy, o.height));

      var cur = getComputedStyle(stage).transform;
      stage.style.transition = "none";
      stage.style.transformOrigin = "0 0";
      stage.style.transform = cur === "none" ? "translate3d(0,0,0) scale(1)" : cur;
      void stage.offsetWidth;

      var self = stage;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.style.transition =
            "transform " + CLOSE_DUR + "s " + EASE_CLOSE + ", " +
            "opacity " + CLOSE_DUR + "s linear, " +
            "border-radius " + CLOSE_DUR + "s linear";
          self.style.transform =
            "translate3d(" + (ox - openRect.left).toFixed(1) + "px," +
                           (oy - openRect.top).toFixed(1) + "px,0) " +
            "scale(" + (ow / openRect.width).toFixed(4) + "," + (oh / openRect.height).toFixed(4) + ")";
          self.style.opacity = "0";
          self.style.borderRadius = "6px";
        });
      });

      clearTimeout(stage.__pvCloseTimer);
      stage.__pvCloseTimer = setTimeout(finish, CLOSE_DUR * 1000 + 140);
    } else {
      finish();
    }

    document.documentElement.classList.remove("is-video-open");
  }

  window.addEventListener("resize", function () {
    if (!isOpen) return;
    /* 放大态：舞台尺寸由 CSS 铺满视口，别再写回小窗矩形 */
    if (isExpanded()) return;
    clearTimeout(window.__pvResize);
    window.__pvResize = setTimeout(function () {
      if (isExpanded()) return;
      var r = stageRect();
      openRect = r;
      var stage = overlay.querySelector(".js-pv-stage");
      stage.style.width = r.width + "px";
      stage.style.height = r.height + "px";
      stage.style.left = r.left + "px";
      stage.style.top = r.top + "px";
      stage.style.transform = "none";
    }, 160);
  });

  if (window.SLi18n) {
    window.SLi18n.onChange(function () {
      if (!overlay) return;
      paintCloseLabel();
      if (!active) return;
      /* 整段内容重渲染：只有这样「项目介绍 / 剧照 / 其他项目」的小标题、
         制作信息字段名才会跟着切语言，而不是停留在打开时的那一版。
         之前只改 cat / badge，结果正文永远是打开时的语言。 */
      var sc = overlay.querySelector(".js-pv-scroll");
      var keep = sc ? sc.scrollTop : 0;
      var host = overlay.querySelector(".js-pv-content");
      if (host) host.innerHTML = contentHtml(active, activeIndex);
      /* 保险：万一选择器对不上，退回单点刷新，且全部判空 */
      var catEl = overlay.querySelector(".js-pv-cat");
      if (catEl) catEl.textContent = i18nCategory(active.category) + " · " + (active.year || "");
      if (sc) sc.scrollTop = keep;
    });
  }

  return {
    open: open,
    close: close,
    isOpen: function () { return isOpen; },
    list: allVideos,
    posterOf: posterOf,
    /* 给独立页面复用 */
    contentHtml: contentHtml,
    i18nCategory: i18nCategory
  };
})();
