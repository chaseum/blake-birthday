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
