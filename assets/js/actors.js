/* =============================================================
   全部数字演员页 actors.html
   - 用 SL_DATA.talent 铺出全部形象照（超写实棚拍胸像）
   - 顶部「类型」筛选：全部 / 模特 / 演员（按 role 过滤）
   - 点任意一位 → talent.html?t=slug（演员基本信息展示页）
   - 左上角后退 → 上一级（模特与演员页）
   ============================================================= */

(function () {
  var D = window.SL_DATA;
  if (!D) return;

  var q = function (s) { return document.querySelector(s); };
  var pool = D.talent || [];
  var grid = q(".js-actor-grid");
  if (!grid || !pool.length) return;

  /* 第二十五轮的筛选口径是 role（Model / Actor）；
     第三十六轮（用户第二条）改成「类型」四分法：男性 / 女性 / 少年 / 中老年，
     取值来自 SL_DATA.talent[].group（male / female / teen / senior）。 */
  var filter = "all";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHtml(p) {
    return (
      '<a class="actor-card js-actor-card" href="talent.html?t=' + p.slug + '" ' +
        'data-actor-role="' + esc(p.role) + '" data-actor-group="' + esc(p.group || "") + '" data-talent-slug="' + p.slug + '" ' +
        'aria-label="' + esc(p.name) + '">' +
        '<span class="actor-card-media">' +
          '<img src="' + p.portrait + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" />' +
          '<span class="actor-card-badge type-label" data-talent-field="role" data-talent-slug="' + p.slug + '">' + esc(p.role) + "</span>" +
        "</span>" +
        '<span class="actor-card-meta">' +
          '<span class="actor-card-name" data-talent-field="name" data-talent-slug="' + p.slug + '">' + esc(p.name) + "</span>" +
          '<span class="actor-card-sub type-label text-fg-40">' +
            '<span data-talent-field="role" data-talent-slug="' + p.slug + '">' + esc(p.role) + "</span>" +
            (p.age ? " &middot; " + esc(p.age) : "") +
            (p.height ? " &middot; " + esc(p.height) : "") +
          "</span>" +
        "</span>" +
      "</a>"
    );
  }

  function visible() {
    if (filter === "all") return pool;
    return pool.filter(function (p) { return p.group === filter; });
  }

  function paint(animate) {
    var list = visible();
    grid.innerHTML = list.map(cardHtml).join("");

    var count = q(".js-actor-count");
    if (count) count.textContent = String(list.length).padStart(2, "0");
    var empty = q(".js-actor-empty");
    if (empty) empty.hidden = list.length > 0;

    if (animate && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.gsap.fromTo(grid.querySelectorAll(".actor-card"),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "expo.out" });
    }

    if (window.SLi18nExtra && window.SLi18nExtra.refresh) window.SLi18nExtra.refresh();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".js-actor-filter"), function (btn) {
    btn.addEventListener("click", function () {
      var next = btn.getAttribute("data-actor-filter") || "all";
      if (next === filter) return;
      filter = next;
      Array.prototype.forEach.call(document.querySelectorAll(".js-actor-filter"), function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      paint(true);
    });
  });

  /* 后退按钮（.js-page-back）不在这里绑 —— 第二十四轮挪到 assets/js/back.js：
     原来这一份（talent.js 里还有一模一样的一份）用 document.referrer 判来源，
     referrer 被 iframe/浏览器策略抹掉时会直接 return，只按写死的 href 跳，
     表现就是「点了没按上一页返回」。back.js 用 sessionStorage 记录站内来源，
     并把两个页面共用成一处实现。 */

  paint(false);

  if (window.SLi18n) window.SLi18n.onChange(function () { paint(false); });
})();
