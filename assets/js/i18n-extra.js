/* =============================================================
   内容层中英文切换（SLi18nExtra）
   界面文案由 i18n.js 的 DICT 负责；这里负责**内容层**：
   - 集合页（brand / stills / narrative）的 标题 / 导语 / 计数
   - 作品卡片上的 类目 / 描述
   - 详情页（work.html）的 类目 / 描述
   - 页脚、按钮等由 data-i18n 声明式处理

   设计要点：
   - 所有改写都在语言切换时**重新渲染一遍**，不做增量 diff，
     避免出现半中半英的中间态。
   - 通过 MutationObserver 捕获 JS 动态生成的节点（作品卡片、画廊），
     生成后立刻套用当前语言。
   - 专有名词（客户名 / 作品名）不翻译。

   对外接口：
     SLi18nExtra.install()   安装（DOMContentLoaded 后调用）
     SLi18nExtra.refresh()   强制重刷
   ============================================================= */

window.SLi18nExtra = (function () {
  var D = window.SL_DATA || {};
  var mounted = false;
  var observer = null;

  function T(key, fb) {
    return window.SLi18n ? window.SLi18n.t(key, fb) : fb || key;
  }
  function pick(row, fb) {
    if (!row) return fb || "";
    var l = window.SLi18n ? window.SLi18n.lang() : "en";
    return row[l] !== undefined ? row[l] : row.en !== undefined ? row.en : fb || "";
  }

  /* ---------- 类目 / 集合元信息 ---------- */
  function categoryLabel(cat) {
    var row = D.i18n && D.i18n.categories && D.i18n.categories[cat];
    return pick(row, cat);
  }
  function collectionMeta(slug) {
    return (D.i18n && D.i18n.collections && D.i18n.collections[slug]) || null;
  }

  /* ---------- 集合页：页头 ---------- */
  function applyCollectionHeader() {
    var slug = document.body.getAttribute("data-collection");
    if (!slug) return;
    var meta = collectionMeta(slug);
    if (!meta) return;

    var title = document.querySelector(".js-collection-title");
    var intro = document.querySelector(".js-collection-intro");
    var count = document.querySelector(".js-collection-count");

    if (title) title.textContent = pick(meta.title, title.textContent);
    if (intro) {
      /* 数据层里集合自身也有 intro（英文），优先用 i18n 表 */
      intro.textContent = pick(meta.intro, D[slug] && D[slug].intro ? D[slug].intro : intro.textContent);
    }
    /* 第二行定位语（品牌页「让我们一起打造您的品牌故事」）。
       没有配 intro2 的集合要把这一行清空，否则会留着上一版文案。 */
    var intro2 = document.querySelector(".js-collection-intro-2");
    if (intro2) intro2.textContent = pick(meta.intro2, "");
    if (count) {
      var n = (D[slug] && D[slug].works && D[slug].works.length) || 0;
      count.textContent = n < 10 ? "0" + n : String(n);
    }

    /* 计数后面的 "Projects" 单位 */
    var unit = document.querySelector(".js-collection-count-unit");
    if (unit) unit.textContent = T("unit.projects", "Projects");
  }

  /* ---------- 作品卡片（集合页 / 详情页相邻推荐） ---------- */
  function applyWorkCards(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll("[data-work-category]"), function (el) {
      el.textContent = categoryLabel(el.getAttribute("data-work-category"));
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-work-blurb]"), function (el) {
      var slug = el.getAttribute("data-work-blurb");
      var w = findWork(slug);
      if (w) el.textContent = blurbOf(w);
    });
  }

  function findWork(slug) {
    var pools = [D.brand, D.narrative, D.stills];
    for (var i = 0; i < pools.length; i++) {
      var list = (pools[i] && pools[i].works) || [];
      for (var k = 0; k < list.length; k++) if (list[k].slug === slug) return list[k];
    }
    return null;
  }

  /* 内容层翻译表里若没有该 slug，就回退到英文原文 */
  function blurbOf(w) {
    var row = D.i18n && D.i18n.workBlurbs && D.i18n.workBlurbs[w.slug];
    if (row) return pick(row, w.blurb);
    return w.blurb;
  }

  /* ---------- 模特与演员 ----------
     人物卡的姓名 / 身份 / 常驻地 / 人物介绍按 slug 查表覆盖；
     查不到就保留数据层英文原文。 */
  function talentMeta(slug) {
    return (D.i18n && D.i18n.talent && D.i18n.talent[slug]) || null;
  }
  function roleLabel(role) {
    var row = D.i18n && D.i18n.roles && D.i18n.roles[role];
    return pick(row, role);
  }
  function talentField(slug, field, fb) {
    var meta = talentMeta(slug);
    if (!meta) return fb || "";
    if (field === "role") {
      /* role 走 roles 通用表，slug 从数据层取 */
      var person = null;
      var pool = D.talent || [];
      for (var i = 0; i < pool.length; i++) if (pool[i].slug === slug) person = pool[i];
      return person ? roleLabel(person.role) : fb || "";
    }
    return pick(meta[field], fb);
  }

  function applyTalent(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll("[data-talent-field]"), function (el) {
      var slug = el.getAttribute("data-talent-slug");
      var field = el.getAttribute("data-talent-field");
      if (!slug || !field) return;
      el.textContent = talentField(slug, field, el.textContent);
    });
  }

  /* ---------- 详情页 ---------- */
  function applyWorkPage() {
    if (!document.querySelector(".js-project-hero-scene")) return;
    var cat = document.querySelector(".js-category");
    if (cat && cat.getAttribute("data-cat-raw")) {
      cat.textContent = categoryLabel(cat.getAttribute("data-cat-raw"));
    }
  }

  /* ---------- 统一重刷 ---------- */
  function refresh() {
    applyCollectionHeader();
    applyWorkCards(document);
    applyTalent(document);
    applyWorkPage();
    /* 声明式界面文案 */
    if (window.SLi18n) window.SLi18n.apply(document);
    /* 标签页 / 面板等动态文案 */
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-live]"), function (el) {
      el.textContent = T(el.getAttribute("data-i18n-live"), el.textContent);
    });
    document.documentElement.setAttribute("data-lang", window.SLi18n ? window.SLi18n.lang() : "en");
  }

  /* ---------- 动态节点：生成后立刻套用当前语言 ---------- */
  function watch() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (records) {
      var need = false;
      records.forEach(function (r) {
        if (r.addedNodes && r.addedNodes.length) need = true;
      });
      if (!need) return;
      /* 合并同一帧内的多次变更，避免连锁触发 */
      if (observer.__pending) return;
      observer.__pending = true;
      requestAnimationFrame(function () {
        observer.__pending = false;
        applyWorkCards(document);
        applyTalent(document);
        applyWorkPage();
        if (window.SLi18n) window.SLi18n.apply(document);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function install() {
    if (mounted) return;
    mounted = true;

    if (window.SLi18n) window.SLi18n.onChange(function () { refresh(); });

    /* 立即刷一次（此时可能还有渲染脚本没跑，没关系，后面会补） */
    refresh();

    /* 各页面自己的渲染脚本（list.js / project.js / works.js）会在本文件之后
       执行，并把数据层的英文原文重新写回 DOM。所以必须在它们跑完之后
       再补刷几次；用 rAF + load + 定时三段式，覆盖到异步渲染的卡片。 */
    requestAnimationFrame(refresh);
    window.addEventListener("load", function () {
      refresh();
      setTimeout(refresh, 60);
      setTimeout(refresh, 400);   /* 兜住异步生成的画廊 */
    });
    document.addEventListener("sl:rendered", function () { refresh(); });
    watch();
  }

  return {
    install: install,
    refresh: refresh,
    categoryLabel: categoryLabel,
    talentField: talentField,
    roleLabel: roleLabel
  };
})();
