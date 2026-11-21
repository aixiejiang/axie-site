/* =============================================================
   独立项目页（work.html?p=slug）
   复用 SLProjectView 的 contentHtml / posterOf，保证弹层与独立页
   是同一套结构与措辞；区别只在于这里是页面内滚动，不是浮层。

   为什么独立页面也要单独写一份播放逻辑：
     弹层的 <video> 生命周期由弹层自己管（打开/关闭即建即毁），
     而这里是常驻的，所以进度条、暂停、声音都要自己接一遍。
   ============================================================= */

(function () {
  var PV = window.SLProjectView;
  var D = window.SL_DATA;
  if (!PV || !D || !D.brand) return;

  var T = function (k, f) {
    return window.SLi18n ? window.SLi18n.t(k, f) : f || k;
  };

  var list = PV.list();
  if (!list.length) return;

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("p");
  var index = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].slug === slug) { index = i; break; }
  }
  var work = list[index];
  if (!work) return;

  var q = function (s) { return document.querySelector(s); };
  var video = q(".js-pv-video");
  var posterEl = q(".js-pv-poster");
  var badge = q(".js-pv-badge");
  var content = q(".js-proj-content");

  /* ---------- 内容 ---------- */
  document.title = work.title + " — AXiE";

  function renderContent() {
    content.innerHTML = PV.contentHtml(work, index);
    if (badge) badge.textContent = PV.i18nCategory(work.category);
  }
  renderContent();

  var poster = PV.posterOf(work);
  if (posterEl) posterEl.style.backgroundImage = poster ? 'url("' + poster + '")' : "none";

  /* 退出键（第四十四轮：用户要求「去除左上后退按钮，退出按钮在视频右上角，
     可以鼠标点击退出当前页面返回上一级」）：
       · 元素从页面左上角挪进播放器右上角（.proj-exit，见 work.html）；
       · 文案 后退 → **退出**（btn.exit），与弹层顶栏那枚同一个词 ——
         它是"离开这一页"，不是"退回品牌页"，所以口径改用退出；
       · href 见下面的 exitTarget()（第四十九轮起按来源页决定落点）；
       · 左键点击的行为也见下面：来源**明确**时直接跳落点，来源不明时才
         沿用原来那套 history.back() 优先（从哪来就回哪去 ——
         在"其他项目"里连跳了几支 → 回上一支，而不是一次跳回栏目页）。
         没有可用的同源上一页（直接打开链接 / 探针里 referrer 为空）时，
         就退回 href 的栏目页。

     ===== 第四十九轮（用户第一 / 二条）：退出键的**落点**按来源页分 =====
       用户原话：
         · 「轮播模式下方案例作品点进去…退出按钮，修改退出按钮返回路径为
           轮播模式不是网格模式」⇒ from=carousel → **brand.html?view=carousel**
         · 「（全部项目页）点进去…退出按钮，修改退出按钮返回路径为全部项目
           不是网格模式」⇒ from=works → **works.html**
       为什么改用 URL 上的 from 标记，而不是继续依赖 document.referrer：
         referrer 只能告诉你"上一页是哪个文件"，**说不出当时停在哪个档**
         （brand.html 上网格 / 轮播 / 列表三档是同一份 URL）。所以让入口
         自己在 URL 上留标记（list.js 的 openWorkPage 写 from=carousel、
         works-cats.js 的 cardMarkup 写 from=works），详情页只读这个标记。
         档位的还原落在 brand.html 自己身上：works.js 认 `?view=carousel`
         并把 tab 扳到轮播档（bfcache 恢复时也认，见那里的 pageshow）。 */
  /* 读 URL 上的 from 标记（"其他项目"就地切片时会保留它，见本文件下方
     url.searchParams.set("p", s) —— 只改 p、其它参数原样带着） */
  function fromParam() {
    try { return new URLSearchParams(window.location.search).get("from") || ""; } catch (e) { return ""; }
  }
  function exitTarget(from) {
    if (from === "carousel") return "brand.html?view=carousel";
    if (from === "works") return "works.html";
    return "brand.html";               /* 来源不明：退回栏目页默认档（网格） */
  }
  var back = q(".js-proj-back");
  var EXIT_KEY = "btn.exit", EXIT_FB = "Exit";
  if (back) {
    var FROM = fromParam();
    back.setAttribute("href", exitTarget(FROM));
    var bl = q(".js-proj-back-label");
    var bt = T(EXIT_KEY, EXIT_FB);
    if (bl) bl.textContent = bt;
    back.setAttribute("aria-label", bt);
    back.setAttribute("title", bt);
    back.addEventListener("click", function (e) {
      /* 只接管左键单击：中键 / Cmd+点击 / Ctrl+点击 交给浏览器默认行为 */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      /* 第四十九轮：来源明确（轮播 / 全部项目）时**直接跳落点**，不再走
         history.back()。back() 只会退回"上一支"（在"其他项目"里连跳几支之后
         更是会一级级往回退），而用户要的是"回到我进来的那个栏目页"。
         来源不明（老链接 / 直接打开）时才保留原来的 back 优先逻辑。 */
      if (FROM) {
        e.preventDefault();
        window.location.href = exitTarget(FROM);
        return;
      }
      var ref = "";
      try { ref = document.referrer || ""; } catch (err) { ref = ""; }
      var sameOrigin = !!ref && ref.indexOf(window.location.origin) === 0;
      if (sameOrigin && window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
      /* 否则不拦：<a href="brand.html"> 自己跳 */
    });
  }
  function paintBack() {
    if (!back) return;
    var label = T(EXIT_KEY, EXIT_FB);
    var bl = q(".js-proj-back-label");
    if (bl) bl.textContent = label;
    back.setAttribute("aria-label", label);
    back.setAttribute("title", label);
  }

  /* 「其他项目」就地切换，不重新加载整页 —— 观感更接近弹层 */
  content.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-pv-other");
    if (!btn) return;
    var s = btn.getAttribute("data-slug");
    if (!s) return;
    var url = new URL(window.location.href);
    url.searchParams.set("p", s);
    window.location.href = url.toString();
  });

  /* 横向：与弹层保持一致的剧照条滚轮行为（竖向滚轮→横向），
     到尽头就放手让整页继续滚。 */
  content.addEventListener("wheel", function (e) {
    var strip = e.target.closest ? e.target.closest(".js-pv-stills") : null;
    if (!strip) return;
    var max = strip.scrollWidth - strip.clientWidth;
    if (max <= 1) return;
    var amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!amount) return;
    if ((amount < 0 && strip.scrollLeft <= 0.5) || (amount > 0 && strip.scrollLeft >= max - 0.5)) return;
    e.preventDefault();
    var next = strip.scrollLeft + amount;
    strip.scrollLeft = next < 0 ? 0 : next > max ? max : next;
  }, { passive: false });

  /* ---------- 播放器 ---------- */
  var fill = q(".js-pv-scrub-fill");
  var timeEl = q(".js-pv-time");
  var scrub = q(".js-pv-scrub");
  var bigplay = q(".js-pv-bigplay");

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function paintIcons() {
    if (!window.SLicon) return;
    var playing = video && !video.paused;
    var ti = q(".js-pv-toggle-icon");
    if (ti) ti.innerHTML = window.SLicon(playing ? "pause" : "play");
    var bi = q(".js-pv-bigplay-icon");
    if (bi) bi.innerHTML = window.SLicon("play");
    var si = q(".js-pv-sound-icon");
    if (si) si.innerHTML = window.SLicon(video && video.muted ? "sound-off" : "sound-on");
    if (bigplay) bigplay.style.opacity = playing ? "0" : "1";
  }

  function togglePlay() {
    if (!video) return;
    if (video.paused) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.pause();
    }
  }

  if (bigplay) bigplay.addEventListener("click", togglePlay);
  var toggle = q(".js-pv-toggle");
  if (toggle) toggle.addEventListener("click", togglePlay);
  if (video) video.addEventListener("click", togglePlay);

  /* 声音：页面内点击即手势，直接带声起播 */
  video.muted = false;
  video.volume = 1;
  video.src = work.media.src;
  video.addEventListener("play", paintIcons);
  video.addEventListener("pause", paintIcons);
  video.addEventListener("loadedmetadata", paintIcons);

  var soundBtn = q(".js-pv-sound");
  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      video.volume = video.muted ? 0 : 1;
      paintIcons();
    });
  }

  /* 进度条 */
  var scrubbing = false;
  function seek(e) {
    var r = scrub.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    if (isFinite(video.duration) && video.duration > 0) {
      try { video.currentTime = ratio * video.duration; } catch (err) {}
    }
  }
  if (scrub) {
    scrub.addEventListener("pointerdown", function (e) {
      scrubbing = true;
      try { scrub.setPointerCapture(e.pointerId); } catch (err) {}
      seek(e);
    });
    scrub.addEventListener("pointermove", function (e) { if (scrubbing) seek(e); });
    scrub.addEventListener("pointerup", function () { scrubbing = false; });
    scrub.addEventListener("pointercancel", function () { scrubbing = false; });
  }

  video.addEventListener("timeupdate", function () {
    var d = video.duration;
    if (isFinite(d) && d > 0 && fill) {
      fill.style.width = Math.min(100, (video.currentTime / d) * 100).toFixed(2) + "%";
    }
    if (timeEl) timeEl.textContent = fmt(video.currentTime) + " / " + fmt(d);
  });

  /* 进入页面即尝试带声播放；被策略拦下就退回静音并显示大播放键 */
  var p = video.play();
  if (p && p.catch) {
    p.catch(function () {
      video.muted = true;
      paintIcons();
      var p2 = video.play();
      if (p2 && p2.catch) p2.catch(function () {});
    });
  }
  paintIcons();

  /* 换语言：整段内容重渲染 + 刷新类目与返回文案。
     只改 cat 文案是不够的 —— 「项目介绍 / 剧照 / 其他项目」的小标题和
     制作信息字段名都在 contentHtml 里。重渲后要把委托点击挂回，
     这里用的是 content 上的事件委托，所以不用重新绑定。 */
  if (window.SLi18n) {
    window.SLi18n.onChange(function () {
      renderContent();
      paintBack();
    });
  }
})();
