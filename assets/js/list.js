/* =============================================================
   列表页渲染：Logo 跑马灯 + Grid / Fan-Carousel / List 三视图
   页面通过 <body data-collection="brand|narrative"> 指定数据集

   三个视图共用同一份 col.works 数据 —— 所以视频数量天然一致，
   不会出现「Grid 有 22 个、List 只有 15 个」这种对不上的情况。

   点击行为：
     - 卡片 / 扇形 / 列表行 → SLProjectView.open()，丝滑弹出独立项目页
       （视频有声播放 + 项目介绍 + 剧照 + 其他项目 + 退出按钮）
     - 中键 / Cmd/Ctrl+点击 → 仍然走 work.html?p=slug 真正开新标签，
       保留"能复制链接"的能力
   ============================================================= */

(function () {
  var D = window.SL_DATA;
  if (!D) return;

  var key = document.body.getAttribute("data-collection") || "brand";
  var col = D[key];
  if (!col) return;

  var q = function (s) { return document.querySelector(s); };
  var T = function (k, f) {
    return window.SLi18n ? window.SLi18n.t(k, f) : f || k;
  };

  /* ---------- 第三十二轮（第七条）：品牌页的「换一批」 ----------
     三个视图（网格 / 轮播 / 列表）共用同一份作品数据，所以「换一批」
     不需要真的换数据，只需要换一个**起点偏移**：
       view = col.works 按 stride 旋转后的那一份
     卡片、扇形、列表、下方的弧形方块轮盘全部改读 view，
     于是一次点击三个视图一起换，且换完仍是同一批作品、只是顺序错开。
     15 件作品 + stride 5 → 正好 3 批，和「模特与演员」那颗按钮同一套手感。 */
  var WORKS_STRIDE = 5;
  var worksAt = 0;
  var view = col.works.slice();

  function rotateWorks(k) {
    var n = col.works.length;
    if (!n) return col.works.slice();
    var s = ((k * WORKS_STRIDE) % n + n) % n;
    return col.works.slice(s).concat(col.works.slice(0, s));
  }
  function worksBatchCount() {
    return Math.max(1, Math.ceil(col.works.length / WORKS_STRIDE));
  }
  function paintBatchLabel() {
    var el = q(".js-works-batch");
    if (!el) return;
    el.textContent =
      String(worksAt + 1).padStart(2, "0") + " / " + String(worksBatchCount()).padStart(2, "0");
  }

  /* ---------- 标题与描述 ----------
     这里写的是数据层英文原文；若当前语言是中文，
     末尾会调用 SLi18nExtra.refresh() 覆盖成中文。 */
  if (q(".js-collection-title")) q(".js-collection-title").textContent = col.title;
  if (q(".js-collection-intro")) q(".js-collection-intro").textContent = col.intro;
  if (q(".js-collection-intro-2")) q(".js-collection-intro-2").textContent = col.intro2 || "";
  if (q(".js-collection-count")) q(".js-collection-count").textContent = String(col.works.length).padStart(2, "0");
  document.title = col.title + " — AXiE";

  /* ---------- Logo 跑马灯 ---------- */
  var rail = q(".js-marquee-rail");
  if (rail) {
    rail.innerHTML = D.clients
      .map(function (c) { return '<span class="logotype-item">' + c + "</span>"; })
      .join("");
  }

  /* ---------- 工具 ---------- */

  /* 卡片要点：
     - <a href="work.html?p=slug"> 保留可复制链接 / 可中键新开
     - 但左键点击由 JS 接管，改成弹层，避免整页跳转 */
  function openProject(i, el) {
    if (!window.SLProjectView) return false;
    window.SLProjectView.open({
      slug: view[i].slug,
      index: indexInBrand(i),
      originEl: el
    });
    return true;
  }

  /* narrative 栏目的作品不在 brand 列表里，需要映射到 brand 的下标；
     brand 栏目则直接用自身下标。 */
  function indexInBrand(i) {
    if (key === "brand") return i;
    var slug = view[i].slug;
    var list = window.SLProjectView ? window.SLProjectView.list() : [];
    for (var k = 0; k < list.length; k++) if (list[k].slug === slug) return k;
    return 0;
  }

  function hasVideo(w) {
    return !!(w && w.media && w.media.kind === "video");
  }

  function bindCard(el, i) {
    if (!hasVideo(view[i])) return;
    el.addEventListener("click", function (e) {
      /* 让浏览器自己处理新标签 / 新窗口的意图 */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (openProject(i, el)) e.preventDefault();
    });
  }

  /* ---------- 卡片 ---------- */
  function card(w, i, seed) {
    var mediaInner;
    if (w.media) {
      mediaInner =
        '<div class="work-card-media sheen aspect-4-3" data-media-src="' + w.media.src + '" data-media-kind="' + w.media.kind + '" data-media-alt="' + w.title + '">' +
          '<div class="scene-grain"></div>' +
        "</div>";
    } else {
      mediaInner =
        '<div class="work-card-media scene sheen aspect-4-3" data-scene="' + w.tone + '" data-scene-seed="' + (seed * 13 + 5) + '">' +
          '<div class="scene-grain"></div>' +
        "</div>";
    }
    return (
      '<article class="col-span-full md:col-span-4 mb-40 md:mb-48 js-work-card work-card reveal" style="margin-bottom:4rem" data-work-index="' + i + '">' +
        '<a href="work.html?p=' + w.slug + '" aria-label="' + w.title + '">' +
          mediaInner +
          '<div class="work-card-meta">' +
            /* 客户名与作品名是专有名词，不翻译 */
            '<div class="work-card-client">' + w.client + "</div>" +
            '<div class="work-card-title">' + w.title + "</div>" +
            /* 类目要跟随中英文切换：只放原始值，文案由 i18n-extra 填 */
            '<div class="work-card-cat type-label text-fg-40" data-work-category="' +
              w.category + '">' + w.category + "</div>" +
          "</div>" +
        "</a>" +
      "</article>"
    );
  }

  var grid = q(".js-works-grid");
  if (grid) grid.innerHTML = view.map(card).join("");

  var list = q(".js-works-list");

  /* 模特与演员 = stills 这一档（其他栏目仍是普通作品列表）
     2026-09-27：它原来是品牌页的 LIST 视图，随导航改名整块搬到
     stills.html 独立成页；品牌页只留 网格 / 轮播 两档，不再渲染人物卡。 */
  var isTalent = key === "stills" && !!(D.talent && D.talent.length);

  /* ---------- 模特与演员：分批渲染 + 「换一批」 ----------
     2026-09-27（第二十二轮）：人物卡从「一次全铺」改成「一屏一批」。
     一屏 8 张（talentBatchSize），「换一批」按 stride 4 往后推一位起点，
     12 位演员因此能轮出 3 批 —— 每次点击至少有 4 张新脸进来，
     不像整屏洗牌那样让人失去方位感。 */
  function talentBatch(k) {
    var pool = D.talent || [];
    var n = pool.length;
    if (!n) return [];
    var size = Math.min(D.talentBatchSize || 8, n);
    var stride = Math.max(1, D.talentBatchStride || 4);
    var start = ((k * stride) % n + n) % n;
    var out = [];
    for (var i = 0; i < size; i++) out.push(pool[(start + i) % n]);
    return out;
  }
  function batchCount() {
    var n = (D.talent || []).length;
    var stride = Math.max(1, D.talentBatchStride || 4);
    return Math.max(1, Math.ceil(n / stride));
  }

  /* ---------- 第九项：中间抠图人物 + 身后一圈弧形环绕的选项 ----------
     结构与几何
       · 每个人一张「头 → 胯」的透明抠图（tools/build-talent-cutouts.py 产出，
         头高已归一化，所以 15 位并排不会有人巨头、有人全身）。
       · 身后那一圈是一个**环形轮盘**：off = i − pos 必须环绕折回，
         否则第 0 位左侧没有邻居、弧线会缺半边。
       · 几何：θ = off × step
              x    = R·sinθ
              rise = R·(1 − cosθ) × riseK   → 越靠外越往上（更远处的「地平线」更高），
                                              踩着一条向后收的地面弧线
              缩放 = 1 − |off|·0.085、亮度 / 模糊随 |off| 衰减 → 景深
       · 正中那位不画在小圈里（改由前景那张大图承担），其它位按 |off| 排 z 序。

     第三十二轮（第六项）：用户给的参考图里，两侧的「位子」是**一路铺到画面边缘**、
     越往外越小越暗的一圈半圆，而不是挤在正中一小撮。所以：
       · rRatio 0.38 → 0.46（1600 视口下半径从 448 提到约 692）
       · riseK 0.5 → 0.34（弧线更平，不然最外那两位会被抬得太高）
       · scaleK 0.085 → 0.075、hide 3.4 → 3.45（保住 ±3 共 7 位可见） */
  var WHEEL = {
    step: 21,       /* 每档偏转角度 */
    rRatio: 0.46,   /* 弧线半径 = 容器宽 × 这个比例 */
    rMin: 240,
    rMax: 740,
    riseK: 0.34,    /* 弧线「抬高」的强度 */
    hide: 3.45      /* 超过这个 |off| 就不画了（1600px 下正好看得见 ±3 共 7 位） */
  };

  function bustOf(t) {
    return "assets/media/talent/cut/bust/" + (t.id || t.slug) + ".png";
  }

  function wheelFigure(t, i) {
    return (
      '<a class="tw-figure js-talent-card js-tw-figure" href="talent.html?t=' + t.slug + '"' +
        ' draggable="false" data-talent-slug="' + t.slug + '" data-index="' + i +
        '" aria-label="' + t.name + '">' +
        '<img src="' + bustOf(t) + '" alt="' + t.name + '" loading="lazy" decoding="async" draggable="false" />' +
      "</a>"
    );
  }

  var batchAt = 0;
  var wheelHost = q(".js-talent-wheel");
  var wheelEls = [];
  var wheelList = [];
  var wheelPos = 0;          /* 连续位置，拖拽时是小数 */
  var wheelShown = -1;       /* 前景当前显示的是第几位 */
  var wheelFore = null;      /* 前景 <img> */
  var wheelForeLink = null;  /* 前景 <a> */
  var wheelName = q(".js-tw-name");
  var wheelRole = q(".js-tw-role");

  window.SLTalent = {
    paint: function (k, animate) { paintTalent(k, animate); },
    count: batchCount,
    at: function () { return batchAt; },
    pool: function () { return D.talent || []; },
    center: function () { return Math.round(wheelPos); }
  };

  function paintTalent(k, animate) {
    var host = wheelHost || q(".js-works-list");
    if (!host) return;
    batchAt = k;
    wheelList = talentBatch(k);
    wheelPos = 0;

    host.innerHTML =
      wheelList.map(wheelFigure).join("") +
      '<a class="tw-fore js-tw-fore" href="#" draggable="false" aria-label="">' +
        '<img class="js-tw-fore-img" src="" alt="" draggable="false" />' +
      "</a>";

    wheelEls = Array.prototype.slice.call(host.querySelectorAll(".js-tw-figure"));
    wheelFore = host.querySelector(".js-tw-fore-img");
    wheelForeLink = host.querySelector(".js-tw-fore");
    wheelShown = -1;
    paintWheel();

    /* 批次计数器（01 / 03） */
    var num = q(".js-talent-batch");
    if (num) {
      var pad = function (v) { return v < 10 ? "0" + v : String(v); };
      num.textContent = pad(k + 1) + " / " + pad(batchCount());
    }

    /* 里层刚写进去的是数据层英文，立刻让 i18n 覆盖成当前语言 */
    if (window.SLi18nExtra && window.SLi18nExtra.refresh) window.SLi18nExtra.refresh();
  }

  function paintWheel() {
    if (!wheelEls.length || !wheelHost) return;
    var n = wheelEls.length;
    var r = Math.max(WHEEL.rMin, Math.min(WHEEL.rMax, wheelHost.clientWidth * WHEEL.rRatio));
    var half = n / 2;

    for (var i = 0; i < n; i++) {
      var off = i - wheelPos;
      /* 环形折回：不折回的话第 0 位左侧就没有邻居，弧线只剩半边 */
      off = ((off % n) + n) % n;
      if (off > half) off -= n;

      var abs = Math.abs(off);
      var el = wheelEls[i];
      if (abs > WHEEL.hide) { el.style.visibility = "hidden"; continue; }
      el.style.visibility = "visible";

      var th = (off * WHEEL.step * Math.PI) / 180;
      var x = r * Math.sin(th);
      var rise = r * (1 - Math.cos(th)) * WHEEL.riseK;
      var sc = 1 - abs * 0.085;
      el.style.transform =
        "translate3d(calc(-50% + " + x.toFixed(1) + "px),-" + rise.toFixed(1) + "px,0) " +
        "scale(" + sc.toFixed(3) + ")";
      el.style.setProperty("--tw-op", Math.max(0.3, 0.86 - abs * 0.2).toFixed(3));
      el.style.setProperty("--tw-dim", Math.max(0.52, 1.02 - abs * 0.18).toFixed(3));
      el.style.setProperty("--tw-blur", Math.min(2.2, abs * 0.5).toFixed(2) + "px");
      el.style.zIndex = String(30 - Math.round(abs * 5));
      /* 正中那位交给前景大图，小圈里那一张藏掉，免得两层叠出重影 */
      el.style.pointerEvents = abs < 0.5 ? "none" : "auto";
      el.style.visibility = abs < 0.5 ? "hidden" : "visible";
      el.classList.toggle("is-center", Math.round(wheelPos) === i);
    }

    var idx = ((Math.round(wheelPos) % n) + n) % n;
    setForeground(idx);
  }

  function setForeground(idx) {
    if (idx === wheelShown) return;
    var t = wheelList[idx];
    if (!t) return;
    wheelShown = idx;

    if (wheelForeLink) wheelForeLink.setAttribute("href", "talent.html?t=" + t.slug);
    if (wheelFore) {
      var next = bustOf(t);
      var probe = new Image();          /* 先解码再换，避免换图那一帧闪白 */
      probe.onload = function () { if (wheelFore) wheelFore.src = next; };
      probe.src = next;
    }
    if (wheelName) {
      wheelName.textContent = t.name;
      wheelName.setAttribute("data-talent-field", "name");
      wheelName.setAttribute("data-talent-slug", t.slug);
    }
    if (wheelRole) {
      wheelRole.textContent = t.role;
      wheelRole.setAttribute("data-talent-field", "role");
      wheelRole.setAttribute("data-talent-slug", t.slug);
    }
    if (window.SLi18nExtra && window.SLi18nExtra.refresh) window.SLi18nExtra.refresh();
  }

  /* ---------- 轮盘的交互：拖拽 / 滚轮 / 左右键 / 点按 ---------- */
  if (isTalent && wheelHost) {
    var wDrag = null, wTween = null, wRaf = null, wMoved = 0, wDown = null;

    function scheduleWheel() {
      if (wRaf) return;
      wRaf = requestAnimationFrame(function () { wRaf = null; paintWheel(); });
    }
    function cancelWTween() {
      if (wTween) { cancelAnimationFrame(wTween); wTween = null; }
    }
    function goToWheel(i, immediate) {
      var n = wheelEls.length || 1;
      var target = ((i % n) + n) % n;
      cancelWTween();
      if (immediate) { wheelPos = target; scheduleWheel(); return; }
      var start = wheelPos, t0 = performance.now(), dur = 520;
      /* 走「最短方向」：从第 14 位回第 0 位是往右滑一格，不是往回拉 14 格 */
      var delta = target - start;
      while (delta > n / 2) delta -= n;
      while (delta < -n / 2) delta += n;
      function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 4);       /* expo-out，不过冲 */
        wheelPos = start + delta * e;
        paintWheel();
        if (p < 1) wTween = requestAnimationFrame(tick);
        else { wTween = null; wheelPos = target; paintWheel(); }
      }
      wTween = requestAnimationFrame(tick);
    }

    wheelHost.addEventListener("pointerdown", function (e) {
      /* 这里**不要** preventDefault()。
         踩过的坑：一旦在 pointerdown 上 preventDefault，Chrome 会把配套的
         mousedown / mouseup 一起掐掉，而 click 是由它们合成出来的 ——
         结果就是「点正中那位进个人页」整个失效（探针里表现为
         F0 找到链接、F1 却停在 stills.html）。
         原生拖拽改用 <a draggable="false"> 挡（见 wheelFigure / 前景那段 markup）。 */
      wDrag = { x0: e.clientX, pos0: wheelPos, id: e.pointerId };
      wMoved = 0;
      /* 关键：把「按下的是谁」在这里就记下来。
         因为下面调了 setPointerCapture —— 指针捕获会把之后所有指针事件
         （连带的 mouseup / click 一起）重定向到 wheelHost 本身，
         于是 click 的 e.target 不再是那张 <a>，浏览器默认的链接跳转
         永远不会发生。诊断日志实录：
           mousedown:IMG.js-tw-fore-img → click:DIV.talent-wheel（被重定向）
         站内轮播（vp）也是这么绕的，这里照抄同一套。 */
      wDown = e.target && e.target.closest
        ? e.target.closest(".js-tw-fore, .js-tw-figure")
        : null;
      try { wheelHost.setPointerCapture(e.pointerId); } catch (err) {}
      wheelHost.classList.add("is-dragging");
    });
    wheelHost.addEventListener("pointermove", function (e) {
      if (!wDrag) return;
      var dx = e.clientX - wDrag.x0;
      wMoved = Math.max(wMoved, Math.abs(dx));
      var unit = Math.max(90, wheelHost.clientWidth * 0.16);
      wheelPos = wDrag.pos0 - dx / unit;
      scheduleWheel();
    });
    function endWheelDrag() {
      if (!wDrag) return;
      wDrag = null;
      wheelHost.classList.remove("is-dragging");
      /* 松手吸附到最近的一位；「点按 vs 拖拽」由 click 里的 wMoved 判定 */
      goToWheel(Math.round(wheelPos), false);
    }
    wheelHost.addEventListener("pointerup", endWheelDrag);
    wheelHost.addEventListener("pointercancel", function () {
      if (!wDrag) return;
      wDrag = null;
      wheelHost.classList.remove("is-dragging");
      goToWheel(Math.round(wheelPos), false);
    });

    /* 点按：点身后那圈 → 先转到正中；点正中 → 直接进个人页 */
    wheelHost.addEventListener("click", function (e) {
      if (wMoved > 8) { e.preventDefault(); wMoved = 0; wDown = null; return; }
      /* e.target 已被指针捕获重定向到 wheelHost，所以这里用 pointerdown 记下的 wDown */
      var a = wDown;
      wDown = null;
      if (!a) return;
      if (a.classList.contains("js-tw-fore")) {
        /* 正中那位的前景大图：捕获吃掉了默认跳转，手动走一次 */
        var href = a.getAttribute("href");
        e.preventDefault();
        if (href && href !== "#") window.location.href = href;
        return;
      }
      var i = parseInt(a.getAttribute("data-index"), 10);
      if (i !== Math.round(wheelPos)) {
        e.preventDefault();
        goToWheel(i, false);
      }
      /* 正中那位的小圈块（i === center）：它本来就 pointer-events:none，
         真点上去的是前景，走上面那个分支 */
    });

    wheelHost.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (Math.abs(e.deltaX) > 24) goToWheel(Math.round(wheelPos) + (e.deltaX > 0 ? 1 : -1), false);
    }, { passive: false });

    wheelHost.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goToWheel(Math.round(wheelPos) + 1, false); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goToWheel(Math.round(wheelPos) - 1, false); }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var t = wheelList[Math.round(wheelPos)] || wheelList[0];
        if (t) window.location.href = "talent.html?t=" + t.slug;
      }
    });

    window.addEventListener("resize", scheduleWheel);
  }

  if (isTalent) {
    var shuffle = q(".js-talent-shuffle");
    if (shuffle) {
      shuffle.addEventListener("click", function () {
        var host = wheelHost || q(".js-works-list");
        if (!host) return;
        host.classList.add("is-swapping");
        window.setTimeout(function () {
          paintTalent((batchAt + 1) % batchCount(), true);
          host.classList.remove("is-swapping");
        }, 170);
      });
    }
  }

  /* 列表视图的行标记（第三十二轮：抽成函数，「换一批」要重渲染一次） */
  function listMarkup() {
    /* 第三十一轮：列表行重做 —— 左「项目大标题」/ 右「备注标签」，白字。
       悬停态（橙黄长条 + 文字转黑）全交给 CSS；
       这里只把「条内跟随鼠标的静音视频预览」挂上（见 initListPreview）。 */
    return view
      .map(function (w, i) {
        var src = hasVideo(w) ? w.media.src : "";
        return (
          '<a class="list-row js-work-list-row" href="work.html?p=' + w.slug + '" data-work-index="' + i + '"' +
            (src ? ' data-preview-src="' + src + '"' : "") + ">" +
            '<span class="list-row-title">' + w.title + "</span>" +
            '<span class="list-row-tags">' +
              '<span class="list-row-tag" data-work-category="' + w.category + '">' + w.category + "</span>" +
              (w.year ? '<span class="list-row-tag">' + w.year + "</span>" : "") +
              '<span class="list-row-tag">' + w.client + "</span>" +
            "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  if (list && isTalent) {
    list.classList.add("is-talent");
    paintTalent(0, false);
  } else if (list) {
    list.innerHTML = listMarkup();
    initListPreview(list);
  }

  /* ---------- 列表视图的「跟随式视频预览」 ----------
     一个共享的预览窗口，而不是给 15 条各挂一支 <video>。

     第三十一轮：悬停 1 秒才出现。
     第三十二轮改成「指针一进条就出现」，并把三条手感要求做进去：
       · 窗口比长条更高（CSS 里 height: calc(100% + 7.2rem)），
         所以它会压出长条上下一点 —— 看着更大、也更像浮在页面上；
       · 横向跟随鼠标，但**不整块跑出**：x 夹在
         [−42% 窗宽, 条宽 − 58% 窗宽]，即至少 58% 永远压在长条里；
       · 换到别的作品时用两层 <video> 做交叉淡入（双缓冲）：
         新的那条先 load() + play()，起来之后再淡入，旧的在下面淡出 ——
         直接换同一个元素的 src 会闪一下黑，这就是「丝滑」的做法。 */
  function initListPreview(host) {
    if (!host) return;

    var row = null;        /* 当前悬停的案例条 */
    var shown = "";        /* 当前正在播的那个 src */
    var front = 0;         /* 现在压在上层的是哪一层 */
    var cleanTimer = null;

    /* 第三十八轮（用户第三条「跟随鼠标移动的时候不要出现卡顿，
       鼠标移到对应的作品橙色长条上预览窗口丝滑跟随移动切换」）：
       两件事 ——

       ① 卡顿的根因是**每个 mousemove 都同步读两次 getBoundingClientRect()**
          （row 一次、box 一次），把整棵长列表强制布局一遍；列表里还有
          <video>，这一下就是肉眼可见的掉帧。现在改成：
           · 测量只在「换行 / resize」时做一次，结果缓存在 hostBox / rowBox；
           · box 的尺寸不再读 DOM，直接由行高算（高度 = 行高 + 3.2rem，
             宽度由 CSS 的 aspect-ratio: 16/9 推出 = 高 × 16/9）；
           · pointermove 只记一个目标点，真正的写 transform 交给下面的 rAF 循环。
       ② 切换不顺滑的根因是**窗口被搬到了另一行**（appendChild 到新行）——
          每行都是独立坐标原点，跨行等于瞬移。现在窗口挂在 .works-list 上
          （见 components.css 里 .works-list 的 position: relative），
          一直在同一套坐标里移动，跨行时用插值滑过去。 */
    var hostBox = null;          /* 缓存的列表矩形（视口坐标） */
    var rowBox = null;           /* 缓存的行矩形（相对列表左上角） */
    var rowH = 0;
    var tx = 0, ty = 0;          /* 窗口左上角的**目标**位置（相对列表） */
    var cx = null, cy = null;    /* 窗口当前的**渲染**位置（插值跟进目标） */
    var rafId = 0;
    var PAD = 6, REACH = 28;
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    var box = document.createElement("span");
    box.className = "list-row-preview";
    box.setAttribute("aria-hidden", "true");

    function mkVideo() {
      var v = document.createElement("video");
      v.className = "list-row-preview-el";
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("preload", "none");
      return v;
    }
    var layers = [mkVideo(), mkVideo()];
    layers.forEach(function (v) { box.appendChild(v); });

    function boxH() { return rowH + 32; }        /* 与 CSS 的「行高 + 3.2rem」等价 */
    function boxW() { return boxH() * 16 / 9; }  /* aspect-ratio: 16 / 9 */

    function reset(v) {
      try { v.pause(); } catch (e) {}
      v.classList.remove("is-on");
      v.removeAttribute("src");
      try { v.load(); } catch (e) {}
    }

    /* 只在「换行 / resize」时跑：两次 rect 读取，换来 pointermove 里零布局 */
    function measure() {
      var hb = host.getBoundingClientRect();
      hostBox = { left: hb.left, top: hb.top, width: hb.width };
      rowBox = null;
      if (!row) return;
      var rb = row.getBoundingClientRect();
      rowH = rb.height;
      rowBox = { left: rb.left - hb.left, top: rb.top - hb.top, width: rb.width, height: rb.height };
      box.style.height = boxH().toFixed(1) + "px";
    }

    function hide() {
      if (cleanTimer) { clearTimeout(cleanTimer); cleanTimer = null; }
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (!row) return;
      row.classList.remove("is-previewing");
      box.classList.remove("is-on");
      layers.forEach(reset);
      if (box.parentNode) box.parentNode.removeChild(box);
      row = null;
      rowBox = null;
      shown = "";
      front = 0;
      /* 下次出现不要从上一个落点飞过来 */
      cx = null;
      cy = null;
    }

    /* 算目标点：横向跟鼠标、纵向也跟，但整窗始终夹在
       [条顶 − REACH, 条底 + REACH] 之内（见上一轮的注释）。 */
    function target(clientX, clientY) {
      if (!row || !rowBox || !hostBox) return;
      var w = boxW(), h = boxH();
      var ox = hostBox.left + rowBox.left;      /* 行左边的视口 x */
      var oy = hostBox.top + rowBox.top;        /* 行顶边的视口 y */
      var xRel = clientX - ox - w / 2;
      var xMax = Math.max(PAD, rowBox.width - w - PAD);
      tx = rowBox.left + Math.min(Math.max(xRel, PAD), xMax);
      if (typeof clientY === "number") {
        var minTop = -REACH;
        var maxTop = Math.max(minTop, rowH + REACH - h);
        var center = clientY - oy;
        center = Math.min(Math.max(center, minTop + h / 2), maxTop + h / 2);
        ty = rowBox.top + center - h / 2;
      }
      kick();
    }

    /* 一帧一次：把渲染位置向目标插值推进（跨行时就是从旧行滑到新行） */
    function tick() {
      rafId = 0;
      if (!row) return;
      var k = reduce ? 1 : 0.3;
      if (cx === null) { cx = tx; cy = ty; }
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      if (Math.abs(tx - cx) < 0.3 && Math.abs(ty - cy) < 0.3) { cx = tx; cy = ty; }
      box.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      if (cx !== tx || cy !== ty) rafId = requestAnimationFrame(tick);
    }
    function kick() { if (!rafId) rafId = requestAnimationFrame(tick); }

    function show(el, clientX, clientY) {
      if (row) row.classList.remove("is-previewing");
      var first = cx === null;
      row = el;
      el.classList.add("is-previewing");
      if (box.parentNode !== host) host.appendChild(box);
      measure();
      target(clientX, clientY);
      if (first) {   /* 第一次出现：直接落位，不然会从上一处飞过来 */
        cx = tx;
        cy = ty;
        box.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      }
      box.classList.add("is-on");
      kick();
    }

    function play(src) {
      if (shown === src) return;
      shown = src;
      var next = layers[1 - front];
      var prev = layers[front];
      if (cleanTimer) { clearTimeout(cleanTimer); cleanTimer = null; }
      next.src = src;
      try { next.load(); } catch (e) {}
      var p = next.play();
      if (p && p.catch) p.catch(function () {});
      next.classList.add("is-on");
      prev.classList.remove("is-on");
      front = 1 - front;
      /* 等淡出跑完再释放解码器（立刻清会连淡出一起掐掉） */
      cleanTimer = setTimeout(function () {
        cleanTimer = null;
        var back = layers[1 - front];
        if (back.classList.contains("is-on")) return;
        reset(back);
      }, 460);
    }

    host.addEventListener("pointerover", function (e) {
      var el = e.target.closest ? e.target.closest(".js-work-list-row") : null;
      if (!el || el === row) return;
      var src = el.getAttribute("data-preview-src");
      if (!src) { hide(); return; }
      show(el, e.clientX, e.clientY);
      play(src);
    });

    host.addEventListener("pointermove", function (e) {
      if (row) target(e.clientX, e.clientY);
    });

    host.addEventListener("pointerleave", hide);
    /* 点进项目页、或页面滚走，都要把预览收干净 */
    host.addEventListener("click", hide);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", function () { if (row) measure(); });

    /* 探针用的读数（第三十八轮）：当前渲染位置 / 目标位置 / 在哪一行。
       判「丝滑」就是看渲染位置是不是**逐帧逼近**目标，而不是一跳到位。 */
    window.__slPreview = function () {
      return {
        row: row ? row.getAttribute("data-work-index") : null,
        tx: tx, ty: ty, cx: cx, cy: cy,
        raf: !!rafId
      };
    };
  }


  /* ---------- 扇形 Carousel ----------
     结构：一条水平"腰线"，每张卡按与当前位置的偏移量 fan 出去
       offset = i - active   （-3 … +3 可见）
       angle  = offset × STEP      向外张开
       y      = |offset| × LIFT    越远越低（形成圆弧）
       z      = -|offset|          越远越靠后
       scale  = 1 - |offset|×0.14
     拖拽：指针左右滑 → 累积位移 → 超过阈值就切下一张，带惯性。
     点击：非当前卡片先居中，当前卡片则打开项目页。 */
  /* 第三十四轮（用户第一条，与第三十三轮同一对诉求：缩小 + 拉开）：
     卡片 58rem → **50rem**（components.css），这里把 **spread 0.72 → 0.88**。
     为什么一次提这么多：第三十三轮把 spread 提到 0.72 之后，实测相邻两张的
     **最小间隙只有 2.2px** —— 仍然几乎是贴着的。原因是卡片带旋转（14°）
     又带透视后退，旋转会把外接盒撑到 边长×(cosφ+sinφ)，透视又把它推向中心，
     所以"每档错开 418px vs 卡片 580px"这种算法会严重高估间距。
     第一轮试 0.88（位移 440px）实测最小间隙只到 13.5px；第二轮把 spread 提到
     1.02、scale 提到 0.15，最小间隙**反而退到 11.3px**。
     为什么会这样 —— **depth 的透视在抵消位移**：
       translate3d 的 x 位移也会被透视投影缩放（z = −depth×|off|），
       off=1 的 510px 投影后只剩 510×1800/2160 = 425px；off=2 的 1020px
       只剩 728px。也就是说**越往外的档，位移被拽回中心越多**，
       而卡片自身宽度同样被缩小 —— 两头都缩，中间的缝就被吃掉了。
     第三轮才把账算对 —— 判据要换成**屏幕包围盒**的水平缝：
       getComputedStyle 的 width 少了父级 perspective 那一层缩放，
       外侧档会被算大 100px 以上，SAT 那套数值根本不能用。
     实测（spread 1.10 / scale 0.22 / step 12）中间卡与邻卡只有 **21px** 的缝，
     原因有两个：① 位移被透视拽回；② **旋转把包围盒撑大** ——
     500px 的卡旋转 12° 后，包围盒是 边长×(cos12°+sin12°) = ×1.181。
     于是缝 = 位移 − 中间卡半宽 − 邻卡半包围盒，三个变量一起调：
       spread 0.72 → **1.16**   每档错开 580px
       scale  0.11 → **0.28**   邻卡缩到 72%（缝主要靠这条出来）
       step   14   → **10**     包围盒系数 1.212 → 1.158，少撑一截
       depth  360  → **300**    少拽回一点
     代价是 off=±2 以外会滑出视口的淡出区（mask 6%~94%），
     清晰可见的是中间 3 张 —— 这正是"一叠卡片散开"该有的样子。
     lift 58 → 44 是跟着卡片一起缩小（下沉量按卡片比例收），
     顺带让视口能少留一大截空白（见 .fan-viewport 的负 margin-bottom）。 */
  /* 第四十二轮：老扇形那套几何参数（step / lift / spread / depth / scale）
     **全部删掉** —— 那是「15 张大卡沿一条水平腰线散开」的做法，
     本轮改成 3 块走**真圆弧**（几何由下面的 STAGE 接管）。
     只留两项手感参数：dur（补间时长）、threshold（拖拽判位阈值）。 */
  var FAN = {
    threshold: 48,  /* 切换所需的拖拽距离 */
    dur: 520        /* 吸附/切换动画时长（ms） */
  };

  /* 第四十二轮（用户第一 / 二条）：**上方 3 块案例作品的圆弧扇形**。
     与下方那排小方块（ARC）是同一套数学，只是参数不同：
       θ = off × step       每档圆心角 40° ⇒ 3 块跨 −40°…+40° = 80°
       x = R·sinθ           沿圆弧横移
       y = R·(1 − cosθ)     沿圆弧下沉（⇒ 中间最高、两侧下沉 = 开口向下的拱形）
       旋转 = θ（1:1）       方块垂直方向对齐圆弧径向、底边朝向圆心
       scale = 1 − |off| × scaleK
     R 由「想要的净间隙」反解（见 initFan 内的 stageRadius()），
     所以 CSS 改卡片尺寸（窄屏 84px / 大屏 240px）时弧会自动跟着缩放。 */
  var STAGE = {
    step: 40,      /* 每档圆心角（度）—— 3 块跨 80°，扇面张得开 */
    gapK: 0.55,    /* 目标净间隙 = 边长 × gapK（用户「间距拉开不要重叠」） */
    scaleK: 0.12,  /* 每档缩小比例（景深） */
    /* ① 为什么是 1.55 而不是 1.5：3 块连续排布时，off 的取值是
         {−1, 0, +1}（pos 为整数）或 {−1.5, −0.5, +0.5, +1.5}（pos 在半档）。
       判据若取 > 1.5，半档那一瞬 |off| = 1.5 会**正好**卡在边界上，
       浮点一抖就少一块 —— 实测采样 436 帧里出现过 2 块。
       取 1.55 让最外侧那块（|off| ≤ 1.5）始终在画，块数恒 3。
       ② 它同时是淡出终点：|off| 从 1 走到 1.55 淡完（见 paint 里的 op）。
       ③ 第四十三轮（用户「两边案例在从两侧出画消失」）：淡完（1.55）之后
         **不立刻隐藏**，让它沿圆弧继续往外走到 |off| = 2 才收 ——
         于是两侧的块是**一路滑到画面外**再消失（容器 `contain: paint`
         会把越过边界的部分裁掉，正是"出画"），而不是原地淡掉。
         因为淡出在 1.55 就完成了，多出来的 1.55~2.05 这段完全不可见，
         "清晰可见恒 3 块"的判据不受影响。 */
    hide: 2.05     /* |off| > 2.05 才不画 ⇒ 恒 3 块清晰可见，两侧滑到画外 */
  };

  /* 参数名沿用 vp（viewport）以减少改动；第四十二轮起它指向的是
     上方那个新容器 `.js-fan-stage`（老的 `.js-fan-viewport` 已被编辑器回写删掉）。 */
  function initFan(vp) {
    if (!vp) return;
    var n = view.length;
    if (!n) return;

    function fanMarkup() {
      return view
        .map(function (w, i) {
          return (
            /* 第四十二轮：带 data-slug —— 点当前那块要跳 work.html?p=<slug>
               独立项目页（用户第三条），探针也靠这个字段验链接对不对。 */
            '<div class="fan-card js-fan-card" data-index="' + i + '" data-slug="' + (w.slug || "") + '" role="button" tabindex="0" aria-label="' + w.title + '">' +
              '<div class="fan-card-inner">' +
                '<div class="fan-card-media" data-media-src="' + (w.media ? w.media.src : "") + '" data-media-kind="' + (w.media ? w.media.kind : "") + '" data-media-alt="' + w.title + '">' +
                  '<div class="scene-grain"></div>' +
                "</div>" +
                '<div class="fan-card-meta">' +
                  '<span class="fan-card-client">' + w.client + "</span>" +
                  '<span class="fan-card-title">' + w.title + "</span>" +
                  '<span class="fan-card-cat type-label">' + w.category + "</span>" +
                "</div>" +
                '<span class="fan-card-play" aria-hidden="true"></span>' +
              "</div>" +
            "</div>"
          );
        })
        .join("");
    }
    vp.innerHTML = fanMarkup();

    var cards = Array.prototype.slice.call(vp.querySelectorAll(".js-fan-card"));
    var active = 0;
    var pos = 0;        /* 连续位置，用于拖拽手感 */
    var drag = null;
    var raf = null;

    /* 第四十二轮：卡片边长（CSS 的 clamp(84px, 15vw, 240px)）与弧半径**解耦** ——
       反解出「净间隙正好 = gapK × 边长」的那个半径：
         水平间距 = R·sinθ − 中心块半宽 − 邻块半投影
         中心块不旋转，半宽 = S/2
         邻块转了 θ、又缩了 (1−scaleK)，半投影 = S(1−scaleK)(cosθ+sinθ)/2
       ⇒ R = (gapK·S + S/2 + S(1−scaleK)(cosθ+sinθ)/2) / sinθ
       读边长用 offsetWidth：getBoundingClientRect 含 transform 的 scale，
       会把已经缩小的邻块读小 → R 越算越小，是条正反馈（坑速查 81）。
       只在初始化 / 重铺 / resize 时读一次（paint 是逐帧跑的，不能碰布局）。 */
    var stageSide = 240, stageSideDirty = true, lastStageW = 0;
    /* 第四十三轮：**淡出终点 = 出画点**。
       放大到 300px 之后，卡片在 |off| ≈ 1.2 时外缘就探出了容器
       （实测那一刻 opacity 还有 0.71）—— 容器 `contain: paint` 会把探出的
       部分裁掉，看上去就是"卡片被切掉一块后凭空消失"的硬切。
       修法不是把淡出调快了事，而是让两者**对齐**：数值求出"外缘刚好触到
       容器边界"的那个 off（offExit），opacity 从 |off| = 1 线性淡到 offExit
       归零 —— 于是块是**一路滑到边界、在触边那一刻正好淡完**，
       既不会硬切，也不会在画面里"啪"地淡掉。
       offExit 只跟边长 / 半径 / 容器半宽有关，缓存起来，别逐帧算。 */
    var stageHalfW = 752, offExit = 1.55;
    function computeOffExit() {
      var S = stageSide, half = stageHalfW, R = stageRadius(), kRad = Math.PI / 180;
      var prev = 1;
      for (var o = 1.02; o <= 3.0001; o += 0.02) {
        var th = o * STAGE.step * kRad;
        var sc = Math.max(0.5, 1 - o * STAGE.scaleK);
        /* 外缘 = 圆心横移 + 旋转后的半投影 */
        var edge = R * Math.sin(th) + S * sc * (Math.cos(th) + Math.sin(th)) / 2;
        if (edge > half) { offExit = prev; return; }
        prev = o;
      }
      offExit = 3;
    }
    function measureStage() {
      /* 第四十二轮：方块边长由**容器宽**算出再写回 CSS 变量 ——
         k × 容器宽，clamp 到 64~上限：
           桌面 1504 → 撞上限；窄屏 350 → 80（正好贴着"不出血"上限）。
         上限是"扇形大一些"：第四十二轮 240 → **第四十三轮 300**（用户本轮
         「整体放大」，+25%）；下限 64 只是**极小容器**的兜底，
         真正起作用的是比例 k —— 下限若写成 84，360 机型也会用 84px
         （3 块总宽 374 > 容器 320 ⇒ 出血），所以必须压到 64。
         **k 的上限是被几何锁死的**：3 块的总跨度（含旋转外接盒）
           = 2 × (R·sinθ + S(1−scaleK)(cosθ+sinθ)/2)
           = 2S × (gapK + 1/2 + (1−scaleK)(cosθ+sinθ))   （θ = 40°）
           = 4.3556 × S
         要不出血就必须 4.3556·S ≤ 容器宽 ⇒ k ≤ 0.2296。
         第四十三轮取 **0.228**（贴着上限走，放大效果全给宽屏）：
           1504 × 0.228 = 343 → 撞 300 上限（放大生效）
           350  × 0.228 = 79.8 → 跨度 347.5 < 350，窄屏仍不出血。
         不写成 CSS 的 clamp(84px, 22%, 240px) 是因为这个变量还要拿去算
         容器 height（百分比在 height 里会相对父高求值 ⇒ 整个值失效 ⇒ height 变 0）。
         同理不能用 vw（CDP 覆盖视口后 vw 不跟着更新）。

         **每帧都比对一次容器宽**（而不是只在标脏时读）：实测窄屏第一次量到的是
         一个中间态宽度（900px → 算出 198px 的方块，3 块直接溢出到 x −259..649），
         而容器宽变化**不会**触发 resize 之外的任何事件，单靠 stageSideDirty
         就永远停在那个错值上。读 clientWidth 不会额外触发 reflow ——
         paint 每帧改的是 transform（合成层属性，不使布局失效）。 */
      var w = vp.clientWidth;
      if (w > 0 && w !== lastStageW) {
        lastStageW = w;
        /* 容器半宽要跟着一起记：淡出终点 offExit 是拿它反解的 */
        stageHalfW = w / 2;
        /* 第五十轮（用户第一条「圆角正方形整体放大40%」）：
             max(64, min(300, round(w × 0.228)))
           → **max(90, min(420, round(w × 0.319)))**。
           比例 0.228 → **0.3192**（= 0.228 × 1.4）、上限 300 → **420**、
           下限 64 → **90**（窄屏 3 块的极小兜底也乘 1.4，否则小屏不跟着长）。
           1584 视口实测：300 → **420px**（上限档）；390 窄屏 80 → **131px**。
          ⚠️ 第四十三轮记的那条「k ≤ 0.2296 才不出血」这条**几何约束本轮被主动放开**：
             放大 40% 之后 3 块的总跨度（2 × (R·sin40° + 旋转外接盒半宽) ≈ 4.36S）
             必然超出舞台容器。之所以敢放开，是因为舞台**不再裁切**了
             （见 components.css 的 .fan-stage：contain 由 `layout paint` 收成 `layout`），
             溢出的部分交给 body 的 overflow-x: hidden 在**视口边缘**裁掉 ——
             于是两侧案例是「滑到屏幕外」，而不是在容器边界处被硬切一刀。
             代价：静止态两侧那两块会被屏幕边缘切掉一角（中间那块 420px 完整）。
             若用户嫌切得多，把 k / 上限按同比例往回收一档即可。 */
        var side = Math.max(90, Math.min(420, Math.round(w * 0.319)));
        vp.style.setProperty("--stage-side", side + "px");
        stageSideDirty = true;
      }
      if (stageSideDirty && cards.length && cards[0].offsetWidth > 0) {
        stageSide = cards[0].offsetWidth;
        stageSideDirty = false;
        computeOffExit();
      }
      return stageSide;
    }
    function stageRadius() {
      var S = measureStage();
      var th = STAGE.step * Math.PI / 180;
      return (STAGE.gapK * S + S / 2 +
        S * (1 - STAGE.scaleK) * (Math.cos(th) + Math.sin(th)) / 2) / Math.sin(th);
    }

    /* ---------- 第三十一轮：下方的「弧形圆角方块轮盘」 ----------
       它是同一个轮播的第二个控制器（不是独立的一套索引）：
       两边共用 pos，所以底部信息条 / 计数器跟着一起动。
       几何：θ = off × ARC.step
             x = R·sinθ 、 y = R·(1 − cosθ)  → 开口向下的半圆弧（拱形，
                                                中间最高、两侧下沉）
             旋转 = θ × rotK（每块沿径向朝向圆心，方块垂直方向对齐半径）
             亮度 = 1 − |off|·0.22（中间最亮，向两侧衰减）

       第三十二轮（用户第三条 / 参考图 E-TORO 那张）：
         · **去掉方块里的视频截图** —— 它是渐变的磨玻璃方块，不是缩略图；
         · **间距拉开、不许重叠**：上一轮 R=300 / step=24°，相邻两块圆心距
           只有 124.7px，而方块边长 152px —— 大面积压在一起。
           现在取 R=520 / step=23°，圆心距 2R·sin(11.5°) ≈ 207px。
           注意方块是**带旋转**的，旋转后方块外接盒会涨到
           边长×(cosφ+sinφ)，所以真正的判据是「旋转后的最小间隙」而不是圆心距：
             R=470/step=22 → 中心两块只差 13px，视觉上仍嫌挤；
             R=520/step=23 → 六对相邻块最小间隙 40px，且整条弧
             宽 1150px、高 499px，刚好装进 .fan-arc 的 540px。
         · 因此容器也要更高（见 components.css 的 .fan-arc）。 */
    var ARC = {
      /* —— 下面这段是第三十一~四十轮的几何沿革，仅作存档保留；
         第四十一轮起参数已换回**真圆弧轨迹**（见紧接着的那段注释）—— */
      /* 第三十七轮（用户第一条「整体缩小」）：整套几何**等比缩 0.8** ——
         方块 104 → 84px（components.css），弧半径 520 → **416**，
         于是「相邻两块的净间隙 ≈ 一个方块的边长」这个第三十四轮定下的
         比例关系原样保留（2R·sin(step/2) 与边长同比例缩）：
           圆心距 216 → 173px，净间隙 102 → 81px，边长 104 → 84px，
           间隙/边长 0.98 → 0.97，仍是一个方块。
         单改方块、不动 R 的话，间隙会涨到 124px（≈1.5 个方块），
         弧也会显得「块小、路远」——所以必须一起缩。
         第三十九轮（用户第一条「整体缩小60%」）：在第三十七轮基础上**再 ×0.6** ——
         方块 84 → 50px（components.css），弧半径 416 → **250**，
         圆心距 173 → 104px，净间隙 81 → 54px，间隙/边长 0.97 → 1.08（仍约一个方块）。
         最外侧下沉 416×(1−cos48°) = 138 → 250×0.3309 = 83px，
         外接盒高 ≈ 50×1.395 = 70px → 整条弧占高约 152px（容器 16rem）。 */
      /* 第四十一轮（用户第一 / 二条）：**回到真正的圆弧轨迹** ——
         第四十轮的「折扇式」是 x = off×spread 的**线性**外移 + 只沉 6px/档，
         读起来是"往两边推开"，不是用户要的"沿一段向上张开的弧形（半圆形路径）"。
         本轮按用户原话重写几何（开口向下的半圆弧 = 拱形，中间最高、两侧下沉）：
           θ = off × step          每档圆心角 26°，5 块跨 −52°…+52° = 104°（≈半圆）
           x = R·sinθ              沿圆弧横移（**不是**线性的 off×50）
           y = R·(1 − cosθ)        沿圆弧下沉（圆心在弧顶正下方 R 处）
           旋转 = θ（1:1）          方块垂直方向对齐圆弧径向、底边朝向圆心
         旋转为什么是 +θ 而不是别的符号：把方块局部"向上"那条轴 (0,−1)
         按 CSS 的 rotate(θ) 转出来是 (sinθ, −cosθ)，正好等于**由圆心指向该块**
         的单位向量 —— 于是方块的上边朝外、下边朝圆心，和拱心石 / 折扇骨一致
         （右侧块顺时针、左侧块镜像）。
         R 不再是写死的常数 —— 由「想要的净间隙」反解（见 arcRadius()），
         CSS 改方块尺寸（30 / 36px 两档）时弧线自动跟着缩放，不会"块小、路远"。
         间距（用户第二条「间距大一些」）：净间隙 = 边长 × **0.72**
         （第四十轮是 0.33 —— 实测 12px，本轮 36px 档实测约 28px）。 */
      step: 26,      /* 每档圆心角（度）：5 块跨 104°，就是一段半圆路径 */
      gapK: 0.72,    /* 目标净间隙 = 边长 × gapK（用户「间距大一些」） */
      scaleK: 0.07,  /* 每档缩小比例（景深） */
      /* 第三十五轮（用户第二条 / 参考图 画板 1.png）：可见块数 7 → **5**
         （弧心 + 左右各两块），与参考图一致。第三十九轮的「整体缩小60%」
         只缩尺寸、不改可见块数 —— 仍是 5 块。 */
      hide: 2.45     /* 超过这个 |off| 就不画了 → 可见 5 块 */
    };

    /* 第四十一轮：方块边长（CSS 两档 30 / 36px）与弧半径**解耦** ——
       读一次布局宽度，反解出「净间隙正好 = gapK×边长」的那个半径：
         相邻两块圆心距（弦长）   = 2R·sin(step/2)
         各自在连心线方向的半投影 = 边长×(cos(step/2)+sin(step/2))/2
         （方块是转过的，投影得按 |cos|+|sin| 算，不能拿边长直接减）
         ⇒ gap = 2R·sin h − S·(cos h + sin h)
         ⇒ R   = (gapK·S + S·(cos h + sin h)) / (2·sin h)
       用 offsetWidth 而不是 getBoundingClientRect：后者**含 transform 的 scale**，
       会把已经缩小的外侧块读小 → R 越算越小，是条正反馈。
       只在 collect / resize 时读一次（paint 是逐帧跑的，不能在里面碰布局）。 */
    var arcSide = 36, arcSideDirty = true;
    function measureArc() {
      if (arcSideDirty && arcTiles.length && arcTiles[0].offsetWidth > 0) {
        arcSide = arcTiles[0].offsetWidth;
        arcSideDirty = false;
      }
      return arcSide;
    }
    function arcRadius() {
      var S = measureArc();
      var h = (ARC.step / 2) * Math.PI / 180;
      return (ARC.gapK * S + S * (Math.cos(h) + Math.sin(h))) / (2 * Math.sin(h));
    }

    /* 第四十轮（用户第二条「左右切换完还可以继续循环切换」）：
       轮盘改成**环形** —— 走到最后一支再往右就回到第一支，往左同理。
         wrap(v)    ：把任意档位折回 [0, n)
         offWrap(d) ：把「第 i 支相对当前位」的偏移折到 ±n/2 内
                      （于是 pos=0 时第 n−1 支的 off 是 −1、出现在左边，
                       而不是 +14 —— 否则扇形的左半边永远是空的）
       三处都要用：paint() 的卡片、paintArc() 的方块、goTo() 的目标。 */
    function wrap(v) { var n = view.length || 1; return ((v % n) + n) % n; }
    function offWrap(d) {
      var n = view.length || 1;
      d = ((d % n) + n) % n;
      if (d > n / 2) d -= n;
      return d;
    }
    var arcHost = document.querySelector(".js-fan-arc");
    var arcTiles = [];
    function arcMarkup() {
      return view
        .map(function (w, i) {
          return (
            '<button class="arc-tile js-arc-tile" type="button" data-index="' + i + '" aria-label="' + w.title + '"></button>'
          );
        })
        .join("");
    }
    function collectArc() {
      arcTiles = arcHost ? Array.prototype.slice.call(arcHost.querySelectorAll(".js-arc-tile")) : [];
      /* 第四十一轮：重铺之后方块尺寸可能换档（CSS 断点），标记重读一次 */
      arcSideDirty = true;
    }
    if (arcHost) {
      arcHost.innerHTML = arcMarkup();
      collectArc();
    }

    function paintArc() {
      if (!arcTiles.length) return;
      var n = arcTiles.length;
      /* 半径每帧只算一次（里面是纯算术，不碰布局） */
      var R = arcRadius();
      var kRad = Math.PI / 180;
      for (var i = 0; i < n; i++) {
        /* 关键：偏移要**环绕折回**（环形轮盘）。
           若直接用 i − pos，第一件作品的左侧就没有邻居，
           轮盘会缺半边、只剩 3 块；折回之后永远是 5 块对称的扇形。
           第四十轮起折回统一走 offWrap()（与上方大卡片共用同一套口径）。 */
        var off = offWrap(i - pos);
        var abs = Math.abs(off);
        if (abs > ARC.hide) { arcTiles[i].style.visibility = "hidden"; continue; }
        arcTiles[i].style.visibility = "visible";
        /* 第四十一轮：**真圆弧轨迹**（θ = off×step）——
             x = R·sinθ       沿圆弧横移
             y = R·(1 − cosθ) 沿圆弧下沉（y 为正 = 往下 ⇒ 中间最高、两侧下沉，
                              呈开口向下的半圆弧 / 拱形）
           第四十轮的折扇式（x = off×spread、y = |off|×lift）已废弃。 */
        var th = off * ARC.step * kRad;
        var x = R * Math.sin(th);
        var y = R * (1 - Math.cos(th));
        arcTiles[i].style.transform =
          "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
          /* 旋转 1:1 跟圆心角 ⇒ 方块垂直方向对齐圆弧径向、底边朝向圆心 */
          "rotate(" + (off * ARC.step).toFixed(2) + "deg) " +
          "scale(" + (1 - abs * ARC.scaleK).toFixed(3) + ")";
        /* 淡出区间跟着可见块数走：hide=2.45，所以 |off| 从 2 走到 2.45 淡完 */
        arcTiles[i].style.opacity = abs > 2 ? Math.max(0, 1 - (abs - 2) / 0.45).toFixed(3) : "1";
        /* 中间那块压在最上层，两侧依次往后 —— 折扇摊开时层级才不会打架 */
        arcTiles[i].style.zIndex = String(100 - Math.round(abs * 10));
        arcTiles[i].style.setProperty("--arc-bright", Math.max(0.45, 1 - abs * 0.2).toFixed(3));
        arcTiles[i].classList.toggle("is-active", wrap(Math.round(pos)) === i);
      }
    }

    /* 第三十九轮（用户第二条）：「左右滑动的时候中间只有一个案例视频，
       去除中间底部多余视频，两侧各一个」——
       原来 |off| ≤ 4.2 都画（同屏 9 张：中 1 + 左右各 4，越远越小越下沉），
       现在**只留 |off| ≤ 1**（中间 1 张 + 左右各 1 张）。
       阈值取 1.5（而不是 1.0）：滑动时 pos 是小数，相邻两张的 |off| 之和恒为 1，
       1.5 这个中点能保证**任何时刻可见数都恰好是 3**，不会中途闪成 2 张或 4 张。
       消失不硬切：|off| 从 1.0 走到 1.5 的这半档里把 opacity 压到 0（见下面 op）。 */
    /* 第四十二轮：上方扇形的可见块数由 STAGE.hide 管（1.45 ⇒ 恒 3 块），
       淡出区间跟着走：|off| 从 1 到 1.45 淡完（跨档时是渐隐，不硬切）。
       下面这行只是给 paint 里用的常量，避免把 1.45 写两遍。 */
    var STAGE_VISIBLE = STAGE.hide;

    function paint() {
      raf = null;
      /* 半径每帧只算一次（纯算术，不碰布局） */
      var R = stageRadius();
      var kRad = Math.PI / 180;
      /* 第四十三轮：淡完点 = 出画点（见 computeOffExit 的注释）。
         隐藏点必须**晚于**淡完点，否则块会在还看得见的时候被整块撤掉
         （另一种硬切）；容器特别宽时 offExit 会超过 STAGE.hide，所以取 max。 */
      var hideNow = Math.max(STAGE_VISIBLE, offExit + 0.05);
      /* 第五十轮：淡出行程给一个**下限 0.25 档**。
         第四十三轮把「淡完点」对齐到「卡片外缘触到容器边界那一刻」（offExit），
         靠的是「静止态（|off| = 1）时卡片还在容器里」这个前提。
         本轮卡面放大 40% 之后这个前提没了 —— 静止态两侧那两块的外缘
         （距中心 ≈ 961px）本来就超出了舞台半宽（≈ 774px），
         computeOffExit 求出来的 offExit 会退化成 1 ⇒ fadeSpan = 0.05，
         卡片一出 |off| = 1 就"啪"地没了（正是第四十三轮要避免的观感）。
         现在裁剪也搬到了视口边缘（见 .fan-stage 的 contain 注释），
         「淡完点 == 裁切点」这件事已经不存在了，所以改成：
         从 |off| = 1 起、至少跨 0.25 档淡完（旧值实测 ≈ 0.25 档，手感一致）。 */
      var fadeSpan = Math.max(0.25, offExit - 1);
      for (var i = 0; i < cards.length; i++) {
        /* 第四十轮：环形 —— 偏移先折回 ±n/2，于是第 1 支左边也是第 n 支 */
        var off = offWrap(i - pos);
        var abs = Math.abs(off);
        if (abs > hideNow) {
          /* 第四十四轮（用户第一条）：「轮播下方左右滑动案例作品，在鼠标左右
             滑动的时候，去除中间位置背景底部、不可点击、在自动播放的预览视频」。
             根因：只写 visibility:hidden **挡不住卡片里的 <video>** ——
             SLMedia 挂载时会给视频写行内 `visibility: visible`
             （scene.js 的 tryPlay 成功分支，见 brand.html 里序列化出来的
              style="opacity:1;…;visibility:visible"），**行内样式压过继承值**，
             于是这 10 张"已隐藏"的卡片其实还在出画面：它们停在**未变换的
             初始位置**（舞台正中、当前卡的正后方，z-index 又低），
             当前卡一被拖开就把这一摞正在自动播放、又点不动的画面露出来。
             两处一起改：
               ① `display:none` —— 直接不让它参与渲染，行内 visibility 也救不回来
                  （比 visibility 更彻底，且 .fan-card 是绝对定位，不影响布局）；
               ② 顺带解决"15 路视频同时在播"：display:none 之后
                  SLMedia 的 IntersectionObserver 判定为不在视口 → 自动 pause，
                  拖拽时的解码压力也一起降下来。 */
          cards[i].style.visibility = "hidden";
          cards[i].style.display = "none";
          continue;
        }
        cards[i].style.visibility = "visible";
        cards[i].style.display = "";
        /* 第四十二轮：**真圆弧轨迹**（与下方 ARC 同一套公式）——
             x = R·sinθ       沿圆弧横移
             y = R·(1 − cosθ) 沿圆弧下沉 ⇒ 中间最高、两侧下沉（开口向下的拱形）
           旋转 1:1 跟圆心角 ⇒ 方块垂直方向对齐圆弧径向、底边朝向圆心。
           老的「x = off×spread 百分比 + translateZ 后退」那套已废弃 ——
           它的位移是线性的，拼不出圆弧，而且透视会把位移拽回中心，
           越往外的档缝隙被吃得越狠（这正是老扇形相邻卡只差 2.2px 的原因）。 */
        var th = off * STAGE.step * kRad;
        var x = R * Math.sin(th);
        var y = R * (1 - Math.cos(th));
        var sc = Math.max(0.5, 1 - abs * STAGE.scaleK);
        /* 第四十三轮：|off| 从 1 起淡出、到 **offExit（触到容器边界那一刻）**
           淡完 —— 于是块是"滑出去的同时淡掉"，触边即全透明，不会硬切；
           淡完之后仍继续沿圆弧滑到 hideNow 才撤掉（那一段完全不可见，
           但保证了"出画"的位移是连续的，不是原地消失）。
           旧的固定 `/ 0.55` 在放大后会让块在 opacity 0.71 时探出边界被裁。 */
        var op = abs <= 1 ? 1 : Math.max(0, 1 - (abs - 1) / fadeSpan);

        cards[i].style.transform =
          "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
          "rotate(" + (off * STAGE.step).toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
        cards[i].style.opacity = op.toFixed(3);
        cards[i].style.zIndex = String(1000 - Math.round(abs * 10));
        cards[i].classList.toggle("is-active", wrap(Math.round(pos)) === i);
      }
      /* 换一张就刷新底部信息条
         第四十轮：pos 在环形补间里可能短暂越界（14 → 15 → 归一到 0），
         Math.round(pos) 会先给出 n，所以取索引前一律 wrap。 */
      var cur = view[wrap(Math.round(pos))] || view[0];
      if (cur && caption) {
        caption.querySelector(".js-fan-caption-client").textContent = cur.client;
        caption.querySelector(".js-fan-caption-title").textContent = cur.title;
        caption.querySelector(".js-fan-caption-cat").textContent =
          window.SLProjectView ? window.SLProjectView.i18nCategory(cur.category) : cur.category;
        caption.querySelector(".js-fan-caption-year").textContent = cur.year || "";
      }
      /* 第四十二轮：counter（.js-fan-counter）在第三十八轮已经随 .fan-nav
         一起被删掉了 —— 这里如果不判空，paint() 会在这一行抛 TypeError，
         于是**下方弧形轮盘也跟着不画**（paintArc 在同一帧的后面）。
         运行时症状是「方块定在初始位置、拖也拖不动」，很难一眼看出是这里。 */
      if (counter) {
        counter.textContent = String(wrap(Math.round(pos)) + 1).padStart(2, "0") + " / " + String(view.length).padStart(2, "0");
      }
      /* 下方的弧形轮盘跟着一起走 */
      paintArc();
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(paint);
    }

    /* 第二十三轮：原来这里有一套 setSwitching()（拖拽/补间期间给 viewport 打
       .is-switching，CSS 把非当前卡全淡掉，只留中间一支）。现在去掉了：
       两侧扇形滑开时应该照常可见，中间卡底部那条"别人的画面"改由
       .fan-card.is-active::after 的那条渐隐垫片盖住（见 components.css）。
       顺带也修掉了它带来的副作用 —— 那两条 `transition: opacity .18s !important`
       会把 .is-dragging 的 `transition: none` 顶掉，于是 paint() 逐帧写的
       行内 opacity 开始滞后于位置，拖出一串半透明的"幽灵卡片"。 */

    function goTo(i, immediate) {
      /* 第四十轮：目标档位**环绕**（不再 clamp 到端点）——
         最后一支再往右就是第一支，第一支往左就是最后一支。
         补间走**环形最短路径**：14 → 0 是往前 1 档（+1），
         不是往回退 14 档 —— 否则跨端点时会看到整排卡片唰地扫回去。 */
      active = wrap(i);
      cancelTween();
      if (immediate) {
        pos = active;
        schedule();
      } else {
        /* 用一条短的缓动跑到目标，避免指针一松就"跳"。
           直接同步 paint()，不再套一层 rAF：多等一帧会表现为
           "卡片慢半拍"，快速连切时看着就是拖尾。 */
        var start = pos, delta = active - start, t0 = performance.now();
        var nN = cards.length;
        if (delta > nN / 2) delta -= nN;
        if (delta < -nN / 2) delta += nN;
        function tick(now) {
          var p = Math.min(1, (now - t0) / FAN.dur);
          var e = 1 - Math.pow(1 - p, 4);   /* expo-out，不过冲 */
          pos = start + delta * e;
          paint();
          if (p < 1) tween = requestAnimationFrame(tick);
          else { tween = null; pos = active; paint(); }
        }
        tween = requestAnimationFrame(tick);
      }
    }

    /* 新一次切换要先掐掉上一条补间，否则两条 rAF 同时改 pos，
       卡片会在两个目标之间来回抖 —— 这也是"拖尾"的常见来源。 */
    var tween = null;
    function cancelTween() {
      if (tween) { cancelAnimationFrame(tween); tween = null; }
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    /* 拖拽：按水平位移换算成"档位"，松手后吸附 */
    vp.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".fan-card-play")) return;
      /* 关键：这里要把「按下的那张卡」记下来。
         因为下面调用了 setPointerCapture，指针捕获之后 pointerup 的
         e.target 会被重定向到 vp 本身（而不是卡片），
         所以松手时再 e.target.closest(".js-fan-card") 永远拿到 null，
         "轻点当前卡 → 打开项目页" 就会静默失效。 */
      drag = {
        x0: e.clientX,
        pos0: pos,
        moved: 0,
        id: e.pointerId,
        card: e.target.closest(".js-fan-card")
      };
      /* 手一按下就关掉 card 上的过渡（.is-dragging），避免逐帧改 transform 时
         浏览器把每一帧当成新补间去追，拖出一串残影。 */
      try { vp.setPointerCapture(e.pointerId); } catch (err) {}
      vp.classList.add("is-dragging");
    });

    vp.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      /* 经验换算：拖过约 1/4 个视口宽度 = 走一档 */
      var unit = vp.clientWidth * 0.25;
      /* 第四十轮（用户第二条「左右切换完还可以继续循环切换」）：
         越过头尾**直接绕回**，不再做橡皮筋阻尼 —— 环形轮盘没有"端点"这回事。 */
      pos = wrap(drag.pos0 - dx / unit);
      schedule();
    });

    function endDrag(e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      var tapped = drag.moved < 8;
      var from = drag.pos0;
      /* 用按下时记下的卡片，而不是松手事件的 target
         （指针捕获会把 target 重定向到 vp） */
      var card = drag.card;
      drag = null;
      vp.classList.remove("is-dragging");

      /* 轻点：当作切卡 / 打开 */
      if (tapped) {
        if (card) {
          var i = parseInt(card.getAttribute("data-index"), 10);
          if (i === active) {
            /* 第四十二轮（用户第三条）：点当前那块 → 进**独立的**项目页
               `work.html?p=<slug>`。那页本来就齐了用户要的四样东西：
               可开声音的播放器（.js-pv-sound）/ 退出（.js-proj-back 后退）/
               广告基础介绍 + 剧照 / 最下方的其他项目（project-page.js 注入）。
               原来是弹层 openProject()，这次用户明确说「点击进入一个单独的
               页面，能够选择播放视频且有声音、也可以选择退出」，改跳转。 */
            openWorkPage(i);
          } else {
            goTo(i, false);
          }
        }
        return;
      }

      /* 拖拽：按方向吸附到相邻档 */
      if (Math.abs(dx) > FAN.threshold) {
        goTo(dx < 0 ? Math.floor(from) + 1 : Math.ceil(from) - 1, false);
      } else {
        goTo(Math.round(pos), false);
      }
    }
    vp.addEventListener("pointerup", endDrag);
    vp.addEventListener("pointercancel", function (e) {
      if (!drag) return;
      drag = null;
      vp.classList.remove("is-dragging");
      goTo(Math.round(pos), false);
    });

    /* 第四十二轮：进独立项目页（上方扇形与下方弧形共用）
       第四十九轮：URL 上补一个 `from=carousel` —— 告诉详情页"用户是从
       **轮播档**进来的"，详情页右上角的退出键据此把人送回 brand.html 的
       轮播档（`brand.html?view=carousel`），而不是默认的网格档。
       （落点解析在 project-page.js 的 exitTarget()，档位解析在 works.js） */
    function openWorkPage(i) {
      var w = view[i];
      if (!w) return;
      location.href = "work.html?p=" + encodeURIComponent(w.slug || "") + "&from=carousel";
    }

    /* 键盘：左右箭头切卡，回车打开 */
    vp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1, false); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1, false); }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        /* 同上：回车也是进独立项目页，不是弹层 */
        openWorkPage(active);
      }
    });

    /* 滚轮横向：也当作切换（触控板用户最自然的动作） */
    vp.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) > 60) {
        goTo(active + (wheelAcc > 0 ? 1 : -1), false);
        wheelAcc = 0;
      }
    }, { passive: false });
    var wheelAcc = 0;

    /* ---------- 第三十一轮：弧形轮盘交互（拖拽 / 滚轮 / 左右键 / 点按） ---------- */
    if (arcHost && arcTiles.length) {
      var aDrag = null;
      arcHost.addEventListener("pointerdown", function (e) {
        aDrag = {
          x0: e.clientX, pos0: pos, moved: 0,
          tile: e.target.closest ? e.target.closest(".js-arc-tile") : null
        };
        try { arcHost.setPointerCapture(e.pointerId); } catch (err) {}
        arcHost.classList.add("is-dragging");
      });
      arcHost.addEventListener("pointermove", function (e) {
        if (!aDrag) return;
        var dx = e.clientX - aDrag.x0;
        aDrag.moved = Math.max(aDrag.moved, Math.abs(dx));
        var unit = Math.max(120, arcHost.clientWidth * 0.22);
        /* 同上：环形，越过头尾直接绕回（不再阻尼） */
        pos = wrap(aDrag.pos0 - dx / unit);
        schedule();
      });
      function endArcDrag(e) {
        if (!aDrag) return;
        var dx = e.clientX - aDrag.x0;
        var tapped = aDrag.moved < 8;
        var tile = aDrag.tile;
        var from = aDrag.pos0;
        aDrag = null;
        arcHost.classList.remove("is-dragging");
        if (tapped) {
          if (tile) {
            var i = parseInt(tile.getAttribute("data-index"), 10);
            if (i === active) openProject(i, tile);
            else goTo(i, false);
          }
          return;
        }
        if (Math.abs(dx) > FAN.threshold) {
          goTo(dx < 0 ? Math.floor(from) + 1 : Math.ceil(from) - 1, false);
        } else {
          goTo(Math.round(pos), false);
        }
      }
      arcHost.addEventListener("pointerup", endArcDrag);
      arcHost.addEventListener("pointercancel", function () {
        if (!aDrag) return;
        aDrag = null;
        arcHost.classList.remove("is-dragging");
        goTo(Math.round(pos), false);
      });
      arcHost.addEventListener("wheel", function (e) {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        if (Math.abs(e.deltaX) > 24) goTo(active + (e.deltaX > 0 ? 1 : -1), false);
      }, { passive: false });
      arcHost.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1, false); }
        if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1, false); }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProject(active, arcTiles[active]);
        }
      });
    }

    /* ---------- 「查看更多项目」链接 ----------
       第四十轮（用户第四条）：这枚控件从 <button> 改成了 <a href="works.html">，
       文案「查看项目」→「查看更多项目」，位置从弧形方块上方移到**下方居中**。
       所以它**不再 openProject()** —— 点它是进第四十轮新建的
       「视频类型分类」独立页，不是打开当前作品的播放弹层。
       原来的 click 绑定整段撤掉，跳转交给 <a> 自己走（back.js / 换页动效照旧）。 */

    /* 下方信息条（第三十八轮起只剩案例信息）
       第三十八轮（用户第一 / 四条）：底部的「计数 + 左右箭头」按用户要求整条去掉
       （原话：去除 左右箭头和数字），连同它上方那条 1px 细线一起。
       原来这两处是探针驱动轮播的唯一入口（点 .js-fan-next），现在换成下面两个
       程序化接口 —— 页面上的换片仍有三条路：拖拽 / 点两侧卡片 / 这两个接口。 */
    var caption = vp.parentElement.querySelector(".js-fan-caption");
    var counter = vp.parentElement.querySelector(".js-fan-counter");
    if (!caption) { caption = null; }
    if (!counter) { counter = { textContent: "" }; }

    var prevBtn = vp.parentElement.querySelector(".js-fan-prev");
    var nextBtn = vp.parentElement.querySelector(".js-fan-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1, false); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1, false); });

    /* 第四十轮修一个 falsy 坑：原来写的是 `delta || 1`，于是传 **0** 会
       被当成「没传」而前进一格（探针 `__slFanGo(-active)` 在 active=0 时
       传的正是 -0）。现在显式判 undefined/null，0 就是 0（原地不换片）。 */
    window.__slFanGo = function (delta) {
      var d = (delta === undefined || delta === null) ? 1 : delta;
      goTo(active + d, false);
      return Math.round(pos);
    };
    window.__slFanIndex = function () {
      /* 第四十轮：环形之后 pos 在补间途中可能短暂越界，读序号一律 wrap */
      var a = wrap(Math.round(pos));
      return { active: a, total: view.length,
               counter: String(a + 1).padStart(2, "0") + " / " +
                        String(view.length).padStart(2, "0") };
    };

    goTo(0, true);
    /* 第四十一轮：窗口宽度变了会跨 CSS 断点（方块 30 / 36px 两档），
       弧半径是按边长反解的，所以这里必须标脏、让下一帧重读一次。
       第四十二轮：上方扇形的卡片是 clamp(84px, 15vw, 240px)，**连续**随视口变，
       更要标脏 —— 否则拉宽窗口后 R 还是按旧边长算的，间距会跟着失真。 */
    window.addEventListener("resize", function () {
      arcSideDirty = true;
      stageSideDirty = true;
      schedule();
    });

    /* 面板从 hidden 切成可见时，卡片宽度会从 0 变成实际值。
       这时必须重画一次，否则 transform 里的百分比是按 0 宽算的，
       所有卡片会叠在正中。works.js 的 tab 切换会调用这个钩子。 */
    window.__slFanRepaint = function () {
      measure();
      schedule();
    };

    /* 第三十二轮（第七条）：「换一批」把数据顺序换掉之后重铺整把扇子。
       指针事件的监听都挂在 vp / arcHost 这两个容器上，
       innerHTML 重铺不会掉监听，所以这里只要把 cards / arcTiles 重新收一遍。 */
    window.__slFanRebuild = function () {
      n = view.length;
      vp.innerHTML = fanMarkup();
      cards = Array.prototype.slice.call(vp.querySelectorAll(".js-fan-card"));
      /* 第四十二轮：卡片整批重铺后，边长要重新读一次（可能跨了 CSS 断点） */
      stageSideDirty = true;
      if (arcHost) {
        arcHost.innerHTML = arcMarkup();
        collectArc();
      }
      active = 0;
      pos = 0;
      goTo(0, true);
      if (window.SLScene) window.SLScene.mount(vp);
      measure();
      schedule();
    };

    function measure() {
      /* 读一次宽度，强制布局落地（隐藏时读到 0，显示后要重新读） */
      void vp.offsetWidth;
    }
  }

  /* 第四十二轮：容器从 `.js-fan-viewport`（被编辑器回写删掉、且几何是老扇形）
     换成新建的 `.js-fan-stage`（3 块走真圆弧）。 */
  initFan(q(".js-fan-stage"));

  /* ---------- 绑定点：卡片 / 列表行 ---------- */
  function bindGrid() {
    Array.prototype.forEach.call(document.querySelectorAll(".js-work-card[data-work-index]"), function (el) {
      bindCard(el, parseInt(el.getAttribute("data-work-index"), 10));
    });
  }
  function bindListRows() {
    Array.prototype.forEach.call(document.querySelectorAll(".js-work-list-row[data-work-index]"), function (el) {
      var i = parseInt(el.getAttribute("data-work-index"), 10);
      if (!hasVideo(view[i])) return;
      el.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (openProject(i, el)) e.preventDefault();
      });
    });
  }
  bindGrid();
  bindListRows();

  /* ---------- 第三十二轮（第七条）：「换一批」 ----------
     换的只是一个起点偏移（view），三个视图 + 弧形轮盘全部重渲染一次。
     事件监听挂在容器上（vp / arcHost / list），重渲染 innerHTML 不会掉监听；
     只有网格卡片与列表行是「每个元素各挂一个」，所以重渲染后要重新绑一次。 */
  function renderWorks() {
    view = rotateWorks(worksAt);
    if (grid) {
      grid.innerHTML = view.map(card).join("");
      bindGrid();
      if (window.SLScene) window.SLScene.mount(grid);
    }
    if (list && !isTalent) {
      list.innerHTML = listMarkup();
      bindListRows();
    }
    if (window.__slFanRebuild) window.__slFanRebuild();
    paintBatchLabel();
  }

  var shuffleBtn = q(".js-works-shuffle");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      worksAt += 1;
      renderWorks();
    });
  }
  paintBatchLabel();

  /* ---------- 跨栏目 CTA ----------
     第二十一轮：精选作品页底部的 CTA 从「Continue to Narrative」改成
     「CONTINUE TO MODELS & ACTORS」，连带目标页也从 narrative.html 换成
     stills.html（模特与演员页）。& 要写成 &amp;，否则 innerHTML 会吞成实体。 */
  var other = null;
  if (key === "brand") other = { href: "stills.html", title: "MODELS &amp; ACTORS" };
  else if (D.brand) other = { href: "brand.html", title: D.brand.title };
  var cross = q(".js-cross-cta");
  if (cross && other) {
    cross.setAttribute("href", other.href);
    var t = cross.querySelector(".js-cross-title");
    if (t) t.innerHTML = 'Continue to <span class="cross-cta-accent">' + other.title + "</span>";
  }

  /* ---------- 场景与媒体挂载 ---------- */
  if (window.SLScene) window.SLScene.mount(document);
  if (window.SLMedia) window.SLMedia.mount(document);

  /* ---------- 通知 i18n 内容层重刷 ----------
     本脚本渲染时写入的是数据层里的英文原文，如果当前语言是中文，
     必须让 i18n-extra 再覆盖一次；否则页头/类目会停在英文。 */
  if (window.SLi18nExtra && window.SLi18nExtra.refresh) {
    window.SLi18nExtra.refresh();
  }
})();
