let audioContext: AudioContext | null = null;

function getContext() {
  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

export function playArenaStart() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [110, 165, 220].forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04 + index * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.72);
  });
}

export function playPuckHit(power: number) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(165 + power * 70, now);
  oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.11);
  gain.gain.setValueAtTime(0.11 + power * 0.13, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.13);
}

export function playSaveSound(kind: "save" | "post") {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = kind === "post" ? "sine" : "square";
  oscillator.frequency.value = kind === "post" ? 2050 : 210;
  gain.gain.setValueAtTime(kind === "post" ? 0.15 : 0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "post" ? 0.44 : 0.16));
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}

export function playGoalCelebration() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [146.8, 196, 246.9, 293.7].forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index * 3;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.08);
    gain.gain.setValueAtTime(0.075, now + 1.55);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.15);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 2.2);
  });
}

/** Filtered-noise swoosh for camera whips. */
export function playWhoosh(intensity = 1) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = 0.45;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(2600 * intensity + 400, now + length);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16 * intensity, now + length * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
}
