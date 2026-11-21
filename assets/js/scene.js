/* =============================================================
   程序化影像背景（Procedural Footage）
   没有视频素材时，用 Canvas 生成"电影感"动态画面：
   低分辨率绘制 + CSS 放大模糊 = 浅景深胶片感
   - 仅视口内的实例参与 rAF（性能）
   - tone 索引决定配色
   ============================================================= */

window.SLScene = (function () {
  var PALETTES = [
    // 0 冷青（钢与玻璃）
    { base: [8, 11, 13], lights: [[58, 104, 120], [22, 46, 56], [96, 132, 140]] },
    // 1 琥珀（钨丝灯）
    { base: [10, 8, 6], lights: [[132, 82, 34], [64, 38, 16], [180, 132, 74]] },
    // 2 暖橙（黄昏街景）
    { base: [11, 8, 8], lights: [[140, 68, 40], [72, 32, 22], [186, 118, 70]] },
    // 3 品红（霓虹）
    { base: [10, 7, 11], lights: [[112, 40, 96], [58, 20, 52], [156, 84, 140]] },
    // 4 苔绿（自然光）
    { base: [7, 10, 8], lights: [[52, 92, 58], [24, 46, 30], [110, 148, 96]] },
    // 5 钢蓝（夜）
    { base: [7, 9, 13], lights: [[38, 62, 116], [18, 30, 58], [86, 118, 176]] }
  ];

  var W = 320; // 内部绘制宽度（低分辨率 → 放大后柔化）
  var instances = [];
  var running = [];
  var ticking = false;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rand(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function Scene(el) {
    this.el = el;
    this.tone = parseInt(el.getAttribute("data-scene") || "0", 10) % PALETTES.length;
    this.seed = parseFloat(el.getAttribute("data-scene-seed") || "1") || 1;
    this.canvas = document.createElement("canvas");
    el.insertBefore(this.canvas, el.firstChild);
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.active = false;
    this.blobs = [];
    var p = PALETTES[this.tone];
    for (var i = 0; i < 5; i++) {
      var s = this.seed * 3.7 + i * 11.3;
      this.blobs.push({
        x: rand(s) ,
        y: rand(s + 1.7),
        r: 0.28 + rand(s + 4.2) * 0.5,
        c: p.lights[i % p.lights.length],
        sx: 0.05 + rand(s + 8.1) * 0.09,
        sy: 0.04 + rand(s + 2.9) * 0.08,
        ph: rand(s + 6.4) * Math.PI * 2,
        amp: 0.12 + rand(s + 9.9) * 0.22,
        pulse: 0.1 + rand(s + 3.3) * 0.25
      });
    }
    this.resize();
    this.draw(0);
  }

  Scene.prototype.resize = function () {
    var rect = this.el.getBoundingClientRect();
    var ratio = rect.height > 0 ? rect.width / rect.height : 16 / 9;
    this.canvas.width = W;
    this.canvas.height = Math.max(2, Math.round(W / (ratio || 1.777)));
    this.draw(this.lastT || 0);
  };

  Scene.prototype.draw = function (t) {
    this.lastT = t;
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var p = PALETTES[this.tone];

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgb(" + p.base[0] + "," + p.base[1] + "," + p.base[2] + ")";
    ctx.fillRect(0, 0, w, h);

    // 缓慢推镜：整体轻微放大
    var zoom = 1 + Math.sin(t * 0.06 + this.seed) * 0.045;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h / 2);

    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < this.blobs.length; i++) {
      var b = this.blobs[i];
      var cx = (b.x + Math.sin(t * b.sx + b.ph) * b.amp) * w;
      var cy = (b.y + Math.cos(t * b.sy + b.ph * 1.3) * b.amp * 0.7) * h;
      var r = b.r * Math.min(w, h) * (1 + Math.sin(t * b.pulse + b.ph) * 0.18);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(4, r));
      var a = 0.55;
      g.addColorStop(0, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + "," + a + ")");
      g.addColorStop(0.55, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + "," + a * 0.28 + ")");
      g.addColorStop(1, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(4, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 底部压暗（模拟镜头自然衰减）
    ctx.globalCompositeOperation = "source-over";
    var vg = ctx.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0, "rgba(0,0,0,0.35)");
    vg.addColorStop(0.45, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  };

  function loop(now) {
    if (!ticking) return;
    var t = now * 0.001;
    for (var i = 0; i < running.length; i++) running[i].draw(t);
    requestAnimationFrame(loop);
  }

  function start() {
    if (ticking || reduce) return;
    ticking = true;
    requestAnimationFrame(loop);
  }

  var io = null;
  function observe(scene) {
    if (!io) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            var s = e.target.__scene;
            if (!s) return;
            s.active = e.isIntersecting;
            var idx = running.indexOf(s);
            if (e.isIntersecting && idx === -1) running.push(s);
            if (!e.isIntersecting && idx > -1) running.splice(idx, 1);
          });
          if (running.length) start();
        },
        { rootMargin: "20% 0px" }
      );
    }
    io.observe(scene.el);
  }

  function mount(root) {
    root = root || document;
    var nodes = root.querySelectorAll("[data-scene]:not([data-scene-mounted])");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.setAttribute("data-scene-mounted", "");
      var s = new Scene(el);
      el.__scene = s;
      instances.push(s);
      if (reduce) { s.draw(0); } else { observe(s); }
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      instances.forEach(function (s) { s.resize(); });
    }, 200);
  });

  return { mount: mount, palettes: PALETTES };
})();

/* =============================================================
   真实媒体挂载器（SLMedia）
   把 [data-media-src] 元素转成真实 <video> / <img>：
   - video：进视口播放、出视口暂停（后台标签页全暂停）
   - 声音：默认静音（浏览器自动播放策略要求），用户点一次
     声音开关后全局解锁，此后进入视口的视频带声播放
   - 图片：懒加载静帧
   - 文件缺失或解码失败时回退程序化场景，绝不出现黑块

   对外接口：
     SLMedia.mount(root)      挂载
     SLMedia.setSound(bool)   开/关声音
     SLMedia.toggleSound()    切换
     SLMedia.isSoundOn()      查询
     SLMedia.onSoundChange(fn) 订阅状态变化
   ============================================================= */
window.SLMedia = (function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entries = [];
  var videos = [];
  var MAX_RETRY = 8;

  /* 声音状态：默认关。可能从 localStorage 恢复上次选择。
     注意：jsdom / 不透明来源下**读 localStorage 属性本身**就会抛
     SecurityError，所以取值也必须包 try。 */
  var soundOn = false;
  try {
    if (window.localStorage && window.localStorage.getItem("sl-sound") === "on") soundOn = true;
  } catch (e) {}
  var soundListeners = [];

  function emitSound() {
    soundListeners.forEach(function (fn) {
      try {
        fn(soundOn);
      } catch (e) {}
    });
  }

  function applySound() {
    entries.forEach(function (en) {
      var v = en.media;
      if (!v || v.tagName !== "VIDEO") return;
      /* 只有标记 data-media-audio="on" 的才允许出声 */
      var allowed = soundOn && en.el.getAttribute("data-media-audio") === "on";
      v.muted = !allowed;
      v.defaultMuted = !allowed;
      v.volume = allowed ? 1 : 0;
      if (allowed) {
        v.removeAttribute("muted");
        /* 开了声音后必须重新 play 一次，否则部分浏览器不重建音频轨 */
        if (en.inView && !reduce) tryPlay(en);
      } else {
        v.setAttribute("muted", "");
      }
    });
  }

  function setSound(on) {
    soundOn = !!on;
    try {
      if (window.localStorage) window.localStorage.setItem("sl-sound", soundOn ? "on" : "off");
    } catch (e) {}
    applySound();
    emitSound();
  }

  function toggleSound() {
    setSound(!soundOn);
    return soundOn;
  }

  function onSoundChange(fn) {
    soundListeners.push(fn);
    fn(soundOn);
  }

  /* 视频就绪前先复用程序化场景，避免直接切到黑底 */
  function keepProceduralFallback(el, media, reason) {
    media.style.opacity = "0";
    media.style.visibility = "hidden";
    media.dataset.slFailed = "1";
    if (reason) console.warn("[SLMedia] 视频不可用，已回退程序化场景:", media.src, "-", reason);
  }

  /* 全屏播放器是否正开着。
     背景视频必须让路：否则 IntersectionObserver 会在播放器打开后
     继续把首屏视频 play() 起来，出现"弹层在放、背景也在放"的两路声音。 */
  function playerBusy() {
    if (window.SLPlayer && window.SLPlayer.isOpen && window.SLPlayer.isOpen()) return true;
    if (window.SLProjectView && window.SLProjectView.isOpen && window.SLProjectView.isOpen()) return true;
    return false;
  }

  /* 播放：失败则退避重试，直到成功或超出上限 */
  function tryPlay(entry) {
    var media = entry.media;
    if (entry.dead || media.dataset.slFailed === "1") return;
    if (!entry.inView || document.hidden) return;
    /* 播放器开着的时候不抢播放权 */
    if (playerBusy()) return;

    var p = media.play();
    if (!p || !p.then) return;

    p.then(function () {
      entry.retries = 0;
      media.style.opacity = "1";
      media.style.visibility = "visible";
      /* 首帧解码完成后再启用手动 seek，避免 InvalidStateError */
      if (media.readyState >= 2 && media.dataset.slSeeked !== "1" && media.dataset.autoplayFirstFrame !== "no") {
        media.dataset.slSeeked = "1";
        try { media.currentTime = 0.001; } catch (err) {}
      }
    }).catch(function () {
      entry.retries++;
      if (entry.retries > MAX_RETRY) {
        entry.dead = true;
        keepProceduralFallback(entry.el, media, "重试 " + MAX_RETRY + " 次仍无法播放");
        return;
      }
      /* 退避重试：解码未开始（readyState 0）时等更久 */
      var delay = Math.min(240 * Math.pow(1.6, entry.retries), 2400);
      clearTimeout(entry.retryTimer);
      entry.retryTimer = setTimeout(function () { tryPlay(entry); }, delay);
    });
  }

  function pause(entry) {
    clearTimeout(entry.retryTimer);
    entry.media.pause();
  }

  var io = null;
  function observe(entry) {
    if (!io) {
      io = new IntersectionObserver(
        function (entriesIn) {
          entriesIn.forEach(function (e) {
            var item = e.target.__mediaEntry;
            if (!item) return;
            item.inView = e.isIntersecting;
            if (e.isIntersecting && !reduce) tryPlay(item);
            else pause(item);
          });
        },
        { rootMargin: "25% 0px", threshold: 0.01 }
      );
    }
    io.observe(entry.el);
  }

  /* 挂载标记必须是「本次会话」的 token，不能是一个固定值。
     可视化编辑器会把运行时的 DOM 连同 data-media-mounted 一起序列化回 HTML；
     下次加载时 mount() 看到这个标记就整块跳过 —— 于是 el.__mediaEntry 为空，
     播放器的 resumeBackground()（依赖 __mediaEntry.inView）彻底失效，
     表现为「退出播放后背景视频不再恢复」。旧写死的标记一律不认。 */
  var MOUNT_TOKEN = "m" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);

  function mount(root) {
    root = root || document;
    var nodes = root.querySelectorAll("[data-media-src]");
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.getAttribute("data-media-mounted") === MOUNT_TOKEN) return;
      /* 上一次会话被写死留下的 <video>/<img>，先清掉，避免叠播两份 */
      Array.prototype.forEach.call(
        el.querySelectorAll("video.media-el, img.media-el"),
        function (old) { if (old.parentNode) old.parentNode.removeChild(old); }
      );
      el.setAttribute("data-media-mounted", MOUNT_TOKEN);
      var src = el.getAttribute("data-media-src") || "";
      var kind = el.getAttribute("data-media-kind") || "video";
      var poster = el.getAttribute("data-media-poster") || "";
      if (!src) return;

      var media;
      if (kind === "video") {
        media = document.createElement("video");
        /* 默认静音：满足自动播放策略。开启声音后由 applySound() 解除 */
        media.muted = true;
        media.defaultMuted = true;
        media.loop = true;
        media.playsInline = true;
        media.autoplay = true;
        media.preload = "auto";
        media.setAttribute("muted", "");
        media.setAttribute("loop", "");
        media.setAttribute("playsinline", "");
        media.setAttribute("webkit-playsinline", "");
        media.setAttribute("autoplay", "");
        media.setAttribute("preload", "auto");
        if (poster) media.setAttribute("poster", poster);
        media.className = "media-el";
        media.style.opacity = "0";
        media.style.transition = "opacity 0.6s var(--ease-expo-out)";

        media.addEventListener("error", function () {
          keepProceduralFallback(el, media, "加载失败");
        });
        media.addEventListener("stalled", function () {
          setTimeout(function () { tryPlay(entry); }, 600);
        });
        /* 数据够一帧就点亮，不等整段 */
        media.addEventListener("loadeddata", function () {
          if (entry.inView && !reduce && media.paused) tryPlay(entry);
        });
        media.addEventListener("canplay", function () {
          if (entry.inView && !reduce && media.paused) tryPlay(entry);
        });
        /* 被浏览器暂停（省电/策略）时，回到前台或再次进入视口要恢复 */
        media.addEventListener("pause", function () {
          if (entry.inView && !document.hidden && !reduce && !entry.dead) {
            setTimeout(function () {
              if (entry.inView && media.paused && media.dataset.slFailed !== "1") tryPlay(entry);
            }, 260);
          }
        });

        el.__videoEl = media;
        videos.push(media);
      } else {
        media = document.createElement("img");
        media.loading = "lazy";
        media.decoding = "async";
        media.alt = el.getAttribute("data-media-alt") || "";
        media.className = "media-el";
        media.style.opacity = "0";
        media.style.transition = "opacity 0.6s var(--ease-expo-out)";
        media.addEventListener("load", function () { media.style.opacity = "1"; });
        media.addEventListener("error", function () { media.style.visibility = "hidden"; });
      }

      var entry = {
        el: el,
        media: media,
        inView: false,
        retries: 0,
        dead: false,
        retryTimer: null,
      };
      el.__mediaEntry = entry;
      entries.push(entry);

      media.src = src;
      el.insertBefore(media, el.firstChild);
      if (kind === "video" && !reduce) observe(entry);
    });

    /* 挂载完立刻套用一次声音状态 */
    applySound();
  }

  /* 页面隐藏时全部暂停（省电与带宽）；回来时重试播放 */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      videos.forEach(function (v) { v.pause(); });
    } else {
      entries.forEach(function (en) {
        if (en.inView && en.media.tagName === "VIDEO") tryPlay(en);
      });
    }
  });

  /* 首次用户交互兜底：某些浏览器只在交互后才放行播放 */
  var armed = false;
  function armOnGesture() {
    if (armed) return;
    armed = true;
    entries.forEach(function (en) {
      if (en.inView && en.media.tagName === "VIDEO") tryPlay(en);
    });
  }
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(function (evt) {
    window.addEventListener(evt, armOnGesture, { once: true, passive: true });
  });

  return {
    mount: mount,
    setSound: setSound,
    toggleSound: toggleSound,
    isSoundOn: function () { return soundOn; },
    onSoundChange: onSoundChange,
    entries: function () { return entries; }
  };
})();
