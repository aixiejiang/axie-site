/* =============================================================
   全局运行时
   1) Lenis × GSAP ticker 统一时钟（效果 01）
   2) 开场编排状态机（效果 13）
   3) Header 网格归位动画（效果 04）
   4) 页面转场：离开遮罩 / 进入裁切揭示（效果 07）
   5) 通用滚动揭示
   ============================================================= */

(function () {
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var Lenis = window.Lenis;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var isHome = document.body.getAttribute("data-page") === "home";

  /* ---------- 1. 平滑滚动：统一时钟 ---------- */
  var lenis = null;
  if (Lenis && !reduce) {
    lenis = new Lenis({
      duration: 0.75,
      autoRaf: false,          // 关键：交给 GSAP ticker
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      /* 关闭自带锚点处理：锚点交给 home.js 的 lenis.scrollTo，
         否则点击导航会双触发，看起来"卡一下" */
      anchors: false
    });

    if (gsap) {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
    }

    if (ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
    window.SLLenis = { lenis: lenis };
  }

  /* ---------- 2. 内部链接：转场后跳转 ---------- */
  var LEAVE_DURATION = 0.2;

  /* 第二十四轮：跳转前把「从哪来的」记进 sessionStorage。
     内页的后退按钮（assets/js/back.js）靠它判断能不能 history.back()。
     为什么不用 document.referrer：referrer 会被抹掉 ——
     站点被塞进 <iframe referrerpolicy="no-referrer">、从 target="_blank" 打开、
     浏览器/中间层设了 Referrer-Policy，它都会是空串，那时后退按钮就只能按
     写死的 href 跳，去的不是「上一页」。sessionStorage 不受这些策略影响。

     放在 leaveTo() 里是有讲究的：只有「真的决定要往前走」的时候才记录。
     如果记在 click 的捕获阶段，点击后退按钮本身也会写一次 ——
     于是 back.js 判「有没有站内来源」时永远为真，反而永远退回不去。 */
  function rememberSource() {
    try { sessionStorage.setItem("sl:from", location.pathname + location.search); } catch (e) {}
  }

  function leaveTo(href) {
    rememberSource();
    var overlay = document.querySelector(".js-transition-overlay");
    if (!overlay || !gsap || reduce) { location.href = href; return; }
    overlay.style.visibility = "visible";
    gsap.set(overlay, { autoAlpha: 0, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
    gsap.to(overlay, {
      autoAlpha: 1,
      duration: LEAVE_DURATION,
      ease: "linear",
      onComplete: function () { location.href = href; }
    });
  }

  document.addEventListener("click", function (e) {
    /* 关键：如果更内层的处理器已经 preventDefault（例如作品卡 / 人物卡 /
       WATCH SHOWREEL 按钮被 list.js / talent.js / player.js 接管成弹层），
       这里必须放行，否则会把弹层入口重新变成整页跳转。 */
    if (e.defaultPrevented) return;
    var a = e.target.closest("a[href]");
    if (!a) return;
    /* 新标签 / 新窗口意图交给浏览器 */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    if (href.indexOf("http") === 0 && href.indexOf(location.host) === -1) return;
    // 同页锚点交给滚动，其余走转场
    e.preventDefault();
    leaveTo(href);
  });

  /* ---------- 3. Header 归位（效果 04） ---------- */

  /* 内页：进入后 logo（左）与「联系我们」（右）快速向中间聚拢，
     最终停在胶囊导航栏两侧，形成一组居中紧凑的顶部条。
     用 gsap 的 x 而不是 CSS transform —— headerIntro 已经在给这三个元素
     写 inline transform，两套写法会互相覆盖。 */
  function headerParts() {
    var header = document.querySelector(".js-site-header");
    if (!header) return null;
    return {
      logo: header.querySelector(".js-header-logotype"),
      nav: header.querySelector(".js-header-nav"),
      cta: header.querySelector(".js-header-cta")
    };
  }

  /* ---------- 导航六颗胶囊「一样大」 ----------
     宽度必须在 JS 里量：中文「剧照」和英文「Featured Works」差一倍多，
     写死一个 CSS 宽度，切语言后不是撑破就是留一堆空白。
     做法：先把 --nav-item-w 归零 → 量出本语言下最宽那一项 → 其余补齐到同宽
     （CSS 里 min-width 读这个变量，文字居中、单行）。
     空间不够时（窄屏）自动退回自然宽度，不让导航把 header 撑破。 */
  function equalizeNavItems() {
    var nav = document.querySelector(".js-header-nav");
    var inner = document.querySelector(".header-inner");
    if (!nav || !inner) return;
    var items = nav.querySelectorAll(".nav-item");
    if (!items.length) return;

    nav.style.setProperty("--nav-item-w", "0px");
    var widest = 0;
    Array.prototype.forEach.call(items, function (el) {
      widest = Math.max(widest, el.getBoundingClientRect().width);
    });
    if (!widest) return;

    /* 可用宽度 = header 内容宽 - logo - 联系我们 - 两侧各 16px 间隙 */
    var logo = document.querySelector(".js-header-logotype");
    var cta = document.querySelector(".js-header-cta");
    var ctaW = (cta && getComputedStyle(cta).display !== "none")
      ? cta.getBoundingClientRect().width : 0;
    var budget = inner.getBoundingClientRect().width
      - (logo ? logo.getBoundingClientRect().width : 0) - ctaW - 32;
    var gaps = 4 * (items.length - 1);

    if (widest * items.length + gaps <= budget) {
      nav.style.setProperty("--nav-item-w", Math.ceil(widest) + "px");
    }
  }

  var convLockUntil = 0;
  function convergeHeader(immediate) {
    var p = headerParts();
    if (!p || !p.logo || !p.nav || !p.cta || !gsap) return;

    /* 调试埋点：探针会读它，用来确认"到底有没有真的渐变"以及谁在插队 */
    (window.__convTrace = window.__convTrace || []).push({ t: Date.now(), immediate: !!immediate });

    var isDesktop = window.matchMedia("(min-width: 48rem)").matches;
    var navVisible = getComputedStyle(p.nav).display !== "none";
    if (!isDesktop || !navVisible) {
      gsap.set([p.logo, p.nav, p.cta], { x: 0, rotation: 0.01 });
      return;
    }

    /* 每次落位前先校准胶囊宽度：它决定了导航总宽，
       进而决定 logo / 联系我们 要往中间走多远 */
    equalizeNavItems();

    /* 瞬时归位（resize / 切语言）不能插队正在跑的入场动画 ——
       插队会把 0.72s 的渐变压成瞬移，看起来像直接跳过去。
       用时间锁而不是 gsap.isTweening()：入场 tween 带 0.18s delay，
       那段窗口里 isTweening 判定不成立，实测照样被插队。 */
    if (immediate) {
      if (Date.now() < convLockUntil) return;
    } else {
      convLockUntil = Date.now() + 1400;
    }

    /* 先归零再测量：否则上一次的位移会混进 rect，越算越偏 */
    gsap.set([p.logo, p.cta], { x: 0, rotation: 0.01 });

    var gap = 16;
    var navRect = p.nav.getBoundingClientRect();
    var logoRect = p.logo.getBoundingClientRect();
    var ctaRect = p.cta.getBoundingClientRect();

    /* 目标：logo 右缘贴到导航左缘 - gap；联系我们左缘贴到导航右缘 + gap */
    var xLogo = Math.max(0, (navRect.left - gap) - logoRect.right);
    var xCta = Math.min(0, (navRect.right + gap) - ctaRect.left);

    gsap.to(p.logo, {
      x: xLogo, duration: immediate ? 0 : 0.72, delay: immediate ? 0 : 0.18,
      ease: "expo.out", rotation: 0.01
    });
    gsap.to(p.cta, {
      x: xCta, duration: immediate ? 0 : 0.72, delay: immediate ? 0 : 0.18,
      ease: "expo.out", rotation: 0.01
    });
  }

  function headerIntro() {
    var header = document.querySelector(".js-site-header");
    if (!header || !gsap) return;
    header.classList.add("is-ready");

    if (reduce) return;

    var p = headerParts();
    if (!p || !p.logo || !p.nav || !p.cta) return;

    /* 首页：logo 在左上角、右侧只有语言浮标与「联系我们」，
       不做任何位移（做过一版会来回弹，取消）。 */
    if (isHome) {
      gsap.set([p.logo, p.nav, p.cta], { x: 0, rotation: 0.01 });
      return;
    }

    gsap.set(p.nav, { x: 0, rotation: 0.01 });
    convergeHeader(false);
  }

  /* 视口变化 / 语言切换都会改变导航宽度，重算一次落位 */
  if (!reduce && gsap) {
    var convTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(convTimer);
      convTimer = setTimeout(function () { convergeHeader(true); }, 160);
    });
    if (window.SLi18n && window.SLi18n.onChange) {
      window.SLi18n.onChange(function () {
        setTimeout(function () { convergeHeader(true); }, 80);
      });
    }
    /* 兜底落位：字体/i18n 落地后导航宽度可能还会变一次，
       入场动画跑完后再校准一次（此时不会撞上 tween）。 */
    if (!isHome) setTimeout(function () { convergeHeader(true); }, 1800);
  }

  /* ---------- 4. 进入：裁切揭示 ---------- */
  function enterReveal() {
    var overlay = document.querySelector(".js-transition-overlay");
    var main = document.getElementById("main");
    if (!gsap) { document.documentElement.classList.remove("is-booting"); return; }

    if (reduce || !overlay) {
      document.documentElement.classList.remove("is-booting");
      if (overlay) overlay.style.visibility = "hidden";
      return;
    }

    gsap.set(overlay, { autoAlpha: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
    if (main) gsap.set(main, { y: "4rem", scale: 1.015 });

    var tl = gsap.timeline({
      defaults: { duration: 1.3, ease: "expo.out" },
      onComplete: function () {
        overlay.style.visibility = "hidden";
        if (main) gsap.set(main, { clearProps: "all" });
        if (ScrollTrigger) ScrollTrigger.refresh();
      }
    });
    tl.to(overlay, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }, 0)
      .to(main || {}, { y: 0, scale: 1 }, 0);

    document.documentElement.classList.remove("is-booting");
  }

  /* ---------- 5. 通用滚动揭示 ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!gsap || reduce) {
      items.forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      return;
    }
    items.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  /* ---------- 启动时序 ---------- */
  function boot() {
    /* 先确保画廊与媒体已挂载（脚本在 index.html 末尾已调 mount，
       此处兜底一次，防止挂载顺序变动导致空轨道） */
    if (window.SLFrames && window.SLFrames.mount) {
      try { window.SLFrames.mount(); } catch (e) {}
    }
    if (window.SLMedia && window.SLMedia.mount) {
      try { window.SLMedia.mount(document); } catch (e) {}
    }
    /* 全屏播放器：等媒体挂载完再绑，才能拿到 video 元素做暂停/恢复。
       但**首页不再给背景画面挂点击** —— 需求要求「每个视频都只能通过
       WATCH SHOWREEL 按钮点击进去」，点画面不应该打开播放器。
       只有在 <body data-scene-play="1"> 的页面才启用"点画面即播"。 */
    var sceneClickable = document.body.getAttribute("data-scene-play") === "1";
    if (sceneClickable && window.SLPlayer && window.SLPlayer.bindScenes) {
      try { window.SLPlayer.bindScenes(document); } catch (e) {}
    }

    initReveal();
    headerIntro();
    if (ScrollTrigger) ScrollTrigger.refresh();
    // 等一帧再揭示，确保布局与场景已就绪
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        enterReveal();
        /* 转场结束后再 refresh 一次：此时 header/logo/画廊尺寸才最终确定 */
        if (ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);

  window.SLApp = { lenis: lenis, leaveTo: leaveTo };
})();
