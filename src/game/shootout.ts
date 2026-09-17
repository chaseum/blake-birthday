/**
 * Shootout rules + goalie AI. Pure (no canvas, no React) so `npm run check`
 * can simulate shots and keep the difficulty in the 2–5 attempt window.
 * All units are logical pixels / seconds.
 */

export type Part = readonly [x: number, y: number, w: number, h: number, color: string];
export type Box = { x: number; y: number; w: number; h: number };
export type Pose = "stance" | "butterfly" | "reachL" | "reachR" | "padL" | "padR";
export type Outcome = "goal" | "post" | "crossbar" | "wide" | "save";

/** Goal mouth: posts sit just outside left/right, crossbar just above top. */
export type Net = { left: number; right: number; top: number; line: number };

export const TUNING = {
  netWidth: 80,
  netHeight: 32,
  post: 2,
  shotSpeedMin: 150,
  shotSpeedMax: 400,
  chargeTime: 0.75,
  goalieMaxSpeed: 70,
  goalieAccel: 500,
  reaction: 0.16,
  /** Every miss makes the goalie slower to react, slower to move and worse at guessing. */
  reactionPerMiss: 0.05,
  speedLossPerMiss: 0.15,
  guessError: 6,
  guessErrorPerMiss: 7,
  /** Height above the ice where the goalie reaches up instead of dropping. */
  highShot: 14,
};

// Colors are palette keys resolved by the renderer (see pixelArt.ts).
const W = "W", S = "S", D = "D", J = "J", L = "L", T = "T";

const STANCE: Part[] = [
  [-15, -12, 2, 11, T], [-15, -2, 9, 2, D], // stick
  [-10, -12, 8, 12, W], [2, -12, 8, 12, W], [-10, -7, 8, 1, S], [2, -7, 8, 1, S], // pads
  [-8, -17, 16, 5, D], // pants
  [-10, -27, 20, 10, J], [-10, -21, 20, 2, W], // jersey
  [-13, -25, 3, 7, J], [10, -25, 3, 7, J], // arms
  [-16, -20, 4, 8, W], // blocker
  [12, -21, 6, 7, D], [13, -20, 4, 4, L], // glove
  [-4, -34, 8, 7, S], [-3, -31, 6, 1, D], [-3, -29, 6, 1, D], // mask
];

const BUTTERFLY: Part[] = [
  [-17, -5, 13, 5, W], [4, -5, 13, 5, W], [-17, -3, 13, 1, S], [4, -3, 13, 1, S],
  [-6, -3, 12, 2, D],
  [-8, -11, 16, 4, D],
  [-10, -21, 20, 10, J], [-10, -15, 20, 2, W],
  [-13, -19, 3, 7, J], [10, -19, 3, 7, J],
  [-17, -15, 4, 8, W],
  [13, -16, 6, 7, D], [14, -15, 4, 4, L],
  [-4, -28, 8, 7, S], [-3, -25, 6, 1, D], [-3, -23, 6, 1, D],
];

const REACH_R: Part[] = [
  [-10, -12, 8, 12, W], [2, -10, 8, 10, W], [-10, -7, 8, 1, S], [2, -6, 8, 1, S],
  [-15, -2, 9, 2, D],
  [-7, -17, 16, 5, D],
  [-8, -27, 20, 10, J], [-8, -21, 20, 2, W],
  [-11, -25, 3, 7, J], [12, -31, 8, 3, J], // glove arm thrown up and out
  [-14, -20, 4, 8, W],
  [18, -35, 7, 7, D], [19, -34, 5, 5, L],
  [-1, -34, 8, 7, S], [0, -31, 6, 1, D], [0, -29, 6, 1, D],
];

const PAD_R: Part[] = [
  [-12, -12, 8, 12, W], [-12, -7, 8, 1, S],
  [2, -5, 21, 5, W], [2, -3, 21, 1, S], // pad stacked along the ice
  [-6, -15, 16, 5, D],
  [-7, -25, 20, 10, J], [-7, -19, 20, 2, W],
  [-10, -23, 3, 7, J], [13, -21, 3, 6, J],
  [-14, -18, 4, 8, W],
  [15, -16, 6, 7, D], [16, -15, 4, 4, L],
  [0, -32, 8, 7, S], [1, -29, 6, 1, D], [1, -27, 6, 1, D],
];

const mirror = (parts: Part[]): Part[] => parts.map(([x, y, w, h, c]) => [-x - w, y, w, h, c]);

export const GOALIE_POSES: Record<Pose, Part[]> = {
  stance: STANCE,
  butterfly: BUTTERFLY,
  reachR: REACH_R,
  reachL: mirror(REACH_R),
  padR: PAD_R,
  padL: mirror(PAD_R),
};

export function makeNet(cx: number, line: number): Net {
  const half = TUNING.netWidth / 2;
  return { left: cx - half, right: cx + half, top: line - TUNING.netHeight, line };
}

export type Goalie = {
  x: number;
  v: number;
  pose: Pose;
  /** Where the goalie *thinks* the shot is going (includes guess error). */
  guess: number | null;
};

export const makeGoalie = (x: number): Goalie => ({ x, v: 0, pose: "stance", guess: null });

/** The goalie stands a few pixels in front of the goal line. */
export const goalieBaseY = (net: Net) => net.line + 3;

export function goalieBoxes(g: Goalie, net: Net): Box[] {
  const baseY = goalieBaseY(net);
  return GOALIE_POSES[g.pose].map(([x, y, w, h]) => ({ x: g.x + x, y: baseY + y, w, h }));
}

export type Shot = { x: number; y: number; releasedAt: number };

export function difficulty(misses: number) {
  return {
    reaction: TUNING.reaction + misses * TUNING.reactionPerMiss,
    maxSpeed: TUNING.goalieMaxSpeed * Math.max(0.35, 1 - misses * TUNING.speedLossPerMiss),
    guessError: TUNING.guessError + misses * TUNING.guessErrorPerMiss,
  };
}

/**
 * Momentum-based goalie. Before a shot it drifts to cut the shooter's angle;
 * after its reaction delay it commits to a (slightly wrong) guess and a pose.
 */
export function updateGoalie(
  g: Goalie,
  dt: number,
  now: number,
  net: Net,
  shooterX: number,
  shot: Shot | null,
  misses: number,
  random: () => number = Math.random,
) {
  const { reaction, maxSpeed, guessError } = difficulty(misses);
  const cx = (net.left + net.right) / 2;
  let desired = cx + (shooterX - cx) * 0.3;

  if (!shot) {
    g.pose = "stance";
    g.guess = null;
  } else if (now - shot.releasedAt >= reaction) {
    if (g.guess === null) {
      g.guess = shot.x + (random() * 2 - 1) * guessError;
      const dx = g.guess - g.x;
      const high = net.line - shot.y > TUNING.highShot;
      if (Math.abs(dx) < 9) g.pose = high ? "stance" : "butterfly";
      else if (dx > 0) g.pose = high ? "reachR" : "padR";
      else g.pose = high ? "reachL" : "padL";
    }
    desired = g.guess;
  }

  const accel = Math.max(-TUNING.goalieAccel, Math.min(TUNING.goalieAccel, (desired - g.x) * 30 - g.v * 8));
  g.v = Math.max(-maxSpeed, Math.min(maxSpeed, g.v + accel * dt));
  g.x = Math.max(net.left + 10, Math.min(net.right - 10, g.x + g.v * dt));
}

/** Resolve a puck (4×2) arriving at the goal plane at (x, y). */
export function shotOutcome(x: number, y: number, net: Net, goalie: Box[]): Outcome {
  const p = TUNING.post;
  if (x < net.left - p - 1 || x > net.right + p + 1 || y < net.top - p - 1) return "wide";
  if (x <= net.left + 1 || x >= net.right - 1) return "post";
  if (y <= net.top + 1) return "crossbar";
  const hit = goalie.some((b) => x + 2 > b.x && x - 2 < b.x + b.w && y + 1 > b.y && y - 1 < b.y + b.h);
  return hit ? "save" : "goal";
}

export const shotSpeed = (power: number) =>
  TUNING.shotSpeedMin + (TUNING.shotSpeedMax - TUNING.shotSpeedMin) * power;

/** Aim error: weak shots wander, full charge is accurate. */
export const shotError = (power: number, random: () => number = Math.random) =>
  (random() * 2 - 1) * (1 + 3 * (1 - power));
