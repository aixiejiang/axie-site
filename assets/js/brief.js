/* =============================================================
   第二十一轮：常见问题页（liquid-engine.html）右下角那张表单
   —— 点「生成项目简报」把填的内容拼成一份简报，显示在按钮下方。

   为什么单独一个文件：这是整站唯一一处"表单 + 即时产出"的交互，
   塞进 content.js 会让那个通用文件开始关心具体页面。

   没有后端，产出就是一段排好版的纯文本 + 一个 mailto 链接地址；
   用户可以直接复制去发邮件。
   ============================================================= */
(function () {
  var form = document.querySelector(".js-brief-form");
  if (!form) return;
  var out = form.querySelector(".js-brief-out");
  var make = form.querySelector(".js-brief-make");
  if (!out || !make) return;

  function val(id) {
    var el = form.querySelector("#" + id);
    return el ? (el.value || "").trim() : "";
  }

  function build() {
    var name = val("b-name") || "（未填写称呼）";
    var email = val("b-email") || "（未填写邮箱）";
    var type = val("b-type");
    var budget = val("b-budget");
    var idea = val("b-idea");

    if (idea.length < 10) {
      out.textContent = "还差一点点 —— 「讲讲你的想法」至少写 10 个字，我们才知道该怎么接话。（当前 " + idea.length + " 字）";
      return;
    }

    var lines = [
      "AXIE 项目简报 / PROJECT BRIEF",
      "────────────────────────",
      "称呼 / NAME      " + name,
      "邮箱 / EMAIL     " + email,
      "类型 / TYPE      " + type,
      "预算 / BUDGET    " + budget,
      "",
      "想法 / IDEA",
      idea,
      "",
      "下一步：把这封简报发到 xiewenshengx@gmail.com，",
      "我们会在两个工作日内回复。"
    ];
    out.textContent = lines.join("\n");
  }

  make.addEventListener("click", function (e) {
    e.preventDefault();
    build();
    if (out.textContent) out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* 回车不要触发表单提交（onsubmit 已经 return false，但 textarea 里
     按回车仍可能冒泡到某些浏览器默认行为，这里显式拦一下） */
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") e.preventDefault();
  });
})();
