// Musiqa: config.tracks bo'lsa mp3 pleylist, bo'lmasa Web Audio'da sintez
// qilingan "Happy Birthday" (public domain) — music-box + pad + arpejio.
(function () {
  const MIDI = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const N = { G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79 };

  // [nota, boshlanish (bit), davomiylik (bit)] — 3/4, pickup bilan.
  const MELODY = [
    ["G4", 0, .75], ["G4", .75, .25], ["A4", 1, 1], ["G4", 2, 1], ["C5", 3, 1], ["B4", 4, 2],
    ["G4", 6, .75], ["G4", 6.75, .25], ["A4", 7, 1], ["G4", 8, 1], ["D5", 9, 1], ["C5", 10, 2],
    ["G4", 12, .75], ["G4", 12.75, .25], ["G5", 13, 1], ["E5", 14, 1], ["C5", 15, 1], ["B4", 16, 1], ["A4", 17, 2],
    ["F5", 19, .75], ["F5", 19.75, .25], ["E5", 20, 1], ["C5", 21, 1], ["D5", 22, 1], ["C5", 23, 3],
  ];
  // Akkordlar: [boshlanish, davomiylik, MIDI notalar]
  const C = [48, 55, 60, 64], G7 = [43, 55, 59, 65], F = [41, 53, 57, 60];
  const CHORDS = [[1, 3, C], [4, 3, G7], [7, 3, G7], [10, 3, C], [13, 3, C], [16, 3, F], [19, 3, C], [22, 1, G7], [23, 3, C]];
  const LOOP_BEATS = 27;
  const BPM = 96;
  const BEAT = 60 / BPM;

  let ctx, master, reverb, dry, timer, nextLoopAt = 0, loopIndex = 0, playing = false;
  let audioEl = null, trackIdx = 0;
  let introEl = null, introDone = false;

  function impulse(seconds = 2.8) {
    const rate = ctx.sampleRate, len = rate * seconds;
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    reverb = ctx.createConvolver();
    reverb.buffer = impulse();
    const wet = ctx.createGain(); wet.gain.value = .45;
    reverb.connect(wet).connect(master);
    dry = ctx.createGain(); dry.gain.value = .8;
    dry.connect(master);
  }

  function out(node, rev = .6) {
    node.connect(dry);
    const s = ctx.createGain(); s.gain.value = rev;
    node.connect(s).connect(reverb);
  }

  // Music-box / qo'ng'iroq: garmonikalar, tez hujum, uzun so'nish.
  function bell(midi, t, dur, vel = .22) {
    const f = MIDI(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + .005);
    g.gain.exponentialRampToValueAtTime(.0008, t + Math.max(1.6, dur * 2.2));
    [[1, 1], [2, .35], [3, .12], [4.2, .06]].forEach(([m, a]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f * m;
      const og = ctx.createGain(); og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t); o.stop(t + Math.max(1.8, dur * 2.4));
    });
    out(g, .7);
  }

  function pad(notes, t, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.045, t + .4);
    g.gain.setValueAtTime(.045, t + dur - .2);
    g.gain.linearRampToValueAtTime(0, t + dur + .6);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
    lp.connect(g);
    notes.slice(1).forEach((n) => {
      [-6, 6].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth"; o.frequency.value = MIDI(n); o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + .7);
      });
    });
    out(g, .9);
    // bas
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = "triangle"; b.frequency.value = MIDI(notes[0]);
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(.12, t + .03);
    bg.gain.exponentialRampToValueAtTime(.001, t + dur);
    b.connect(bg); out(bg, .2); b.start(t); b.stop(t + dur + .1);
  }

  function sparkle(notes, t, dur) {
    const tones = notes.slice(1).map((n) => n + 24);
    const steps = Math.round(dur * 2);
    for (let i = 0; i < steps; i++) bell(tones[i % tones.length] + (i % 4 === 3 ? 12 : 0), t + i * BEAT / 2, .4, .035);
  }

  function scheduleLoop(t0, idx) {
    const up = idx % 2 === 1 ? 12 : 0; // har ikkinchi aylanish oktava yuqori
    MELODY.forEach(([n, s, d]) => bell(N[n] + up, t0 + s * BEAT, d * BEAT, up ? .16 : .22));
    CHORDS.forEach(([s, d, notes]) => {
      pad(notes, t0 + s * BEAT, d * BEAT);
      if (idx > 0) sparkle(notes, t0 + s * BEAT, d);
    });
  }

  function tick() {
    while (nextLoopAt < ctx.currentTime + 1.5) {
      scheduleLoop(nextLoopAt, loopIndex++);
      nextLoopAt += LOOP_BEATS * BEAT;
    }
  }

  // ── mp3 pleylist ──
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
      const intro = window.BDAY && window.BDAY.intro;
      if (intro && !introDone) {
        if (!introEl) {
          introEl = new Audio(intro);
          introEl.addEventListener("ended", () => { introDone = true; if (playing) Music.start(); });
          // Klip ochilmasa (format/tarmoq) — to'g'ridan-to'g'ri music-box.
          introEl.addEventListener("error", () => { introDone = true; if (playing) Music.start(); });
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
          audioEl.volume = 0;
          playTrack(0);
          let v = 0;
          const fade = setInterval(() => { v = Math.min(.9, v + .05); audioEl.volume = v; if (v >= .9) clearInterval(fade); }, 120);
        } else audioEl.play().catch(() => {});
        playing = true;
        return;
      }
      if (!ctx) setup();
      ctx.resume();
      if (!timer) {
        nextLoopAt = ctx.currentTime + .15;
        tick();
        timer = setInterval(tick, 400);
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.9, ctx.currentTime, .6);
      playing = true;
    },
    pause() {
      playing = false;
      if (introEl && !introDone) { introEl.pause(); return; }
      if (audioEl) { audioEl.pause(); return; }
      if (!ctx) return;
      master.gain.setTargetAtTime(0, ctx.currentTime, .25);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 900);
    },
    toggle() { playing ? this.pause() : this.start(); return playing; },
  };

  window.Music = Music;
})();
