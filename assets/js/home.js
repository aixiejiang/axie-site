/* =============================================================
   首页：全屏吸附 + scrub 3D 转场 + 导航跟随指示器
   ============================================================= */

(function () {
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.querySelector(".js-index-scroll");
  if (!root) return;

  var sections = Array.prototype.slice.call(root.querySelectorAll(".js-snap-item"));
  if (!sections.length) return;

  /* ---------- 效果 02：scrub 三段式转场 ---------- */
  /* 关键：内层不能用 yPercent —— 内层高度是 100lvh 的局部坐标系，
     yPercent:12 会被解析成局部像素（12% × 1.22 ≈ 132px，比屏幕还高），
     接缝处上一屏下移、下一屏上移，视觉上就是"上下分屏"。
     改用 fpY：按视口高度换算的像素值，两屏偏移严格互等、互相抵消。 */
  var SCRUB = { shiftPx: 0.07, scaleOut: 1.22, rotate: 5, fade: 0.62 };

  function scrubShift() {
    return window.innerHeight * SCRUB.shiftPx; // 例：900 × 0.07 = 63px
  }

  sections.forEach(function (section) {
    var inner = section.querySelector(".js-snap-item-inner");
    if (!inner) return;

    if (reduce) {
      gsap.set(inner, { y: 0, scale: 1, rotate: 0, opacity: 1 });
      return;
    }

    var s = scrubShift();
    /* 用函数式取值，resize 后由 ScrollTrigger.refresh() 重新求值 */
    var tl = gsap.timeline({
      defaults: { duration: 1, ease: "linear", force3D: true }
    })
      .set(inner, {
        y: function () { return -scrubShift(); },
        scale: SCRUB.scaleOut,
        rotate: SCRUB.rotate,
        opacity: SCRUB.fade
      })
      .to(inner, {
        y: 0,
        scale: 1,
        rotate: 0,
        opacity: 1
      })
      .to(inner, {
        y: function () { return scrubShift(); },
        scale: SCRUB.scaleOut,
        rotate: -SCRUB.rotate,
        opacity: SCRUB.fade
      });

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      animation: tl,
      /* 离开视口后清掉内联 transform，避免残留偏移叠加 */
      onToggle: function (self) {
        if (!self.isActive) gsap.set(inner, { clearProps: "transform,opacity" });
      }
    });
  });

  /* ---------- 吸附：Lenis Snap ---------- */
  var lenis = window.SLLenis && window.SLLenis.lenis;
  if (lenis && window.Snap && !reduce) {
    try {
      var snap = new window.Snap(lenis, { type: "mandatory", distanceThreshold: "30%" });
      snap.addElements(sections, { align: ["center"] });
      window.addEventListener("resize", function () { snap.resize(); });
    } catch (err) {
      /* Snap 不可用时忽略，平滑滚动仍然生效 */
    }
  }

  /* ---------- 效果 03：导航跟随指示器 ---------- */
  var nav = document.querySelector(".js-header-nav");
  var indicator = document.querySelector(".js-nav-indicator");
  var hoverBox = document.querySelector(".js-nav-hover-box");
  var navItems = nav ? Array.prototype.slice.call(nav.querySelectorAll(".js-nav-item")) : [];

  // 屏 → 导航项 的映射（首尾 showreel 屏分别映射到首/末项）
  function navIndexForSection(i) {
    if (!navItems.length) return 0;
    if (i <= 0) return 0;
    if (i >= sections.length - 1) return navItems.length - 1;
    return Math.min(i - 1, navItems.length - 1);
  }

  function measure() {
    return {
      centers: sections.map(function (s) {
        return s.getBoundingClientRect().top + window.scrollY + s.offsetHeight / 2;
      }),
      navCenters: navItems.map(function (n) {
        var r = n.getBoundingClientRect();
        return r.left + r.width / 2;
      }),
      navLeft: nav ? nav.getBoundingClientRect().left : 0
    };
  }

  var m = measure();

  function updateIndicator(scrollY) {
    if (!indicator || !navItems.length) return;
    var p = scrollY + window.innerHeight / 2;
    var centers = m.centers;

    var i = 0;
    for (var k = 0; k < centers.length - 1; k++) {
      if (p >= centers[k]) i = k;
    }
    var a = centers[i];
    var b = centers[i + 1] !== undefined ? centers[i + 1] : a + 1;
    var t = (p - a) / (b - a);
    t = Math.max(0, Math.min(1, t));

    var ia = navIndexForSection(i);
    var ib = navIndexForSection(i + 1);
    var xa = m.navCenters[ia] - m.navLeft;
    var xb = m.navCenters[ib] - m.navLeft;
    var x = xa + (xb - xa) * t;

    gsap.set(indicator, { x: x - 3, opacity: 1 });

    navItems.forEach(function (n, idx) {
      n.classList.toggle("is-current", idx === (t > 0.5 ? ib : ia));
    });
  }

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) { updateIndicator(self.scroll()); },
    onRefresh: function () { m = measure(); updateIndicator(window.scrollY); }
  });

  /* ---------- 左侧单帧画廊：滚动驱动纵向滑动 ---------- */
  var frames = window.SLFrames;
  /* 立刻生效版：初始化/refresh/resize 时用，避免等一帧导致首屏闪位 */
  function syncFrames(p) {
    if (!frames) return;
    if (frames.setProgressNow) frames.setProgressNow(p);
    else frames.setProgress(p);
  }
  if (frames) {
    var frameST = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        /* 用「视口中心落在第几屏」换算成 0→1 进度，让画廊与转场同步 */
        var p = self.scroll() + window.innerHeight / 2;
        var centers = m.centers;
        var last = centers.length - 1;
        if (last <= 0) return syncFrames(0);
        var lo = 0;
        for (var k = 0; k < last; k++) if (p >= centers[k]) lo = k;
        var a = centers[lo];
        var b = centers[lo + 1] !== undefined ? centers[lo + 1] : a + 1;
        var t = Math.max(0, Math.min(1, (p - a) / (b - a)));
        frames.setProgress((lo + t) / last);
      },
      onRefresh: function () {
        m = measure();
        syncFrames(0);
      }
    });
    /* 初始位置：必须立刻定位，不能等下一帧，否则首屏会先闪一下旧位置 */
    syncFrames(0);
  }

  /* ---------- 导航 hover 方框 ---------- */
  if (hoverBox) {
    navItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        var r = item.getBoundingClientRect();
        var nr = nav.getBoundingClientRect();
        gsap.set(hoverBox, {
          x: r.left - nr.left,
          y: r.top - nr.top,
          width: r.width,
          height: r.height,
          opacity: 1
        });
      });
      item.addEventListener("mouseleave", function () {
        gsap.set(hoverBox, { opacity: 0 });
      });
      item.addEventListener("click", function (e) {
        e.preventDefault();
        var target = item.getAttribute("data-target");
        var el = target ? document.getElementById(target) : null;
        if (!el) return;
        if (lenis) lenis.scrollTo(el, { duration: 1 });
        else el.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  window.addEventListener("resize", function () {
    m = measure();
    updateIndicator(window.scrollY);
  });

  updateIndicator(window.scrollY);
  if (frames) syncFrames(0);
})();
