(function () {
  const cfg = window.BDAY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = !!window.gsap;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 640px)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const COLORS = ["#ffd36e", "#ff5fa2", "#ff9ec7", "#a78bfa", "#67e8f9", "#ffffff"];

  if (!hasGsap) document.documentElement.classList.add("no-gsap");
  else gsap.registerPlugin(ScrollTrigger);

  // ── Matnlar ──────────────────────────────────────────
  $("#heroName").textContent = cfg.name;
  $("#finalName").textContent = cfg.name;
  $(".gate-kicker").textContent = `${cfg.name}, senga kichik bir sovg'a bor…`;
  document.title = `${cfg.name} — ${cfg.age} 🎂`;

  function splitChars(el) {
    const words = el.textContent.split(" ");
    el.textContent = "";
    words.forEach((word, wi) => {
      const w = document.createElement("span");
      w.className = "w";
      [...word].forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }
  $$(".split").forEach(splitChars);

  // ── Yulduzli osmon ───────────────────────────────────
  const sky = $("#sky"), sctx = sky.getContext("2d");
  let stars = [], shooting = [];
  function sizeSky() {
    sky.width = innerWidth * DPR; sky.height = innerHeight * DPR;
    const n = mobile ? 110 : 220;
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * sky.width, y: Math.random() * sky.height,
      r: (Math.random() * 1.3 + .3) * DPR, p: Math.random() * Math.PI * 2, s: Math.random() * .02 + .005,
    }));
  }
  function drawSky() {
    sctx.clearRect(0, 0, sky.width, sky.height);
    for (const s of stars) {
      s.p += s.s;
      sctx.globalAlpha = .35 + Math.sin(s.p) * .35;
      sctx.fillStyle = "#fff";
      sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 7); sctx.fill();
    }
    if (Math.random() < .006) shooting.push({ x: Math.random() * sky.width, y: Math.random() * sky.height * .4, l: 1 });
    shooting = shooting.filter((m) => m.l > 0);
    for (const m of shooting) {
      sctx.globalAlpha = m.l;
      const g = sctx.createLinearGradient(m.x, m.y, m.x - 120 * DPR, m.y - 50 * DPR);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "transparent");
      sctx.strokeStyle = g; sctx.lineWidth = 2 * DPR;
      sctx.beginPath(); sctx.moveTo(m.x, m.y); sctx.lineTo(m.x - 120 * DPR, m.y - 50 * DPR); sctx.stroke();
      m.x += 14 * DPR; m.y += 6 * DPR; m.l -= .025;
    }
    sctx.globalAlpha = 1;
    requestAnimationFrame(drawSky);
  }
  sizeSky(); drawSky();
  addEventListener("resize", sizeSky);

  // ── Sharlar ──────────────────────────────────────────
  function spawnBalloons() {
    const wrap = $("#balloons");
    const n = mobile ? 7 : 12;
    for (let i = 0; i < n; i++) {
      const b = document.createElement("div");
      b.className = "balloon";
      const c = ["#ff5fa2", "#ffd36e", "#a78bfa", "#67e8f9", "#ff8a3d", "#ff9ec7"][i % 6];
      b.style.cssText = `left:${Math.random() * 92}%;--c:${c};--w:${40 + Math.random() * 30}px;--d:${14 + Math.random() * 12}s;--delay:${-Math.random() * 20}s;--sway:${(Math.random() * 80 - 40)}px`;
      wrap.appendChild(b);
    }
  }

  // ── Konfetti ─────────────────────────────────────────
  const confetti = window.confetti || (() => {});
  function burst(x = .5, y = .6, power = 1) {
    confetti({ particleCount: Math.round(140 * power), spread: 90, startVelocity: 45 * power, origin: { x, y }, colors: COLORS, scalar: 1.1 });
  }
  function sideCannons(ms = 2500) {
    const end = Date.now() + ms;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: .75 }, colors: COLORS });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: .75 }, colors: COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  // ── Musiqa tugmasi ───────────────────────────────────
  const musicBtn = $("#musicBtn");
  musicBtn.addEventListener("click", () => {
    const on = window.Music.toggle();
    musicBtn.classList.toggle("paused", !on);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.Music.playing) { window.Music.pause(); musicBtn.classList.add("paused"); musicBtn.dataset.auto = "1"; }
    else if (!document.hidden && musicBtn.dataset.auto) { delete musicBtn.dataset.auto; window.Music.start(); musicBtn.classList.remove("paused"); }
  });

  // ── Darvoza → ochilish ───────────────────────────────
  const gift = $("#gift"), gate = $("#gate");
  let opened = false;
  gift.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    window.Music.start();
    gift.classList.add("shake");
    setTimeout(() => {
      gift.classList.remove("shake");
      gift.classList.add("open");
      burst(.5, .55, 1.2);
      const flash = $(".gate-flash");
      if (hasGsap) {
        gsap.timeline()
          .to(flash, { opacity: 1, duration: .35, ease: "power2.in" })
          .add(() => {
            gate.style.display = "none";
            document.body.classList.remove("locked");
            $("#site").removeAttribute("aria-hidden");
            musicBtn.hidden = false;
            spawnBalloons();
            startHero();
          })
          .to(flash, { opacity: 0, duration: .01 });
      } else {
        gate.style.display = "none";
        document.body.classList.remove("locked");
        musicBtn.hidden = false;
        spawnBalloons();
        startHero();
      }
    }, 550);
  });

  // ── Hero: zarrachalardan "18" ────────────────────────
  const num = $("#num"), nctx = num.getContext("2d");
  let parts = [], pointer = { x: -9999, y: -9999 }, heroRunning = false, heroVisible = true;

  function buildTargets() {
    const w = num.clientWidth, h = num.clientHeight;
    num.width = w * DPR; num.height = h * DPR;
    const off = document.createElement("canvas");
    off.width = num.width; off.height = num.height;
    const o = off.getContext("2d");
    const size = Math.min(w * .78, h * .5) * DPR;
    o.font = `800 ${size}px Outfit, sans-serif`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillStyle = "#fff";
    o.fillText(String(cfg.age), num.width / 2, num.height * .3);
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const gap = Math.round((mobile ? 6 : 7) * DPR);
    const targets = [];
    for (let y = 0; y < off.height; y += gap)
      for (let x = 0; x < off.width; x += gap)
        if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ x, y });
    return targets;
  }

  function initParticles() {
    const targets = buildTargets();
    const grad = (x) => {
      const t = x / num.width;
      return t < .5 ? `hsl(${45 - t * 2 * 70}, 100%, ${70 - t * 10}%)` : `hsl(${335 - (t - .5) * 2 * 75}, 95%, 72%)`;
    };
    parts = targets.map((t) => ({
      x: Math.random() * num.width, y: num.height + Math.random() * num.height * .5,
      tx: t.x, ty: t.y, vx: 0, vy: 0, c: grad(t.x), r: (Math.random() * 1.2 + 1.2) * DPR, d: Math.random() * 40,
    }));
  }

  function drawHero() {
    if (!heroRunning) return;
    requestAnimationFrame(drawHero);
    if (!heroVisible) return;
    nctx.clearRect(0, 0, num.width, num.height);
    const t = performance.now() / 1000;
    for (const p of parts) {
      if (p.d > 0) { p.d -= 1; continue; }
      const wob = Math.sin(t * 2 + p.tx * .01) * 1.2 * DPR;
      let ax = (p.tx - p.x) * .045, ay = (p.ty + wob - p.y) * .045;
      const dx = p.x - pointer.x, dy = p.y - pointer.y, dist = dx * dx + dy * dy, R = (70 * DPR) ** 2;
      if (dist < R) { const f = (1 - dist / R) * 9; const a = Math.atan2(dy, dx); ax += Math.cos(a) * f; ay += Math.sin(a) * f; }
      p.vx = (p.vx + ax) * .82; p.vy = (p.vy + ay) * .82;
      p.x += p.vx; p.y += p.vy;
      nctx.fillStyle = p.c;
      nctx.shadowColor = p.c; nctx.shadowBlur = mobile ? 0 : 8;
      nctx.beginPath(); nctx.arc(p.x, p.y, p.r, 0, 7); nctx.fill();
    }
  }

  const movePointer = (e) => {
    const r = num.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    pointer = { x: (pt.clientX - r.left) * DPR, y: (pt.clientY - r.top) * DPR };
  };
  num.addEventListener("pointermove", movePointer);
  num.addEventListener("touchmove", movePointer, { passive: true });
  ["pointerleave", "touchend"].forEach((ev) => num.addEventListener(ev, () => (pointer = { x: -9999, y: -9999 })));
  num.addEventListener("click", (e) => {
    burst(e.clientX / innerWidth, e.clientY / innerHeight, .5);
    for (const p of parts) { p.vx += (Math.random() - .5) * 60; p.vy += (Math.random() - .5) * 60; }
  });
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(num);

  let resizeT;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => heroRunning && initParticles(), 250); });

  function startHero() {
    document.fonts.ready.then(() => {
      initParticles();
      heroRunning = true;
      drawHero();
    });
    sideCannons(2200);
    if (!hasGsap) return;
    gsap.from("#hero .kicker .ch", { opacity: 0, y: 20, stagger: .03, duration: .6, delay: .6, ease: "back.out(2)" });
    gsap.from("#hero .hero-l1 .ch", { opacity: 0, y: 40, rotateX: -90, stagger: .025, duration: .8, delay: .9, ease: "back.out(1.7)" });
    gsap.from("#hero .name", { opacity: 0, scale: .4, filter: "blur(20px)", duration: 1.4, delay: 1.6, ease: "elastic.out(1, .6)" });
    gsap.from("#hero .sub", { opacity: 0, y: 20, duration: 1, delay: 2.4 });
    gsap.from(".scroll-hint", { opacity: 0, duration: 1, delay: 3 });
    setupScroll();
  }

  // ── Galereya ─────────────────────────────────────────
  const track = $("#track"), dotsEl = $("#dots");
  const photos = cfg.photos.length ? cfg.photos : Array.from({ length: 5 }, () => null);
  const emojis = ["🌸", "✨", "💖", "🎀", "🌷", "🦋"];
  photos.forEach((p, i) => {
    const el = document.createElement("figure");
    el.className = "photo" + (p ? "" : " placeholder");
    if (p) {
      const img = new Image();
      if (p.pos) img.style.objectPosition = p.pos;
      img.src = p.src; img.alt = p.caption || `${cfg.name} ${i + 1}`; img.loading = i < 2 ? "eager" : "lazy"; img.decoding = "async";
      el.appendChild(img);
      if (p.caption) { const c = document.createElement("figcaption"); c.className = "cap"; c.textContent = p.caption; el.appendChild(c); }
      el.addEventListener("click", () => openLightbox(p));
    } else el.textContent = emojis[i % emojis.length];
    track.appendChild(el);
    dotsEl.appendChild(document.createElement("i"));
  });
  const cards = $$(".photo", track), dots = $$("i", dotsEl);

  function coverflow() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const cm = c.offsetLeft + c.offsetWidth / 2;
      const d = (cm - mid) / c.offsetWidth;
      const ad = Math.min(Math.abs(d), 2);
      c.style.transform = `rotateY(${Math.max(-1, Math.min(1, d)) * -32}deg) scale(${1 - ad * .14}) translateZ(${-ad * 60}px)`;
      c.style.opacity = 1 - ad * .25;
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    cards.forEach((c, i) => c.classList.toggle("active", i === best));
    dots.forEach((d, i) => d.classList.toggle("on", i === best));
  }
  track.addEventListener("scroll", () => requestAnimationFrame(coverflow), { passive: true });
  addEventListener("resize", coverflow);
  coverflow();

  const lb = $("#lightbox");
  function openLightbox(p) {
    $("img", lb).src = p.src;
    $(".lb-cap", lb).textContent = p.caption || "";
    lb.hidden = false;
  }
  lb.addEventListener("click", () => (lb.hidden = true));

  // ── Maktub (typewriter) ──────────────────────────────
  const letterEl = $("#letterText");
  let typed = false;
  function typeLetter() {
    if (typed) return;
    typed = true;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    let pi = 0;
    function nextPara() {
      if (pi >= cfg.letter.length) {
        cursor.remove();
        const sig = $("#signature");
        sig.textContent = cfg.from ? `— ${cfg.from}` : "— seni yaxshi ko'radiganlar 💖";
        sig.classList.add("on");
        return;
      }
      const p = document.createElement("p");
      letterEl.appendChild(p);
      const text = cfg.letter[pi++];
      let i = 0;
      (function step() {
        p.textContent = text.slice(0, ++i);
        p.appendChild(cursor);
        if (i < text.length) setTimeout(step, reduced ? 0 : 22 + Math.random() * 30);
        else setTimeout(nextPara, 380);
      })();
    }
    nextPara();
  }

  // ── Tilaklar ─────────────────────────────────────────
  const wishIcons = ["🌟", "💖", "🍀", "🎁", "🌈", "🦋", "🌙", "🌸", "🚀", "💎", "🎈", "🔥"];
  const grid = $("#wishGrid");
  cfg.wishes.forEach((w, i) => {
    const el = document.createElement("button");
    el.className = "wish";
    el.innerHTML = `<div class="wish-in"><div class="wish-face"><b>${i + 1}</b>${wishIcons[i % wishIcons.length]}</div><div class="wish-back">${w}</div></div>`;
    el.addEventListener("click", () => {
      el.classList.toggle("flip");
      if (el.classList.contains("flip")) {
        const r = el.getBoundingClientRect();
        confetti({ particleCount: 30, spread: 60, startVelocity: 25, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: COLORS, scalar: .8 });
      }
    });
    grid.appendChild(el);
  });

  // ── Tort ─────────────────────────────────────────────
  const candles = $$(".candle");
  let blown = false;
  function blowOut() {
    if (blown) return;
    blown = true;
    candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 250));
    $("#blowBtn").disabled = true; $("#micBtn").disabled = true;
    $("#cakeLead").textContent = "Orzuing albatta ushaladi! 🌠";
    setTimeout(() => {
      burst(.5, .5, 1.4); sideCannons(3000);
      startFireworks();
      setTimeout(() => $("#final").scrollIntoView({ behavior: "smooth" }), 1400);
    }, 600);
  }
  $("#blowBtn").addEventListener("click", blowOut);

  $("#micBtn").addEventListener("click", async () => {
    const btn = $("#micBtn");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      btn.textContent = "🎤 Endi puflang…";
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const an = ac.createAnalyser(); an.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      let loud = 0;
      (function listen() {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += (v - 128) ** 2;
        const rms = Math.sqrt(sum / buf.length);
        loud = rms > 28 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 6 || blown) { stream.getTracks().forEach((t) => t.stop()); ac.close(); blowOut(); return; }
        requestAnimationFrame(listen);
      })();
    } catch {
      btn.textContent = "Mikrofon yo'q — tugmani bos";
      btn.disabled = true;
    }
  });

  // ── Mushaklar ────────────────────────────────────────
  const fw = $("#fireworks"), fctx = fw.getContext("2d");
  let rockets = [], sparks = [], fwOn = false, fwVisible = false;
  function sizeFw() { fw.width = fw.clientWidth * DPR; fw.height = fw.clientHeight * DPR; }
  function launch() {
    rockets.push({ x: fw.width * (.15 + Math.random() * .7), y: fw.height, vy: -(fw.height / 60) * (.9 + Math.random() * .3), ty: fw.height * (.12 + Math.random() * .35), c: COLORS[Math.floor(Math.random() * 5)] });
  }
  function explode(r) {
    const n = mobile ? 60 : 110;
    const heart = Math.random() < .3;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      let vx, vy;
      if (heart) { // yurak shakli
        vx = 16 * Math.sin(a) ** 3; vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
        vx *= .32 * DPR; vy *= .32 * DPR;
      } else { const s = (Math.random() * 4 + 2) * DPR; vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
      sparks.push({ x: r.x, y: r.y, vx, vy, l: 1, c: Math.random() < .2 ? "#fff" : r.c });
    }
  }
  function drawFw() {
    if (!fwOn) return;
    requestAnimationFrame(drawFw);
    if (!fwVisible) return;
    fctx.globalCompositeOperation = "destination-out";
    fctx.fillStyle = "rgba(0,0,0,.18)"; fctx.fillRect(0, 0, fw.width, fw.height);
    fctx.globalCompositeOperation = "lighter";
    if (Math.random() < .045) launch();
    rockets = rockets.filter((r) => {
      r.y += r.vy; r.vy *= .985;
      fctx.fillStyle = r.c; fctx.beginPath(); fctx.arc(r.x, r.y, 2.4 * DPR, 0, 7); fctx.fill();
      if (r.y <= r.ty || r.vy > -1) { explode(r); return false; }
      return true;
    });
    sparks = sparks.filter((s) => {
      s.x += s.vx; s.y += s.vy; s.vy += .05 * DPR; s.vx *= .985; s.vy *= .985; s.l -= .012;
      fctx.globalAlpha = Math.max(0, s.l); fctx.fillStyle = s.c;
      fctx.beginPath(); fctx.arc(s.x, s.y, 1.8 * DPR, 0, 7); fctx.fill();
      return s.l > 0;
    });
    fctx.globalAlpha = 1;
  }
  function startFireworks() {
    if (fwOn) return;
    fwOn = true; sizeFw(); drawFw();
    for (let i = 0; i < 3; i++) setTimeout(launch, i * 300);
  }
  addEventListener("resize", () => fwOn && sizeFw());
  new IntersectionObserver(([e]) => {
    fwVisible = e.isIntersecting;
    if (e.isIntersecting) startFireworks();
  }, { threshold: .3 }).observe(fw);
  fw.addEventListener("click", (e) => {
    const r = fw.getBoundingClientRect();
    explode({ x: (e.clientX - r.left) * DPR, y: (e.clientY - r.top) * DPR, c: COLORS[Math.floor(Math.random() * 5)] });
  });

  $("#replayBtn").addEventListener("click", () => {
    burst(.5, .7, 1);
    blown = false;
    candles.forEach((c) => c.classList.remove("out"));
    $("#blowBtn").disabled = false; $("#micBtn").disabled = false;
    $("#micBtn").textContent = "🎤 Puflab o'chir";
    $("#cakeLead").textContent = "Ko'zingni yum, orzu qil va shamlarni o'chir 🕯️";
    scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => { for (const p of parts) { p.x = Math.random() * num.width; p.y = num.height + Math.random() * 200; p.d = Math.random() * 40; } sideCannons(1500); }, 900);
  });

  // ── Scroll animatsiyalari ────────────────────────────
  function setupScroll() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) typeLetter(); }), { threshold: .35 });
    io.observe($("#letter .card"));
    if (!hasGsap) return;
    $$(".reveal").forEach((el) => {
      gsap.from(el, { opacity: 0, y: 60, scale: .96, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    gsap.from(".photo", { opacity: 0, y: 120, rotate: (i) => (i % 2 ? 8 : -8), stagger: .12, duration: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: "#track", start: "top 80%" }, onComplete: coverflow });
    gsap.from(".wish", { opacity: 0, scale: 0, rotate: () => Math.random() * 40 - 20, stagger: { each: .06, from: "random" }, duration: .7, ease: "back.out(2)", scrollTrigger: { trigger: "#wishGrid", start: "top 80%" } });
    gsap.from(".candle", { y: -60, opacity: 0, stagger: .2, duration: .9, ease: "bounce.out", scrollTrigger: { trigger: ".cake", start: "top 75%" } });
    gsap.to("#num", { opacity: .15, scale: .85, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  }
})();
