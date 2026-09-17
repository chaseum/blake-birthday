import { goalieBoxes, makeGoalie, makeNet, shotError, shotOutcome, shotSpeed, updateGoalie } from "../src/game/shootout.ts";

/** Simulates a casual player; returns attempts needed for the first goal. */
export function attemptsToScore(random: () => number, maxAttempts = 30) {
  const cx = 240, line = 113, playerY = 244;
  const net = makeNet(cx, line);
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const misses = attempt - 1;
    // Half the time they go for a corner, otherwise anywhere in the mouth.
    const corner = random() < 0.5;
    const side = random() < 0.5 ? -1 : 1;
    const aimX = corner ? cx + side * (28 + random() * 11) : net.left + 2 + random() * 76;
    const aimY = net.top + 2 + random() * 29;
    const power = 0.45 + random() * 0.55;
    const shooterX = cx + (aimX - cx) * 0.6;
    const x = aimX + shotError(power, random);
    const y = aimY + shotError(power, random) * 0.5;
    const flight = Math.hypot(x - (shooterX - 4), y - playerY) / shotSpeed(power);

    const g = makeGoalie(cx);
    for (let t = 0; t < 1.5; t += 1 / 60) updateGoalie(g, 1 / 60, t, net, shooterX, null, misses, random);
    const shot = { x, y, releasedAt: 0 };
    for (let t = 0; t < flight; t += 1 / 60) updateGoalie(g, 1 / 60, t, net, shooterX, shot, misses, random);
    if (shotOutcome(x, y, net, goalieBoxes(g, net)) === "goal") return attempt;
  }
  return maxAttempts + 1;
}

// Seeded PRNG so the check is deterministic.
export function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function difficultyStats(runs = 4000, seed = 7) {
  const random = mulberry32(seed);
  const results = Array.from({ length: runs }, () => attemptsToScore(random));
  const share = (pred: (n: number) => boolean) => results.filter(pred).length / runs;
  return {
    mean: results.reduce((a, b) => a + b, 0) / runs,
    firstTry: share((n) => n === 1),
    withinFive: share((n) => n <= 5),
    withinTwo: share((n) => n <= 2),
  };
}
