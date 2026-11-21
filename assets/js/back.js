/* =============================================================
   内页「返回上一页」按钮 —— .js-page-back（第二十四轮新建）
   -------------------------------------------------------------
   用户报障：「查看全部数字演员」那一支里的返回按钮，点下去没有回到上一个页面。

   病根在判据上。原来 actors.js 与 talent.js 各有一份（代码还是重的）：
       var ref = document.referrer || "";
       if (ref.indexOf(location.origin) !== 0) return;   // ← 就是这里
       if (!/(stills|actors)\.html/.test(ref)) return;
       e.preventDefault();
       history.back();

   `document.referrer` 是**可以被抹掉**的：
     · 站点被放进 <iframe referrerpolicy="no-referrer">（编辑器预览、部分投放页就是这种）
     · 从 target="_blank" 打开、或浏览器/中间层设了 Referrer-Policy
     · 用户粘贴地址栏直接进来
   这些情况下 ref 是空串 → 上面两行直接 return → 浏览器按 <a href> 自己跳，
   去的是**写死的那一页**，而不是「上一页」。表现就是「点了没按预期返回」。

   新判据不再依赖 referrer：
     站内**真的决定往前跳**的那一步（app.js 的 leaveTo()）会把「当前路径」
     记进 sessionStorage["sl:from"]。sessionStorage 不会被任何 referrer 策略动到，
     而且是全站所有页面共用一处写入 —— 后退按钮在 actors / talent 两页上只负责读。

     读到的结果分三种：
       · 有记录  → 用户是从站内某页点进来的 → history.back()（回到上一页）
       · 无记录，但 referrer 同源（老浏览器/直接跳转的兜底）→ 也 history.back()
       · 都没有（新标签直接打开 / 书签 / 外链进来）→ 放行给 <a href> 兜底，
         免得把用户一把带出站

   history.back() 归还的是浏览器前进后退栈里的上一页 —— 这正是
   「鼠标点击后就会自动返回上一个页面」的字面含义。
   ============================================================= */

(function () {
  var KEY = "sl:from";

  /* ---------- 判定「是不是从站内过来的」 ---------- */
  function fromInside() {
    try { if (sessionStorage.getItem(KEY)) return true; } catch (e) {}
    var ref = document.referrer || "";
    return !!ref && ref.indexOf(location.origin) === 0;
  }

  /* ---------- 绑定 ---------- */
  function bind(a) {
    if (!a) return;

    if (!a.__slBackBound) {
      a.__slBackBound = true;
      a.addEventListener("click", function (e) {
        /* 新标签 / 新窗口意图交给浏览器 */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        /* 第四十九轮：带 `data-back-explicit` 的按钮**按写死的 href 跳**，
           既不用 history.back()，也不走 app.js 那层换页动画（preventDefault
           之后 app.js 的全局 click 会看到 defaultPrevented 并放行）。
           为什么要开这个口子：落点里带着"回到哪一档"这类状态信息 ——
           works.html 的后退键写的是 `brand.html?view=grid`（第四十七轮定下的
           口径：从分类页退出要回网格档）；而 history.back() 归还的是 bfcache
           里**离开时**那份旧状态（那会儿多半停在轮播档），档位会对不上。
           ⚠️ 只给"落点写死了状态"的那一枚加，其余页面（actors / talent）
           不变 —— 它们要的就是"回上一页"。 */
        if (a.hasAttribute("data-back-explicit")) {
          e.preventDefault();
          var to = a.getAttribute("href");
          if (to) window.location.href = to;
          return;
        }
        /* 这个标签页里没有上一页可退（刚打开的第一个页面）→ 交给 href 兜底 */
        if (window.history.length <= 1) return;
        /* 不是从站内过来的 → 也交给 href 兜底，别把用户带出站 */
        if (!fromInside()) return;
        e.preventDefault();
        history.back();
      });
    }

    /* 无障碍 / 悬停提示：原来只有一枚图标加一行小字，没有任何说明。
       文案会跟着语言切换变，所以每次 refresh 都重读一遍。 */
    var text = (a.textContent || "").replace(/\s+/g, " ").trim();
    if (text) {
      a.setAttribute("title", text);
      a.setAttribute("aria-label", text);
    }
  }

  function refresh(root) {
    Array.prototype.forEach.call(
      (root || document).querySelectorAll(".js-page-back"), bind);
  }

  /* fromInside 一并暴露出去：回归脚本要能单独验「判据本身」，
     不必每次都去模拟一次真实点击。 */
  window.SLBack = { refresh: refresh, fromInside: fromInside };
  refresh(document);

  /* 切语言后按钮的 title / aria-label 要跟着换 */
  if (window.SLi18n && window.SLi18n.onChange) {
    window.SLi18n.onChange(function () { refresh(document); });
  }
})();
