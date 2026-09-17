/**
 * One AudioContext, three buses (music / ambience / sfx) into a master.
 * Stages set a target mix; every change is a gain ramp (setTargetAtTime), never a jump,
 * so nothing clicks. The context is unlocked by a user gesture (PLAY, or the cat).
 */
export type MixStage =
  | "pregame"
  | "lineupIntro"
  | "lineup"
  | "highlights"
  | "iceDive"
  | "shootout"
  | "goal"
  | "tickets"
  | "final";

/** [music, ambience] bus gains per stage. The track is mastered loud, so these stay low. */
const MIX: Record<MixStage, [number, number]> = {
  pregame: [0.14, 0.3],
  lineupIntro: [0.2, 0.34],
  lineup: [0.4, 0.22],
  highlights: [0.3, 0.18],
  iceDive: [0.1, 0.26],
  shootout: [0.13, 0.22],
  goal: [0.03, 0.6],
  tickets: [0.24, 0.22],
  final: [0.15, 0.08],
};
/** Multiplier on music + ambience while an overlay (Meowdoku) is open. */
const DUCK = 0.2;
/** Final note gets a warmer (low-passed) music bed. */
const WARM_HZ = 2600;
const OPEN_HZ = 20000;

type Graph = {
  ctx: AudioContext;
  music: GainNode;
  musicTone: BiquadFilterNode;
  ambience: GainNode;
  sfx: GainNode;
};

let graph: Graph | null = null;
let musicEl: HTMLAudioElement | null = null;
let noise: AudioBuffer | null = null;
let stage: MixStage = "pregame";
let ducked = false;
let scrapeTimer = 0;

function build(): Graph | null {
  if (graph) return graph;
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  const bus = (value: number) => {
    const gain = ctx.createGain();
    gain.gain.value = value;
    gain.connect(master);
    return gain;
  };
  const music = bus(0);
  const musicTone = ctx.createBiquadFilter();
  musicTone.type = "lowpass";
  musicTone.frequency.value = OPEN_HZ;
  musicTone.connect(music);
  graph = { ctx, music, musicTone, ambience: bus(0), sfx: bus(1) };
  startCrowd(graph);
  applyMix(1);
  return graph;
}

/** Glide a param to `value` from wherever it currently is. */
function ramp(param: AudioParam, value: number, seconds: number) {
  const now = graph!.ctx.currentTime;
  if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
  else {
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
  }
  param.setTargetAtTime(value, now, seconds / 3);
}

/** Resumes (or creates) the context. Returns null when Web Audio is unavailable. */
export function audioContext() {
  const g = build();
  if (g && g.ctx.state === "suspended") void g.ctx.resume();
  return g?.ctx ?? null;
}

/** Where every SFX connects. */
export function sfxOut(): AudioNode {
  return build()!.sfx;
}

/** 2 s of shared white noise for whooshes, scrapes, crowd, paper. */
export function noiseBuffer(ctx: AudioContext) {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** Arena murmur: looped noise, band-limited to "voices", with a slow swell. */
function startCrowd({ ctx, ambience }: Graph) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 520;
  band.Q.value = 0.6;
  const level = ctx.createGain();
  level.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 0.09;
  depth.gain.value = 0.18;
  lfo.connect(depth).connect(level.gain);
  src.connect(band).connect(level).connect(ambience);
  src.start();
  lfo.start();
}

/** A skate carving somewhere on the ice. Lives on the ambience bus so it ducks with the crowd. */
function skateScrape() {
  const g = graph;
  if (!g) return;
  const { ctx } = g;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = "bandpass";
  hp.frequency.setValueAtTime(3200 + Math.random() * 1500, now);
  hp.frequency.linearRampToValueAtTime(2200, now + 0.4);
  hp.Q.value = 2.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  src.connect(hp).connect(gain).connect(g.ambience);
  src.start(now, Math.random(), 0.5);
}

function applyMix(seconds: number) {
  if (!graph) return;
  const [music, ambience] = MIX[stage];
  const k = ducked ? DUCK : 1;
  ramp(graph.music.gain, music * k, seconds);
  ramp(graph.ambience.gain, ambience * k, seconds);
  ramp(graph.musicTone.frequency, stage === "final" ? WARM_HZ : OPEN_HZ, seconds);
}

/** Call from the PLAY click (a user gesture) so browsers allow playback. */
export function startMusic(src: string) {
  const g = build();
  if (!g) return;
  void g.ctx.resume();
  if (!musicEl) {
    musicEl = new Audio(src);
    musicEl.loop = true;
    musicEl.preload = "auto";
    g.ctx.createMediaElementSource(musicEl).connect(g.musicTone);
  }
  // Replay keeps the song rolling; only a paused track restarts.
  if (musicEl.paused) void musicEl.play().catch(() => {});
}

export function setMix(next: MixStage) {
  if (next === stage && graph) return;
  stage = next;
  // The goal cut is instant-feeling; everything else breathes.
  applyMix(next === "goal" ? 0.25 : 1.6);

  window.clearInterval(scrapeTimer);
  if (next === "pregame" || next === "lineupIntro") {
    scrapeTimer = window.setInterval(() => Math.random() < 0.6 && skateScrape(), 1400);
  }
}

/** Duck music + ambience under an overlay; `false` restores the stage mix. */
export function setDuck(on: boolean) {
  ducked = on;
  applyMix(0.4);
}
