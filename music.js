// Musiqa: config.intro (bir marta) → config.tracks (mp3 pleylist) yoki
// Web Audio'da sintez qilingan pop-remiks: 91 BPM, F major (intro klipga mos) —
// baraban, bas, "nafas oluvchi" akkordlar, "Happy Birthday" (public domain)
// kuyi va I–V–vi–IV arpejio groove.
(function () {
  const BPM = 91;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // F major akkordlari: [bas, ovozlar...]
  const CHORD = { F: [65, 69, 72, 77], C: [60, 64, 67, 72], Dm: [62, 65, 69, 74], Bb: [58, 62, 65, 70] };

  // Kuy (4/4 ga moslangan): [takt ichidagi bit, MIDI nota, davomiylik bitda].
  // Manfiy bit — keyingi taktga olib kiruvchi pickup ("Hap-py").
  const PICKUP = [[-1, 72, .75], [-.25, 72, .25]];
  const MEL = [
    [[0, 74, 1], [1, 72, 1], [2, 77, 2]],
    [[0, 76, 3], [3, 72, .75], [3.75, 72, .25]],
    [[0, 74, 1], [1, 72, 1], [2, 79, 2]],
    [[0, 77, 3], [3, 72, .75], [3.75, 72, .25]],
    [[0, 84, 1], [1, 81, 1], [2, 77, 2]],
    [[0, 76, 1], [1, 74, 2], [3, 82, .75], [3.75, 82, .25]],
    [[0, 81, 1], [1, 77, 1], [2, 79, 2]],
    [[0, 77, 4]],
  ];
  // 16 taktlik aylanish: 0–7 kuy, 8–15 arpejio groove. Oldidan 2 takt intro.
  const HARM = [["F"], ["C"], ["C"], ["F"], ["F"], ["Bb"], ["F", "C"], ["F"],
                ["F"], ["C"], ["Dm"], ["Bb"], ["F"], ["C"], ["Dm"], ["Bb"]];
  const INTRO_BARS = 2;

  let ctx, master, bus, reverb, delay, duck, noiseBuf, timer, nextBarAt = 0, bar = 0, playing = false;
  let audioEl = null, trackIdx = 0, introEl = null, introDone = false;

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .005; comp.release.value = .2;
    master.connect(comp).connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = .9; bus.connect(master);

    const len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    reverb = ctx.createConvolver(); reverb.buffer = ir;
    const rv = ctx.createGain(); rv.gain.value = .35; reverb.connect(rv).connect(master);

    delay = ctx.createDelay(1); delay.delayTime.value = BEAT * .75; // nuqtali 8-lik
    const fb = ctx.createGain(); fb.gain.value = .32;
    const dl = ctx.createBiquadFilter(); dl.type = "lowpass"; dl.frequency.value = 3000;
    delay.connect(dl).connect(fb).connect(delay);
    const dw = ctx.createGain(); dw.gain.value = .28; dl.connect(dw).connect(master);

    // Akkordlar uchun sidechain ("pump") — kick urilganda pasayadi.
    duck = ctx.createGain(); duck.gain.value = 1; duck.connect(bus);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  const send = (node, rev = 0, dly = 0) => {
    if (rev) { const g = ctx.createGain(); g.gain.value = rev; node.connect(g).connect(reverb); }
    if (dly) { const g = ctx.createGain(); g.gain.value = dly; node.connect(g).connect(delay); }
  };

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
    g.gain.setValueAtTime(1.1, t); g.gain.exponentialRampToValueAtTime(.001, t + .42);
    o.connect(g).connect(bus); o.start(t); o.stop(t + .45);
    duck.gain.setValueAtTime(.35, t); duck.gain.linearRampToValueAtTime(1, t + BEAT * .55);
  }
  function noise(t, dur, type, freq, q, vol) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f).connect(g); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
    return g;
  }
  function clap(t) {
    [0, .012, .024].forEach((o, i) => { const g = noise(t + o, i === 2 ? .22 : .03, "bandpass", 1600, 1.2, .55); g.connect(bus); send(g, .5); });
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.frequency.value = 190; bg.gain.setValueAtTime(.25, t); bg.gain.exponentialRampToValueAtTime(.001, t + .1);
    b.connect(bg).connect(bus); b.start(t); b.stop(t + .12);
  }
  function hat(t, open = false, vol = .16) { noise(t, open ? .22 : .045, "highpass", 8000, .7, vol).connect(bus); }

  function bass(t, m, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sine"; o2.type = "sawtooth"; o.frequency.value = hz(m - 24); o2.frequency.value = hz(m - 24);
    f.type = "lowpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(220, t + .25);
    const g2 = ctx.createGain(); g2.gain.value = .25;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .01); g.gain.setValueAtTime(.5, t + dur - .05); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); o2.connect(g2).connect(f).connect(g); g.connect(bus);
    [o, o2].forEach((x) => { x.start(t); x.stop(t + dur + .02); });
  }

  function chords(t, notes, dur) {
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 3;
    f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(2200, t + dur * .5); f.frequency.linearRampToValueAtTime(900, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.075, t + .06); g.gain.setValueAtTime(.075, t + dur - .08); g.gain.linearRampToValueAtTime(0, t + dur);
    notes.slice(1).forEach((m) => [-9, 0, 9].forEach((det) => {
      const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + dur + .02);
    }));
    f.connect(g).connect(duck); send(g, .4);
  }

  function lead(t, m, dur, vol = .16) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "square"; o2.type = "sawtooth"; o.frequency.value = hz(m); o2.frequency.value = hz(m + 12); o2.detune.value = 6;
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.5;
    vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(dur > .6 ? 7 : 0, t + Math.min(dur, .5));
    vib.connect(vg); vg.connect(o.detune); vg.connect(o2.detune);
    f.type = "lowpass"; f.Q.value = 5; f.frequency.setValueAtTime(5200, t); f.frequency.exponentialRampToValueAtTime(1400, t + .35);
    const mix = ctx.createGain(); mix.gain.value = .5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008);
    g.gain.exponentialRampToValueAtTime(vol * .45, t + .25); g.gain.setValueAtTime(vol * .45, t + Math.max(.26, dur - .06)); g.gain.linearRampToValueAtTime(0, t + dur + .08);
    o.connect(f); o2.connect(mix).connect(f); f.connect(g).connect(bus); send(g, .45, .6);
    [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + dur + .12); });
  }

  function pluck(t, m, vol = .06) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = hz(m);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
    o.connect(g).connect(bus); send(g, .3, .5); o.start(t); o.stop(t + .32);
  }

  const pickupInto = (barStart) => PICKUP.forEach(([b, m, d]) => lead(barStart + b * BEAT, m, d * BEAT));

  function scheduleBar(t, n) {
    // Intro: faqat akkord + hi-hat, oxirida kuyga olib kiruvchi pickup.
    if (n < INTRO_BARS) {
      chords(t, CHORD[n === 0 ? "F" : "C"], BAR);
      for (let s = 0; s < 8; s++) hat(t + s * BEAT / 2 + (s % 2 ? BEAT * .06 : 0), false, s % 2 ? .08 : .12);
      if (n === INTRO_BARS - 1) { [3.5, 3.75].forEach((b) => clap(t + b * BEAT)); pickupInto(t + BAR); }
      return;
    }
    const i = (n - INTRO_BARS) % 16;
    const h = HARM[i];

    // Akkord + bas (kick bilan bir ritmda)
    h.forEach((name, k) => {
      const len = BAR / h.length, st = t + k * len, notes = CHORD[name];
      chords(st, notes, len);
      const hits = h.length === 1 ? [[0, 1.5], [1.75, .75], [2.5, 1.5]] : [[0, 1.5], [1.5, .5]];
      hits.forEach(([b, d]) => bass(st + b * BEAT, notes[0], d * BEAT * .95));
    });

    // Baraban: kick 1, 2¾, 3½; clap 2 va 4; swing'li hi-hat, har 4-taktda roll.
    for (let s = 0; s < 8; s++) hat(t + s * BEAT / 2 + (s % 2 ? BEAT * .06 : 0), s === 7 && i % 2 === 1, s % 2 ? .11 : .16);
    [0, 1.75, 2.5].forEach((b) => kick(t + b * BEAT));
    [1, 3].forEach((b) => clap(t + b * BEAT));
    if (i % 4 === 3) [3.5, 3.75].forEach((b) => hat(t + b * BEAT, false, .2));

    if (i < 8) {
      MEL[i].forEach(([b, m, d]) => lead(t + b * BEAT, m, d * BEAT));
    } else {
      h.forEach((name, k) => {
        const notes = CHORD[name].slice(1).map((m) => m + 12), steps = 16 / h.length;
        for (let s = 0; s < steps; s++) pluck(t + (k * steps + s) * BEAT / 4, notes[[0, 1, 2, 1, 2, 0, 1, 2][s % 8]], s % 4 === 0 ? .08 : .05);
      });
    }
    // Aylanish oxiri: keyingi kuyga pickup.
    if (i === 15) pickupInto(t + BAR);
  }

  function tick() {
    while (nextBarAt < ctx.currentTime + 1.2) {
      scheduleBar(nextBarAt, bar++);
      nextBarAt += BAR;
    }
  }

  function playTrack(i) {
    const list = window.BDAY.tracks;
    trackIdx = (i + list.length) % list.length;
    audioEl.src = list[trackIdx];
    audioEl.play().catch(() => {});
  }

  const Music = {
    get playing() { return playing; },
    start() {
      // iOS: AudioContext faqat bosish paytida yaratilsa/resume qilinsa ishlaydi —
      // shuning uchun klip chalinayotgan bo'lsa ham hozir "uyg'otamiz".
      if (!ctx) setup();
      ctx.resume();
      const introSrc = window.BDAY && window.BDAY.intro;
      if (introSrc && !introDone) {
        if (!introEl) {
          introEl = new Audio(introSrc);
          const next = () => { if (introDone) return; introDone = true; if (playing) Music.start(); };
          introEl.addEventListener("ended", next);
          // Klip ochilmasa (format/tarmoq) — to'g'ridan-to'g'ri sintez.
          introEl.addEventListener("error", next);
        }
        playing = true;
        introEl.play().catch(() => { introDone = true; Music.start(); });
        return;
      }
      const tracks = (window.BDAY && window.BDAY.tracks) || [];
      if (tracks.length) {
        if (!audioEl) {
          audioEl = new Audio();
          audioEl.addEventListener("ended", () => playTrack(trackIdx + 1));
          playTrack(0);
        } else audioEl.play().catch(() => {});
        playing = true;
        return;
      }
      if (!timer) {
        nextBarAt = ctx.currentTime + .1;
        tick();
        timer = setInterval(tick, 300);
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.6, ctx.currentTime, .15);
      playing = true;
    },
    pause() {
      playing = false;
      if (introEl && !introDone) { introEl.pause(); return; }
      if (audioEl) { audioEl.pause(); return; }
      if (!ctx) return;
      master.gain.setTargetAtTime(0, ctx.currentTime, .15);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 700);
    },
    // Mikrofon tinglayotganda musiqa (ayniqsa kick) puflash deb qabul qilinmasin.
    duck(on) {
      const v = on ? .12 : 1;
      if (introEl && !introDone) introEl.volume = v;
      if (audioEl) audioEl.volume = v;
      if (ctx && timer && playing) master.gain.setTargetAtTime(on ? .08 : .6, ctx.currentTime, .1);
    },
    toggle() { playing ? this.pause() : this.start(); return playing; },
  };

  window.Music = Music;
})();
