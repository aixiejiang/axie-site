/* =============================================================
   首页左侧「单帧画廊」（SLFrames）

   帧 = **首页上下滑动依次出现的那几支视频**（目前 8 屏 / 8 帧），
   不是全站 22 支作品 —— 画廊是跟着首页滚动走的，
   多出来的帧永远滚不到，属于「多余的」。
   来源直接读 index.html 里 .scene[data-media-src]，按文档顺序，
   所以加减一屏视频，画廊自动跟着变，不用改数据。

   每格的图是从对应视频**尾板**（片尾）截的单帧，
   由 tools/extract_tail_frames.py 生成到 assets/media/frames/vNN.jpg，
   与卡片海报 posters/vNN.jpg（正片中段）分开，互不干扰。

   行为：
   - 随页面滚动纵向平移（滚动驱动，不是鼠标事件驱动）
   - 当前帧为实心"黄色框"，按与当前帧的距离做「暗 → 亮」连续渐变
   - 右侧一条黄色计时轴显示进度

   关键几何（曾经的坑）：
     若轨道上下不垫留白，N 帧总高常常比容器高不了多少，
     可滑动行程会被 clamp 压成 0，黄框看起来「完全不动」。
     做法是上下各垫 (railH - cellH)/2，于是 y = -i × span，
     行程恢复到 (N-1) × span。
   ============================================================= */

window.SLFrames = (function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var rail, track, axisFill, cells = [];
  var geo = { cellH: 0, gap: 0, span: 0, railH: 0, pad: 0 };
  /* 初始 -1：保证首次 update(0) 也会真正打上 is-current，
     否则 curIndex 初值就是 0，首屏永远不会高亮。 */
  var curIndex = -1;
  var mounted = false;

  /* 兜底：页面里一个场景都没解析到时才用（正常不会走到） */
  var FALLBACK = [
    { src: "assets/media/frames/v01.jpg", label: "Tylenol", video: "assets/media/videos/v01.mp4" },
    { src: "assets/media/frames/v02.jpg", label: "Wissen", video: "assets/media/videos/v02.mp4" }
  ];

  /* 画廊来源 = 首页场景，按**文档顺序**读 index.html 的 .scene[data-media-src]。
     这样帧数永远等于「首页能滑到的视频数」，不会多出滚不到的死帧。 */
  function items() {
    var scenes = document.querySelectorAll(".js-snap-item .scene[data-media-src], .snap-item .scene[data-media-src]");
    if (!scenes.length) scenes = document.querySelectorAll(".scene[data-media-src]");

    var list = [];
    Array.prototype.forEach.call(scenes, function (sc) {
      var src = sc.getAttribute("data-media-src") || "";
      if (!/\.mp4$/i.test(src)) return;          /* 只收视频，静帧场景跳过 */
      var m = /videos\/(v\d+)\.mp4$/.exec(src);
      var section = sc.closest(".snap-item");
      list.push({
        src: m ? "assets/media/frames/" + m[1] + ".jpg" : src,
        video: src,
        /* 标签优先用分屏的 aria-label（Showreel / Tylenol / …），
           没有就退回 data-media-alt，再没有就用文件名 */
        label: (section && section.getAttribute("aria-label")) ||
               sc.getAttribute("data-media-alt") ||
               (m ? m[1] : "Video"),
        client: ""
      });
    });
    return list.length ? list : FALLBACK;
  }

  /* ---------- 构建 DOM ---------- */
  function build() {
    var list = items();
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var it = list[i] || {};
      var num = i + 1 < 10 ? "0" + (i + 1) : String(i + 1);
      html +=
        '<figure class="frame-cell js-frame-cell" data-frame="' + i + '"' +
          ' data-video="' + (it.video || "") + '"' +
          ' data-title="' + (it.label || "") + '"' +
          ' data-client="' + (it.client || "") + '"' +
          ' role="button" tabindex="0"' +
          ' aria-label="' + (it.label || "") + '"' +
          ' title="' + (it.label || "") + '">' +
          /* 关键：这里必须 eager，不能用 lazy。
             画廊是「滚动驱动纵向平移」的，lazy 会让刚滑进视口的帧
             才开始下载 —— 滑动时就会看到一格格空的黑块往里跳。
             尾板图单张很小（448px 宽，~15KB），8 张共 140K，一次性加载无压力。 */
          '<img src="' + (it.src || "") + '" alt="" loading="eager" fetchpriority="low" decoding="async" />' +
          '<span class="frame-cell-index">' + num + "</span>" +
        "</figure>";
    }
    track.innerHTML = html;
    cells = Array.prototype.slice.call(track.querySelectorAll(".js-frame-cell"));
    bindCells();
  }

  /* 点某一帧 = 播放它对应的那支视频（用全屏丝滑播放器，有声、可自由退出）。
     键盘 Enter / Space 等价于点击，保证可达性。 */
  function bindCells() {
    cells.forEach(function (cell) {
      function play(e) {
        var src = cell.getAttribute("data-video");
        if (!src || !window.SLPlayer) return;
        e.preventDefault();
        e.stopPropagation();
        window.SLPlayer.open({
          src: src,
          title: cell.getAttribute("data-title") || "",
          client: cell.getAttribute("data-client") || "",
          originEl: cell
        });
      }
      cell.addEventListener("click", play);
      cell.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") play(e);
      });
    });
  }

  /* ---------- 量测 ---------- */
  function measure() {
    if (!cells.length) return;
    var first = cells[0];
    /* 临时清掉留白，量到单元格真实高度 */
    track.style.paddingTop = "0px";
    track.style.paddingBottom = "0px";
    var r = first.getBoundingClientRect();
    /* 用 offsetHeight 避免 transform(scale) 干扰真实尺寸 */
    geo.cellH = first.offsetHeight || r.height;
    geo.gap = parseFloat(getComputedStyle(track).rowGap || "9") || 9;
    geo.span = geo.cellH + geo.gap;
    geo.railH = rail.clientHeight;

    /* 上下各补 (容器高 - 单帧高)/2 的留白，让首尾帧也能被推到容器正中。
       没有这段留白，帧数多时行程会被压成 0，"黄框跟随"就完全失效。 */
    geo.pad = Math.max(0, (geo.railH - geo.cellH) / 2);
    track.style.paddingTop = geo.pad.toFixed(1) + "px";
    track.style.paddingBottom = geo.pad.toFixed(1) + "px";
  }

  /* ---------- 滚动驱动：纵向平移 + 暗到亮渐变 + 高亮跟随 ---------- */
  /* progress: 0（首屏）→ 1（末屏） */
  /* FALLOFF：亮度衰减半径（以「帧」为单位）。
     距离当前帧 d 帧以内的帧会依次变暗，d >= FALLOFF 之后统一最暗。
     8 帧时整条都能进视口，取 3 —— 当前帧最亮，两侧各 2~3 帧参与渐变，
     再往外的统一压到最暗，明暗层次才拉得开（22 帧时代用的是 5）。 */
  var FALLOFF = 3;

  function update(progress) {
    if (!cells.length || !geo.span) return;

    progress = Math.max(0, Math.min(1, progress));

    /* 把第 i 帧推到容器正中：上下已垫留白，所以 y = -i × span */
    var exact = progress * (cells.length - 1);
    var y = -exact * geo.span;
    var minY = -(cells.length - 1) * geo.span;
    if (y < minY) y = minY;
    if (y > 0) y = 0;

    track.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";

    /* 暗 → 亮：每帧的 --lit 按与当前位置的距离连续写入。
       这里不用 class 切换，因为要求的是「渐变」而不是「两档跳变」。 */
    for (var i = 0; i < cells.length; i++) {
      var d = Math.abs(i - exact);
      var lit = d >= FALLOFF ? 0 : 1 - d / FALLOFF;
      /* 平方一下让中心更"聚光"，边缘更快暗下去 */
      lit = lit * lit;
      cells[i].style.setProperty("--lit", lit.toFixed(3));
    }

    /* 当前帧的书签（用于 a11y 与动画触发） */
    var idx = Math.max(0, Math.min(cells.length - 1, Math.round(exact)));
    if (idx !== curIndex) {
      curIndex = idx;
      for (var k = 0; k < cells.length; k++) {
        cells[k].classList.toggle("is-current", k === curIndex);
      }
    }

    if (axisFill) axisFill.style.height = (progress * 100).toFixed(1) + "%";
  }

  function mount() {
    rail = document.querySelector(".js-frame-rail");
    track = document.querySelector(".js-frame-track");
    axisFill = document.querySelector(".js-frame-axis-fill");
    if (!rail || !track) return;
    /* 只在首页生效 */
    if (document.body.getAttribute("data-page") !== "home") {
      rail.style.display = "none";
      return;
    }
    if (mounted) return;
    mounted = true;

    build();
    /* 图片尺寸未知会导致量测偏差；另外海报是异步解码的，
       解码完会撑开高度，所以首批图加载完要重量一次。 */
    function remeasure() {
      measure();
      setProgressNow(curIndex <= 0 ? 0 : curIndex / Math.max(1, cells.length - 1));
    }

    measure();
    setProgressNow(0);

    var pending = 0;
    cells.forEach(function (c) {
      var img = c.querySelector("img");
      if (!img || img.complete) return;
      pending++;
      img.addEventListener("load", function () {
        if (--pending <= 0) remeasure();
      }, { once: true });
      img.addEventListener("error", function () {
        if (--pending <= 0) remeasure();
      }, { once: true });
    });
    setTimeout(remeasure, 900);

    window.addEventListener("resize", function () {
      measure();
      setProgressNow(curIndex <= 0 ? 0 : curIndex / Math.max(1, cells.length - 1));
    });
  }

  /* 暴露给 home.js 的滚动回调。
     滚动事件在一帧内可能触发多次（惯性滚动尤其明显），直接每次都跑 update()
     会对每个单元格重复写 --lit。这里合并到一次 rAF：
     一帧之内只认最后一次进度值，既省掉冗余写入，滑动也更跟手。 */
  var rafId = 0;
  var rafP = 0;
  function setProgress(p) {
    rafP = p;
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      update(rafP);
    });
  }
  /* 立刻生效（初始化 / resize 后需要同步定位，不能等下一帧） */
  function setProgressNow(p) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    update(p);
  }

  return {
    mount: mount,
    setProgress: setProgress,
    setProgressNow: setProgressNow,
    currentIndex: function () { return curIndex; },
    count: function () { return cells.length; }
  };
})();
