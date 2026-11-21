/* =============================================================
   全局外壳注入：SVG 滤镜 / 图标雪碧 / Header / Drawer / Footer / 转场遮罩
   同步执行（脚本置于 body 末尾），配合开场遮罩无闪烁
   ============================================================= */

(function () {
  var D = window.SL_DATA || {};

  /* ---------- SVG：液态玻璃滤镜 + 图标雪碧 ---------- */
  var SVG_DEFS =
    '<svg aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute">' +
      '<defs>' +
        '<filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="9" result="noise"/>' +
          '<feComponentTransfer in="noise" result="gamma">' +
            '<feFuncR type="gamma" amplitude="1" exponent="2.4" offset="0"/>' +
            '<feFuncG type="gamma" amplitude="1" exponent="2.4" offset="0"/>' +
          '</feComponentTransfer>' +
          '<feGaussianBlur in="gamma" stdDeviation="1.6" result="blur"/>' +
          '<feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.9" specularExponent="22" lighting-color="#ffffff" result="spec">' +
            '<fePointLight x="120" y="80" z="180"/>' +
          '</feSpecularLighting>' +
          '<feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="specOut" scale="8" xChannelSelector="R" yChannelSelector="G" result="disp"/>' +
          '<feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.05 0" result="cm1"/>' +
          '<feColorMatrix in="cm1" type="saturate" values="1.15" result="cm2"/>' +
          '<feBlend in="cm2" in2="SourceGraphic" mode="screen" result="blend1"/>' +
          '<feBlend in="blend1" in2="cm2" mode="multiply"/>' +
        '</filter>' +
        '<symbol id="triangle" viewBox="0 0 24 24"><path d="M12 4 L21 20 L3 20 Z"/></symbol>' +
        '<symbol id="arrow" viewBox="0 0 24 24"><path d="M4 20 L20 4 M20 4 H9 M20 4 V15" stroke="currentColor" stroke-width="2.4" fill="none"/></symbol>' +
        '<symbol id="pause" viewBox="0 0 24 24"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></symbol>' +
        '<symbol id="menu" viewBox="0 0 24 24"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></symbol>' +
        '<symbol id="close" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.4" fill="none"/></symbol>' +
        /* 声音开：喇叭 + 声波 */
        '<symbol id="sound-on" viewBox="0 0 24 24"><path d="M4 9h3.5L12 5v14L7.5 15H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>' +
        /* 声音关：喇叭 + 斜线 */
        '<symbol id="sound-off" viewBox="0 0 24 24"><path d="M4 9h3.5L12 5v14L7.5 15H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>' +
        /* 语言：地球 + 经纬线 */
        '<symbol id="globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c2.6 2.6 4 5.7 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.7-4-9s1.4-6.4 4-9z" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>' +
        /* 播放 / 关闭（全屏播放器用） */
        '<symbol id="play" viewBox="0 0 24 24"><path d="M7 4.5 L19 12 L7 19.5 Z"/></symbol>' +
        /* 第三十一轮：播放器「放大 / 还原」。
           四角箭头朝外 = 放大；朝内 = 还原。用 stroke 描边，方便跟着 currentColor 变色。 */
        '<symbol id="expand" viewBox="0 0 24 24"><path d="M4 9V4h5M20 15v5h-5M4 4l6.5 6.5M20 20l-6.5-6.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
        '<symbol id="collapse" viewBox="0 0 24 24"><path d="M9 4v5H4M15 20v-5h5M9 9L3.5 3.5M15 15l5.5 5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
      '</defs>' +
    '</svg>';

  function icon(id, cls) {
    return '<svg class="' + (cls || "") + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }
  window.SLicon = icon;

  /* ---------- 玻璃按钮 ---------- */
  function glassButton(opts) {
    var href = opts.href || "#";
    var cls = "btn btn-" + (opts.size || "default") + " " + (opts.variant || "glass");
    /* 如果传了 i18n 键，就把键留在 label 上，
       SLi18n.apply() 之后能随语言切换重刷文案（按钮本身是运行时生成的，
       直接写在 <span class="js-btn"> 上的 data-i18n 会在 outerHTML 替换时丢掉）。 */
    var i18nAttr = opts.i18n ? ' data-i18n="' + opts.i18n + '"' : "";
    var inner =
      '<span class="glass-surface-wrapper rounded-full" style="border-radius:9999px">' +
        '<span class="glass-surface-effect"></span>' +
        '<span class="glass-surface-content ' + cls + ' sheen">' +
          '<span class="label"' + i18nAttr + ">" + opts.label + "</span>" +
          (opts.icon ? '<span class="icon-box">' + icon(opts.icon, opts.icon === "triangle" ? "ic-tri-right" : "") + "</span>" : "") +
        "</span>" +
      "</span>";
    return '<a href="' + href + '" class="btn-link" style="display:inline-block;border-radius:9999px">' + inner + "</a>";
  }
  window.SLButton = glassButton;

  /* ---------- Header ---------- */
  /* 语言切换做成一枚「始终钉在右上角」的独立浮标：
     它不再塞在 header 的 CTA 组里 —— 那样会被 联系我们 / Menu 挤位置，
     换页、归位动画、左侧画廊宽窄变化都会让它左右晃。
     现在它是 body 直属元素 + position:fixed，任何页面、任何断点都在同一处。 */
  function langSwitchHtml() {
    return (
      '<div class="lang-dock js-lang-dock">' +
        '<button class="lang-switch js-lang-toggle" type="button" ' +
          'data-i18n-attr="aria-label" data-i18n="lang.switch" aria-label="Switch language" ' +
          'role="switch" aria-checked="false">' +
          '<span class="lang-switch-track">' +
            '<span class="lang-switch-thumb js-lang-thumb"></span>' +
            '<span class="lang-switch-opt js-lang-opt-en" data-lang-opt="en">EN</span>' +
            '<span class="lang-switch-opt js-lang-opt-zh" data-lang-opt="zh">中</span>' +
          "</span>" +
        "</button>" +
      "</div>"
    );
  }

  function buildHeader() {
    var isHome = document.body.getAttribute("data-page") === "home";
    var T = window.SLi18n ? window.SLi18n.t : function (k, f) { return f || k; };
    var items = [];

    if (isHome) {
      /* 首页按要求「去除菜单选项」：顶部不再渲染任何导航项 / 菜单按钮 */
      items = [];
    } else {
      var path = location.pathname.split("/").pop() || "index.html";
      items = (D.nav || []).map(function (n) {
        var cur = n.href === path ? " is-current" : "";
        return '<a class="nav-item js-nav-item' + cur + '" href="' + n.href + '" data-i18n="' +
          (n.i18n || "") + '">' + T(n.i18n, n.label) + "</a>";
      });
    }

    var navHtml =
      '<nav class="header-nav glass-surface-wrapper js-header-nav" aria-label="' +
      (isHome ? T("nav.workIndex", "Work index") : T("nav.primary", "Primary")) +
      '">' +
        '<span class="glass-surface-effect"></span>' +
        '<span class="glass-surface-content" style="display:inline-flex;align-items:center;gap:0.3rem">' +
          items.join("") +
        "</span>" +
        '<span class="nav-indicator js-nav-indicator">' + icon("triangle") + "</span>" +
        '<span class="nav-hover-box js-nav-hover-box"></span>' +
      "</nav>";

    /* 语言切换已从 header 移出（右上角固定浮标）。
       首页按需求**不放「联系我们」**：桌面首页顶部只剩 logo（左）
       + 右上角语言浮标；内页才出现这颗 CTA，并在入场时向中间聚拢。
       Menu 抽屉入口默认隐藏，只由 syncResponsiveCta 在小屏放出来。 */
    var cta =
      '<div class="js-header-cta" style="display:flex;align-items:center;gap:0.8rem">' +
        (isHome ? "" : glassButton({ label: T("btn.getInTouch", "Get In Touch"), i18n: "btn.getInTouch", href: "contact.html", size: "default" })) +
        '<button class="btn btn-default btn-glass js-drawer-open" aria-label="' + T("a11y.openMenu", "Open menu") + '" type="button" style="display:none">' +
          '<span class="glass-surface-wrapper" style="border-radius:9999px">' +
            '<span class="glass-surface-effect"></span>' +
            '<span class="glass-surface-content btn btn-default btn-glass"><span class="label">' + T("btn.menu", "Menu") + '</span><span class="icon-box">' + icon("menu") + "</span></span>" +
          "</span>" +
        "</button>" +
      "</div>";

    return (
      '<header class="site-header js-site-header">' +
        '<div class="gutter">' +
          /* 不再写死 height:4rem —— 那会压住 CSS 里为放大 logo 设的 min-height */
          '<div class="header-inner" style="display:flex;align-items:center;justify-content:space-between;gap:1.6rem">' +
            '<a href="index.html" class="logotype js-header-logotype" aria-label="AXiE — home">' +
              '<img class="logo-img" src="assets/logo-axie.png" alt="AXiE" />' +
            "</a>" +
            '<div class="js-header-nav-slot" style="display:flex;justify-content:center">' + navHtml + "</div>" +
            cta +
          "</div>" +
        "</div>" +
      "</header>"
    );
  }

  /* ---------- Drawer ---------- */
  function buildDrawer() {
    var T = window.SLi18n ? window.SLi18n.t : function (k, f) { return f || k; };
    var links = (D.nav || [])
      .map(function (n) {
        return '<a class="drawer-link hover-accent" href="' + n.href + '" data-i18n="' +
          (n.i18n || "") + '">' + T(n.i18n, n.label) + "</a>";
      })
      .join("");
    return (
      '<div class="drawer js-drawer" role="dialog" aria-modal="true" aria-label="' + T("btn.menu", "Menu") + '">' +
        '<div class="drawer-panel">' +
          '<button class="btn btn-default btn-glass js-drawer-close drawer-close" type="button">' +
            '<span class="glass-surface-wrapper" style="border-radius:9999px">' +
              '<span class="glass-surface-effect"></span>' +
              '<span class="glass-surface-content btn btn-default btn-glass"><span class="label">' + T("btn.close", "Close") + '</span><span class="icon-box">' + icon("close") + "</span></span>" +
            "</span>" +
          "</button>" +
          '<div style="margin-top:3.2rem">' + links + "</div>" +
          /* 语言切换不再重复放在抽屉里 —— 右上角浮标在所有页面都可达 */
          '<div style="margin-top:auto;padding-top:3.2rem;display:flex;align-items:center;gap:1.6rem;flex-wrap:wrap">' +
            glassButton({ label: T("btn.getInTouch", "Get In Touch"), i18n: "btn.getInTouch", href: "contact.html", size: "default" }) +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var T = window.SLi18n ? window.SLi18n.t : function (k, f) { return f || k; };
    var navLinks = (D.nav || [])
      .map(function (n) {
        return (
          '<a class="footer-nav-link" href="' + n.href + '">' +
            '<span data-i18n="' + (n.i18n || "") + '">' + T(n.i18n, n.label) + "</span>" +
            '<span class="footer-arrow">' + icon("arrow") + "</span>" +
          "</a>"
        );
      })
      .join("");

    var socials = ["Instagram", "X", "LinkedIn", "YouTube"]
      .map(function (s) {
        return '<a class="badge hover-accent" href="#">' + s + "</a>";
      })
      .join("");

    return (
      '<footer class="site-footer border-t-4 mt-0">' +
        '<div class="gutter py-80">' +
          '<div class="grid grid-cols-12 gap-x-gutter" style="row-gap:4.8rem">' +
            '<div class="col-span-full md:col-span-4">' +
              '<a href="index.html" class="logotype" style="margin-bottom:2.4rem">' +
                '<span class="logo-glyph">' + icon("triangle") + "</span>" +
                '<span class="logo-type">AXiE</span>' +
              "</a>" +
              '<p class="type-sm text-fg-75 max-w-70ch" style="margin-bottom:2.4rem" data-i18n="footer.tagline">' +
                T("footer.tagline", "A film-grade creative studio.") +
              "</p>" +
              '<div class="social-badges">' + socials + "</div>" +
            "</div>" +

            '<div class="col-span-full md:col-span-5 md:col-start-6 border-x-4" style="padding-inline:2.4rem">' +
              '<div class="type-label text-fg-40" style="margin-bottom:1.6rem" data-i18n="footer.navigate">' + T("footer.navigate", "Navigate") + "</div>" +
              navLinks +
            "</div>" +

            '<div class="col-span-full md:col-span-3 md:col-start-11">' +
              '<div class="type-label text-fg-40" style="margin-bottom:1.6rem" data-i18n="home.newBusiness">' + T("home.newBusiness", "New Business") + "</div>" +
              '<a class="type-heading-xs hover-accent underline" href="mailto:xiewenshengx@gmail.com" style="display:block;margin-bottom:2.4rem">xiewenshengx@gmail.com</a>' +
              '<div class="type-label text-fg-40" style="margin-bottom:1.2rem" data-i18n="footer.follow">' + T("footer.follow", "Follow") + "</div>" +
              '<form class="input-group" onsubmit="return false">' +
                '<span class="badge">Email</span>' +
                '<input type="email" placeholder="you@studio.com" aria-label="Email address" />' +
                '<button class="btn btn-sm btn-glass" type="submit" aria-label="Subscribe"><span class="icon-box">' + icon("arrow") + "</span></button>" +
              "</form>" +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="gutter border-t-4">' +
          '<div class="flex flex-wrap items-center justify-between" style="gap:1.6rem;padding-block:2.4rem">' +
            '<span class="type-sm text-fg-60">&copy; ' + new Date().getFullYear() + " AXiE, Inc. " + T("footer.rights", "All rights reserved.") + "</span>" +
            '<span class="flex" style="gap:2.4rem">' +
              '<a class="type-sm text-fg-60 hover-accent" href="legal.html" data-i18n="footer.privacy">' + T("footer.privacy", "Privacy") + "</a>" +
              '<a class="type-sm text-fg-60 hover-accent" href="legal.html" data-i18n="footer.legal">' + T("footer.legal", "Legal") + "</a>" +
            "</span>" +
          "</div>" +
        "</div>" +
      "</footer>"
    );
  }

  /* ---------- 注入 ---------- */
  function inject() {
    var T = window.SLi18n ? window.SLi18n.t : function (k, f) { return f || k; };
    document.body.insertAdjacentHTML("afterbegin", SVG_DEFS);
    document.body.insertAdjacentHTML("afterbegin", '<a class="skip-link" href="#main" data-i18n="a11y.skip">' + T("a11y.skip", "Skip to content") + "</a>");
    /* 语言浮标：body 直属 + fixed，永远在右上角，不参与 header 的流式/归位动画。
       可视化编辑器会把运行时 DOM 回写进 HTML —— brand/stills/contact/index 里
       已经有一份静态浮标了，这里必须先查重，否则会挂出两枚重叠的开关。 */
    if (!document.querySelector(".js-lang-dock")) {
      document.body.insertAdjacentHTML("afterbegin", langSwitchHtml());
    }

    var hSlot = document.getElementById("site-header");
    if (hSlot) hSlot.outerHTML = buildHeader();

    var dSlot = document.getElementById("site-drawer");
    if (dSlot) dSlot.outerHTML = buildDrawer();

    var fSlot = document.getElementById("site-footer");
    if (fSlot) fSlot.outerHTML = buildFooter();

    var oSlot = document.getElementById("site-overlay");
    var isHome = document.body.getAttribute("data-page") === "home";
    if (oSlot) {
      oSlot.outerHTML =
        '<div class="transition-overlay js-transition-overlay' + (isHome ? " is-home" : "") + '"></div>';
    }

    // 声明式按钮：<span class="js-btn" data-label="…" data-href="…" data-icon="arrow" data-size="lg">
    Array.prototype.forEach.call(document.querySelectorAll(".js-btn"), function (el) {
      var d = el.dataset;
      el.outerHTML = glassButton({
        label: d.label || "Button",
        i18n: d.i18n || "",
        href: d.href || "#",
        icon: d.icon || "",
        size: d.size || "default",
        variant: d.variant || "glass"
      });
    });
  }

  inject();

  /* ---------- Drawer 行为 ---------- */
  document.addEventListener("click", function (e) {
    var open = e.target.closest(".js-drawer-open");
    var close = e.target.closest(".js-drawer-close");
    var drawer = document.querySelector(".js-drawer");
    if (!drawer) return;
    if (open) {
      drawer.classList.add("is-open");
      if (window.SLLenis && window.SLLenis.lenis) window.SLLenis.lenis.stop();
    } else if (close || e.target === drawer) {
      drawer.classList.remove("is-open");
      if (window.SLLenis && window.SLLenis.lenis) window.SLLenis.lenis.start();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var drawer = document.querySelector(".js-drawer");
      if (drawer && drawer.classList.contains("is-open")) {
        drawer.classList.remove("is-open");
        if (window.SLLenis && window.SLLenis.lenis) window.SLLenis.lenis.start();
      }
    }
  });

  /* 响应式显隐：
     - 胶囊导航：仅「桌面 + 内页」可见（首页按新要求不放任何菜单项）
     - Menu 抽屉入口：只在窄屏放出来；桌面完全不出现（首页也不再出现） */
  function syncResponsiveCta() {
    var isDesktop = window.matchMedia("(min-width: 48rem)").matches;
    var nav = document.querySelector(".js-header-nav");
    var menuBtn = document.querySelector(".js-drawer-open");
    var isHome = document.body.getAttribute("data-page") === "home";
    if (nav) nav.style.display = isDesktop && !isHome ? "" : "none";
    if (menuBtn) menuBtn.style.display = isDesktop ? "none" : "";
  }
  window.addEventListener("resize", syncResponsiveCta);
  syncResponsiveCta();

  /* ---------- 声音开关 ---------- */
  /* 默认静音（自动播放策略），用户点一下解锁声音；
     之后进入视口的视频带声播放，选择记进 localStorage */
  function buildSoundToggle() {
    var T = window.SLi18n ? window.SLi18n.t : function (k, f) { return f || k; };
    var host = document.querySelector(".js-audio-toggle");
    if (!host) return;

    var btn =
      '<button class="btn btn-default btn-glass sound-toggle js-sound-toggle" type="button" ' +
        'aria-pressed="false" aria-label="' + T("sound.turnOn", "Turn sound on") + '">' +
        '<span class="glass-surface-wrapper" style="border-radius:9999px">' +
          '<span class="glass-surface-effect"></span>' +
          '<span class="glass-surface-content btn btn-default btn-glass">' +
            '<span class="icon-box js-sound-icon">' + icon("sound-off") + "</span>" +
            '<span class="label js-sound-label">' + T("sound.off", "Sound Off") + "</span>" +
          "</span>" +
        "</span>" +
      "</button>";
    host.outerHTML = btn;

    var real = document.querySelector(".js-sound-toggle");
    if (!real) return;

    real.addEventListener("click", function () {
      if (!window.SLMedia) return;
      var on = window.SLMedia.toggleSound();
      real.classList.toggle("is-on", on);
    });

    if (window.SLMedia) {
      window.SLMedia.onSoundChange(function (on) {
        real.setAttribute("aria-pressed", on ? "true" : "false");
        real.setAttribute("aria-label", T(on ? "sound.turnOff" : "sound.turnOn", on ? "Turn sound off" : "Turn sound on"));
        real.classList.toggle("is-on", on);
        var ic = real.querySelector(".js-sound-icon");
        var lb = real.querySelector(".js-sound-label");
        if (ic) ic.innerHTML = icon(on ? "sound-on" : "sound-off");
        if (lb) lb.textContent = T(on ? "sound.on" : "sound.off", on ? "Sound On" : "Sound Off");
      });
    }

    /* 切语言后刷新这枚按钮的文案（图标取决于声音状态，不随语言变） */
    if (window.SLi18n) {
      window.SLi18n.onChange(function () {
        var lb = real.querySelector(".js-sound-label");
        var on = window.SLMedia && window.SLMedia.isSoundOn();
        if (lb) lb.textContent = window.SLi18n.t(on ? "sound.on" : "sound.off", on ? "Sound On" : "Sound Off");
        real.setAttribute("aria-label", window.SLi18n.t(on ? "sound.turnOff" : "sound.turnOn", ""));
      });
    }
  }
  buildSoundToggle();

  /* ---------- 语言切换（EN / 中 拨片） ---------- */
  function buildLangToggle() {
    if (!window.SLi18n) return;

    /* 页面上可能有多个实例（header + 抽屉），全部接线 */
    var btns = document.querySelectorAll(".js-lang-toggle");
    if (!btns.length) return;

    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener("click", function () {
        window.SLi18n.set(window.SLi18n.lang() === "zh" ? "en" : "zh");
      });
    });

    window.SLi18n.onChange(function () {
      var lang = window.SLi18n.lang();
      Array.prototype.forEach.call(btns, function (btn) {
        btn.setAttribute("aria-label", window.SLi18n.t("lang.switch", "Switch language"));
        btn.setAttribute("aria-checked", lang === "zh" ? "true" : "false");
        btn.classList.toggle("is-zh", lang === "zh");
        btn.classList.toggle("is-en", lang === "en");
      });
    });
  }
  buildLangToggle();

  /* 导航文案随语言重刷（数据层里存的是键，这里统一刷新） */
  if (window.SLi18n) {
    window.SLi18n.onChange(function () {
      window.SLi18n.apply(document);
    });
    window.SLi18n.apply(document);
  }
})();
