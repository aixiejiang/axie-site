/* =============================================================
   内页阅读导航 —— .ed-rail（右侧章节索引轨） / .ed-progress（顶部进度细线）
   （第二十九轮新建）
   -------------------------------------------------------------
   关于我们 / 常见问题这两页做完「奢侈品画册版式」之后还剩一个结构性问题：
   两页加起来十来个区块，靠一条发丝线和一枚 §01 分隔，**滚到中间就不知道
   自己在第几节了**。画册的解法不是加粗分隔线，而是给一条**页边索引轨**——
   像书口上的阶梯索引（thumb index），窄窄一条贴在右边缘，当前章节亮起来。

   两件东西，都是「人工手搓」那一档的小巧思，但都是纯装饰性导航：
     · .ed-rail      右侧竖排章节号，跟随滚动高亮，可点击跳转
     · .ed-progress  顶部 1px 荧光黄细线，按阅读进度增长

   三条实现上的硬约束（都是踩过或差点踩的）：
   1. **绝不能影响布局**。N-* 断言把 .page-col / .page-kicker / .about-body p /
      .about-card / .accordion-trigger / .process-step / h2 … 的 rect.left 全部
      拿出来跟左边距比对，容差只有「字号 × 0.06 + 1」像素。所以这两件东西
      一律 position: fixed —— 脱离文档流，谁也不会被推走。
   2. **不依赖 IntersectionObserver**。site/smoke.js 用 jsdom 跑页面，并且把
      IntersectionObserver mock 成了「observe 时立刻回报 isIntersecting:true」
      （见 smoke.js 的 beforeParse）。用它判当前章节，在冒烟环境里会得到
      「所有章节同时高亮」这种假结果。这里改成 scroll 事件 + getBoundingClientRect
      自己算 —— jsdom 里不滚就不会触发，零副作用。
   3. **脚本挂错页面也不能出事**。选择器是 `#main .ed-sec[id]`，全站只有
      这两个内页有 .ed-sec；其它页面即使误挂进来也直接 return，什么都不建。

   降级：requestAnimationFrame / scrollTo({behavior}) 都做了兜底，
   老浏览器顶多是高亮不刷新、跳转是硬跳，不会报错。
   ============================================================= */

(function () {
  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function pad2(n) { return ("0" + n).slice(-2); }

  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* 让出顶部 header 的高度，跳转后章节头不该被压在 header 底下 */
  var HEADER_OFFSET = 96;

  var secs = [];
  var items = [];
  var fill = null;

  function build() {
    secs = qa("#main .ed-sec[id]");
    if (!secs.length) return false;

    /* ---------- 右侧章节索引轨 ---------- */
    var rail = document.createElement("nav");
    rail.className = "ed-rail";
    rail.setAttribute("aria-label", "章节索引");

    secs.forEach(function (sec, i) {
      /* 章节号直接读区块里的 .pk-no（形如「§01」），只留数字。
         读不到就按下标兜底 —— rail 是装饰，不该因为少一个编号就不出现。 */
      var no = ((q(".pk-no", sec) || {}).textContent || "").replace(/[^0-9]/g, "");
      if (!no) no = pad2(i + 1);

      var a = document.createElement("a");
      a.className = "ed-rail-item";
      a.href = "#" + sec.id;
      a.setAttribute("data-no", no);
      a.textContent = no;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var top = sec.getBoundingClientRect().top +
                  (window.pageYOffset || document.documentElement.scrollTop || 0) -
                  HEADER_OFFSET;
        if (top < 0) top = 0;
        try { window.scrollTo({ top: top, behavior: "smooth" }); }
        catch (err) { window.scrollTo(0, top); }
        sync();
      });
      rail.appendChild(a);
      items.push(a);
    });
    document.body.appendChild(rail);

    /* ---------- 顶部进度细线 ---------- */
    var bar = document.createElement("div");
    bar.className = "ed-progress";
    bar.setAttribute("aria-hidden", "true");
    fill = document.createElement("span");
    bar.appendChild(fill);
    document.body.appendChild(bar);

    return true;
  }

  /* ---------- 当前章节：取「视口 35% 线以上」的最后一个区块 ----------
     为什么是 35% 而不是 0：区块留白有 120px，章节头在区块最顶上，
     若按视口顶线判，读者看到标题时它还没过线，高亮会慢半拍。 */
  function sync() {
    if (!items.length) return;
    var vh = window.innerHeight || 0;
    var line = vh * 0.35;
    var cur = 0;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top <= line) cur = i;
    }
    for (var j = 0; j < items.length; j++) {
      var on = j === cur;
      if (on) items[j].classList.add("is-current");
      else items[j].classList.remove("is-current");
      items[j].setAttribute("aria-current", on ? "true" : "false");
    }
    if (fill) {
      var docH = Math.max(
        (document.body && document.body.scrollHeight) || 0,
        (document.documentElement && document.documentElement.scrollHeight) || 0);
      var max = docH - vh;
      var y = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0;
      var p = max > 0 ? y / max : 0;
      if (p < 0) p = 0; if (p > 1) p = 1;
      /* 用 scaleX 而不是改 width —— 进度每帧都在变，transform 不触发重排 */
      fill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () { ticking = false; sync(); });
  }

  if (build()) {
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* 暴露出去：回归脚本要能单独验「高亮算得对不对」，不必真去滚页面。 */
  window.SLFolio = {
    sync: sync,
    sectionCount: secs.length,
    currentIndex: function () {
      for (var i = 0; i < items.length; i++) {
        if (items[i].classList.contains("is-current")) return i;
      }
      return -1;
    }
  };
})();
