/* =============================================================
   第四十轮（用户第四条）：独立的「视频类型分类」页 works.html
   -------------------------------------------------------------
   背景：品牌页（brand.html）轮播下方那枚控件，从「查看项目」（<button>，
   点开播放弹层）改成了「查看更多项目」（<a href="works.html">），
   点进来就是这一页。

   注意文件命名：assets/js/works.js 早已被品牌页占用（跑马灯 + 三视图
   tabs + 卡片扫光），所以这一页的脚本叫 **works-cats.js**，别混。

   这一页做三件事：
     ① 铺出用户点名的 22 个视频类型分类（外加一个「全部」做默认项）；
     ② 点分类 → 筛选该分类下的作品（URL 带 ?cat=xxx，可分享、刷新保持）；
     ③ 该分类还没有作品时显示「敬请期待」，不留空白页。

   第五十一轮：FMAI 50 支并入后共 65 支，新条目的映射在 WORK_CAT 尾部。
  第五十二轮：新增 12 支后共 77 支，新条目的映射在 WORK_CAT 尾部。
  作品的中文分类是**这一页自己的映射表**（WORK_CAT），不动 data.js ——
   data.js 里 category 是英文的 Brand Film / TVC / Campaign…，跟用户要的
   22 个中文类目不是一套口径；改数据层会牵动品牌页 / 列表页既有的分类
   文案与一批探针判据。
   ============================================================= */
(function () {
  var D = window.SL_DATA || {};
  var works = (D.brand && D.brand.works) || [];

  /* 用户点名的 22 个类目（顺序照原话） */
  var CATS = [
    "TVC广告", "非遗文化", "产品广告", "剧情广告", "病毒广告",
    "公益广告", "旅游", "餐饮食品", "汽车", "互联网服务",
    "手机/数码", "美妆/护肤", "服装/时尚", "体育/运动", "快消产品",
    "游戏/娱乐", "地产/金融", "家电", "家居", "医疗保健",
    "珠宝配饰", "其他"
  ];
  var ALL = "全部";

  /* slug → 中文类目。按每支片子实际的品类归属来分：
       TVC广告    ：三支 data.js 里 category 本来就是 TVC 的硬广
       医疗保健   ：泰诺 / 胃药（药品类）
       手机/数码  ：Lillian 手机片 + Lenovo 笔记本
       病毒广告   ：Social Film（社媒传播向）
       互联网服务 ：Tmall 618（电商平台大促）
       其他       ：Studio Reel 与 AIGC 实验片（不属于任何商业类目） */
  var WORK_CAT = {
    "tylenol-jp": "医疗保健",
    "wissen-acid": "医疗保健",
    "andai-driver": "TVC广告",
    "guilin-tvc": "TVC广告",
    "kuaike-elevator": "TVC广告",
    "guilin-spray": "病毒广告",
    "video-execution": "其他",
    "tmall-618": "互联网服务",
    "dior-glitter": "美妆/护肤",
    "lillians-magic": "手机/数码",
    "porsche-wild-force": "汽车",
    "lenovo-yoga": "手机/数码",
    "wot-blitz": "游戏/娱乐",
    "giant-rooster": "其他",
    "puma-neymar": "体育/运动",
    /* ---- 第五十一轮：FMAI 精选视频案例 50 支（v28–v77）的中文类目 ---- */
"fenzhong-alipay": "互联网服务",
    "jiangzhong-appetite": "医疗保健",
    "yiyang-weirdo": "餐饮食品",
    "junzai-same-taste": "餐饮食品",
    "sichuan-travel": "旅游",
    "jiangzhong-mom": "医疗保健",
    "fenzhong-lead": "其他",
    "xingang-renovate": "家居",
    "cocacola-tea": "餐饮食品",
    "bioderma-family": "美妆/护肤",
    "meihao-crispy": "餐饮食品",
    "bolong-steady": "服装/时尚",
    "bytedance-pricey": "互联网服务",
    "sensetime-raccoon": "互联网服务",
    "xiaohuya-lemon": "餐饮食品",
    "swisse-calcium": "医疗保健",
    "swisse-vitality": "医疗保健",
    "baidu-onephrase": "互联网服务",
    "g7-coffee": "餐饮食品",
    "xiangzhipai-addictive": "餐饮食品",
    "lulu-restaurant": "餐饮食品",
    "pizzahut-thin": "餐饮食品",
    "lanshi-petfood": "快消产品",
    "jianbingdao-griddle": "餐饮食品",
    "renlehuanluo-snail": "餐饮食品",
    "jianchun-tummy": "餐饮食品",
    "banbu-panda": "快消产品",
    "qiandaxia-highland": "餐饮食品",
    "manyanshuning-throat": "医疗保健",
    "yuebaizhiji-collagen": "美妆/护肤",
    "xiaodubao-chat": "手机/数码",
    "xiaodubao-companion": "手机/数码",
    "songyan-bumibumi": "手机/数码",
    "bytedance-office": "互联网服务",
    "songyan-iamhere": "手机/数码",
    "bioderma-matte": "美妆/护肤",
    "hkjc-7days": "体育/运动",
    "hkjc-report": "体育/运动",
    "baidu-quit": "互联网服务",
    "baidu-boss": "互联网服务",
    "huangshi-voice": "医疗保健",
    "shuimima-sunscreen": "美妆/护肤",
    "swisse-protein": "医疗保健",
    "niulanshan-spicy": "餐饮食品",
    "niulanshan-tipsy": "餐饮食品",
    "hujihua-ancient": "快消产品",
    "aikeman-sleep": "餐饮食品",
    "jinfuji-crunch": "餐饮食品",
    "guanshubao-pain": "医疗保健",
    "xiaoyangren-kids": "餐饮食品",
    /* ---- 第五十二轮：FMAI 新增 12 支（v78–v89）的中文类目 ---- */
    "starbucks-rich-smooth": "餐饮食品",
    "kappa-court-daily": "服装/时尚",
    "pizzahut-western": "餐饮食品",
    "jiangzhong-finish": "医疗保健",
    "tongyi-tea": "餐饮食品",
    "swisse-timing": "医疗保健",
    "zhongjing-zuogui": "医疗保健",
    "jinhe-yogurt": "餐饮食品",
    "alps-candy": "快消产品",
    "bytedance-helpu": "互联网服务",
    "zhenchawu-matcha": "餐饮食品",
    "sensetime-medical": "医疗保健"
  };

  function catOf(w) { return WORK_CAT[w.slug] || "其他"; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var catBox = document.querySelector(".js-works-cats");
  var grid = document.querySelector(".js-works-grid");
  var countEl = document.querySelector(".js-works-count");
  var emptyEl = document.querySelector(".js-works-empty");
  if (!catBox || !grid) return;

  /* ---------- 分类标签（每个后面带一个该类的作品数） ---------- */
  function catsMarkup() {
    var all = [{ name: ALL, n: works.length }];
    var rest = CATS.map(function (c) {
      return { name: c, n: works.filter(function (w) { return catOf(w) === c; }).length };
    });
    return all.concat(rest).map(function (c) {
      return (
        '<button class="works-cat js-works-cat" type="button" data-cat="' + esc(c.name) + '"' +
        ' aria-pressed="false">' +
        '<span class="works-cat-label">' + esc(c.name) + "</span>" +
        '<span class="works-cat-n">' + c.n + "</span>" +
        "</button>"
      );
    }).join("");
  }

  /* ---------- 作品卡：与品牌页网格同一套 class，样式直接复用 ----------
     注意**不带 `reveal`**：`.reveal { opacity: 0; transform: translateY(3.2rem) }`
     是给 app.js 里的滚动入场动画用的，而 app.js 只在页面加载时
     `querySelectorAll('.reveal')` 登记一次 —— 点分类后**重新渲染出来的卡片
     不在名单里**，会一直停在透明状态（本轮踩到：切到「TVC广告」格子全空）。
     这里直接给最终态（可见），换分类即时生效。 */
  function cardMarkup(w) {
    var m = w.media || {};
    return (
      '<article class="col-span-full md:col-span-4 mb-40 md:mb-48 work-card">' +
      /* 第四十九轮：补 `from=works` —— 从「全部项目」页点进去的，详情页右上角
         退出键要送回**这一页**（works.html），而不是退回 brand.html 的网格档。
         （落点解析在 project-page.js 的 exitTarget()） */
      '<a href="work.html?p=' + esc(w.slug) + '&from=works" aria-label="' + esc(w.title) + '">' +
      '<div class="work-card-media sheen aspect-4-3"' +
      ' data-media-src="' + esc(m.src || "") + '"' +
      ' data-media-kind="' + esc(m.kind || "video") + '"' +
      ' data-media-alt="' + esc(w.title) + '">' +
      '<div class="scene-grain"></div>' +
      "</div>" +
      '<div class="work-card-meta">' +
      '<div class="work-card-client">' + esc(w.client) + "</div>" +
      '<div class="work-card-title">' + esc(w.title) + "</div>" +
      '<div class="work-card-cat type-label text-fg-40">' + esc(catOf(w)) + "</div>" +
      "</div>" +
      "</a></article>"
    );
  }

  var current = ALL;

  function render(cat, pushUrl) {
    current = cat;
    var list = cat === ALL
      ? works.slice()
      : works.filter(function (w) { return catOf(w) === cat; });

    grid.innerHTML = list.map(cardMarkup).join("");

    if (countEl) {
      countEl.textContent = cat === ALL
        ? "全部 " + list.length + " 支作品"
        : cat + " · " + list.length + " 支作品";
    }
    if (emptyEl) {
      var none = list.length === 0;
      emptyEl.hidden = !none;
      if (none) emptyEl.textContent = "「" + cat + "」还没有作品，敬请期待";
    }

    Array.prototype.forEach.call(catBox.querySelectorAll(".js-works-cat"), function (b) {
      var on = b.getAttribute("data-cat") === cat;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    /* 卡片是动态插入的，媒体必须重新挂一次 —— 否则 <video> 根本不会创建 */
    if (window.SLScene) window.SLScene.mount(grid);
    if (window.SLMedia) window.SLMedia.mount(grid);

    if (pushUrl !== false) {
      var q = cat === ALL ? "" : "?cat=" + encodeURIComponent(cat);
      try { history.replaceState(null, "", location.pathname + q); } catch (e) {}
    }

    /* 供探针读取当前状态（tools/probe-r40.js 用） */
    window.__slWorksCat = function () {
      return { cat: current, total: works.length, shown: list.length, cats: CATS.length };
    };
  }

  catBox.innerHTML = catsMarkup();
  catBox.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".js-works-cat") : null;
    if (!b) return;
    render(b.getAttribute("data-cat"));
  });

  /* 支持 ?cat=xxx 直达（分享链接 / 刷新保持） */
  var q = /[?&]cat=([^&]*)/.exec(location.search);
  var init = q ? decodeURIComponent(q[1]) : ALL;
  if (init !== ALL && CATS.indexOf(init) < 0) init = ALL;
  render(init, false);
})();
