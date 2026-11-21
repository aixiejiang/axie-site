/* =============================================================
   中英文切换（SLi18n）
   设计要点：
   - 只在「界面文案」层面切换，不动作品名/客户名（那些是专有名词）
   - 加 <html data-lang="zh"> 后由 CSS + t() 共同生效
   - 选择存 localStorage["sl-lang"]，刷新后保持
   - 通过 [data-i18n] 属性声明式替换，动态生成的 DOM 用 t() 取值

   对外接口：
     SLi18n.lang()            当前语言
     SLi18n.t(key, fallback)  取词
     SLi18n.set(lang)         切换（会派发 sl:lang 事件）
     SLi18n.apply(root)       把 root 内 [data-i18n] 全部刷新
     SLi18n.onChange(fn)      订阅
   ============================================================= */

window.SLi18n = (function () {
  /* 默认中文：需求是「首页文字排版全部在左侧，全部是中文」。
     语言依然可切换（右上角中/EN），选择会记进 localStorage 并保持。 */
  var DEFAULT = "zh";

  /* 词条表：键 → { en, zh } */
  var DICT = {
    /* 导航 / 通用按钮 */
    "nav.work": { en: "Work", zh: "作品" },
    "nav.brand": { en: "Featured Works", zh: "精选作品" },
    /* 2026-09-27 改名：剧照→模特与演员、剧情→声音、Liquid Engine→常见问题、
       关于→关于我们；「动态」整条从导航里删除（nav.news 词条随之移除，
       老页面上万一还留着 data-i18n="nav.news" 会回落到键名，不会报错）。 */
    "nav.narrative": { en: "Sound", zh: "声音" },
    "nav.stills": { en: "Models & Actors", zh: "模特与演员" },
    "nav.faq": { en: "FAQ", zh: "常见问题" },
    "nav.about": { en: "About Us", zh: "关于我们" },
    "nav.contact": { en: "Contact", zh: "联系" },
    "nav.workIndex": { en: "Work index", zh: "作品索引" },
    "nav.primary": { en: "Primary", zh: "主导航" },

    "btn.getInTouch": { en: "Get In Touch", zh: "联系我们" },
    "btn.menu": { en: "Menu", zh: "菜单" },
    "btn.close": { en: "Close", zh: "关闭" },
    "btn.seeAllBrand": { en: "See All Brand Work", zh: "查看全部品牌作品" },
    "btn.watchProject": { en: "Watch Project", zh: "观看作品" },
    "btn.watchShowreel": { en: "Watch Showreel", zh: "观看样片" },
    "btn.backToTop": { en: "Back to top", zh: "回到顶部" },
    "btn.backToBrand": { en: "Back to Brand", zh: "返回品牌页" },

    /* 项目详情（弹层 / 独立页共用） */
    "project.category": { en: "Category", zh: "类目" },
    "project.year": { en: "Year", zh: "年份" },
    "project.director": { en: "Director", zh: "导演" },
    "project.agency": { en: "Agency", zh: "代理" },
    "project.format": { en: "Format", zh: "规格" },
    /* 「品牌广告项目介绍」小节标题（GRID / 轮播进入的详情页共用） */
    "project.about": { en: "The Brief", zh: "项目介绍" },
    "project.stills": { en: "Stills", zh: "剧照" },
    "project.others": { en: "Other Projects", zh: "其他项目" },
    "btn.watchFull": { en: "Watch Full Film", zh: "全屏观看" },
    "btn.exitFull": { en: "Exit", zh: "退出" },
    /* 详情页右上角的「后退」：用户口径就是后退，不要说成退出 */
    "btn.back": { en: "Back", zh: "后退" },
    /* 第四十四轮：独立项目页（work.html）的退出键 —— 用户要求
       「去除左上后退按钮，退出按钮在视频右上角」，所以它**不再叫后退**，
       文案统一到「退出 / Exit」，与弹层顶栏那枚（btn.exitFull）同一个词。 */
    "btn.exit": { en: "Exit", zh: "退出" },

    "sound.on": { en: "Sound On", zh: "声音开" },
    "sound.off": { en: "Sound Off", zh: "声音关" },
    "sound.turnOn": { en: "Turn sound on", zh: "打开声音" },
    "sound.turnOff": { en: "Turn sound off", zh: "关闭声音" },

    "lang.switch": { en: "Switch to 中文", zh: "Switch to English" },
    "lang.short": { en: "中", zh: "EN" },

    /* 首页 */
    "home.showreel": { en: "Showreel 2026", zh: "2026 样片" },
    "home.hero.title": { en: "We make worlds that move", zh: "我们创造会动的世界" },
    "home.hero.sub": {
      en: "A film-grade creative studio. Brand worlds and original stories, built end to end and shipped everywhere at once.",
      zh: "一间电影级创意工作室。从品牌世界到原创故事，全程自制，一次完成，全网投放。"
    },
    "home.newBusiness": { en: "New Business", zh: "商务合作" },
    "home.cta.title": { en: "Let's make the next one", zh: "下一支，一起做" },
    "home.frames": { en: "Frames", zh: "分镜" },
    "home.clickToPlay": { en: "Click to play", zh: "点击播放" },
    "home.scroll": { en: "Scroll", zh: "滚动" },

    /* 页脚 */
    "footer.navigate": { en: "Navigate", zh: "导航" },
    "footer.follow": { en: "Follow", zh: "关注" },
    "footer.contact": { en: "Contact", zh: "联系方式" },
    /* 页脚：「AXIE 的初心」四行。用 \n 断行，
       显示依赖 .site-footer [data-i18n="footer.tagline"] 的 white-space:pre-line。 */
    "footer.tagline": {
      en: "AXIE's original intention\nBring the cost of a TVC down\nMake the ideas good\nLet brands be seen, and even felt, by more people",
      zh: "AXIE的初心\n把TVC的成本降下来\n把创意做好\n让品牌被更多人看见，甚至被触动"
    },
    "footer.rights": { en: "All rights reserved.", zh: "版权所有。" },
    "footer.legal": { en: "Legal", zh: "法务" },
    "footer.privacy": { en: "Privacy", zh: "隐私" },

    "a11y.skip": { en: "Skip to content", zh: "跳到正文" },
    "a11y.home": { en: "home", zh: "首页" },
    "a11y.openMenu": { en: "Open menu", zh: "打开菜单" },

    /* 集合页 / 列表页 */
    "unit.projects": { en: "Projects", zh: "个项目" },
    "unit.frames": { en: "Frames", zh: "帧剧照" },
    "unit.works": { en: "Works", zh: "件作品" },
    "unit.years": { en: "yrs", zh: "岁" },
    "unit.play": { en: "Play", zh: "播放" },
    "unit.pause": { en: "Pause", zh: "暂停" },
    "unit.next": { en: "Next project", zh: "下一个项目" },
    "unit.view": { en: "View", zh: "视图" },
    "unit.grid": { en: "Grid", zh: "网格" },
    "unit.carousel": { en: "Carousel", zh: "轮播" },
    "unit.list": { en: "List", zh: "列表" },
    /* 第三十一轮：轮播视图下方的「查看项目」按钮 */
    "unit.viewProject": { en: "View Project", zh: "查看项目" },
    "unit.client": { en: "Client", zh: "客户" },
    "unit.year": { en: "Year", zh: "年份" },
    "unit.category": { en: "Category", zh: "类目" },
    "unit.collection": { en: "Collection", zh: "栏目" },
    "unit.allWork": { en: "All Work", zh: "全部作品" },
    "unit.selectedClients": { en: "Selected clients", zh: "合作客户" },
    "unit.talent": { en: "Talent", zh: "模特与演员" },

    /* 模特与演员 */
    "talent.title": { en: "Models & Actors", zh: "模特与演员" },
    "talent.intro": {
      en: "Pick the one right face for your brand. Open any profile for the full casting sheet and every film they appear in.",
      zh: "为你的品牌选一张对的脸，点击任意一位，可查看完整casting资料与ta参加过的全部影片。"
    },
    /* 第二十一轮：模特与演员页新增的「大字标题 + 一支 MV」
       第二十二轮：大字改成两行 —— 上面一行年份「2026」，下面一行「近期高人气演员」 */
    "talent.trendingKicker": { en: "TRENDING TALENT · 2026", zh: "TRENDING TALENT · 2026" },
    "talent.trendingYear": { en: "2026", zh: "2026" },
    "talent.trending": { en: "Actors In Demand", zh: "近期高人气演员" },
    /* 第二十三轮：MV 标题拆成「品牌名 + 后缀」两段，
       品牌名走纯白加粗，后缀保持同一套白但字重更轻（见 .mv-caption-title 的 CSS）。 */
    "talent.mvTitleBrand": { en: "Models & Actors", zh: "模特与演员" },
    "talent.mvTitleRest": { en: "MV · Magic Time", zh: "MV · Magic Time" },
    "talent.mvTitle": { en: "Models & Actors MV · Magic Time", zh: "模特与演员 MV · Magic Time" },
    "talent.mvNote": {
      en: "On loop · 1080p · sound follows the switch top-right",
      zh: "循环播放 · 1080p · 声音由右上角开关控制"
    },
    "talent.works": { en: "Filmography", zh: "参加作品" },
    "talent.height": { en: "Height", zh: "身高" },
    "talent.based": { en: "Based", zh: "常驻" },
    "talent.agency": { en: "Agency", zh: "经纪" },
    "talent.profile": { en: "Profile", zh: "人物介绍" },
    "talent.personality": { en: "Personality", zh: "性格" },
    "talent.style": { en: "Style", zh: "风格" },
    "talent.scrollHint": { en: "Scroll for filmography", zh: "向下滑动查看参加作品" },
    /* 第二十五轮：原来这里还有 talent.backToTalent / talent.back /
       talent.backToActors 三个「返回某某页」的词条，现在全站的后退按钮
       （项目页 / 全部数字演员页 / 演员详情页）统一用上面的 btn.back = 「后退」。
       理由是按钮走的是 history.back()，回的是「上一页」而不是写死的那一页，
       标签就不该写死具体页面名。 */
    "talent.credit": { en: "Appears in", zh: "出演于" },

    /* 第二十二轮：人物卡下方的两颗按钮 + 全部数字演员页 + 演员详情页新版式 */
    "talent.shuffle": { en: "Another batch", zh: "换一批" },
    "talent.viewAll": { en: "View all digital actors", zh: "查看全部数字演员" },
    "talent.batch": { en: "Cast", zh: "批次" },
    "talent.age": { en: "Age", zh: "年龄" },
    "talent.fit": { en: "Best for", zh: "适合" },
    /* 第二十五轮：新一代 15 位演员每人只给了一张图，没有多角度/多情绪素材，
      三联改成**同一张图的三档景别**（用户当天选定「同图裁三档近景」）。
       文案必须跟着改 —— 图是同一张脸、同一组灯位裁出来的，
       继续写「换角度，也换情绪」就是在说假话。
       （这里是**唯一**的 talent.moodTitle —— 上面第二十二轮那条旧的同名键已删，
       之前靠对象字面量「后者覆盖前者」才没出事，看着像能用其实是雷。） */
    "talent.moodTitle": { en: "One Face, Three Scales", zh: "同一张脸 · 三档景别" },
    "talent.moodNote": {
      en: "Same face, same set-up — from close-up to full length.",
      zh: "同一组灯位、同一张脸 —— 从近景到全身。"
    },
    "talent.mood1": { en: "Close-up", zh: "近景" },
    "talent.mood2": { en: "Half length", zh: "半身" },
    "talent.mood3": { en: "Full length", zh: "全身" },
    "talent.basics": { en: "Casting sheet", zh: "演员基本信息" },
    "talent.prevNext": { en: "Cast navigation", zh: "演员导航" },
    "actors.title": { en: "All Digital Actors", zh: "全部数字演员" },
    "actors.intro": {
      en: "Fifty-plus digital actors, faces and bodies built for brand work. Filter by type, open a profile for the casting sheet.",
      zh: "五十余位数字演员，总有一张脸与品牌气质相称。按类型筛选，点开任意一位查看完整资料。"
    },
    "actors.filter": { en: "Type", zh: "类型" },
    "actors.filterAll": { en: "All", zh: "全部" },
    /* 第三十六轮（用户第二条）：类型从「全部 / 模特 / 演员」改成
       性别 × 年龄段的四分法「全部 / 男性 / 女性 / 少年 / 中老年」。
       旧的 filterModel / filterActor 词条保留（其它页若引用不会落成键名）。 */
    "actors.filterMale": { en: "Male", zh: "男性" },
    "actors.filterFemale": { en: "Female", zh: "女性" },
    "actors.filterTeen": { en: "Youth", zh: "少年" },
    "actors.filterSenior": { en: "Mature", zh: "中老年" },
    "actors.filterModel": { en: "Models", zh: "模特" },
    "actors.filterActor": { en: "Actors", zh: "演员" },
    "actors.sheet": { en: "Casting sheet", zh: "演员资料" },
    "actors.empty": { en: "No one in this type yet.", zh: "这个类型下暂时没有人。" },
    "actors.count": { en: "actors", zh: "位演员" },
    "actors.backToList": { en: "Back", zh: "返回" },

    /* ---------- 声音页 · 案例作品（第三十七轮） ----------
       类型名（AI人物配音 / 洗脑 / 唱歌 / 配乐 / 克隆）不走这里，
       它们是**内容**，跟案例一起放在 data.js 的 narrative.soundTypes 里
       （每类都带 zh/en 两份），渲染时按当前语言取。这里只放界面词。 */
    "sound.kicker": { en: "Selected cases", zh: "案例作品" },
    "sound.title": { en: "Sound cases", zh: "声音案例" },
    "sound.intro": {
      en: "Five sound capabilities on one chain — from character dialogue to full score.",
      zh: "五种声音能力，从人物对白到整支配乐的一条链路。"
    },
    "sound.unit": { en: "cases", zh: "则案例" },
    "sound.all": { en: "All", zh: "全部" },
    "sound.preview": { en: "Preview", zh: "试听" },
    "sound.stop": { en: "Stop", zh: "停止" },
    "sound.empty": { en: "Nothing here yet.", zh: "这一类暂时还没有案例。" },

    /* ---------- 分类维度（演员详情页） ----------
       七个维度 + 每个维度下的标签。key 约定：dim.<维度> / tag.<维度>.<code>，
       code 与 data.js 里 SL_DATA.talent[].dims 的取值一一对应。 */
    "talent.dims": { en: "Casting dimensions", zh: "分类维度" },
    "talent.dimsNote": {
      en: "Seven axes we sort every face along — identity, profession, aura, look, build, personality, visual style.",
      zh: "七条轴线，把每一张脸讲清楚 —— 身份、职业、气质、外貌、体型、性格、视觉风格。"
    },
    "dim.identity": { en: "Character", zh: "人物身份" },
    "dim.job": { en: "Profession", zh: "职业类型" },
    "dim.vibe": { en: "Aura", zh: "人物气质" },
    "dim.look": { en: "Look", zh: "外貌风格" },
    "dim.body": { en: "Build", zh: "体型类型" },
    "dim.character": { en: "Personality", zh: "性格类型" },
    "dim.visual": { en: "Visual style", zh: "视觉风格" },

    "tag.identity.student": { en: "Student", zh: "学生" },
    "tag.identity.professional": { en: "Working professional", zh: "职场人" },
    "tag.identity.parent": { en: "Parent", zh: "父母" },
    "tag.identity.couple": { en: "Couple", zh: "情侣" },
    "tag.identity.spouse": { en: "Spouse", zh: "夫妻" },
    "tag.identity.friend": { en: "Friend", zh: "朋友" },
    "tag.identity.expert": { en: "Expert", zh: "专业人士" },
    "tag.identity.public": { en: "Public figure", zh: "公众人物" },

    "tag.job.executive": { en: "Executive", zh: "企业高管" },
    "tag.job.office": { en: "Office worker", zh: "白领" },
    "tag.job.doctor": { en: "Doctor", zh: "医生" },
    "tag.job.teacher": { en: "Teacher", zh: "教师" },
    "tag.job.designer": { en: "Designer", zh: "设计师" },
    "tag.job.engineer": { en: "Engineer", zh: "工程师" },
    "tag.job.athlete": { en: "Athlete", zh: "运动员" },
    "tag.job.artist": { en: "Artist", zh: "艺术家" },
    "tag.job.model": { en: "Model", zh: "模特" },
    "tag.job.host": { en: "Host", zh: "主播" },
    "tag.job.creator": { en: "Creator", zh: "创作者" },

    "tag.vibe.cool": { en: "Cool", zh: "清冷" },
    "tag.vibe.premium": { en: "Premium", zh: "高级" },
    "tag.vibe.intellectual": { en: "Intellectual", zh: "知性" },
    "tag.vibe.gentle": { en: "Gentle", zh: "温柔" },
    "tag.vibe.sunny": { en: "Sunny", zh: "阳光" },
    "tag.vibe.tough": { en: "Tough", zh: "硬朗" },
    "tag.vibe.mature": { en: "Mature", zh: "成熟" },
    "tag.vibe.elegant": { en: "Elegant", zh: "优雅" },
    "tag.vibe.mysterious": { en: "Mysterious", zh: "神秘" },
    "tag.vibe.rebel": { en: "Rebellious", zh: "叛逆" },
    "tag.vibe.relaxed": { en: "Relaxed", zh: "松弛" },

    "tag.look.fresh": { en: "Fresh-faced", zh: "清秀型" },
    "tag.look.sweet": { en: "Sweet", zh: "甜美型" },
    "tag.look.refined": { en: "Refined", zh: "精致型" },
    "tag.look.rugged": { en: "Rugged", zh: "硬朗型" },
    "tag.look.mature": { en: "Mature", zh: "成熟型" },
    "tag.look.youthful": { en: "Youthful", zh: "少年感" },
    "tag.look.natural": { en: "Natural, real-life", zh: "自然生活型" },
    "tag.look.edgy": { en: "Edgy", zh: "个性型" },

    "tag.body.slim": { en: "Slim", zh: "纤细" },
    "tag.body.balanced": { en: "Balanced", zh: "匀称" },
    "tag.body.athletic": { en: "Athletic", zh: "健美" },
    "tag.body.muscular": { en: "Muscular", zh: "肌肉型" },
    "tag.body.curvy": { en: "Curvy", zh: "丰满" },
    "tag.body.tall": { en: "Tall", zh: "高挑" },
    "tag.body.petite": { en: "Petite", zh: "娇小型" },
    "tag.body.sturdy": { en: "Sturdy", zh: "壮硕型" },

    "tag.character.outgoing": { en: "Outgoing", zh: "外向" },
    "tag.character.introverted": { en: "Introverted", zh: "内向" },
    "tag.character.rational": { en: "Rational", zh: "理性" },
    "tag.character.emotional": { en: "Emotional", zh: "感性" },
    "tag.character.lively": { en: "Lively", zh: "活泼" },
    "tag.character.calm": { en: "Composed", zh: "沉稳" },
    "tag.character.confident": { en: "Confident", zh: "自信" },
    "tag.character.humorous": { en: "Humorous", zh: "幽默" },
    "tag.character.reserved": { en: "Reserved", zh: "内敛" },
    "tag.character.assertive": { en: "Assertive", zh: "强势" },

    "tag.visual.commercial": { en: "Commercial", zh: "商业广告型" },
    "tag.visual.cinematic": { en: "Cinematic realism", zh: "电影写实型" },
    "tag.visual.editorial": { en: "Fashion editorial", zh: "时尚大片型" },
    "tag.visual.street": { en: "Street", zh: "街头潮流型" },
    "tag.visual.documentary": { en: "Documentary", zh: "生活纪实型" },
    "tag.visual.futuristic": { en: "Futuristic tech", zh: "未来科技型" },
    "cta.continueTo": { en: "Continue to", zh: "继续浏览" },
    "player.watch": { en: "Watch", zh: "观看" },
    "player.clickBackground": { en: "Click the film to watch full screen", zh: "点击画面全屏观看" }
  };

  /* localStorage 在 jsdom / 不透明来源下**读取属性本身**就会抛 SecurityError，
     所以必须把取值也包在 try 里，不能只包 setItem。 */
  function readStore(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }
  function writeStore(key, val) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, val);
    } catch (e) {}
  }

  var lang = DEFAULT;
  var saved = readStore("sl-lang");
  if (saved === "zh" || saved === "en") lang = saved;

  var listeners = [];

  function t(key, fallback) {
    var row = DICT[key];
    if (!row) return fallback !== undefined ? fallback : key;
    var v = row[lang];
    return v !== undefined ? v : row.en !== undefined ? row.en : fallback || key;
  }

  function apply(root) {
    root = root || document;
    var nodes = root.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(nodes, function (el) {
      var key = el.getAttribute("data-i18n");
      var attr = el.getAttribute("data-i18n-attr");
      var val = t(key, el.textContent);
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });
    /* 语言标签按钮自身 */
    var tags = root.querySelectorAll(".js-lang-tag");
    Array.prototype.forEach.call(tags, function (el) {
      el.textContent = t("lang.short");
    });
  }

  function set(next, silent) {
    lang = next === "zh" ? "zh" : "en";
    writeStore("sl-lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    apply(document);
    if (!silent) {
      listeners.forEach(function (fn) {
        try {
          fn(lang);
        } catch (e) {}
      });
    }
  }

  function onChange(fn) {
    listeners.push(fn);
    fn(lang);
  }

  /* 初始就把属性打上，CSS 才能按语言微调字距 */
  if (document.documentElement) {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
  }

  return {
    lang: function () { return lang; },
    t: t,
    set: set,
    apply: apply,
    onChange: onChange,
    dict: DICT
  };
})();
