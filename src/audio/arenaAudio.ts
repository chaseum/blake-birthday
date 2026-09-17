import { audioContext, noiseBuffer, sfxOut } from "./AudioDirector";

/** Synthesized arena SFX. Everything goes through the director's sfx bus. */

type Env = { at?: number; attack?: number; peak: number; length: number };

function tone(ctx: AudioContext, type: OscillatorType, freq: number, { at = 0, attack = 0.01, peak, length }: Env, dest?: AudioNode) {
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(dest ?? sfxOut());
  osc.start(t);
  osc.stop(t + length + 0.02);
  return osc;
}

function noiseHit(ctx: AudioContext, filter: BiquadFilterType, freq: number, q: number, { at = 0, attack = 0.005, peak, length }: Env) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = noiseBuffer(ctx);
  src.loop = true; // long hits (the roar) outlast the 2 s buffer
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  f.Q.value = q;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(f).connect(gain).connect(sfxOut());
  src.start(t, Math.random(), length + 0.05);
  return { freq: f.frequency, t };
}

/** PLAY confirmation. */
export function playArenaStart() {
  const ctx = audioContext();
  if (!ctx) return;
  [110, 165, 220].forEach((f, i) => tone(ctx, "sine", f, { attack: 0.04 + i * 0.03, peak: 0.06, length: 0.7 }));
  tone(ctx, "square", 880, { peak: 0.03, length: 0.08 });
}

/** Scoreboard double-blip. */
export function playScoreboardBeep() {
  const ctx = audioContext();
  if (!ctx) return;
  tone(ctx, "square", 1320, { peak: 0.035, length: 0.07 });
  tone(ctx, "square", 1320, { at: 0.11, peak: 0.035, length: 0.07 });
}

/** Short brass-ish stab per lineup player; climbs a step each time. */
export function playLineupSting(index: number) {
  const ctx = audioContext();
  if (!ctx) return;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;
  lp.connect(sfxOut());
  const root = 196 * 2 ** ([0, 2, 4, 7][index % 4] / 12);
  [1, 1.26, 1.5].forEach((ratio) =>
    tone(ctx, "sawtooth", root * ratio, { attack: 0.02, peak: 0.035, length: 0.42 }, lp),
  );
  noiseHit(ctx, "highpass", 6000, 0.7, { peak: 0.05, length: 0.18 });
}

/** Crowd shouting "STARS!": a sibilant burst, then a wall of detuned "ar" voices. */
export function playCrowdStars(at = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  noiseHit(ctx, "highpass", 4500, 0.8, { at, attack: 0.03, peak: 0.08, length: 0.2 });
  const formant = ctx.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.value = 900;
  formant.Q.value = 1.2;
  formant.connect(sfxOut());
  for (let i = 0; i < 10; i += 1) {
    const osc = tone(ctx, "sawtooth", 150 + Math.random() * 120, { at: at + 0.14 + Math.random() * 0.05, attack: 0.05, peak: 0.02, length: 0.6 }, formant);
    osc.frequency.linearRampToValueAtTime(120 + Math.random() * 60, ctx.currentTime + at + 0.75);
  }
}

export function playPuckHit(power: number) {
  const ctx = audioContext();
  if (!ctx) return;
  const osc = tone(ctx, "triangle", 165 + power * 70, { attack: 0.002, peak: 0.11 + power * 0.13, length: 0.12 });
  osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.11);
  noiseHit(ctx, "bandpass", 2500, 1, { attack: 0.002, peak: 0.08 + power * 0.08, length: 0.06 });
}

export function playSaveSound(kind: "save" | "post") {
  const ctx = audioContext();
  if (!ctx) return;
  if (kind === "post") {
    tone(ctx, "sine", 2050, { attack: 0.002, peak: 0.15, length: 0.44 });
    tone(ctx, "sine", 3120, { attack: 0.002, peak: 0.04, length: 0.25 });
  } else {
    // Pad thump + a small crowd "ohh".
    tone(ctx, "square", 210, { attack: 0.002, peak: 0.06, length: 0.16 });
    noiseHit(ctx, "lowpass", 400, 0.7, { attack: 0.002, peak: 0.2, length: 0.12 });
    noiseHit(ctx, "bandpass", 480, 0.8, { at: 0.1, attack: 0.15, peak: 0.12, length: 0.9 });
  }
}

/** Goal horn, crowd roar, then the "bing-bong" after the goal. */
export function playGoalCelebration() {
  const ctx = audioContext();
  if (!ctx) return;
  [146.8, 196, 246.9, 293.7].forEach((f, i) => {
    const osc = tone(ctx, "sawtooth", f, { attack: 0.08, peak: 0.075, length: 2.15 });
    osc.detune.value = i * 3;
  });
  const roar = noiseHit(ctx, "bandpass", 600, 0.5, { attack: 0.4, peak: 0.5, length: 4.2 });
  roar.freq.linearRampToValueAtTime(900, roar.t + 1.2);
  playBingBong(2.4);
}

export function playBingBong(at = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  tone(ctx, "sine", 1175, { at, attack: 0.005, peak: 0.12, length: 0.9 });
  tone(ctx, "sine", 880, { at: at + 0.38, attack: 0.005, peak: 0.12, length: 1.3 });
}

/** Filtered-noise swoosh for camera whips; low intensity doubles as the broadcast wipe. */
export function playWhoosh(intensity = 1) {
  const ctx = audioContext();
  if (!ctx) return;
  const hit = noiseHit(ctx, "bandpass", 300, 1.4, { attack: 0.3, peak: 0.16 * intensity, length: 0.45 });
  hit.freq.exponentialRampToValueAtTime(2600 * intensity + 400, hit.t + 0.45);
}

/** Tickets sliding up: a flurry of paper flicks. */
export function playTicketFlutter() {
  const ctx = audioContext();
  if (!ctx) return;
  for (let i = 0; i < 9; i += 1) {
    noiseHit(ctx, "highpass", 3000 + Math.random() * 2000, 0.9, { at: i * 0.05 + Math.random() * 0.02, attack: 0.003, peak: 0.07, length: 0.05 });
  }
}

export function playUiClick() {
  const ctx = audioContext();
  if (!ctx) return;
  tone(ctx, "square", 1800, { attack: 0.001, peak: 0.02, length: 0.035 });
}

/** Little meow: a sine that rises then falls through a nasal band. */
export function playMeow() {
  const ctx = audioContext();
  if (!ctx) return;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 1.5;
  band.connect(sfxOut());
  const t = ctx.currentTime;
  const osc = tone(ctx, "sawtooth", 520, { attack: 0.06, peak: 0.12, length: 0.5 }, band);
  osc.frequency.linearRampToValueAtTime(820, t + 0.16);
  osc.frequency.linearRampToValueAtTime(560, t + 0.45);
}

export function playMeowdokuPlace(cell: "empty" | "cat" | "x") {
  const ctx = audioContext();
  if (!ctx) return;
  if (cell === "cat") tone(ctx, "triangle", 988, { attack: 0.003, peak: 0.08, length: 0.15 });
  else if (cell === "x") tone(ctx, "triangle", 440, { attack: 0.003, peak: 0.05, length: 0.08 });
}

export function playMeowdokuSolved() {
  const ctx = audioContext();
  if (!ctx) return;
  [784, 988, 1175, 1568].forEach((f, i) => tone(ctx, "triangle", f, { at: i * 0.09, attack: 0.005, peak: 0.08, length: 0.5 }));
  window.setTimeout(playMeow, 450);
}
