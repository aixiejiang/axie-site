/* =============================================================
   内容页渲染：团队列表 / 新闻列表 / 常见问题折叠
   ============================================================= */

(function () {
  var D = window.SL_DATA;
  if (!D) return;

  /* ---------- 团队 ---------- */
  var team = document.querySelector(".js-team-list");
  if (team && D.team) {
    team.innerHTML = D.team
      .map(function (t) {
        return (
          '<div class="team-row reveal">' +
            '<span class="team-name">' + t.name + "</span>" +
            '<span class="type-label text-fg-40">' + t.role + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  /* ---------- 新闻 ---------- */
  var newsRoot = document.querySelector(".js-news-list");
  if (newsRoot && D.news) {
    var limit = parseInt(newsRoot.getAttribute("data-limit") || "99", 10);
    newsRoot.innerHTML = D.news
      .slice(0, limit)
      .map(function (n) {
        return (
          '<a class="news-item reveal" href="news.html#' + n.slug + '">' +
            '<div class="news-date">' + n.date + "</div>" +
            '<h3 class="type-heading-md" style="margin-bottom:1.2rem">' + n.title + "</h3>" +
            '<p class="type-sm text-fg-75 max-w-70ch">' + n.excerpt + "</p>" +
          "</a>"
        );
      })
      .join("");
  }

  /* ---------- 折叠面板 ---------- */
  document.querySelectorAll(".js-accordion").forEach(function (acc) {
    acc.querySelectorAll(".accordion-item").forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        var sign = item.querySelector(".accordion-sign");
        if (sign) sign.textContent = open ? "–" : "+";
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    });
  });
})();
