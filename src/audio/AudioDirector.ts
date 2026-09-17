/**
 * One AudioContext: music / ambience / sfx buses plus two stage cues (Puck Off, the real
 * goal horn), all into a master. Stages set a target mix; every change is a gain ramp
 * (setTargetAtTime), never a jump, so nothing clicks. A user gesture (PLAY, or the cat)
 * unlocks the context.
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

type Cue = "puckOff" | "goalHorn";
type Level = { music: number; ambience: number } & Record<Cue, number>;

/**
 * Gain per stage. Canned Heat and Puck Off are mastered loud (≈ -15 dB RMS), the goal horn
 * file is ≈10 dB quieter, hence its higher number. Puck Off replaces the bed while it plays.
 */
const MIX: Record<MixStage, Level> = {
  pregame: { music: 0.14, ambience: 0.3, puckOff: 0, goalHorn: 0 },
  lineupIntro: { music: 0.02, ambience: 0.3, puckOff: 0.3, goalHorn: 0 },
  lineup: { music: 0.02, ambience: 0.2, puckOff: 0.24, goalHorn: 0 }, // room for player stings
  highlights: { music: 0.28, ambience: 0.16, puckOff: 0, goalHorn: 0 },
  iceDive: { music: 0.02, ambience: 0.24, puckOff: 0.34, goalHorn: 0 },
  shootout: { music: 0.08, ambience: 0.3, puckOff: 0, goalHorn: 0 }, // puck + ice read clearly
  goal: { music: 0, ambience: 0.18, puckOff: 0, goalHorn: 1 }, // the horn leads
  tickets: { music: 0.05, ambience: 0.14, puckOff: 0, goalHorn: 0.45 },
  final: { music: 0.13, ambience: 0.05, puckOff: 0, goalHorn: 0 },
};

/** Seconds into the file where a stage (re)starts a cue. Stages not listed let it keep rolling. */
const CUE_START: Partial<Record<MixStage, Partial<Record<Cue, number>>>> = {
  lineupIntro: { puckOff: 2.7 }, // skip the file's leading silence
  iceDive: { puckOff: 30 }, // reprise mid-song for the dive into the shootout
  goal: { goalHorn: 0.7 }, // horn starts at 0.7 s
};

/** Multiplier on everything but sfx while an overlay (Meowdoku) is open. */
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
  cueOut: GainNode;
};

type CueTrack = { el: HTMLAudioElement; gain: GainNode; startedFor: MixStage | null; stopTimer: number };

type AudioState = {
  graph: Graph | null;
  musicEl: HTMLAudioElement | null;
  cues: Partial<Record<Cue, CueTrack>>;
  noise: AudioBuffer | null;
  stage: MixStage;
  ducked: boolean;
  ambienceTimer: number;
};

// One audio state per page, kept on window. Dev hot reload re-runs this module; with plain
// module-level state the old context kept playing Canned Heat out of reach and the next PLAY
// started a second copy on top. (Vite only disposes the accepting component, not this file.)
const A: AudioState = ((window as typeof window & { __arenaAudio?: AudioState }).__arenaAudio ??= {
  graph: null,
  musicEl: null,
  cues: {},
  noise: null,
  stage: "pregame",
  ducked: false,
  ambienceTimer: 0,
});
const cues = A.cues;

function build(): Graph | null {
  if (A.graph) return A.graph;
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
  A.graph = { ctx, music, musicTone, ambience: bus(0), sfx: bus(1), cueOut: bus(1) };
  startArenaBed(A.graph);
  applyMix(1);
  return A.graph;
}

/** Glide a param to `value` from wherever it currently is. */
function ramp(param: AudioParam, value: number, seconds: number) {
  const now = A.graph!.ctx.currentTime;
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
  if (!A.noise) {
    A.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = A.noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return A.noise;
}

// ---------- Arena bed: continuous crowd + building hum ----------

function loopNoise(ctx: AudioContext) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  src.start(0, Math.random() * 2);
  return src;
}

function startArenaBed({ ctx, ambience }: Graph) {
  // Crowd murmur: band-limited to "voices", with a slow swell.
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
  loopNoise(ctx).connect(band).connect(level).connect(ambience);
  lfo.start();

  // Building rumble: HVAC / ice plant under everything.
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 110;
  const hum = ctx.createGain();
  hum.gain.value = 0.9;
  loopNoise(ctx).connect(low).connect(hum).connect(ambience);
}

// ---------- Arena details: short, randomly panned one-shots on the ambience bus ----------

type Shot = { at?: number; attack?: number; peak: number; length: number };

function panned(ctx: AudioContext, spread = 0.8) {
  const pan = ctx.createStereoPanner();
  pan.pan.value = (Math.random() * 2 - 1) * spread;
  pan.connect(A.graph!.ambience);
  return pan;
}

function envelope(ctx: AudioContext, dest: AudioNode, { at = 0, attack = 0.005, peak, length }: Shot) {
  const t = ctx.currentTime + at;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  gain.connect(dest);
  return { gain, t };
}

function noiseShot(ctx: AudioContext, dest: AudioNode, type: BiquadFilterType, from: number, to: number, q: number, shot: Shot) {
  const { gain, t } = envelope(ctx, dest, shot);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + shot.length);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.connect(filter).connect(gain);
  src.start(t, Math.random(), shot.length + 0.05);
}

function toneShot(ctx: AudioContext, dest: AudioNode, type: OscillatorType, from: number, to: number, shot: Shot) {
  const { gain, t } = envelope(ctx, dest, shot);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + shot.length);
  osc.connect(gain);
  osc.start(t);
  osc.stop(t + shot.length + 0.05);
  return osc;
}

const DETAILS = {
  /** A skater carving, sometimes a double stride. */
  skate(ctx: AudioContext) {
    const out = panned(ctx);
    const f = 3200 + Math.random() * 1500;
    noiseShot(ctx, out, "bandpass", f, 2200, 2.5, { attack: 0.12, peak: 0.16, length: 0.45 });
    if (Math.random() < 0.5) noiseShot(ctx, out, "bandpass", f * 0.9, 2000, 2.5, { at: 0.4, attack: 0.1, peak: 0.12, length: 0.4 });
  },
  /** Two sticks tapping the ice. */
  stickTap(ctx: AudioContext) {
    const out = panned(ctx);
    const gap = 0.12 + Math.random() * 0.1;
    for (const at of [0, gap]) {
      noiseShot(ctx, out, "bandpass", 1900, 1500, 4, { at, attack: 0.001, peak: 0.22, length: 0.04 });
      toneShot(ctx, out, "triangle", 950, 700, { at, attack: 0.001, peak: 0.06, length: 0.05 });
    }
  },
  /** Stick touch, then the puck sliding away. */
  puckSlide(ctx: AudioContext) {
    const out = panned(ctx);
    toneShot(ctx, out, "triangle", 320, 180, { attack: 0.001, peak: 0.1, length: 0.06 });
    noiseShot(ctx, out, "bandpass", 1100, 450, 1.2, { at: 0.02, attack: 0.05, peak: 0.1, length: 0.7 });
  },
  /** Puck into the boards: low thump plus a short glass rattle. */
  boards(ctx: AudioContext) {
    const out = panned(ctx, 1);
    toneShot(ctx, out, "sine", 95, 45, { attack: 0.002, peak: 0.3, length: 0.18 });
    noiseShot(ctx, out, "lowpass", 400, 150, 0.7, { attack: 0.002, peak: 0.25, length: 0.12 });
    noiseShot(ctx, out, "highpass", 2600, 3200, 0.7, { at: 0.02, attack: 0.003, peak: 0.05, length: 0.28 });
  },
  /** A distant referee whistle (pea-whistle trill). Rare. */
  whistle(ctx: AudioContext) {
    const out = panned(ctx, 0.5);
    const osc = toneShot(ctx, out, "sine", 2950, 2900, { attack: 0.02, peak: 0.05, length: 0.45 });
    const trill = ctx.createOscillator();
    const depth = ctx.createGain();
    trill.frequency.value = 28;
    depth.gain.value = 90;
    trill.connect(depth).connect(osc.frequency);
    trill.start();
    trill.stop(ctx.currentTime + 0.5);
  },
  /** The crowd noticing something. */
  crowdSwell(ctx: AudioContext) {
    noiseShot(ctx, panned(ctx, 0.4), "bandpass", 420, 560, 0.7, { attack: 1, peak: 0.28, length: 2.6 });
  },
};
type Detail = keyof typeof DETAILS;

/** Relative odds of each detail per stage, plus how often anything happens (per 0.8 s tick). */
const ICE: Partial<Record<Detail, number>> = { skate: 4, stickTap: 2, puckSlide: 2, boards: 1, crowdSwell: 1 };
const STANDS: Partial<Record<Detail, number>> = { crowdSwell: 2, skate: 1 };
const DETAIL_MIX: Record<MixStage, [number, Partial<Record<Detail, number>>]> = {
  pregame: [0.6, { ...ICE, whistle: 0.3 }],
  lineupIntro: [0.6, ICE],
  lineup: [0.2, STANDS],
  highlights: [0.15, STANDS],
  iceDive: [0.7, ICE],
  shootout: [0.35, { skate: 3, stickTap: 3, crowdSwell: 1 }], // the game makes its own puck sounds
  goal: [0, {}],
  tickets: [0.15, { crowdSwell: 1 }],
  final: [0, {}],
};

function arenaTick() {
  const g = A.graph;
  const [chance, odds] = DETAIL_MIX[A.stage];
  if (!g || g.ctx.state !== "running" || Math.random() > chance) return;
  const entries = Object.entries(odds) as [Detail, number][];
  let roll = Math.random() * entries.reduce((sum, [, w]) => sum + w, 0);
  const pick = entries.find(([, w]) => (roll -= w) < 0)?.[0];
  if (pick) DETAILS[pick](g.ctx);
}

/** Contextual one-shots the game can ask for (e.g. a wide shot hitting the boards). */
export function playArenaDetail(name: Detail) {
  const ctx = audioContext();
  if (ctx) DETAILS[name](ctx);
}

// ---------- Mix ----------

function cueTrack(name: Cue, src: string): CueTrack {
  const g = A.graph!;
  let track = cues[name];
  if (!track) {
    const el = new Audio(src);
    el.preload = "auto";
    const gain = g.ctx.createGain();
    gain.gain.value = 0;
    g.ctx.createMediaElementSource(el).connect(gain).connect(g.cueOut);
    track = cues[name] = { el, gain, startedFor: null, stopTimer: 0 };
  }
  return track;
}

function applyMix(seconds: number) {
  if (!A.graph) return;
  const level = MIX[A.stage];
  const k = A.ducked ? DUCK : 1;
  ramp(A.graph.music.gain, level.music * k, seconds);
  ramp(A.graph.ambience.gain, level.ambience * k, seconds);
  ramp(A.graph.musicTone.frequency, A.stage === "final" ? WARM_HZ : OPEN_HZ, seconds);

  for (const name of Object.keys(cues) as Cue[]) {
    const track = cues[name]!;
    const target = level[name];
    window.clearTimeout(track.stopTimer);
    ramp(track.gain.gain, target * k, seconds);

    const from = CUE_START[A.stage]?.[name];
    if (target > 0 && from !== undefined && track.startedFor !== A.stage) {
      track.startedFor = A.stage;
      track.el.currentTime = from;
      void track.el.play().catch(() => {});
    } else if (target === 0 && !track.el.paused) {
      // Pause once the fade is inaudible, so a later stage can restart it cleanly.
      track.stopTimer = window.setTimeout(() => {
        track.el.pause();
        track.startedFor = null;
      }, seconds * 2000);
    }
  }
}

/** Call from the PLAY click (a user gesture) so browsers allow playback. */
export function startMusic(src: string, cueSrc: Record<Cue, string>) {
  const g = build();
  if (!g) return;
  void g.ctx.resume();
  if (!A.musicEl) {
    A.musicEl = new Audio(src);
    A.musicEl.loop = true;
    A.musicEl.preload = "auto";
    g.ctx.createMediaElementSource(A.musicEl).connect(g.musicTone);
    // Prime the cues inside this gesture (iOS won't start them later otherwise). They are at gain 0.
    for (const name of Object.keys(cueSrc) as Cue[]) {
      const { el } = cueTrack(name, cueSrc[name]);
      void el.play().then(() => cues[name]!.startedFor === null && el.pause(), () => {});
    }
  }
  // Replay keeps the song rolling; only a paused track restarts.
  if (A.musicEl.paused) void A.musicEl.play().catch(() => {});
}

export function setMix(next: MixStage) {
  if (next === A.stage && A.graph) return;
  A.stage = next;
  // The goal hit is instant; everything else breathes.
  applyMix(next === "goal" ? 0.25 : next === "iceDive" ? 0.6 : 1.6);
  window.clearInterval(A.ambienceTimer);
  A.ambienceTimer = window.setInterval(arenaTick, 800);
}

/** Duck music, cues and ambience under an overlay; `false` restores the stage mix. */
export function setDuck(on: boolean) {
  A.ducked = on;
  applyMix(0.4);
}
