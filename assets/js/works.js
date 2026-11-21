/* =============================================================
   列表页：Logo 跑马灯（效果 10）+ 三视图 Tabs（效果 11）+ Carousel 拖拽
   ============================================================= */

(function () {
  /* ---------- 跑马灯：测量内容宽度，写入 CSS 变量 ---------- */
  function initMarquee(view) {
    var inner = view.querySelector(".js-marquee");
    if (!inner) return;
    var rail = inner.querySelector(".js-marquee-rail");
    if (!rail) return;

    function measure() {
      var w = rail.getBoundingClientRect().width;
      // 内容复制两份，左移一份宽度 = 无缝衔接
      inner.style.setProperty("--marquee-content-width", "-" + w + "px");
      var speed = 60; // px/s
      inner.style.setProperty("--marquee-duration", (w / speed).toFixed(2) + "s");
    }

    // 复制一份保证首尾相接
    if (!inner.getAttribute("data-cloned")) {
      var clone = rail.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.remove("js-marquee-rail");
      inner.appendChild(clone);
      inner.setAttribute("data-cloned", "1");
    }
    measure();
    window.addEventListener("resize", measure);
  }

  document.querySelectorAll(".js-marquee-view").forEach(initMarquee);

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var triggers = Array.prototype.slice.call(wrap.querySelectorAll(".js-tab"));
    var panels = Array.prototype.slice.call(wrap.querySelectorAll(".js-panel"));

    /* 默认档 = HTML 里本来就 aria-selected="true" 的那一个（brand.html 上是「网格」） */
    var DEFAULT = 0;
    triggers.forEach(function (t, i) {
      if (t.getAttribute("aria-selected") === "true") DEFAULT = i;
    });
    /* 「轮播」那一档用 data-i18n 认，不写死下标 —— 换语言/换顺序都不会认错 */
    var CAROUSEL = -1;
    triggers.forEach(function (t, i) {
      if (t.getAttribute("data-i18n") === "unit.carousel") CAROUSEL = i;
    });

    function select(idx) {
      triggers.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach(function (p, i) {
        p.hidden = i !== idx;
      });
      // 面板切换后重算滚动触发点
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (window.SLScene) window.SLScene.mount(panels[idx]);
      // 扇形面板刚显示时尺寸从 0 变成实际值，需要重画一次
      // （否则卡片会用 hidden 状态下的尺寸算位置，全都挤在中间）
      if (window.__slFanRepaint) window.__slFanRepaint();
    }

    triggers.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % triggers.length); triggers[(i + 1) % triggers.length].focus(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + triggers.length) % triggers.length); triggers[(i - 1 + triggers.length) % triggers.length].focus(); }
      });
    });

    /* ---------- 第四十九轮：从详情页退出回来时，停在**来源那一档** ----------
       第四十七轮这里写的是「一律扳回网格」；第四十九轮用户把口径**反过来**了：
         · 从**轮播**档点作品进详情页 → 退出回来要停在**轮播**（不是网格）
         · 从「全部项目」页（works.html）点进去 → 退出直接回 works.html，
           根本不经过 brand.html
       落点由详情页的退出键带回来：`brand.html?view=carousel`（见
       project-page.js 的 exitTarget()）。所以这里只做一件事：
       **URL 上写了 view=carousel 就把 tab 扳到轮播档**；没写就维持 HTML 的
       默认档（网格），不再自作主张去扳。

       为什么 pageshow 里也要判一遍：bfcache 还原后退的那一页时**页面脚本不会
       重新执行**（DOMContentLoaded / load 都不再触发，只有 pageshow 会），
       而 bfcache 会把**离开时的档位**原样恢复 —— 若用户是"从网格卡进详情页、
       又从详情页地址栏改成 ?view=carousel"这类混合路径，就靠这里兜住。

       ⚠️ 判据只认 `view=carousel` 这一个值，别写成"不是网格就扳" ——
       否则从列表档回来会被无谓地扳动（用户没要求动它）。 */
    function viewParam() {
      try { return new URLSearchParams(window.location.search).get("view") || ""; } catch (e) { return ""; }
    }
    /* 按 URL 参数选档；返回 true 表示"已按参数选过"。
       认两个值：
         · view=carousel → 轮播档（第四十九轮：从轮播卡进详情页再退出回来）
         · view=grid     → 网格档（第四十七轮：从分类页 works.html 退出回来；
                            那一页的返回键写的是 brand.html?view=grid） */
    function selectByParam() {
      var v = viewParam();
      if (!v || CAROUSEL < 0) return false;
      if (v === "carousel") { select(CAROUSEL); return true; }
      if (v === "grid") { select(DEFAULT); return true; }
      return false;
    }
    selectByParam();

    function isBackForward() {
      try {
        var n = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        if (n && n.type === "back_forward") return true;
      } catch (e) {}
      return false;
    }
    function selectedIdx() {
      var i = -1;
      triggers.forEach(function (t, k) {
        if (t.getAttribute("aria-selected") === "true") i = k;
      });
      return i;
    }
    function onPageShow(e) {
      if (!(e && e.persisted) && !isBackForward()) return;         /* 首次进入 / 刷新 */
      /* 第四十九轮：只在 URL 明确写了 view=carousel 时才扳到轮播档；
         其余情况（含"停在轮播档回来"）**保持原样** —— 用户要的就是轮播。
         （第四十七轮那句 `selectedIdx() !== CAROUSEL → 扳回网格` 已删除） */
      selectByParam();
    }
    window.addEventListener("pageshow", onPageShow);
  });

  /* 注：Carousel 已改为「扇形 + 拖拽切换」，逻辑在 list.js 的 initFan()。
     这里不再保留旧的横向 scrollLeft 拖拽，避免两套指针事件互相打架。 */

  /* ---------- 卡片 hover：联动扫光 ---------- */
  document.querySelectorAll(".js-work-card").forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      var s = card.querySelector(".sheen");
      if (s) s.classList.add("is-hover-active");
    });
    card.addEventListener("mouseleave", function () {
      var s = card.querySelector(".sheen");
      if (s) s.classList.remove("is-hover-active");
    });
  });
})();
