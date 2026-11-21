/* =============================================================
   声音页（narrative.html）· 案例作品墙
   —— 第三十七轮新增：用户要求「重新设计声音页面下方案例作品布局，
      类型有 AI人物配音 / 洗脑 / 唱歌 / 配乐 / 克隆」。

   数据来自 SL_DATA.narrative.soundTypes / soundCases（见 data.js）。
   这一块是**独立于 list.js 三视图**的：声音页不再走 Grid/Carousel/List，
   而是一块按类型组织的案例墙 —— 所以这里自带筛选条与渲染，
   不去动 list.js 那套（品牌页/其它页照旧）。

   播放：snd.audio 有值 → 用真的 <audio> 播；
         留空（当前都是空的，仓库里还没有音频素材）→ 只走**视觉播放态**：
         波形条跳动 + 进度条按 dur 走完，不发出声音。
         把 mp3 放进 assets/media/audio/ 并填上 audio 字段即可换成真播放，
         这段代码不用改。
   ============================================================= */

(function () {
  var D = window.SL_DATA;
  if (!D || !D.narrative) return;

  var typesEl = document.querySelector(".js-sound-types");
  var gridEl = document.querySelector(".js-sound-grid");
  if (!typesEl || !gridEl) return;

  var TYPES = D.narrative.soundTypes || [];
  var CASES = D.narrative.soundCases || [];
  if (!TYPES.length || !CASES.length) return;

  var countEl = document.querySelector(".js-sound-count");
  var active = "all";
  var playing = null;        /* 当前处于播放态的卡片 */

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "zh";
  }
  function pick(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    return v[lang()] || v.zh || v.en || "";
  }
  function t(key, fallback) {
    return window.SLi18n ? window.SLi18n.t(key, fallback) : fallback || key;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function typeOf(key) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].key === key) return TYPES[i];
    return null;
  }
  function countOf(key) {
    if (key === "all") return CASES.length;
    return CASES.filter(function (c) { return c.type === key; }).length;
  }
  function seconds(dur) {
    var m = /^(\d+):(\d+)$/.exec(String(dur || ""));
    if (!m) return 30;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  /* 每条案例一条**稳定**的波形：同一个 id 永远画出同一条，刷新/切语言都不变。
     中间高、两端收（乘一个 sin 包络），看起来像一段有起伏的音频。 */
  var WAVE_BARS = 44;
  function wave(id) {
    var seed = 7;
    for (var i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 1000003;
    var out = [];
    for (var k = 0; k < WAVE_BARS; k++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      var r = seed / 2147483648;
      var env = 0.34 + 0.66 * Math.sin((Math.PI * (k + 0.5)) / WAVE_BARS);
      out.push(Math.max(6, Math.round((0.2 + 0.8 * r) * env * 100)));
    }
    return out;
  }
  function waveHtml(id) {
    return wave(id)
      .map(function (h) { return '<i style="--h:' + h + '"></i>'; })
      .join("");
  }

  function visible() {
    if (active === "all") return CASES;
    return CASES.filter(function (c) { return c.type === active; });
  }

  /* ---------- 筛选条 ---------- */
  function paintTypes() {
    var rows = [{ key: "all", label: t("sound.all", "全部"), sub: "" }];
    TYPES.forEach(function (ty) {
      rows.push({ key: ty.key, label: pick(ty), sub: pick(ty.desc) });
    });
    typesEl.innerHTML = rows
      .map(function (r) {
        var on = r.key === active;
        return (
          '<button class="chip sound-type js-sound-type' + (on ? " is-active" : "") + '" type="button" ' +
            'role="tab" aria-selected="' + (on ? "true" : "false") + '" aria-pressed="' + (on ? "true" : "false") + '" ' +
            'data-type="' + esc(r.key) + '"' + (r.sub ? ' title="' + esc(r.sub) + '"' : "") + ">" +
            esc(r.label) +
            '<span class="sound-type-num">' + String(countOf(r.key)).padStart(2, "0") + "</span>" +
          "</button>"
        );
      })
      .join("");
  }

  /* ---------- 案例卡 ---------- */
  function cardHtml(c, i) {
    var ty = typeOf(c.type);
    var tagList = [c.client];
    if (c.voice) tagList.push(pick(c.voice));
    if (c.lang) tagList.push(c.lang);
    return (
      '<article class="sound-card js-sound-card" data-type="' + esc(c.type) + '" data-id="' + esc(c.id) + '"' +
        (c.audio ? ' data-audio="' + esc(c.audio) + '"' : "") + ">" +
        '<div class="sound-card-top">' +
          '<span class="sound-card-idx">' + String(i + 1).padStart(2, "0") + "</span>" +
          '<span class="sound-card-type">' + esc(ty ? pick(ty) : "") + "</span>" +
        "</div>" +
        '<h3 class="sound-card-title">' + esc(c.title) + "</h3>" +
        '<div class="sound-wave" aria-hidden="true">' + waveHtml(c.id) + "</div>" +
        '<p class="sound-card-desc">' + esc(pick(c.desc)) + "</p>" +
        '<div class="sound-card-meta">' +
          tagList
            .map(function (s) { return '<span class="sound-tag">' + esc(s) + "</span>"; })
            .join("") +
          '<span class="sound-dur">' + esc(c.dur) + "</span>" +
        "</div>" +
        '<div class="sound-card-foot">' +
          '<button class="sound-play js-sound-play" type="button" aria-pressed="false">' +
            '<span class="sound-play-icon" aria-hidden="true"></span>' +
            '<span class="sound-play-label">' + esc(t("sound.preview", "试听")) + "</span>" +
          "</button>" +
          '<span class="sound-progress" aria-hidden="true"><i></i></span>' +
        "</div>" +
      "</article>"
    );
  }

  function stopPlaying() {
    if (!playing) return;
    playing.classList.remove("is-playing");
    playing.style.removeProperty("--dur");
    var btn = playing.querySelector(".js-sound-play");
    if (btn) {
      btn.setAttribute("aria-pressed", "false");
      var lb = btn.querySelector(".sound-play-label");
      if (lb) lb.textContent = t("sound.preview", "试听");
    }
    var au = playing.querySelector("audio");
    if (au) { try { au.pause(); au.currentTime = 0; } catch (e) {} }
    var bar = playing.querySelector(".sound-progress i");
    if (bar) { bar.style.transition = "none"; bar.style.width = "0"; }
    playing = null;
  }

  function startPlaying(card) {
    stopPlaying();
    playing = card;
    card.style.setProperty("--dur", seconds(cardDur(card)) + "s");
    card.classList.add("is-playing");
    var btn = card.querySelector(".js-sound-play");
    if (btn) {
      btn.setAttribute("aria-pressed", "true");
      var lb = btn.querySelector(".sound-play-label");
      if (lb) lb.textContent = t("sound.stop", "停止");
    }
    var bar = card.querySelector(".sound-progress i");
    if (bar) {
      /* 先归零、下一帧再拉满，transition 才会真的跑起来 */
      bar.style.transition = "none";
      bar.style.width = "0";
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          bar.style.transition = "width linear " + card.style.getPropertyValue("--dur");
          bar.style.width = "100%";
        });
      });
    }
    var src = card.getAttribute("data-audio");
    if (src) {
      var au = card.querySelector("audio");
      if (!au) {
        au = document.createElement("audio");
        au.src = src;
        au.preload = "auto";
        card.appendChild(au);
        au.addEventListener("ended", stopPlaying);
      }
      try { au.play(); } catch (e) {}
    }
  }

  function cardDur(card) {
    var id = card.getAttribute("data-id");
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i].dur;
    return "";
  }

  function paintGrid() {
    var list = visible();
    gridEl.innerHTML = list.length
      ? list.map(cardHtml).join("")
      : '<p class="sound-empty type-base text-fg-40">' + esc(t("sound.empty", "这一类暂时还没有案例。")) + "</p>";
    if (countEl) countEl.textContent = String(list.length).padStart(2, "0");
    if (playing) playing = null;      /* 重渲染后旧节点已不在 DOM 里 */
  }

  function paintAll() {
    paintTypes();
    paintGrid();
    if (window.SLi18n && window.SLi18n.apply) window.SLi18n.apply(gridEl);
    /* 让 i18n-extra 有机会刷新这一块里带 data-i18n 的节点 */
    try { document.dispatchEvent(new CustomEvent("sl:rendered")); } catch (e) {}
  }

  /* 事件代理：筛选 + 试听 */
  typesEl.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".js-sound-type") : null;
    if (!btn) return;
    var next = btn.getAttribute("data-type");
    if (!next || next === active) return;
    active = next;
    paintTypes();
    paintGrid();
  });
  typesEl.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var btns = Array.prototype.slice.call(typesEl.querySelectorAll(".js-sound-type"));
    var cur = btns.indexOf(document.activeElement);
    if (cur < 0) return;
    e.preventDefault();
    var nxt = btns[(cur + (e.key === "ArrowRight" ? 1 : btns.length - 1)) % btns.length];
    nxt.focus();
    nxt.click();
  });
  gridEl.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".js-sound-play") : null;
    if (!btn) return;
    var card = btn.closest(".js-sound-card");
    if (!card) return;
    if (card === playing) stopPlaying();
    else startPlaying(card);
  });

  /* 语言切换：类型名/说明/标签/描述都是双语内容，整块重画 */
  if (window.SLi18n && window.SLi18n.onChange) window.SLi18n.onChange(paintAll);
  else paintAll();
})();
