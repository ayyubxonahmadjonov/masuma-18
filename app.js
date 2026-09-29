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
  // Osmon 1x piksel zichlikda va ~30 fps da chiziladi: yulduzlar mayda, farqi
  // ko'rinmaydi, lekin telefon GPU'siga yuk 4–8 barobar kam.
  const sky = $("#sky"), sctx = sky.getContext("2d");
  const SDPR = 1;
  let stars = [], shooting = [], skyOdd = false;
  function sizeSky() {
    sky.width = innerWidth * SDPR; sky.height = innerHeight * SDPR;
    const n = mobile ? 110 : 220;
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * sky.width, y: Math.random() * sky.height,
      r: Math.random() * 1.3 + .4, p: Math.random() * Math.PI * 2, s: Math.random() * .02 + .005,
    }));
  }
  function drawSky() {
    requestAnimationFrame(drawSky);
    if ((skyOdd = !skyOdd)) return;
    sctx.clearRect(0, 0, sky.width, sky.height);
    sctx.fillStyle = "#fff";
    for (const s of stars) {
      s.p += s.s * 2;
      sctx.globalAlpha = .35 + Math.sin(s.p) * .35;
      sctx.fillRect(s.x, s.y, s.r, s.r);
    }
    if (Math.random() < .006) shooting.push({ x: Math.random() * sky.width, y: Math.random() * sky.height * .4, l: 1 });
    shooting = shooting.filter((m) => m.l > 0);
    for (const m of shooting) {
      sctx.globalAlpha = m.l;
      const g = sctx.createLinearGradient(m.x, m.y, m.x - 120, m.y - 50);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "transparent");
      sctx.strokeStyle = g; sctx.lineWidth = 2;
      sctx.beginPath(); sctx.moveTo(m.x, m.y); sctx.lineTo(m.x - 120, m.y - 50); sctx.stroke();
      m.x += 28; m.y += 12; m.l -= .05;
    }
    sctx.globalAlpha = 1;
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
  // Konfetti o'z canvas'ida va Web Worker'da chiziladi (OffscreenCanvas bo'lmasa
  // kutubxona o'zi oddiy rejimga qaytadi) — animatsiyalar bilan to'qnashmaydi.
  let confetti = () => {};
  if (window.confetti) {
    const cc = document.createElement("canvas");
    cc.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70";
    document.body.appendChild(cc);
    confetti = window.confetti.create(cc, { resize: true, useWorker: true, disableForReducedMotion: true });
  }
  const PK = mobile ? .6 : 1; // telefonda zarrachalar soni
  function burst(x = .5, y = .6, power = 1) {
    confetti({ particleCount: Math.round(140 * power * PK), spread: 90, startVelocity: 45 * power, origin: { x, y }, colors: COLORS, scalar: 1.1 });
  }
  function sideCannons(ms = 2500) {
    const end = Date.now() + ms * (mobile ? .75 : 1);
    let odd = false;
    (function frame() {
      if ((odd = !odd)) {
        confetti({ particleCount: mobile ? 3 : 5, angle: 60, spread: 60, origin: { x: 0, y: .75 }, colors: COLORS });
        confetti({ particleCount: mobile ? 3 : 5, angle: 120, spread: 60, origin: { x: 1, y: .75 }, colors: COLORS });
      }
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
    stopListening();
    candles.forEach((c, i) => setTimeout(() => { c.classList.add("out"); c.style.removeProperty("--blow"); }, i * 250));
    $("#blowBtn").disabled = true; $("#micBtn").disabled = true;
    $("#cakeLead").textContent = "Orzuing albatta ushaladi! 🌠";
    // Og'ir effektlar ketma-ket: avval konfetti, keyin yon to'plar, scroll esa
    // konfetti bosilgandan keyin — hammasi bir kadrga tushib qotirmasin.
    setTimeout(() => burst(.5, .5, 1.3), 500);
    setTimeout(() => sideCannons(2200), 900);
    setTimeout(() => $("#final").scrollIntoView({ behavior: "smooth" }), 2600);
  }
  $("#blowBtn").addEventListener("click", blowOut);

  // ── Puflab o'chirish (mikrofon) ──────────────────────
  // Puflash — past chastotalarda (50–500 Hz) keng shovqin. Avval 0.4 s xona
  // shovqini o'lchanadi, keyin undan ~14 dB baland past-chastota energiyasi
  // "puflash" hisoblanadi; har sham ma'lum vaqt puflashdan keyin o'chadi.
  const micBtn = $("#micBtn"), meter = $("#micMeter"), meterBar = $("#micMeter i");
  let listening = null;
  function stopListening() {
    if (!listening) return;
    const l = listening; listening = null;
    cancelAnimationFrame(l.raf);
    l.stream && l.stream.getTracks().forEach((t) => t.stop());
    l.ac.close().catch(() => {});
    window.Music.duck(false);
    meter.classList.remove("on");
    candles.forEach((c) => c.style.removeProperty("--blow"));
  }
  micBtn.addEventListener("click", async () => {
    if (listening || blown) return;
    // iOS: AudioContext aynan bosish paytida yaratilishi va resume qilinishi shart,
    // aks holda getUserMedia'dan keyin u "uxlab" qoladi va faqat jimlik keladi.
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    ac.resume();
    listening = { ac, raf: 0, stream: null };
    micBtn.textContent = "🎤 Ruxsat bering…";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (!listening) { stream.getTracks().forEach((t) => t.stop()); return; }
      listening.stream = stream;
      await ac.resume();
      window.Music.duck(true);
      const an = ac.createAnalyser();
      an.fftSize = 1024; an.smoothingTimeConstant = .35;
      ac.createMediaStreamSource(stream).connect(an);
      const freq = new Float32Array(an.frequencyBinCount);
      const hzPerBin = ac.sampleRate / an.fftSize;
      const lo = Math.max(1, Math.round(50 / hzPerBin)), hi = Math.round(500 / hzPerBin);
      const mlo = hi, mhi = Math.round(3000 / hzPerBin);
      const flo = Math.round(100 / hzPerBin), fhi = Math.round(4000 / hzPerBin);
      // Jim bin'lar -Infinity dB qaytaradi — o'rtacha NaN bo'lmasligi uchun -140 dan pastga tushirmaymiz.
      const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += Math.max(-140, freq[i]); return s / (b - a); };
      // Spektral tekislik (0..1): puflash — tekis keng shovqin (yuqori), gap/qo'shiq —
      // garmonikalar (past). Shu bilan ovoz shamlarni o'chirmaydi.
      const flatness = () => {
        let lg = 0, ar = 0;
        for (let i = flo; i < fhi; i++) { const db = Math.max(-140, freq[i]); lg += db; ar += Math.pow(10, db / 10); }
        const n = fhi - flo;
        return Math.pow(10, lg / n / 10) / (ar / n);
      };

      meter.classList.add("on");
      micBtn.textContent = "🎤 Tinglayapman…";
      const calib = []; let base = null, baseMid = null, blowMs = 0, last = performance.now(), started = last, hinted = false;
      const NEED = [320, 700]; // har sham uchun kerakli puflash (ms, jamlanadi)

      (function listen(now) {
        if (!listening) return;
        listening.raf = requestAnimationFrame(listen);
        const dt = Math.min(64, now - last); last = now;
        an.getFloatFrequencyData(freq);
        const low = band(lo, hi), mid = band(mlo, mhi);
        if (base === null) {
          // Oqim hali kelmagan kadrlar (to'liq jimlik) bazani buzmasin; mediana —
          // kalibrovka paytidagi tasodifiy shovqinga chidamli.
          if (low > -135) calib.push([low, mid]);
          if (calib.length >= 24) {
            const med = (k) => calib.map((v) => v[k]).sort((a, b) => a - b)[calib.length >> 1];
            base = med(0); baseMid = med(1);
            micBtn.textContent = "🌬️ Endi puflang!";
          }
          return;
        }
        // Kuch: past chastota bazadan qancha oshdi (o'rta chastota ham oshishi —
        // bu keng shovqin, ya'ni gap/qo'shiq emas, puflash).
        const lift = low - base, liftMid = mid - baseMid;
        const flat = flatness();
        const strength = flat > .18 ? Math.max(0, Math.min(1, (lift - 8) / 18)) : 0;
        const blowing = lift > 14 && liftMid > 10 && flat > .18;
        meterBar.style.transform = `scaleX(${Math.max(.04, strength)})`;
        meter.classList.toggle("hot", blowing);
        candles.forEach((c) => { if (!c.classList.contains("out")) c.style.setProperty("--blow", strength.toFixed(2)); });

        if (blowing) blowMs += dt; else blowMs = Math.max(0, blowMs - dt * .3);
        NEED.forEach((ms, i) => { if (blowMs >= ms && candles[i] && !candles[i].classList.contains("out")) candles[i].classList.add("out"); });
        if (blowMs >= NEED[NEED.length - 1]) { blowOut(); return; }

        if (!hinted && now - started > 9000) {
          hinted = true;
          micBtn.textContent = "💨 Kuchliroq, mikrofonga yaqin puflang";
        }
      })(last);
    } catch {
      stopListening();
      micBtn.textContent = "Mikrofon ochilmadi — tugmani bos";
      micBtn.disabled = true;
    }
  });

  // ── Mushaklar ────────────────────────────────────────
  const fw = $("#fireworks"), fctx = fw.getContext("2d");
  // Telefonda 1x piksel: to'liq ekranli "lighter" kompozitsiya 2–3x da juda og'ir.
  const FDPR = mobile ? 1 : Math.min(DPR, 1.5);
  let rockets = [], sparks = [], fwOn = false, fwVisible = false;
  function sizeFw() { fw.width = fw.clientWidth * FDPR; fw.height = fw.clientHeight * FDPR; }
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
        vx *= .32 * FDPR; vy *= .32 * FDPR;
      } else { const s = (Math.random() * 4 + 2) * FDPR; vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
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
      fctx.fillStyle = r.c; fctx.fillRect(r.x - 2 * FDPR, r.y - 2 * FDPR, 4 * FDPR, 4 * FDPR);
      if (r.y <= r.ty || r.vy > -1) { explode(r); return false; }
      return true;
    });
    sparks = sparks.filter((s) => {
      s.x += s.vx; s.y += s.vy; s.vy += .05 * FDPR; s.vx *= .985; s.vy *= .985; s.l -= .012;
      fctx.globalAlpha = Math.max(0, s.l); fctx.fillStyle = s.c;
      fctx.fillRect(s.x - 1.5 * FDPR, s.y - 1.5 * FDPR, 3 * FDPR, 3 * FDPR);
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
    explode({ x: (e.clientX - r.left) * FDPR, y: (e.clientY - r.top) * FDPR, c: COLORS[Math.floor(Math.random() * 5)] });
  });

  $("#replayBtn").addEventListener("click", () => {
    burst(.5, .7, 1);
    blown = false;
    candles.forEach((c) => c.classList.remove("out"));
    $("#blowBtn").disabled = false; $("#micBtn").disabled = false;
    stopListening();
    $("#micBtn").textContent = "🎤 Puflab o'chir";
    $("#cakeLead").textContent = "Ko'zingni yum, orzu qil va shamlarni o'chir 🕯️";
    scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => { for (const p of parts) { p.x = Math.random() * num.width; p.y = num.height + Math.random() * 200; p.d = Math.random() * 40; } sideCannons(1500); }, 900);
  });

  // ── "Pastga suring" ──────────────────────────────────
  const hint = $("#scrollHint");
  setTimeout(() => hint.classList.add("in"), 2600);
  hint.addEventListener("click", () => $("#gallery").scrollIntoView({ behavior: "smooth" }));
  addEventListener("scroll", () => hint.classList.toggle("gone", scrollY > innerHeight * .25), { passive: true });

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
