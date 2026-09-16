let activeContext: AudioContext | null = null;

/**
 * Tiny synthesized celebration sound.
 * No bundled copyrighted arena audio is required.
 */
export function playGoalCelebration() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const ctx = activeContext ?? new AudioContextClass();
  activeContext = ctx;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const start = ctx.currentTime;
  const frequencies = [147, 196, 247];

  frequencies.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index * 4;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.04);
    gain.gain.setValueAtTime(0.16, start + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.5);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 1.55);
  });
}
