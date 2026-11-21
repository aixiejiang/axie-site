/* =============================================================
   演员详情页 talent.html?t=slug
   版式（自上而下）：
     1. 后退按钮（回上一级）
     2. HERO —— 超写实棚拍全身照居右、人物压在超大字名牌之上
     3. 演员基本信息 —— 年龄 / 性格 / 风格（+ 身高·常驻·经纪 小字条）
     4. 三档景别近景（第二十五轮：同一张图裁出 近景 / 半身 / 全身）
     5. 参演作品 —— 点击丝滑弹出项目页、带声播放
     6. 上一位 / 下一位

   与 stills / actors 页共用 SL_DATA.talent 与 SL_DATA.brand.works，
   所以「参加作品」永远指向真实存在的那支视频。
   ============================================================= */

(function () {
  var D = window.SL_DATA;
  if (!D) return;

  var q = function (s) { return document.querySelector(s); };
  var T = function (k, f) { return window.SLi18n ? window.SLi18n.t(k, f) : f || k; };

  var people = D.talent || [];
  if (!people.length) return;

  /* ---------- 取 slug ---------- */
  var m = /[?&]t=([^&#]+)/.exec(window.location.search || "");
  var slug = m ? decodeURIComponent(m[1]) : people[0].slug;
  var idx = -1;
  for (var i = 0; i < people.length; i++) if (people[i].slug === slug) idx = i;
  if (idx < 0) idx = 0;
  var person = people[idx];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- 中英取值 ---------- */
  function field(name, fb) {
    if (window.SLi18nExtra && window.SLi18nExtra.talentField) {
      return window.SLi18nExtra.talentField(person.slug, name, fb);
    }
    return fb || "";
  }
  function field2(p, name, fb) {
    if (window.SLi18nExtra && window.SLi18nExtra.talentField) {
      return window.SLi18nExtra.talentField(p.slug, name, fb);
    }
    return fb || "";
  }
  function catLabel(cat) {
    return window.SLProjectView ? window.SLProjectView.i18nCategory(cat) : cat;
  }

  /* ---------- 1. HERO ---------- */
  function paintIdentity() {
    var img = q(".js-talent-full");
    if (img) {
      img.src = person.full || person.portrait;
      img.alt = field("name", person.name);
    }

    var nameEl = q(".js-talent-name");
    if (nameEl) {
      nameEl.textContent = field("name", person.name);
      nameEl.setAttribute("data-talent-slug", person.slug);
    }
    var roleEl = q(".js-talent-role");
    if (roleEl) {
      roleEl.textContent = field("role", person.role);
      roleEl.setAttribute("data-talent-slug", person.slug);
    }
    var bioEl = q(".js-talent-bio");
    if (bioEl) {
      bioEl.textContent = field("bio", person.bio);
      bioEl.setAttribute("data-talent-slug", person.slug);
    }

    document.title = field("name", person.name) + " — " + T("unit.talent", "Talent") + " — AXiE";
  }

  /* ---------- 2. 基本信息：年龄 / 性格 / 风格 / 适合 ---------- */
  function paintBasics() {
    var box = q(".js-talent-basics");
    if (box) {
      var rows = [
        [T("talent.age", "Age"), person.age ? person.age + " " + T("unit.years", "岁") : "", "is-num"],
        [T("talent.personality", "Personality"), field("personality", person.personality), ""],
        [T("talent.style", "Style"), field("style", person.style), ""],
        /* 第二十三轮：「适合」—— 适合的题材 / 品类，选角时最实用的一栏 */
        [T("talent.fit", "Best for"), field("fit", person.fit), ""]
      ].filter(function (r) { return r[1]; });

      box.innerHTML = rows.map(function (r) {
        return (
          '<div class="tb-item ' + r[2] + '">' +
            '<span class="tb-key type-label text-fg-40">' + esc(r[0]) + "</span>" +
            '<span class="tb-val">' + esc(r[1]) + "</span>" +
          "</div>"
        );
      }).join("");
    }

    /* 小字条：身高 / 常驻 / 经纪 / 作品数 —— 资料页的「简历抬头」 */
    var meta = q(".js-talent-meta");
    if (meta) {
      var strip = [
        [T("talent.height", "Height"), person.height],
        [T("talent.based", "Based"), field("based", person.based)],
        [T("talent.agency", "Agency"), person.agency],
        [T("talent.works", "Filmography"),
          String((person.works || []).length).padStart(2, "0") + " " + T("unit.works", "件作品")]
      ].filter(function (r) { return r[1]; });

      meta.innerHTML = strip.map(function (r) {
        return (
          '<div class="talent-meta-row">' +
            '<span class="talent-meta-key type-label text-fg-40">' + esc(r[0]) + "</span>" +
            '<span class="talent-meta-val">' + esc(r[1]) + "</span>" +
          "</div>"
        );
      }).join("");
    }
  }

  /* ---------- 3. 分类维度（第三十六轮 · 用户第三条） ----------
     七个维度依次排下来，每个维度一行：维度名 + 该演员的标签。
     数据在 SL_DATA.talent[].dims 里存的是 code（如 vibe: ["cool","relaxed"]），
     显示文案走 i18n 的 tag.<维度>.<code>。空数组的维度整行跳过 ——
     不是每位都恰好填满七条，缺的那条不该留一行空白出来。 */
  var DIM_KEYS = ["identity", "job", "vibe", "look", "body", "character", "visual"];

  function paintDims() {
    var box = q(".js-talent-dims");
    if (!box) return;

    var dims = person.dims || {};
    box.innerHTML = DIM_KEYS.map(function (k) {
      var vals = dims[k] || [];
      if (!vals.length) return "";
      return (
        '<div class="dim-row" data-dim="' + k + '">' +
          '<span class="dim-key type-label text-fg-40">' + esc(T("dim." + k, k)) + "</span>" +
          '<span class="dim-tags">' +
            vals.map(function (v) {
              return '<span class="dim-tag" data-dim-tag="' + k + "." + v + '">' +
                esc(T("tag." + k + "." + v, v)) + "</span>";
            }).join("") +
          "</span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- 4. 三档景别近景（第二十五轮：同图裁三档） ----------
     新一代每人只给了一张图，没有多表情素材 —— 三联是把同一张 2:3 底图
     按「近景 / 半身 / 全身」三档窗口裁出来的。下面的 labels 是 i18n 没起来时的兜底，
     必须跟 i18n.js 的「近景 / 半身 / 全身」一致，不能留着旧的 Neutral/Laughing/Staring。 */
  function paintMoods() {
    var host = q(".js-talent-moods");
    if (!host) return;
    var imgs = person.moods || [];
    var labels = [T("talent.mood1", "Close-up"), T("talent.mood2", "Half length"), T("talent.mood3", "Full length")];
    if (!imgs.length) { host.innerHTML = ""; return; }

    host.innerHTML = imgs.map(function (src, k) {
      return (
        '<figure class="mood-item">' +
          '<span class="mood-media"><img src="' + src + '" alt="' + esc(field("name", person.name)) + " — " + esc(labels[k] || "") + '" loading="lazy" decoding="async" /></span>' +
          '<figcaption class="mood-label type-label">' +
            '<span class="mood-num">' + String(k + 1).padStart(2, "0") + "</span>" +
            "<span>" + esc(labels[k] || "") + "</span>" +
          "</figcaption>" +
        "</figure>"
      );
    }).join("");
  }

  /* ---------- 5. 参演作品 ---------- */
  function workBySlug(s) {
    var pool = (D.brand && D.brand.works) || [];
    for (var k = 0; k < pool.length; k++) if (pool[k].slug === s) return pool[k];
    return null;
  }

  function posterOf(w) {
    if (!w || !w.media) return "";
    if (w.media.poster) return w.media.poster;
    var mm = /videos\/(v\d+)\.mp4$/.exec(w.media.src || "");
    return mm ? "assets/media/posters/" + mm[1] + ".jpg" : "";
  }

  function renderWorks() {
    var host = q(".js-talent-works");
    if (!host) return;

    var list = (person.works || []).map(workBySlug).filter(Boolean);

    var countEl = q(".js-talent-count");
    if (countEl) countEl.textContent = String(list.length).padStart(2, "0");

    if (!list.length) {
      host.innerHTML = '<p class="type-base text-fg-40 col-span-full">—</p>';
      return;
    }

    host.innerHTML = list.map(function (w) {
      var bi = -1;
      var pool = (D.brand && D.brand.works) || [];
      for (var k = 0; k < pool.length; k++) if (pool[k].slug === w.slug) bi = k;
      return (
        '<article class="col-span-full md:col-span-4 js-talent-work work-card" data-work-index="' + bi + '" ' +
          'data-work-slug="' + w.slug + '">' +
          '<a href="work.html?p=' + w.slug + '" aria-label="' + esc(w.title) + '">' +
            '<div class="work-card-media" style="background-image:url(&quot;' + posterOf(w) + '&quot;);background-size:cover;background-position:center">' +
              '<span class="work-card-play" aria-hidden="true"></span>' +
            "</div>" +
            '<div class="work-card-meta">' +
              '<div class="work-card-client">' + esc(w.client) + "</div>" +
              '<div class="work-card-title">' + esc(w.title) + "</div>" +
              '<div class="work-card-cat type-label text-fg-40" data-work-category="' + esc(w.category) + '">' +
                esc(catLabel(w.category)) +
              "</div>" +
            "</div>" +
          "</a>" +
        "</article>"
      );
    }).join("");

    /* 点击 → 丝滑弹出项目页（有声播放 + 项目介绍 + 退出按钮）
       Cmd/Ctrl/Shift+点击、中键仍然真跳转，保留复制链接能力。 */
    Array.prototype.forEach.call(host.querySelectorAll(".js-talent-work"), function (el) {
      var i = parseInt(el.getAttribute("data-work-index"), 10);
      var s = el.getAttribute("data-work-slug");
      if (isNaN(i) || i < 0) return;
      el.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!window.SLProjectView) return;
        e.preventDefault();
        window.SLProjectView.open({
          slug: s,
          index: i,
          originEl: el.querySelector(".work-card-media") || el
        });
      });
    });
  }

  /* ---------- 6. 上一位 / 下一位 ---------- */
  function renderNav() {
    var prev = people[(idx - 1 + people.length) % people.length];
    var next = people[(idx + 1) % people.length];
    var pe = q(".js-talent-prev");
    var ne = q(".js-talent-next");
    if (pe) {
      pe.setAttribute("href", "talent.html?t=" + prev.slug);
      q(".js-talent-prev-name").textContent = field2(prev, "name", prev.name);
    }
    if (ne) {
      ne.setAttribute("href", "talent.html?t=" + next.slug);
      q(".js-talent-next-name").textContent = field2(next, "name", next.name);
    }
  }

  /* ---------- 语言切换 ---------- */
  function repaint() {
    paintIdentity();
    paintBasics();
    paintDims();
    paintMoods();
    renderWorks();
    renderNav();
    if (window.SLi18nExtra && window.SLi18nExtra.refresh) window.SLi18nExtra.refresh();
  }

  /* 后退按钮（.js-page-back）不在这里绑 —— 第二十四轮挪到 assets/js/back.js，
     actors.js 里那份同款实现也一并去掉了，两页共用一处。 */

  repaint();

  if (window.SLi18n) window.SLi18n.onChange(function () { repaint(); });
  if (window.SLi18nExtra && window.SLi18nExtra.refresh) window.SLi18nExtra.refresh();

  /* ---------- 形象照入场 ---------- */
  var gsap = window.gsap;
  if (gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.from(".th-figure", { y: 48, opacity: 0, duration: 1.0, ease: "expo.out" });
    gsap.from(".th-type > *", { y: 26, opacity: 0, duration: 0.8, stagger: 0.07, ease: "expo.out", delay: 0.08 });
  }
})();
