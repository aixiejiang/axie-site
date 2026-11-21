/* =============================================================
   站点内容数据层
   替换内容时只改这个文件 + HTML 中的文案即可
   - media.kind = "video" | "image"：真实素材（assets/media/ 下）
   - 无 media 的条目回落到程序化影像（tone 见 scene.js PALETTES）
   ============================================================= */

window.SL_DATA = {
  brand: {
    /* 2026-09-26：页头不再放大号「品牌」标题，改成「精选作品」大字 + 两行中文定位语。
       intro / intro2 分别对应那两行，两行都走 i18n 表（见文件末尾 collections.brand）。 */
    label: "精选作品",
    title: "精选作品",
    /* 两行定位语：↑粗体标题 + ↓细体正文，逗号处断行 */
    intro:
      "AXIE是一家创意视频制作公司，",
    intro2:
      "把创意做好 让品牌被更多人看见，甚至被触动",
    /* 22 支作品 → 去重后 15 支：v16–v22 与 v09–v15 是同一批素材的字节副本
       （tools/add_videos.py 第二轮导入时重复落地），已连同文件一并删除。
       去重后每个 slug 对应唯一一支视频，GRID / 轮播 / 单帧画廊数量天然一致。
       第五十一轮：FMAI 精选视频案例 50 支并入（v28–v77），15 → 65 支；
       第五十二轮：FMAI 新增 12 支（v78–v89），65 → 77 支；
       中文类目映射见 assets/js/works-cats.js 的 WORK_CAT。 */
    works: [
      { slug: "tylenol-jp", client: "JNTL Consumer Health", title: "Tylenol", category: "Brand Film", year: "2025", tone: 5, media: { kind: "video", src: "assets/media/videos/v01.mp4", poster: "assets/media/posters/v01.jpg" }, blurb: "A quiet, human film for Tylenol Japan — care rendered in soft light and patient pacing.", credits: { director: "Studio In-House", agency: "JNTL Tokyo", format: "16:9 / 60s" } },
      { slug: "wissen-acid", client: "Wissen", title: "For Your Stomach", category: "Campaign", year: "2025", tone: 2, media: { kind: "video", src: "assets/media/videos/v02.mp4", poster: "assets/media/posters/v02.jpg" }, blurb: "Wissen x Oh Na-ra. A stomach-health project told with warmth, humor and a very likeable lead.", credits: { director: "Studio In-House", agency: "Wissen", format: "16:9 / 45s" } },
      { slug: "andai-driver", client: "An Da Jia", title: "Half A Dozen", category: "TVC", year: "2024", tone: 1, media: { kind: "video", src: "assets/media/videos/v03.mp4", poster: "assets/media/posters/v03.jpg" }, blurb: "A magnetic, earworm-driven spot for the designated-driver service — built for repeat exposure.", credits: { director: "Studio In-House", agency: "An Da Jia", format: "16:9 / 30s" } },
      { slug: "guilin-tvc", client: "Guilin Xiguashuang", title: "Clear Throat", category: "TVC", year: "2024", tone: 4, media: { kind: "video", src: "assets/media/videos/v04.mp4", poster: "assets/media/posters/v04.jpg" }, blurb: "Classic product TVC for Guilin Watermelon Frost lozenges — crisp, clinical, confident.", credits: { director: "Studio In-House", agency: "Guilin", format: "16:9 / 30s" } },
      { slug: "kuaike-elevator", client: "Kuaike", title: "Happy Again", category: "TVC", year: "2024", tone: 0, media: { kind: "video", src: "assets/media/videos/v05.mp4", poster: "assets/media/posters/v05.jpg" }, blurb: "An elevator-media spot engineered for the six-second glance — one joke, one pack shot, one hook.", credits: { director: "Studio In-House", agency: "Kuaike", format: "16:9 / 15s" } },
      { slug: "guilin-spray", client: "Guilin Xiguashuang", title: "Spray Spray Spray", category: "Social Film", year: "2024", tone: 3, media: { kind: "video", src: "assets/media/videos/v06.mp4", poster: "assets/media/posters/v06.jpg" }, blurb: "Repetition as comedy. A social-first cut that turns the product name into the punchline.", credits: { director: "Studio In-House", agency: "Guilin", format: "9:16 / 20s" } },
      { slug: "video-execution", client: "Studio Reel", title: "Video Execution", category: "Reel", year: "2024", tone: 5, media: { kind: "video", src: "assets/media/videos/v07.mp4", poster: "assets/media/posters/v07.jpg" }, blurb: "A craft reel — execution studies collected from across the studio's recent output.", credits: { director: "Studio In-House", agency: "—", format: "16:9 / 90s" } },
      { slug: "tmall-618", client: "Tmall 618", title: "Bu Bu Bu", category: "Campaign", year: "2024", tone: 1, media: { kind: "video", src: "assets/media/videos/v08.mp4", poster: "assets/media/posters/v08.jpg" }, blurb: "A festival-mechanics anthem for Tmall 618 — rhythm, repetition and a hook you can't unhear.", credits: { director: "Studio In-House", agency: "Tmall", format: "16:9 / 30s" } },
      { slug: "dior-glitter", client: "DIOR", title: "Glitter", category: "Fashion Film", year: "2023", tone: 3, media: { kind: "video", src: "assets/media/videos/v09.mp4", poster: "assets/media/posters/v09.jpg" }, blurb: "Light as material. A beauty film where glitter behaves like liquid metal under studio strobes.", credits: { director: "Studio In-House", agency: "DIOR", format: "16:9 / 60s" } },
      { slug: "lillians-magic", client: "Lillian", title: "Magic Time", category: "Brand Film", year: "2023", tone: 2, media: { kind: "video", src: "assets/media/videos/v10.mp4", poster: "assets/media/posters/v10.jpg" }, blurb: "A phone-and-digital product film built around one impossible continuous moment.", credits: { director: "Studio In-House", agency: "Lillian", format: "16:9 / 45s" } },
      { slug: "porsche-wild-force", client: "Porsche", title: "Wild Force", category: "Brand Film", year: "2023", tone: 0, media: { kind: "video", src: "assets/media/videos/v11.mp4", poster: "assets/media/posters/v11.jpg" }, blurb: "Machine vs. terrain. A launch film that treats the car as an animal in its own habitat.", credits: { director: "Studio In-House", agency: "Porsche", format: "16:9 / 60s" } },
      { slug: "lenovo-yoga", client: "Lenovo", title: "YOGA Air X", category: "Campaign", year: "2023", tone: 5, media: { kind: "video", src: "assets/media/videos/v12.mp4", poster: "assets/media/posters/v12.jpg" }, blurb: "Lenovo x He Ruixian. Looks and horsepower, held in the same frame without apology.", credits: { director: "Studio In-House", agency: "Lenovo", format: "16:9 / 45s" } },
      { slug: "wot-blitz", client: "World of Tanks Blitz", title: "Familiars", category: "Game Trailer", year: "2023", tone: 3, media: { kind: "video", src: "assets/media/videos/v13.mp4", poster: "assets/media/posters/v13.jpg" }, blurb: "WoT Blitz x deadmau5. Steel, sound design and a familiar that shouldn't work — but does.", credits: { director: "Studio In-House", agency: "Wargaming", format: "16:9 / 90s" } },
      { slug: "giant-rooster", client: "AIGC Brand Lab", title: "The Giant Rooster", category: "AIGC Film", year: "2024", tone: 4, media: { kind: "video", src: "assets/media/videos/v14.mp4", poster: "assets/media/posters/v14.jpg" }, blurb: "What do you do when a two-story rooster blocks the road? An AIGC brand film with a straight face.", credits: { director: "AIGC Unit", agency: "AIGC Brand Lab", format: "16:9 / 45s" } },
      { slug: "puma-neymar", client: "PUMA", title: "Crazy", category: "Campaign", year: "2023", tone: 2, media: { kind: "video", src: "assets/media/videos/v15.mp4", poster: "assets/media/posters/v15.jpg" }, blurb: "Neymar for PUMA. A sports spot that lets the madness of the skill carry the whole narrative.", credits: { director: "Studio In-House", agency: "PUMA", format: "16:9 / 60s" } },
/* ---- 第五十一轮：FMAI 精选视频案例 50 支（v28–v77），中文客户名 + 口标语标题 ---- */
{ slug: "fenzhong-alipay", client: "分众传媒", title: "碰一下就发！", category: "Campaign", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v28.mp4", poster: "assets/media/posters/v28.jpg" }, blurb: "分众传媒 × 支付宝「碰一下」联合传播：福利碰一下就到手。", credits: { director: "Studio In-House", agency: "分众传媒", format: "16:9 / 22s" } },
      { slug: "jiangzhong-appetite", client: "江中制药", title: "胃口好，吃饭香", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v29.mp4", poster: "assets/media/posters/v29.jpg" }, blurb: "开胃场景一镜到底，把「胃口好，吃饭香」唱进生活。", credits: { director: "Studio In-House", agency: "江中制药", format: "16:9 / 15s" } },
      { slug: "yiyang-weirdo", client: "宜养", title: "不懂的人，说它怪", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v30.mp4", poster: "assets/media/posters/v30.jpg" }, blurb: "反差设定开场：不懂的人说它怪，懂的人已经复购。", credits: { director: "Studio In-House", agency: "宜养", format: "16:9 / 18s" } },
      { slug: "junzai-same-taste", client: "君仔", title: "还是那个味儿", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v31.mp4", poster: "assets/media/posters/v31.jpg" }, blurb: "老味道的情怀牌：还是那个君仔，还是那个味儿。", credits: { director: "Studio In-House", agency: "君仔", format: "16:9 / 19s" } },
      { slug: "sichuan-travel", client: "四川文旅", title: "啥子是四川？", category: "Campaign", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v32.mp4", poster: "assets/media/posters/v32.jpg" }, blurb: "一句四川话提问，把全川风物串成一支文旅答卷。", credits: { director: "Studio In-House", agency: "四川文旅", format: "16:9 / 16s" } },
      { slug: "jiangzhong-mom", client: "江中制药", title: "妈妈更放心", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v33.mp4", poster: "assets/media/posters/v33.jpg" }, blurb: "从妈妈视角讲安全感，药品广告拍出了日常温度。", credits: { director: "Studio In-House", agency: "江中制药", format: "16:9 / 15s" } },
      { slug: "fenzhong-lead", client: "分众传媒", title: "马上投分众", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v34.mp4", poster: "assets/media/posters/v34.jpg" }, blurb: "电梯媒体的六秒说服：品牌要领先，马上投分众。", credits: { director: "Studio In-House", agency: "分众传媒", format: "16:9 / 30s" } },
      { slug: "xingang-renovate", client: "新港集团", title: "装完想马上住？", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v35.mp4", poster: "assets/media/posters/v35.jpg" }, blurb: "旧房改造前后对比，「装完想马上住」的冲动一秒建立。", credits: { director: "Studio In-House", agency: "新港集团", format: "16:9 / 22s" } },
      { slug: "cocacola-tea", client: "可口可乐", title: "和茶一起呼吸吧", category: "Campaign", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v36.mp4", poster: "assets/media/posters/v36.jpg" }, blurb: "可口可乐茶饮线：和茶一起呼吸的轻盈感。", credits: { director: "Studio In-House", agency: "可口可乐", format: "16:9 / 15s" } },
      { slug: "bioderma-family", client: "贝德玛", title: "从宝宝到全家", category: "Brand Film", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v37.mp4", poster: "assets/media/posters/v37.jpg" }, blurb: "贝德玛全家护肤叙事：从宝宝的第一瓶到全家共用。", credits: { director: "Studio In-House", agency: "贝德玛", format: "16:9 / 37s" } },
      { slug: "meihao-crispy", client: "美好小酥肉", title: "就吃美好小酥肉", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v38.mp4", poster: "assets/media/posters/v38.jpg" }, blurb: "馋字四连的洗脑节奏，小酥肉的馋被拍成了肌肉记忆。", credits: { director: "Studio In-House", agency: "美好小酥肉", format: "16:9 / 16s" } },
      { slug: "bolong-steady", client: "暴龙眼睛", title: "戴的稳，才有效", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v39.mp4", poster: "assets/media/posters/v39.jpg" }, blurb: "稳字当头的功能诉求：戴得稳，才有效。", credits: { director: "Studio In-House", agency: "暴龙眼睛", format: "16:9 / 15s" } },
      { slug: "bytedance-pricey", client: "字节跳动", title: "贵的，才是省钱的", category: "Campaign", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v40.mp4", poster: "assets/media/posters/v40.jpg" }, blurb: "为「贵」正名：贵的，才是省钱的。", credits: { director: "Studio In-House", agency: "字节跳动", format: "16:9 / 16s" } },
      { slug: "sensetime-raccoon", client: "商汤科技", title: "先交给商汤小浣熊", category: "Campaign", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v41.mp4", poster: "assets/media/posters/v41.jpg" }, blurb: "商汤小浣熊接管日常工作，AI 助手的产品化叙事。", credits: { director: "Studio In-House", agency: "商汤科技", format: "16:9 / 17s" } },
      { slug: "xiaohuya-lemon", client: "小胡鸭", title: "柠檬解腻，酸辣过瘾", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v42.mp4", poster: "assets/media/posters/v42.jpg" }, blurb: "柠檬解腻、酸辣过瘾，口味卖点直给。", credits: { director: "Studio In-House", agency: "小胡鸭", format: "16:9 / 16s" } },
      { slug: "swisse-calcium", client: "斯维诗", title: "钙，你真的吃对了吗？", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v43.mp4", poster: "assets/media/posters/v43.jpg" }, blurb: "斯维诗钙片科普向：钙，你真的吃对了吗？", credits: { director: "Studio In-House", agency: "斯维诗", format: "16:9 / 15s" } },
      { slug: "swisse-vitality", client: "斯维诗", title: "溢出满屏的生命力", category: "Campaign", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v44.mp4", poster: "assets/media/posters/v44.jpg" }, blurb: "满屏生命力，斯维诗的年轻化视觉表达。", credits: { director: "Studio In-House", agency: "斯维诗", format: "16:9 / 18s" } },
      { slug: "baidu-onephrase", client: "百度", title: "一句话，做应用", category: "Campaign", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v45.mp4", poster: "assets/media/posters/v45.jpg" }, blurb: "一句话做应用：百度 AI 开发平台的极简演示。", credits: { director: "Studio In-House", agency: "百度", format: "16:9 / 16s" } },
      { slug: "g7-coffee", client: "G7 Coffee", title: "越南国民级咖啡", category: "Brand Film", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v46.mp4", poster: "assets/media/posters/v46.jpg" }, blurb: "越南国民级咖啡的品牌背书，一支地道风味片。", credits: { director: "Studio In-House", agency: "G7 Coffee", format: "16:9 / 21s" } },
      { slug: "xiangzhipai-addictive", client: "香之派", title: "香之派，好上头", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v47.mp4", poster: "assets/media/posters/v47.jpg" }, blurb: "好上头的零食律动，香之派自带 BGM。", credits: { director: "Studio In-House", agency: "香之派", format: "16:9 / 16s" } },
      { slug: "lulu-restaurant", client: "承德露露", title: "上饭店，下馆子，喝露露", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v48.mp4", poster: "assets/media/posters/v48.jpg" }, blurb: "上饭店下馆子喝露露，餐桌场景绑定记忆点。", credits: { director: "Studio In-House", agency: "承德露露", format: "16:9 / 15s" } },
      { slug: "pizzahut-thin", client: "必胜客", title: "薄薄薄薄，薄底料更多", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v49.mp4", poster: "assets/media/posters/v49.jpg" }, blurb: "薄字四连击，必胜客薄底披萨的产品卖点片。", credits: { director: "Studio In-House", agency: "必胜客", format: "16:9 / 21s" } },
      { slug: "lanshi-petfood", client: "蓝氏", title: "营养更健康", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v50.mp4", poster: "assets/media/posters/v50.jpg" }, blurb: "蓝氏宠物粮的营养主张，铲屎官的放心之选。", credits: { director: "Studio In-House", agency: "蓝氏", format: "16:9 / 16s" } },
      { slug: "jianbingdao-griddle", client: "煎饼道", title: "饼软弹，肉现烤", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v51.mp4", poster: "assets/media/posters/v51.jpg" }, blurb: "饼软弹、肉现烤：现制现售的口感证据链。", credits: { director: "Studio In-House", agency: "煎饼道", format: "16:9 / 22s" } },
      { slug: "renlehuanluo-snail", client: "人类欢乐", title: "魔鬼辣螺蛳粉，辣爽啦", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v52.mp4", poster: "assets/media/posters/v52.jpg" }, blurb: "魔鬼辣螺蛳粉的辣爽体验，爽感拉满。", credits: { director: "Studio In-House", agency: "人类欢乐", format: "16:9 / 18s" } },
      { slug: "jianchun-tummy", client: "简醇", title: "帮你肚子做运动", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v53.mp4", poster: "assets/media/posters/v53.jpg" }, blurb: "帮你肚子做运动：简醇的功能表达轻松化。", credits: { director: "Studio In-House", agency: "简醇", format: "16:9 / 20s" } },
      { slug: "banbu-panda", client: "斑布", title: "熊猫最爱的主食", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v54.mp4", poster: "assets/media/posters/v54.jpg" }, blurb: "熊猫最爱的主食：斑布把竹纤维讲成了萌点。", credits: { director: "Studio In-House", agency: "斑布", format: "16:9 / 24s" } },
      { slug: "qiandaxia-highland", client: "黔大侠", title: "高原山猪更健康", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v55.mp4", poster: "assets/media/posters/v55.jpg" }, blurb: "高原山猪更健康：产地背书 + 品质诉求。", credits: { director: "Studio In-House", agency: "黔大侠", format: "16:9 / 16s" } },
      { slug: "manyanshuning-throat", client: "慢咽舒宁", title: "专业治疗，慢性咽炎", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v56.mp4", poster: "assets/media/posters/v56.jpg" }, blurb: "专业治疗慢性咽炎：症状共鸣开场，疗效收尾。", credits: { director: "Studio In-House", agency: "慢咽舒宁", format: "16:9 / 15s" } },
      { slug: "yuebaizhiji-collagen", client: "悦白之几", title: "品智胶原，美得自然", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v57.mp4", poster: "assets/media/posters/v57.jpg" }, blurb: "品智胶原，美得自然：轻医美质感的美妆叙事。", credits: { director: "Studio In-House", agency: "悦白之几", format: "16:9 / 1:12s" } },
      { slug: "xiaodubao-chat", client: "筱嘟宝", title: "不仅好看还能聊", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v58.mp4", poster: "assets/media/posters/v58.jpg" }, blurb: "不仅好看还能聊：筱嘟宝的陪伴机器人第一印象。", credits: { director: "Studio In-House", agency: "筱嘟宝", format: "16:9 / 16s" } },
      { slug: "xiaodubao-companion", client: "筱嘟宝", title: "懂你的AI陪伴机器人", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v59.mp4", poster: "assets/media/posters/v59.jpg" }, blurb: "懂你的 AI 陪伴机器人：情绪价值场景化。", credits: { director: "Studio In-House", agency: "筱嘟宝", format: "16:9 / 16s" } },
      { slug: "songyan-bumibumi", client: "松延动力", title: "布米布米真神奇", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v60.mp4", poster: "assets/media/posters/v60.jpg" }, blurb: "布米布米真神奇：人形机器人的萌系亮相。", credits: { director: "Studio In-House", agency: "松延动力", format: "16:9 / 16s" } },
      { slug: "bytedance-office", client: "字节跳动", title: "精英办公都在用", category: "Campaign", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v61.mp4", poster: "assets/media/posters/v61.jpg" }, blurb: "精英办公都在用：字节系 toB 产品的人群定位。", credits: { director: "Studio In-House", agency: "字节跳动", format: "16:9 / 17s" } },
      { slug: "songyan-iamhere", client: "松延动力", title: "布米布米，我在", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v62.mp4", poster: "assets/media/posters/v62.jpg" }, blurb: "布米布米，我在！：唤醒交互的响应演示。", credits: { director: "Studio In-House", agency: "松延动力", format: "16:9 / 17s" } },
      { slug: "bioderma-matte", client: "贝德玛", title: "一抹哑光，控油8小时", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v63.mp4", poster: "assets/media/posters/v63.jpg" }, blurb: "一抹哑光控油 8 小时：贝德玛功效型卖点直给。", credits: { director: "Studio In-House", agency: "贝德玛", format: "16:9 / 16s" } },
      { slug: "hkjc-7days", client: "香港赛马会", title: "还有7天！", category: "Campaign", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v64.mp4", poster: "assets/media/posters/v64.jpg" }, blurb: "距离美加墨开赛还有 7 天：赛事倒计时悬念营销。", credits: { director: "Studio In-House", agency: "香港赛马会", format: "16:9 / 16s" } },
      { slug: "hkjc-report", client: "香港赛马会", title: "美加墨战报", category: "Campaign", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v65.mp4", poster: "assets/media/posters/v65.jpg" }, blurb: "美加墨战报：赛果快讯式的体育内容营销。", credits: { director: "Studio In-House", agency: "香港赛马会", format: "16:9 / 16s" } },
      { slug: "baidu-quit", client: "百度", title: "烂活不干了", category: "Campaign", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v66.mp4", poster: "assets/media/posters/v66.jpg" }, blurb: "不干了烂活不干了：百度 AI 的打工人情绪共鸣。", credits: { director: "Studio In-House", agency: "百度", format: "16:9 / 17s" } },
      { slug: "baidu-boss", client: "百度", title: "直接交付老板的AI", category: "Campaign", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v67.mp4", poster: "assets/media/posters/v67.jpg" }, blurb: "直接交付老板的 AI：成果导向的效率叙事。", credits: { director: "Studio In-House", agency: "百度", format: "16:9 / 15s" } },
      { slug: "huangshi-voice", client: "黄氏响声丸", title: "520为爱发声", category: "Campaign", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v68.mp4", poster: "assets/media/posters/v68.jpg" }, blurb: "520 为爱发声：节点营销 + 情感向表达。", credits: { director: "Studio In-House", agency: "黄氏响声丸", format: "16:9 / 16s" } },
      { slug: "shuimima-sunscreen", client: "水密码", title: "防晒，养肤，就这一瓶", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v69.mp4", poster: "assets/media/posters/v69.jpg" }, blurb: "防晒养肤二合一，一瓶搞定的夏日主张。", credits: { director: "Studio In-House", agency: "水密码", format: "16:9 / 17s" } },
      { slug: "swisse-protein", client: "斯维诗", title: "好吸收才有效", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v70.mp4", poster: "assets/media/posters/v70.jpg" }, blurb: "蛋白粉好吸收才有效：功效科普 + 场景说服。", credits: { director: "Studio In-House", agency: "斯维诗", format: "16:9 / 16s" } },
      { slug: "niulanshan-spicy", client: "牛栏山", title: "怕辣嗓子？怕上头？", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v71.mp4", poster: "assets/media/posters/v71.jpg" }, blurb: "怕辣嗓子怕上头？牛栏山的顺口解法。", credits: { director: "Studio In-House", agency: "牛栏山", format: "16:9 / 15s" } },
      { slug: "niulanshan-tipsy", client: "牛栏山", title: "小微醺，才开心", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v72.mp4", poster: "assets/media/posters/v72.jpg" }, blurb: "小微醺才开心：低度酒饮的轻松场景。", credits: { director: "Studio In-House", agency: "牛栏山", format: "16:9 / 15s" } },
      { slug: "hujihua-ancient", client: "胡姬花", title: "不是所有的香，都叫古法香", category: "Brand Film", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v73.mp4", poster: "assets/media/posters/v73.jpg" }, blurb: "不是所有的香都叫古法香：胡姬花的工艺叙事。", credits: { director: "Studio In-House", agency: "胡姬花", format: "16:9 / 21s" } },
      { slug: "aikeman-sleep", client: "爱克曼", title: "累了喝爱克曼", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v74.mp4", poster: "assets/media/posters/v74.jpg" }, blurb: "累了喝爱克曼，困了就睡觉：功能场景双押。", credits: { director: "Studio In-House", agency: "爱克曼", format: "16:9 / 15s" } },
      { slug: "jinfuji-crunch", client: "金富士脆美司", title: "好吃到停不下来", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v75.mp4", poster: "assets/media/posters/v75.jpg" }, blurb: "好吃到停不下来：脆美司的口感循环。", credits: { director: "Studio In-House", agency: "金富士脆美司", format: "16:9 / 16s" } },
      { slug: "guanshubao-pain", client: "关舒宝", title: "痛痛痛痛！", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v76.mp4", poster: "assets/media/posters/v76.jpg" }, blurb: "痛痛痛痛！复方塞隆胶囊的症状四连击。", credits: { director: "Studio In-House", agency: "关舒宝", format: "16:9 / 1:01s" } },
      { slug: "xiaoyangren-kids", client: "小洋人", title: "我们和我们的孩子都爱喝", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v77.mp4", poster: "assets/media/posters/v77.jpg" }, blurb: "我们和我们的孩子都爱喝：家庭共饮的信任叙事。", credits: { director: "Studio In-House", agency: "小洋人", format: "16:9 / 15s" } },
/* ---- 第五十二轮：FMAI 新增 12 支（v78–v89），51–62 号源 ---- */
      { slug: "starbucks-rich-smooth", client: "星巴克", title: "想浓一点？又想顺一点？", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v78.mp4", poster: "assets/media/posters/v78.jpg" }, blurb: "浓与顺的两难选择，星巴克一支片给出双答案。", credits: { director: "Studio In-House", agency: "星巴克", format: "16:9 / 16s" } },
      { slug: "kappa-court-daily", client: "Kappa", title: "从赛场到日常", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v79.mp4", poster: "assets/media/posters/v79.jpg" }, blurb: "从赛场到日常：运动基因的街头化穿搭表达。", credits: { director: "Studio In-House", agency: "Kappa", format: "16:9 / 17s" } },
      { slug: "pizzahut-western", client: "必胜客", title: "吃西餐就去必胜客", category: "Campaign", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v80.mp4", poster: "assets/media/posters/v80.jpg" }, blurb: "「吃西餐就去必胜客」：品类心智一句话占领。", credits: { director: "Studio In-House", agency: "必胜客", format: "16:9 / 15s" } },
      { slug: "jiangzhong-finish", client: "江中制药", title: "碗里的饭吃光光", category: "TVC", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v81.mp4", poster: "assets/media/posters/v81.jpg" }, blurb: "碗里的饭吃光光：健胃消食的成果画面化。", credits: { director: "Studio In-House", agency: "江中制药", format: "16:9 / 15s" } },
      { slug: "tongyi-tea", client: "统一", title: "真茶真功夫，一口真解腻", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v82.mp4", poster: "assets/media/posters/v82.jpg" }, blurb: "真茶真功夫，一口真解腻：茶饮料卖点三连。", credits: { director: "Studio In-House", agency: "统一", format: "16:9 / 18s" } },
      { slug: "swisse-timing", client: "斯维诗", title: "吃个钙片，还要挑时间？", category: "TVC", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v83.mp4", poster: "assets/media/posters/v83.jpg" }, blurb: "吃钙片还要挑时间？斯维诗把服用门槛打到零。", credits: { director: "Studio In-House", agency: "斯维诗", format: "16:9 / 17s" } },
      { slug: "zhongjing-zuogui", client: "仲景牌左归丸", title: "保持好状态", category: "TVC", year: "2026", tone: 2, media: { kind: "video", src: "assets/media/videos/v84.mp4", poster: "assets/media/posters/v84.jpg" }, blurb: "仲景牌左归丸：保持好状态的中式滋补叙事。", credits: { director: "Studio In-House", agency: "仲景牌左归丸", format: "16:9 / 15s" } },
      { slug: "jinhe-yogurt", client: "金河", title: "一杯轻酸奶，一口爽到底", category: "TVC", year: "2026", tone: 3, media: { kind: "video", src: "assets/media/videos/v85.mp4", poster: "assets/media/posters/v85.jpg" }, blurb: "一杯轻酸奶，一口爽到底：轻负担的爽感节奏。", credits: { director: "Studio In-House", agency: "金河", format: "16:9 / 16s" } },
      { slug: "alps-candy", client: "阿尔卑斯", title: "好吃到一颗不剩", category: "TVC", year: "2026", tone: 4, media: { kind: "video", src: "assets/media/videos/v86.mp4", poster: "assets/media/posters/v86.jpg" }, blurb: "好吃到一颗不剩：糖果的童心放大器。", credits: { director: "Studio In-House", agency: "阿尔卑斯", format: "16:9 / 16s" } },
      { slug: "bytedance-helpu", client: "字节跳动", title: "帮你帮你帮你，也就帮到这了", category: "Campaign", year: "2026", tone: 5, media: { kind: "video", src: "assets/media/videos/v87.mp4", poster: "assets/media/posters/v87.jpg" }, blurb: "帮你帮你帮你——AI 帮忙的边界感幽默。", credits: { director: "Studio In-House", agency: "字节跳动", format: "16:9 / 15s" } },
      { slug: "zhenchawu-matcha", client: "真茶屋", title: "抹茶加干酪，好喝有一套", category: "TVC", year: "2026", tone: 0, media: { kind: "video", src: "assets/media/videos/v88.mp4", poster: "assets/media/posters/v88.jpg" }, blurb: "抹茶加干酪，好喝有一套：茶饮新搭配的味觉想象。", credits: { director: "Studio In-House", agency: "真茶屋", format: "16:9 / 17s" } },
      { slug: "sensetime-medical", client: "商汤医疗", title: "世界医疗模型领导者", category: "Brand Film", year: "2026", tone: 1, media: { kind: "video", src: "assets/media/videos/v89.mp4", poster: "assets/media/posters/v89.jpg" }, blurb: "世界医疗模型领导者：医疗 AI 的权威背书片。", credits: { director: "Studio In-House", agency: "商汤医疗", format: "16:9 / 15s" } }
    ]
  },

  narrative: {
    label: "Narrative",
    title: "Narrative",
    intro:
      "From a single line of dialogue to a full score — we finish the half of the job you hear.",
    works: [
      { slug: "long-shadow", client: "Secret Level Originals", title: "Long Shadow", category: "Short Film", year: "2026", tone: 5, blurb: "A debt collector discovers the man he's chasing is the one person who remembers his name." },
      { slug: "cold-open", client: "Secret Level Originals", title: "Cold Open", category: "Series", year: "2026", tone: 0, blurb: "Six episodes. One newsroom. Every episode opens on the same minute from a different point of view." },
      { slug: "the-quiet-part", client: "Secret Level Originals", title: "The Quiet Part", category: "Short Film", year: "2025", tone: 3, blurb: "Two estranged sisters inherit a recording studio and the unfinished album inside it." },
      { slug: "no-signal", client: "Secret Level Originals", title: "No Signal", category: "Series", year: "2025", tone: 1, blurb: "A remote research station stops transmitting. The last tape they sent is four minutes long." }
    ],

    /* =============================================================
       2026-10-09（第三十七轮）：声音页（narrative.html）下方案例作品
       布局重做 —— 从「Grid / Carousel / List 三视图 + 4 支英文短片」
       改成按**五类声音能力**组织的案例墙：
         AI人物配音 / 洗脑 / 唱歌 / 配乐 / 克隆

       · soundTypes：类型本身（key + 中英名 + 一句话说明），
         顺序就是筛选条的顺序。想加第六类，这里加一条即可。
       · soundCases：每条案例指向一个 type；tags 里是语言/音色这类
         描述性标签（中文原文 + 英文译文），渲染时按当前语言取用。
       · audio：目前**留空** —— 仓库里还没有音频素材（assets/media 下
         只有视频/图片）。留空时「试听」只走视觉播放态（波形动 + 进度走）；
         以后把 mp3 放进 assets/media/audio/ 再把路径填到这里，
         sound.js 会自动改用真的 <audio> 播放，不需要改代码。
       · tone：与品牌作品同一套调色板（scene.js PALETTES），
         卡片左上角的编号条用得到，也方便将来接真实波形图。
       ============================================================= */
    soundTypes: [
      { key: "ai-voice", zh: "AI人物配音", en: "AI Character Voice",
        desc: { zh: "多语种、多情绪的 AI 人声对白", en: "Multilingual, multi-emotion AI dialogue" } },
      { key: "earworm", zh: "洗脑", en: "Earworm",
        desc: { zh: "一句话反复，听一遍就记住", en: "One line, repeated until it sticks" } },
      { key: "singing", zh: "唱歌", en: "Singing",
        desc: { zh: "原创词曲 + 演唱，把主张唱出来", en: "Original lyrics and vocals for the message" } },
      { key: "score", zh: "配乐", en: "Score",
        desc: { zh: "情绪铺陈与节奏设计", en: "Emotional build and rhythmic design" } },
      { key: "clone", zh: "克隆", en: "Voice Clone",
        desc: { zh: "一人千声，音色克隆与延续", en: "One voice, cloned and carried forward" } }
    ],

    soundCases: [
      /* --- AI人物配音 --- */
      { id: "snd-01", type: "ai-voice", title: "药房独白", client: "JNTL Consumer Health", dur: "0:38", lang: "中 / 日", tone: 5,
        voice: { zh: "成年女声 · 温柔", en: "Adult female · Warm" },
        audio: "",
        desc: { zh: "旁白式独白，情绪从克制到松动，一口气 12 句不断线。",
                en: "A voice-over that loosens from restraint to warmth — twelve lines in one breath." } },
      { id: "snd-02", type: "ai-voice", title: "双人对话", client: "Wissen", dur: "0:45", lang: "中 / 韩", tone: 2,
        voice: { zh: "男女对白 · 俏皮", en: "Duo dialogue · Playful" },
        audio: "",
        desc: { zh: "一问一答的生活流对白，AI 人声得接得住对方的笑点。",
                en: "Everyday back-and-forth — the AI voice has to land the other's punchline." } },
      { id: "snd-03", type: "ai-voice", title: "战场播报", client: "WoT Blitz", dur: "0:22", lang: "中 / 英", tone: 3,
        voice: { zh: "中年男声 · 硬朗", en: "Mid male · Hard" },
        audio: "",
        desc: { zh: "压着混音走的喊话式播报，尾音要留一点金属质感。",
                en: "Shouted play-by-play under the mix, with a metallic tail." } },

      /* --- 洗脑 --- */
      { id: "snd-04", type: "earworm", title: "六个字", client: "An Da Jia", dur: "0:15", lang: "中", tone: 1,
        voice: { zh: "齐唱 · 轻快", en: "Group · Bouncy" },
        audio: "",
        desc: { zh: "副歌只留六个字，重复 8 遍；听完走路都在打拍子。",
                en: "Six syllables, eight repeats — you walk home on the beat." } },
      { id: "snd-05", type: "earworm", title: "Bu Bu Bu", client: "Tmall 618", dur: "0:20", lang: "中", tone: 1,
        voice: { zh: "童声合唱 · 跳跃", en: "Kids chorus · Springy" },
        audio: "",
        desc: { zh: "hook 每 2.5 秒回一次，卡着价格数字的节拍切。",
                en: "The hook returns every 2.5 seconds, cutting on the price beats." } },
      { id: "snd-06", type: "earworm", title: "Spray × 3", client: "Guilin Xiguashuang", dur: "0:18", lang: "中", tone: 3,
        voice: { zh: "女声 · 俏皮", en: "Female · Witty" },
        audio: "",
        desc: { zh: "产品名就是歌词，三段递进，最后一遍叠四轨。",
                en: "The product name is the lyric — three builds, the last one four-tracked." } },

      /* --- 唱歌 --- */
      { id: "snd-07", type: "singing", title: "清喉小情歌", client: "Guilin Xiguashuang", dur: "0:30", lang: "中", tone: 4,
        voice: { zh: "女声 + 木吉他", en: "Female + Acoustic" },
        audio: "",
        desc: { zh: "把药品广告唱成一首小情歌，副歌留一个上扬的钩子。",
                en: "A medicine spot as a small love song, with one rising hook." } },
      { id: "snd-08", type: "singing", title: "战歌", client: "Porsche", dur: "0:50", lang: "英", tone: 0,
        voice: { zh: "男声摇滚 + 弦乐", en: "Male rock + Strings" },
        audio: "",
        desc: { zh: "低频引擎声当鼓，人声进来之前一切都是铺垫。",
                en: "The engine is the kick drum; everything before the vocal is a runway." } },
      { id: "snd-09", type: "singing", title: "片尾曲", client: "Secret Level Originals", dur: "1:12", lang: "英", tone: 5,
        voice: { zh: "女声气声", en: "Breathy female" },
        audio: "",
        desc: { zh: "短片主题曲只唱两句词，其余留给呼吸和房间的混响。",
                en: "Two lines of lyric; the rest is breath and room tone." } },

      /* --- 配乐 --- */
      { id: "snd-10", type: "score", title: "时装片配乐", client: "DIOR", dur: "1:05", lang: "纯音乐", tone: 3,
        voice: { zh: "电子弦乐", en: "Electronic strings" },
        audio: "",
        desc: { zh: "闪粉像液态金属，配乐慢半拍，让闪光先说话。",
                en: "Glitter as liquid metal — the score sits half a beat behind the light." } },
      { id: "snd-11", type: "score", title: "开合之间", client: "Lenovo", dur: "0:45", lang: "纯音乐", tone: 5,
        voice: { zh: "极简电子", en: "Minimal electronic" },
        audio: "",
        desc: { zh: "从一个音符起手，结尾落在一次开合的机械声上。",
                en: "One note to start; it ends on the sound of a hinge." } },
      { id: "snd-12", type: "score", title: "剧集主题", client: "Secret Level Originals", dur: "1:30", lang: "纯音乐", tone: 0,
        voice: { zh: "编辑室氛围", en: "Newsroom ambience" },
        audio: "",
        desc: { zh: "六集共用一段旋律，每集换一次配器，听得出是同一间屋子。",
                en: "One melody across six episodes, re-orchestrated each time." } },

      /* --- 克隆 --- */
      { id: "snd-13", type: "clone", title: "同一把嗓子", client: "AXiE", dur: "0:40", lang: "中 / 英 / 日", tone: 2,
        voice: { zh: "音色克隆 · 多语种", en: "Cloned timbre · Multilingual" },
        audio: "",
        desc: { zh: "一段 30 秒参考音，克隆出中英日三版同一把嗓子。",
                en: "Thirty seconds of reference becomes the same voice in three languages." } },
      { id: "snd-14", type: "clone", title: "补录 47 句", client: "Tmall 618", dur: "0:35", lang: "中", tone: 1,
        voice: { zh: "克隆 + 情绪迁移", en: "Clone + Emotion transfer" },
        audio: "",
        desc: { zh: "代言人进不了棚，用克隆音补完 47 句，接缝听不出来。",
                en: "No studio date — 47 lines cloned, and the seam is inaudible." } },
      { id: "snd-15", type: "clone", title: "1998 年的磁带", client: "Secret Level Originals", dur: "0:52", lang: "中", tone: 4,
        voice: { zh: "年代音色还原", en: "Period timbre restore" },
        audio: "",
        desc: { zh: "还原磁带频响，让同一个人的声音从旧录音里接出来。",
                en: "Tape response restored, so the same person speaks across two decades." } }
    ]
  },

  /* 2026-09-27：导航「剧照」改名为「模特与演员」，并把品牌页里的
     模特与演员（LIST 视图）整块搬到这里 —— 所以 stills 这一档现在就是
     模特与演员页：标题 / 导语改中文选角文案，works 仍然为空
     （人物卡不走 works，走下面的 talent 数组）。 */
  stills: {
    label: "模特与演员",
    title: "模特与演员",
    /* 第二十三轮：导语只留这一句 —— 页头大字已经是「模特与演员」，
       上面再重复一行同名 kicker 是多余的。 */
    intro: "五十余位数字演员，总有一张脸与品牌气质相称。",
    works: []
  },

  /* 模特与演员（LIST 视图）
     每位：超写实形象照 + 人物介绍 + 参加过的视频作品（works 里填 brand 作品 slug）
     形象照由 AI 生成，统一 900×1350（2:3 竖构图），位于 assets/media/talent/

     2026-09-27（第二十二轮）扩到 12 位：
       - 新增 id 字段 = 素材目录里的文件名前缀（t01…t08 / n01…n04）。
         下面那段 IIFE 用它拼出形象照 / 棚拍全身照 / 情绪三联三组路径，
         省得每条都手写三行路径。
       - 新增 age（年龄）：详情页「演员基本信息」要显示。
       - works 全部指向 brand 里真实存在的作品 slug，点开就能播。
       - n01–n04 的图是这一轮新生成的（同一套棚拍灯位），
         让「换一批」能换出真正不同的一批脸。 */
  talent: [
    /* 2026-09-27（第二十五轮）：整批换成用户新给的 15 位。
       id t01–t15 与素材目录文件名一一对应（= 用户给的 15 张图的先后顺序）；
       portrait / full / moods 三组路径由文件末尾那段 IIFE 从 id 派生，这里不写。
       每人恰 3 件参演作品，且 slug 都指向 brand 里真实存在的片子（点开就能播）。 */
    {
      id: "t01", slug: "jiang-yin", name: "Jiang Yin", role: "Model", age: 24,
      personality: "Androgynous and unhurried — wears an oversized silhouette without disappearing inside it.",
      style: "Streetwear and youth culture; saturated colour blocks, flat daylight.",
      fit: "Streetwear, youth campaigns, colour-block graphics.",
      height: "176 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "A street cast first and a model second. Jiang Yin reads as someone you might actually pass on the street — which is exactly what youth brands keep asking for.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "male",
      dims: { identity: ["student"], job: ["model"], vibe: ["cool", "relaxed"], look: ["natural", "youthful"], body: ["tall", "slim"], character: ["calm", "confident"], visual: ["street", "commercial"] },
      works: ["puma-neymar", "tmall-618", "kuaike-elevator"]
    },
    {
      id: "t02", slug: "luo-wan", name: "Luo Wan", role: "Model", age: 25,
      personality: "Easy-going and unforced; turns an ordinary walk into a frame without being asked.",
      style: "Lifestyle and knitwear; natural light, real rooms.",
      fit: "Lifestyle, knitwear, campus and everyday stories.",
      height: "172 cm", based: "Chengdu", agency: "AXiE Talent",
      bio: "Luo Wan is cast for the in-between moments — the walk to the door, the second look back. Nothing inside her frame looks arranged.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["student"], job: ["model"], vibe: ["relaxed", "gentle"], look: ["natural", "fresh"], body: ["balanced", "tall"], character: ["calm"], visual: ["documentary", "commercial"] },
      works: ["lenovo-yoga", "lillians-magic", "andai-driver"]
    },
    {
      id: "t03", slug: "tan-xinyi", name: "Tan Xinyi", role: "Model", age: 23,
      personality: "Disciplined and genuinely athletic — never poses the effort.",
      style: "Sport and wellness; movement-led frames, clean morning light.",
      fit: "Sportswear, wellness, running and training films.",
      height: "170 cm", based: "Guangzhou", agency: "AXiE Talent",
      bio: "She trains, so the camera doesn't have to lie. Tan Xinyi sells pace and breath rather than a pose, which is why running films keep coming back to her.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "teen",
      dims: { identity: ["expert"], job: ["athlete"], vibe: ["sunny", "tough"], look: ["fresh"], body: ["athletic", "balanced"], character: ["outgoing", "confident"], visual: ["commercial", "documentary"] },
      works: ["puma-neymar", "guilin-tvc", "wissen-acid"]
    },
    {
      id: "t04", slug: "qiu-yan", name: "Qiu Yan", role: "Model", age: 26,
      personality: "Competitive and composed; the bob and the stare do half the work.",
      style: "Sport-lux and court sports; crisp light, graphic composition.",
      fit: "Sport-lux, tennis and court sports, performance apparel.",
      height: "174 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "A court athlete who photographs like an editorial. Qiu Yan holds a statue-still stance and makes the racket look like an accessory she chose.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["public"], job: ["athlete"], vibe: ["tough", "premium"], look: ["edgy", "refined"], body: ["athletic", "tall"], character: ["assertive", "calm"], visual: ["editorial", "commercial"] },
      works: ["puma-neymar", "porsche-wild-force", "tmall-618"]
    },
    {
      id: "t05", slug: "pei-zhou", name: "Pei Zhou", role: "Actor", age: 29,
      personality: "Precise and dryly funny; the glasses are a choice, not a prop.",
      style: "Smart-casual and tech; two-hander dialogue, underplayed reactions.",
      fit: "Tech, finance and smart-casual brand films; comedic timing.",
      height: "181 cm", based: "Beijing", agency: "AXiE Talent",
      bio: "Pei Zhou can deliver a spec sheet like a punchline and still sound like a person. Cast him when the script needs to be funny without announcing it.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "male",
      dims: { identity: ["professional"], job: ["office"], vibe: ["intellectual", "cool"], look: ["refined"], body: ["tall", "balanced"], character: ["humorous", "reserved"], visual: ["commercial", "documentary"] },
      works: ["lenovo-yoga", "video-execution", "andai-driver"]
    },
    {
      id: "t06", slug: "he-qing", name: "He Qing", role: "Model", age: 27,
      personality: "Minimal and exacting — she edits her own posture before the camera rolls.",
      style: "Minimal fashion and tailoring; neutral palettes, long lenses.",
      fit: "Minimal fashion, tailoring, clean editorial.",
      height: "171 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "He Qing works in millimetres. A shoulder dropped and a hand moved two centimetres is the whole difference between ordinary and exact.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["professional"], job: ["designer"], vibe: ["premium", "intellectual"], look: ["refined", "mature"], body: ["slim", "tall"], character: ["reserved", "rational"], visual: ["editorial", "commercial"] },
      works: ["dior-glitter", "lillians-magic", "lenovo-yoga"]
    },
    {
      id: "t07", slug: "yu-ke", name: "Yu Ke", role: "Model", age: 22,
      personality: "Quick and playful — always looks caught mid-thought rather than mid-pose.",
      style: "Casual and Gen-Z social; flash daylight, one-take energy.",
      fit: "Social campaigns, casual fashion, vertical-first content.",
      height: "168 cm", based: "Hangzhou", agency: "AXiE Talent",
      bio: "Yu Ke makes a vertical frame feel like a friend's phone. Nothing about her work looks produced, and that is the hardest thing to produce.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "teen",
      dims: { identity: ["student"], job: ["creator"], vibe: ["sunny", "relaxed"], look: ["youthful", "sweet"], body: ["petite", "balanced"], character: ["outgoing", "lively"], visual: ["street", "commercial"] },
      works: ["tmall-618", "kuaike-elevator", "wissen-acid"]
    },
    {
      id: "t08", slug: "su-man", name: "Su Man", role: "Model", age: 28,
      personality: "Warm and low-key; makes a product feel like part of a routine.",
      style: "Home and comfort; soft window light, muted pastels.",
      fit: "Home, comfort, coffee and everyday ritual stories.",
      height: "169 cm", based: "Suzhou", agency: "AXiE Talent",
      bio: "Su Man is the reason a kettle can carry a scene. She plays the routine rather than the product, and the product comes along for free.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["professional"], job: ["office"], vibe: ["gentle", "relaxed"], look: ["natural", "sweet"], body: ["balanced"], character: ["reserved", "calm"], visual: ["documentary", "commercial"] },
      works: ["andai-driver", "guilin-tvc", "lenovo-yoga"]
    },
    {
      id: "t09", slug: "nora-vale", name: "Nora Vale", role: "Model", age: 30,
      personality: "Composed and faintly ironic — calm without ever reading as blank.",
      style: "European lifestyle and resort; unhurried camera, natural texture.",
      fit: "European lifestyle, resort and travel, premium everyday.",
      height: "176 cm", based: "Lisbon", agency: "AXiE Talent",
      bio: "European casting with a documentary calm. Nora can hold a long take of doing nothing and make the room feel furnished.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "senior",
      dims: { identity: ["expert"], job: ["model"], vibe: ["elegant", "premium"], look: ["mature", "refined"], body: ["tall", "slim"], character: ["calm", "introverted"], visual: ["documentary", "editorial"] },
      works: ["lillians-magic", "dior-glitter", "guilin-spray"]
    },
    {
      id: "t10", slug: "iris-zhao", name: "Iris Zhao", role: "Model", age: 31,
      personality: "Bold and immaculate — colour-blocked, and completely at ease in it.",
      style: "High fashion colour; saturated palettes, hard editorial light.",
      fit: "High fashion, colour-led beauty, statement jewellery.",
      height: "178 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "Iris is built for the frame that has to be looked at twice. She wears the loudest colour in the room and then out-performs it.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "senior",
      dims: { identity: ["public"], job: ["model"], vibe: ["premium", "elegant"], look: ["refined", "mature"], body: ["tall", "balanced"], character: ["confident", "assertive"], visual: ["editorial", "cinematic"] },
      works: ["dior-glitter", "tmall-618", "lillians-magic"]
    },
    {
      id: "t11", slug: "mo-ran", name: "Mo Ran", role: "Actor", age: 26,
      personality: "Cool and watchful; answers with a look before a line.",
      style: "Street noir and music; handheld, night exteriors.",
      fit: "Street noir, music films, urban night exteriors.",
      height: "173 cm", based: "Chongqing", agency: "AXiE Talent",
      bio: "Mo Ran reads best after dark. Put a practical light behind her and she stops performing and starts existing in the frame.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["expert"], job: ["artist"], vibe: ["cool", "mysterious"], look: ["edgy", "rugged"], body: ["slim", "tall"], character: ["introverted", "reserved"], visual: ["cinematic", "street"] },
      works: ["wot-blitz", "kuaike-elevator", "video-execution"]
    },
    {
      id: "t12", slug: "an-nuo", name: "An Nuo", role: "Actor", age: 27,
      personality: "Textural and handmade — reads as someone who makes things themselves.",
      style: "Craft and artisan brands; linen, texture, slow detail.",
      fit: "Craft, artisan and heritage brands; texture-led close-ups.",
      height: "170 cm", based: "Dali", agency: "AXiE Talent",
      bio: "An Nuo photographs like a material: linen, dye, a scarf tied at the last second. She gives provenance to things that cannot explain themselves.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "female",
      dims: { identity: ["expert"], job: ["creator"], vibe: ["relaxed", "intellectual"], look: ["natural", "fresh"], body: ["balanced"], character: ["reserved", "calm"], visual: ["documentary", "cinematic"] },
      works: ["guilin-spray", "guilin-tvc", "andai-driver"]
    },
    {
      id: "t13", slug: "lian-qiao", name: "Lian Qiao", role: "Model", age: 24,
      personality: "Openly warm; the smile is real and it lands on the first take.",
      style: "Beauty and family; bright, welcoming, close-up friendly.",
      fit: "Beauty, family and food; warmth-led brand films.",
      height: "167 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "Lian Qiao carries warmth without straining for it. Editors keep the first take, because the second one is only trying.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "teen",
      dims: { identity: ["professional"], job: ["model"], vibe: ["sunny", "gentle"], look: ["sweet", "fresh"], body: ["petite", "balanced"], character: ["outgoing", "lively"], visual: ["commercial", "documentary"] },
      works: ["tylenol-jp", "wissen-acid", "andai-driver"]
    },
    {
      id: "t14", slug: "tang-li", name: "Tang Li", role: "Model", age: 21,
      personality: "Bright and a little retro; brings a pop palette to life.",
      style: "Retro-pop and youth; primary colours, playful staging.",
      fit: "Retro-pop campaigns, youth fashion, playful product stories.",
      height: "166 cm", based: "Wuhan", agency: "AXiE Talent",
      bio: "Tang Li looks like a poster from a decade nobody can quite name. Give her a primary colour and she will give it a personality.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "teen",
      dims: { identity: ["student"], job: ["model"], vibe: ["sunny", "relaxed"], look: ["youthful", "sweet"], body: ["petite", "balanced"], character: ["lively", "outgoing"], visual: ["street", "commercial"] },
      works: ["tmall-618", "puma-neymar", "dior-glitter"]
    },
    {
      id: "t15", slug: "ruan-shu", name: "Ruan Shu", role: "Actor", age: 33,
      personality: "Poised and quietly authoritative — the one who steals the office scene.",
      style: "Corporate and drama; tailored frames, controlled light.",
      fit: "Corporate films, financial services, poised dialogue.",
      height: "172 cm", based: "Shanghai", agency: "AXiE Talent",
      bio: "Ruan Shu gives a boardroom the temperature of a real room. She speaks slowly enough that the audience finishes the sentence with her.",
      /* 类型分组（筛选器用）+ 七大分类维度（详情页用，值见 i18n 的 tag.* 表） */
      group: "senior",
      dims: { identity: ["professional"], job: ["executive"], vibe: ["mature", "premium"], look: ["mature", "refined"], body: ["tall", "balanced"], character: ["calm", "confident"], visual: ["commercial", "cinematic"] },
      works: ["video-execution", "lenovo-yoga", "porsche-wild-force"]
    },
  ],
  clients: [
    "DIOR", "PUMA", "Porsche", "Lenovo", "Tmall 618", "JNTL",
    "Wissen", "Kuaike", "Guilin", "WoT Blitz", "An Da Jia", "AIGC Lab"
  ],



  news: [
    { slug: "liquid-engine-2", date: "2026.09.12", title: "Liquid Engine 2.0 ships with real-time relighting", excerpt: "Our in-house pipeline now re-lights finished shots in the browser — no re-render, no round trip." },
    { slug: "ashwick-premieres", date: "2026.08.28", title: "Ashwick premieres worldwide", excerpt: "The launch film went live in 14 markets simultaneously, with 22 localized cuts generated from one master." },
    { slug: "studio-expands", date: "2026.07.04", title: "Secret Level opens a second stage", excerpt: "A 6,000 sq ft volume dedicated to in-camera effects and virtual production." },
    { slug: "cold-open-greenlit", date: "2026.05.19", title: "Cold Open greenlit for season two", excerpt: "Six more episodes enter production this autumn." }
  ],

  /* 2026-09-27：导航改名 —— 剧照→模特与演员、剧情→声音、
     Liquid Engine→常见问题、关于→关于我们，「动态」整条删除。
     改这里就够了：顶部胶囊导航、抽屉、页脚三处都由这份数组生成
     （shell.js 的 buildHeader / buildDrawer / buildFooter）。
     页面里**静态写死**的那几份（可视化编辑器落进 HTML 的）也要一起改，
     见 tools/sync-nav-labels.py。 */
  nav: [
    { label: "Featured Works", href: "brand.html", i18n: "nav.brand" },
    { label: "Models & Actors", href: "stills.html", i18n: "nav.stills" },
    { label: "Sound", href: "narrative.html", i18n: "nav.narrative" },
    { label: "FAQ", href: "liquid-engine.html", i18n: "nav.faq" },
    { label: "About Us", href: "about.html", i18n: "nav.about" }
  ],

  /* 2026-09-27：首页「观看作品」→ 跳到 about 页带声播放。
     键 = 首页分屏那支视频的文件名（v20…v27），值 = 这支片的品牌广告项目介绍。
     播放器（assets/js/watch-project.js）读 ?play=vNN 取这里的一条，
     把 客户 / 片名 / 类目 / 年份 / 简介 铺进信息栏。
     注意：首页分屏的标题文案（Tylenol / Wissen …）还是旧品牌名，
     与这里**不是**同一套 —— 那批旧文案待用户确认后再统一。 */
  homeFilms: {
    v20: {
      src: "assets/media/videos/v20.mp4",
      client: "DIOR", title: "Glitter", category: "Fashion Film", year: "2023",
      format: "16:9 / 60s", director: "Studio In-House",
      blurb: {
        en: "Light as material. A beauty film where glitter behaves like liquid metal under studio strobes.",
        zh: "光即是材质。在这支美妆影片里，闪片像液态金属一样在影棚频闪下流动。"
      }
    },
    v21: {
      src: "assets/media/videos/v21.mp4",
      client: "Lillian", title: "Magic Time", category: "Brand Film", year: "2023",
      format: "16:9 / 45s", director: "Studio In-House",
      blurb: {
        en: "A phone-and-digital product film built around one impossible continuous moment.",
        zh: "一支围绕「一个不可能的连续瞬间」搭建的手机与数码产品影片。"
      }
    },
    v22: {
      src: "assets/media/videos/v22.mp4",
      client: "Porsche", title: "Wild Force", category: "Brand Film", year: "2023",
      format: "16:9 / 60s", director: "Studio In-House",
      blurb: {
        en: "Machine vs. terrain. A launch film that treats the car as an animal in its own habitat.",
        zh: "机械对地貌。这支发布影片把车当成本能动物，放归它自己的栖息地。"
      }
    },
    v23: {
      src: "assets/media/videos/v23.mp4",
      client: "World of Tanks Blitz", title: "Familiars", category: "Game Trailer", year: "2023",
      format: "16:9 / 90s", director: "Studio In-House",
      blurb: {
        en: "WoT Blitz x deadmau5. Steel, sound design and a familiar that shouldn't work — but does.",
        zh: "WoT Blitz × deadmau5。钢铁、声音设计，以及一只本不该成立、却成立的召唤兽。"
      }
    },
    v24: {
      src: "assets/media/videos/v24.mp4",
      client: "AIGC Brand Lab", title: "The Giant Rooster", category: "AIGC Film", year: "2024",
      format: "16:9 / 45s", director: "AIGC Unit",
      blurb: {
        en: "What do you do when a two-story rooster blocks the road? An AIGC brand film with a straight face.",
        zh: "马路中间站着一只两层楼高的公鸡，你怎么办？一支一本正经的 AIGC 品牌影片。"
      }
    },
    v25: {
      src: "assets/media/videos/v25.mp4",
      client: "PUMA", title: "Crazy", category: "Campaign", year: "2023",
      format: "16:9 / 60s", director: "Studio In-House",
      blurb: {
        en: "Neymar for PUMA. A sports spot that lets the madness of the skill carry the whole narrative.",
        zh: "内马尔 × PUMA。一支让脚下那股疯劲自己撑起全部叙事的运动广告。"
      }
    },
    v26: {
      src: "assets/media/videos/v26.mp4",
      client: "Lenovo", title: "YOGA Air X", category: "Campaign", year: "2023",
      format: "16:9 / 45s", director: "Studio In-House",
      blurb: {
        en: "Lenovo x He Ruixian. Looks and horsepower, held in the same frame without apology.",
        zh: "联想 × 何瑞贤。颜值与实力，理直气壮地塞进同一个画面里。"
      }
    },
    v27: {
      src: "assets/media/videos/v27.mp4",
      client: "Guilin Xiguashuang", title: "Clear Throat", category: "TVC", year: "2024",
      format: "16:9 / 30s", director: "Studio In-House",
      blurb: {
        en: "Classic product TVC for Guilin Watermelon Frost lozenges — crisp, clinical, confident.",
        zh: "桂林西瓜霜含片的经典产品 TVC——清脆、利落、笃定。"
      }
    }
  },

  /* 首页左侧「单帧画廊」不再单独存一套静帧。
     它现在直接取「一支视频一帧」：videos/vNN.mp4 → posters/vNN.jpg，
     与 GRID / CAROUSEL / LIST 同源，所以帧数天然等于视频数。
     （旧的 assets/media/frames/f01…f06.jpg 已删除） */

  team: [
    { name: "Mara Vance", role: "Founder, Chief Creative" },
    { name: "Idris Koln", role: "Partner, Head of Production" },
    { name: "Yuki Ren", role: "Director of Technology" },
    { name: "Tomas Beck", role: "Executive Producer" }
  ]
};

/* 演员素材路径：由 id 派生，省得每条手写三行。
   assets/media/talent/<id>.jpg            胸像（卡片 / 列表）
   assets/media/talent/full/<id>.jpg       棚拍全身照（详情页主视觉）
   assets/media/talent/mood/<id>-1..3.jpg  情绪三联近景
                                            （第二十三轮重做：侧望平静 / 侧脸大笑 / 正视凝视，
                                             每人一张 ImageGen 三格拼接图切出来的）
   图由 tools/build-talent-assets.py 从 raw/ 下的生成图裁切、去水印后产出。 */
(function () {
  var pool = (window.SL_DATA.talent || []);
  for (var i = 0; i < pool.length; i++) {
    var p = pool[i];
    if (!p || !p.id) continue;
    if (!p.portrait) p.portrait = "assets/media/talent/" + p.id + ".jpg";
    if (!p.full) p.full = "assets/media/talent/full/" + p.id + ".jpg";
    if (!p.moods) {
      p.moods = [1, 2, 3].map(function (k) {
        return "assets/media/talent/mood/" + p.id + "-" + k + ".jpg";
      });
    }
  }
  /* 演员批次：第二十三轮改成「一屏全部 12 位」（6 列 × 2 行，正好排满）。
     「换一批」按 stride = 4 换个起点，等于换一种排列顺序 ——
     第一张脸每次都不同，但总数不变，网格永远是整齐的两行。 */
  window.SL_DATA.talentBatchSize = 15;
  window.SL_DATA.talentBatchStride = 5;
})();

/* Stills：32 张静帧，确定性生成条目 */
(function () {
  var titles = [
    "Field Study", "Street Light", "Golden Hour", "Interior, Dusk",
    "Control Room", "Elevator", "Morning Ritual", "Backstage",
    "Phone Booth", "House Party", "Green Curtain", "Neon Girl",
    "Interview", "Through Glass", "Cold Open", "Neon Signs",
    "Blue Hair", "Blue Tile", "Fight Scene", "Studio Light",
    "Pink Room", "Corner Store", "Pink Heel", "Dust & Sun",
    "Hoodie", "City Blur", "Floral Bed", "Mirror Mirror"
  ];
  for (var i = 1; i <= 32; i++) {
    var t = titles[(i - 1) % titles.length];
    window.SL_DATA.stills.works.push({
      slug: "still-" + (i < 10 ? "0" + i : i),
      client: "Reference Plate",
      title: t + " " + String(i).padStart(2, "0"),
      category: "Photography",
      year: "2024–2026",
      tone: (i * 3) % 6,
      media: { kind: "image", src: "assets/media/stills/s" + (i < 10 ? "0" + i : i) + ".jpg" },
      blurb: "Selected still — frame " + String(i).padStart(2, "0") + " from the studio reference library."
    });
  }
})();

/* =============================================================
   中英文词条（供 i18n-extra 使用）
   只翻「内容层」文案；作品名 / 客户名等专有名词保持原文。
   key 用与 data.js 条目一一对应的稳定 id：
     collection.<slug>.title / .intro / .label
     work.<slug>.category / .blurb
   ============================================================= */
window.SL_DATA.i18n = {
  collections: {
    brand: {
      label: { en: "Featured Works", zh: "精选作品" },
      title: { en: "Featured Works", zh: "精选作品" },
      /* 2026-09-27：可视化编辑器把 brand 页原来的两段定位语合并成了一个 <p>，
         于是 intro2 对应的元素不复存在 —— 只在 intro2 上挂译文会导致
         "切到英文后第二句整句消失"。这里把两句并成一句挂在 intro 上，
         zh 与页面里的静态文案逐字对齐（含句号），来回切语言不会漂。
         intro2 保留为历史键，元素不存在时 i18n 会自然跳过。 */
      intro: {
        en: "AXIE is a creative video production company, making the ideas good — so brands are seen, and even felt, by more people.",
        zh: "AXIE是一家创意视频制作公司，把创意做好 让品牌被更多人看见，甚至被触动。"
      },
      intro2: {
        en: "making the ideas good — so brands are seen, and even felt, by more people.",
        zh: "把创意做好 让品牌被更多人看见，甚至被触动"
      }
    },
    stills: {
      label: { en: "Models & Actors", zh: "模特与演员" },
      title: { en: "Models & Actors", zh: "模特与演员" },
      intro: {
        en: "Fifty-plus digital actors — one of them carries your brand.",
        zh: "五十余位数字演员，总有一张脸与品牌气质相称。"
      }
    },
    narrative: {
      label: { en: "Sound", zh: "声音" },
      title: { en: "Sound", zh: "声音" },
      /* 第三十七轮：声音页下方案例区改成按五类声音能力组织之后，
         页头这句导语也得对上 —— 原来那句讲的是「原创故事」，
         跟"声音"这个栏目（以及下面的案例墙）已经完全不搭。 */
      intro: {
        en: "From a single line of dialogue to a full score — we finish the half of the job you hear.",
        zh: "从一句对白到整支配乐 —— 我们替品牌做完声音的那一半。"
      }
    }
  },
  /* 模特与演员：姓名 / 常驻地 / 人物介绍 的中英对照
     role（Model / Actor）走下面的 roles 表，不逐条重复 */
  roles: {
    "Model": { en: "Model", zh: "模特" },
    "Actor": { en: "Actor", zh: "演员" }
  },
  talent: {
    "jiang-yin": {
      name: { en: "Jiang Yin", zh: "姜寅" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Androgynous and unhurried — wears an oversized silhouette without disappearing inside it.",
        zh: "中性、从容——再宽大的廓形也压不住人，反而被穿出结构感。"
      },
      style: {
        en: "Streetwear and youth culture; saturated colour blocks, flat daylight.",
        zh: "街头与青年文化；高饱和撞色、平光日光。"
      },
      fit: {
        en: "Streetwear, youth campaigns, colour-block graphics.",
        zh: "街头服饰、青年向广告、撞色视觉。"
      },
      bio: {
        en: "A street cast first and a model second. Jiang Yin reads as someone you might actually pass on the street — which is exactly what youth brands keep asking for.",
        zh: "先是一个街头上的人，然后才是模特。姜寅身上有一种「路过就能遇见」的真实感——正是青年品牌一直在找的那种。"
      }
    },
    "luo-wan": {
      name: { en: "Luo Wan", zh: "罗晚" },
      based: { en: "Chengdu", zh: "成都" },
      personality: {
        en: "Easy-going and unforced; turns an ordinary walk into a frame without being asked.",
        zh: "松弛、不刻意——不用人喊开机，一段平常的走路就已经是画面。"
      },
      style: {
        en: "Lifestyle and knitwear; natural light, real rooms.",
        zh: "生活方式与针织品类；自然光、真实空间。"
      },
      fit: {
        en: "Lifestyle, knitwear, campus and everyday stories.",
        zh: "生活方式、针织服饰、校园与日常叙事。"
      },
      bio: {
        en: "Luo Wan is cast for the in-between moments — the walk to the door, the second look back. Nothing inside her frame looks arranged.",
        zh: "罗晚被选中的，总是那些「之间」的时刻——走向门口的那几步、回头的那一眼。她的画面里没有一处是摆出来的。"
      }
    },
    "tan-xinyi": {
      name: { en: "Tan Xinyi", zh: "谭心怡" },
      based: { en: "Guangzhou", zh: "广州" },
      personality: {
        en: "Disciplined and genuinely athletic — never poses the effort.",
        zh: "自律、真有运动底子——从不「演」那份吃力。"
      },
      style: {
        en: "Sport and wellness; movement-led frames, clean morning light.",
        zh: "运动与健康；动作带画面、干净的晨间光。"
      },
      fit: {
        en: "Sportswear, wellness, running and training films.",
        zh: "运动服饰、健康、跑步与训练题材。"
      },
      bio: {
        en: "She trains, so the camera doesn't have to lie. Tan Xinyi sells pace and breath rather than a pose, which is why running films keep coming back to her.",
        zh: "她真的在训练，所以镜头不必替她撒谎。谭心怡卖的是配速与呼吸，而不是一个姿势——跑步类影片因此一再回头找她。"
      }
    },
    "qiu-yan": {
      name: { en: "Qiu Yan", zh: "邱砚" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Competitive and composed; the bob and the stare do half the work.",
        zh: "好胜而克制——一头短发与那道眼神，已经完成了一半的戏。"
      },
      style: {
        en: "Sport-lux and court sports; crisp light, graphic composition.",
        zh: "运动奢侈与球场项目；硬朗光比、图形化构图。"
      },
      fit: {
        en: "Sport-lux, tennis and court sports, performance apparel.",
        zh: "运动奢华、网球与球场运动、性能服饰。"
      },
      bio: {
        en: "A court athlete who photographs like an editorial. Qiu Yan holds a statue-still stance and makes the racket look like an accessory she chose.",
        zh: "像杂志大片一样上镜的球场运动员。邱砚能一动不动地站住，让球拍看起来像她自己挑的配饰。"
      }
    },
    "pei-zhou": {
      name: { en: "Pei Zhou", zh: "裴舟" },
      based: { en: "Beijing", zh: "北京" },
      personality: {
        en: "Precise and dryly funny; the glasses are a choice, not a prop.",
        zh: "精准、冷幽默——眼镜是选择，不是道具。"
      },
      style: {
        en: "Smart-casual and tech; two-hander dialogue, underplayed reactions.",
        zh: "轻正式与数码；双人对话、克制的反应。"
      },
      fit: {
        en: "Tech, finance and smart-casual brand films; comedic timing.",
        zh: "数码、金融与轻正式品牌片；喜剧节奏。"
      },
      bio: {
        en: "Pei Zhou can deliver a spec sheet like a punchline and still sound like a person. Cast him when the script needs to be funny without announcing it.",
        zh: "裴舟能把一页参数念出笑点，同时仍然像一个人在说话。剧本需要幽默却不点破的时候，找他。"
      }
    },
    "he-qing": {
      name: { en: "He Qing", zh: "何清" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Minimal and exacting — she edits her own posture before the camera rolls.",
        zh: "极简、严苛——机器还没开，她已经先把自己调过一遍。"
      },
      style: {
        en: "Minimal fashion and tailoring; neutral palettes, long lenses.",
        zh: "极简时装与剪裁；中性色、长焦。"
      },
      fit: {
        en: "Minimal fashion, tailoring, clean editorial.",
        zh: "极简时装、剪裁、干净的时装片。"
      },
      bio: {
        en: "He Qing works in millimetres. A shoulder dropped and a hand moved two centimetres is the whole difference between ordinary and exact.",
        zh: "何清以毫米为单位工作。一个肩膀往下、一只手挪两厘米，就是「普通」与「精确」之间的全部差别。"
      }
    },
    "yu-ke": {
      name: { en: "Yu Ke", zh: "余可" },
      based: { en: "Hangzhou", zh: "杭州" },
      personality: {
        en: "Quick and playful — always looks caught mid-thought rather than mid-pose.",
        zh: "机敏、爱玩——永远像被拍到「正想着什么」，而不是「正摆着什么」。"
      },
      style: {
        en: "Casual and Gen-Z social; flash daylight, one-take energy.",
        zh: "休闲与年轻社交；直闪日光、一条过的劲头。"
      },
      fit: {
        en: "Social campaigns, casual fashion, vertical-first content.",
        zh: "社交传播、休闲时装、竖屏优先的内容。"
      },
      bio: {
        en: "Yu Ke makes a vertical frame feel like a friend's phone. Nothing about her work looks produced, and that is the hardest thing to produce.",
        zh: "余可能让一个竖屏画面像朋友手机里拍出来的。她的作品里看不出「制作」的痕迹，而这恰恰是最难制作的。"
      }
    },
    "su-man": {
      name: { en: "Su Man", zh: "苏曼" },
      based: { en: "Suzhou", zh: "苏州" },
      personality: {
        en: "Warm and low-key; makes a product feel like part of a routine.",
        zh: "温和、不抢戏——能让一个产品自然变成日常的一部分。"
      },
      style: {
        en: "Home and comfort; soft window light, muted pastels.",
        zh: "家居与舒适感；柔和窗光、低饱和粉彩。"
      },
      fit: {
        en: "Home, comfort, coffee and everyday ritual stories.",
        zh: "家居、舒适、咖啡与日常仪式感叙事。"
      },
      bio: {
        en: "Su Man is the reason a kettle can carry a scene. She plays the routine rather than the product, and the product comes along for free.",
        zh: "一只水壶能撑起一场戏，靠的是苏曼。她演的是日常动作而不是产品，产品只是顺路跟着出现。"
      }
    },
    "nora-vale": {
      name: { en: "Nora Vale", zh: "诺拉·维尔" },
      based: { en: "Lisbon", zh: "里斯本" },
      personality: {
        en: "Composed and faintly ironic — calm without ever reading as blank.",
        zh: "从容、带一点自嘲式的讥诮——安静，但绝不空洞。"
      },
      style: {
        en: "European lifestyle and resort; unhurried camera, natural texture.",
        zh: "欧洲生活方式与度假题材；不着急的镜头、天然质感。"
      },
      fit: {
        en: "European lifestyle, resort and travel, premium everyday.",
        zh: "欧洲生活方式、度假与旅行、高端日常。"
      },
      bio: {
        en: "European casting with a documentary calm. Nora can hold a long take of doing nothing and make the room feel furnished.",
        zh: "带着纪录片气质的欧陆面孔。诺拉能把「什么也不做」的长镜头撑住，让整个空间都显得有陈设感。"
      }
    },
    "iris-zhao": {
      name: { en: "Iris Zhao", zh: "艾瑞斯·赵" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Bold and immaculate — colour-blocked, and completely at ease in it.",
        zh: "强烈而一丝不乱——撞色穿在身上，毫不费劲。"
      },
      style: {
        en: "High fashion colour; saturated palettes, hard editorial light.",
        zh: "高级时装的色彩；高饱和调色、硬朗时装光。"
      },
      fit: {
        en: "High fashion, colour-led beauty, statement jewellery.",
        zh: "高级时装、色彩向美妆、存在感珠宝。"
      },
      bio: {
        en: "Iris is built for the frame that has to be looked at twice. She wears the loudest colour in the room and then out-performs it.",
        zh: "艾瑞斯为「需要被看两眼」的那种画面而生。她穿着全场最响的颜色出场，然后把自己演得比颜色更响。"
      }
    },
    "mo-ran": {
      name: { en: "Mo Ran", zh: "默然" },
      based: { en: "Chongqing", zh: "重庆" },
      personality: {
        en: "Cool and watchful; answers with a look before a line.",
        zh: "冷、警觉——台词之前，先用眼神回答。"
      },
      style: {
        en: "Street noir and music; handheld, night exteriors.",
        zh: "街头黑色电影与音乐；手持、夜景外拍。"
      },
      fit: {
        en: "Street noir, music films, urban night exteriors.",
        zh: "街头黑色题材、音乐影片、城市夜景。"
      },
      bio: {
        en: "Mo Ran reads best after dark. Put a practical light behind her and she stops performing and starts existing in the frame.",
        zh: "默然在天黑之后最有说服力。在她身后放一盏实景灯，她就不再「演」，而是开始存在于画面里。"
      }
    },
    "an-nuo": {
      name: { en: "An Nuo", zh: "安诺" },
      based: { en: "Dali", zh: "大理" },
      personality: {
        en: "Textural and handmade — reads as someone who makes things themselves.",
        zh: "有肌理、有手工感——一看就是亲手做东西的人。"
      },
      style: {
        en: "Craft and artisan brands; linen, texture, slow detail.",
        zh: "手作与匠人品牌；亚麻、肌理、慢细节。"
      },
      fit: {
        en: "Craft, artisan and heritage brands; texture-led close-ups.",
        zh: "手作、匠人与老字号品牌；质感特写。"
      },
      bio: {
        en: "An Nuo photographs like a material: linen, dye, a scarf tied at the last second. She gives provenance to things that cannot explain themselves.",
        zh: "安诺拍起来像一种材料：亚麻、植物染、临到最后才系上的头巾。她替那些说不清来历的东西，把来历讲了出来。"
      }
    },
    "lian-qiao": {
      name: { en: "Lian Qiao", zh: "连翘" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Openly warm; the smile is real and it lands on the first take.",
        zh: "不掩饰的暖——那个笑是真的，而且第一条就到位。"
      },
      style: {
        en: "Beauty and family; bright, welcoming, close-up friendly.",
        zh: "美妆与家庭题材；明亮、亲和、经得起特写。"
      },
      fit: {
        en: "Beauty, family and food; warmth-led brand films.",
        zh: "美妆、家庭与食品；以温度为主的品牌片。"
      },
      bio: {
        en: "Lian Qiao carries warmth without straining for it. Editors keep the first take, because the second one is only trying.",
        zh: "连翘身上的温度不需要使劲。剪辑师会留下第一条——因为第二条就只是在「努力」了。"
      }
    },
    "tang-li": {
      name: { en: "Tang Li", zh: "唐栗" },
      based: { en: "Wuhan", zh: "武汉" },
      personality: {
        en: "Bright and a little retro; brings a pop palette to life.",
        zh: "明快、带点复古——能把一整块鲜艳的颜色演活。"
      },
      style: {
        en: "Retro-pop and youth; primary colours, playful staging.",
        zh: "复古流行与青年；原色碰撞、游戏感调度。"
      },
      fit: {
        en: "Retro-pop campaigns, youth fashion, playful product stories.",
        zh: "复古流行广告、青年时装、轻松的产品故事。"
      },
      bio: {
        en: "Tang Li looks like a poster from a decade nobody can quite name. Give her a primary colour and she will give it a personality.",
        zh: "唐栗像一张谁也说不清年代的旧海报。给她一种原色，她就能还它一个性格。"
      }
    },
    "ruan-shu": {
      name: { en: "Ruan Shu", zh: "阮书" },
      based: { en: "Shanghai", zh: "上海" },
      personality: {
        en: "Poised and quietly authoritative — the one who steals the office scene.",
        zh: "沉稳、自带分寸——办公室里那场戏，最后总是她的。"
      },
      style: {
        en: "Corporate and drama; tailored frames, controlled light.",
        zh: "企业题材与剧情；利落构图、可控布光。"
      },
      fit: {
        en: "Corporate films, financial services, poised dialogue.",
        zh: "企业影片、金融服务、从容的对话场景。"
      },
      bio: {
        en: "Ruan Shu gives a boardroom the temperature of a real room. She speaks slowly enough that the audience finishes the sentence with her.",
        zh: "阮书能让一间会议室回到真实房间的温度。她说话慢到观众会跟着她把句子说完。"
      }
    },
  },
  categories: {
    "Brand Film": { en: "Brand Film", zh: "品牌影片" },
    "Campaign": { en: "Campaign", zh: "营销战役" },
    "TVC": { en: "TVC", zh: "电视广告" },
    "Social Film": { en: "Social Film", zh: "社交影片" },
    "Reel": { en: "Reel", zh: "作品集" },
    "Fashion Film": { en: "Fashion Film", zh: "时尚影片" },
    "Game Trailer": { en: "Game Trailer", zh: "游戏预告" },
    "AIGC Film": { en: "AIGC Film", zh: "AIGC 影片" },
    "Short Film": { en: "Short Film", zh: "短片" },
    "Series": { en: "Series", zh: "剧集" },
    "Photography": { en: "Photography", zh: "摄影" }
  }
};
