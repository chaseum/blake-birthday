/**
 * 16-bit style sprite drawing. Everything is drawn in logical pixels on a
 * small canvas that CSS scales up with `image-rendering: pixelated`.
 */
import { GOALIE_POSES, type Net, type Part, type Pose } from "./shootout";

type Ctx = CanvasRenderingContext2D;

export const PAL: Record<string, string> = {
  K: "#0b1210", // outline
  W: "#eef3f2",
  S: "#9aa5a8",
  D: "#2a3136",
  J: "#5b6570", // generic slate goalie jersey
  L: "#b98a57", // glove leather
  T: "#c9a46f", // stick tape/wood
  G: "#006847", // Stars victory green
  g: "#2ee88a",
  N: "#e2a882", // skin
  R: "#d0142c",
  r: "#ff5a6e",
  B: "#1d5fa8",
  I: "#dcecef", // ice
  i: "#cfe2e6",
  j: "#eaf5f7",
  C: "#8fc3e6", // crease
  Y: "#ffd84a",
};

const rect = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = PAL[color] ?? color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

/** Classic sprite pass: all outlines first, then all fills, so parts merge cleanly. */
export function drawParts(ctx: Ctx, parts: readonly Part[], ox: number, oy: number) {
  for (const [x, y, w, h] of parts) rect(ctx, ox + x - 1, oy + y - 1, w + 2, h + 2, "K");
  for (const [x, y, w, h, c] of parts) rect(ctx, ox + x, oy + y, w, h, c);
}

/** Pixel line (Bresenham), `size` px thick. */
export function pixelLine(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, size = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    rect(ctx, x0, y0, size, size, color);
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

const DIGITS: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
};

export function pixelDigits(ctx: Ctx, text: string, x: number, y: number, color: string) {
  [...text].forEach((ch, i) =>
    DIGITS[ch]?.forEach((row, ry) =>
      [...row].forEach((on, rx) => on === "1" && rect(ctx, x + i * 4 + rx, y + ry, 1, 1, color)),
    ),
  );
}

const STAR = ["..#..", "#####", ".###.", ".#.#.", "#...#"];
export function pixelStar(ctx: Ctx, x: number, y: number, color: string) {
  STAR.forEach((row, ry) => [...row].forEach((c, rx) => c === "#" && rect(ctx, x + rx, y + ry, 1, 1, color)));
}

/** Tiny seeded PRNG so prerendered art is stable across resizes. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, fill: string | null, line: string, half = false) {
  const inside = (x: number, y: number) => (x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1;
  // `half` draws only the lower half (a crease opening toward the shooter).
  for (let y = half ? 0 : -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      if (!inside(x, y)) continue;
      const edge = !inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1);
      if (edge) rect(ctx, cx + x, cy + y, 1, 1, line);
      else if (fill) rect(ctx, cx + x, cy + y, 1, 1, fill);
    }
  }
}

export type Layout = {
  w: number;
  h: number;
  cx: number;
  net: Net;
  boardsTop: number;
  playerY: number;
};

export function makeLayout(w: number, h: number, net: Net): Layout {
  return { w, h, cx: Math.floor(w / 2), net, boardsTop: net.top - 18, playerY: Math.min(h - 26, net.line + 140) };
}

/** Two crowd frames; alternating them makes the stands bounce. */
export function renderCrowd(layout: Layout, frame: number) {
  const canvas = document.createElement("canvas");
  canvas.width = layout.w;
  canvas.height = layout.boardsTop;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(42);
  rect(ctx, 0, 0, layout.w, layout.boardsTop, "#0d1712");
  const shirts = ["G", "G", "G", "W", "K", "g", "S"];
  const hair = ["#3a2616", "#1a1a1a", "#7a5530", "#c9a46f", "#5b3a1e"];
  for (let row = 0; row * 7 < layout.boardsTop + 7; row += 1) {
    const y = layout.boardsTop - 8 - row * 7;
    rect(ctx, 0, y + 6, layout.w, 1, "#08100c"); // seat row
    for (let x = (row % 2) * 3; x < layout.w; x += 6) {
      if (rand() < 0.12) continue; // empty seat
      const bob = frame && rand() < 0.55 ? -1 : 0;
      const shirt = shirts[Math.floor(rand() * shirts.length)];
      const dim = row > 3 ? 0.55 : 1;
      ctx.globalAlpha = dim;
      rect(ctx, x, y + 3 + bob, 5, 3, shirt);
      rect(ctx, x + 1, y + bob, 3, 3, "N");
      rect(ctx, x + 1, y + bob, 3, 1, hair[Math.floor(rand() * hair.length)]);
      if (frame && rand() < 0.3) rect(ctx, x + (rand() < 0.5 ? 0 : 4), y - 2 + bob, 1, 3, "N"); // arms up
      ctx.globalAlpha = 1;
    }
  }
  return canvas;
}

/** Static rink: ice, markings, crease, boards, glass. */
export function renderRink(layout: Layout) {
  const { w, h, cx, net, boardsTop } = layout;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(7);

  rect(ctx, 0, boardsTop, w, h - boardsTop, "I");
  for (let i = 0; i < w * h * 0.03; i += 1) {
    rect(ctx, rand() * w, boardsTop + rand() * (h - boardsTop), 1, 1, rand() < 0.5 ? "i" : "j");
  }

  // Boards: white dasher, green kick stripe, little ad panels with stars.
  rect(ctx, 0, boardsTop, w, 12, "W");
  rect(ctx, 0, boardsTop, w, 1, "S");
  rect(ctx, 0, boardsTop + 10, w, 2, "G");
  for (let x = (cx % 48) - 20; x < w; x += 48) {
    rect(ctx, x, boardsTop + 2, 30, 7, x % 96 === 0 ? "G" : "D");
    pixelStar(ctx, x + 3, boardsTop + 3, "W");
    rect(ctx, x + 10, boardsTop + 5, 16, 1, "W");
  }

  // Goal line, crease, faceoff circles, hash marks.
  rect(ctx, 0, net.line, w, 2, "R");
  ellipse(ctx, cx, net.line + 1, 30, 16, "C", "R", true);

  const circleY = net.line + 70;
  for (const side of [-1, 1]) {
    const x = cx + side * 110;
    ellipse(ctx, x, circleY, 34, 22, null, "R");
    rect(ctx, x - 2, circleY - 1, 4, 3, "R");
    rect(ctx, x - 40, circleY - 3, 6, 1, "R");
    rect(ctx, x + 34, circleY - 3, 6, 1, "R");
  }
  if (net.line + 160 < h) rect(ctx, 0, net.line + 160, w, 4, "B");

  return canvas;
}

/** Net seen from the slot: mesh, red frame, dark depth. Mesh ripples on a goal. */
export function drawNet(ctx: Ctx, net: Net, ripple: { x: number; y: number; t: number } | null) {
  const { left, right, top, line } = net;
  rect(ctx, left, top, right - left, line - top, "#7f9195");
  rect(ctx, left, top, right - left, 4, "#56666a");
  for (let y = top + 1; y < line; y += 3) {
    for (let x = left + 1; x < right; x += 3) {
      const d = ripple ? Math.hypot(x - ripple.x, (y - ripple.y) * 1.6) : 99;
      const push = ripple && d < 12 ? Math.round(Math.sin(d - ripple.t * 30) * 1) : 0;
      rect(ctx, x, y + push, 1, 1, d < 6 && ripple ? "#ffffff" : "#d6e1e3");
    }
  }
  // posts + crossbar with a highlight
  rect(ctx, left - 3, top - 3, 3, line - top + 3, "R");
  rect(ctx, right, top - 3, 3, line - top + 3, "R");
  rect(ctx, left - 3, top - 3, right - left + 6, 3, "R");
  rect(ctx, left - 3, top - 3, right - left + 6, 1, "r");
  rect(ctx, left - 3, top - 3, 1, line - top + 3, "r");
  rect(ctx, left - 4, top - 4, right - left + 8, 1, "K");
}

export function drawGoalLamp(ctx: Ctx, layout: Layout, on: boolean, t: number) {
  const x = layout.cx - 4;
  const y = layout.boardsTop - 9;
  rect(ctx, x - 1, y + 5, 10, 3, "K");
  rect(ctx, x, y, 8, 6, on && Math.floor(t * 8) % 2 === 0 ? "#ff2a3a" : "#5a1016");
  rect(ctx, x + 1, y + 1, 2, 2, on ? "#ffd0d4" : "#8a2a32");
  if (!on) return;
  // rotating beams
  ctx.globalAlpha = 0.35;
  const dir = Math.sin(t * 10);
  for (let i = 0; i < 22; i += 1) {
    rect(ctx, x + 4 + dir * i * 2, y + 2 - Math.floor(i / 3), 2, 1 + Math.floor(i / 4), "#ff2a3a");
  }
  ctx.globalAlpha = 1;
}

export function drawGoalie(ctx: Ctx, pose: Pose, x: number, baseY: number) {
  // ice shadow
  ctx.globalAlpha = 0.25;
  rect(ctx, x - 14, baseY, 28, 2, "D");
  ctx.globalAlpha = 1;
  drawParts(ctx, GOALIE_POSES[pose], x, baseY);
}

/** Shooter seen from behind. `wind` 0..1 charge, `follow` 0..1 follow-through. */
export function drawPlayer(ctx: Ctx, x: number, y: number, wind: number, follow: number, number: string) {
  ctx.globalAlpha = 0.25;
  rect(ctx, x - 9, y, 18, 2, "D");
  ctx.globalAlpha = 1;

  const parts: Part[] = [
    [-6, -2, 5, 2, "S"], [1, -2, 5, 2, "S"],
    [-6, -9, 4, 7, "G"], [2, -9, 4, 7, "G"], [-6, -6, 4, 1, "W"], [2, -6, 4, 1, "W"],
    [-7, -14, 14, 5, "D"],
    [-8, -25, 16, 11, "G"], [-8, -25, 16, 2, "W"], [-8, -16, 16, 1, "W"],
    [-10, -23, 3, 7, "G"], [7, -23, 3, 7, "G"],
    [-10, -17, 3, 3, "D"], [7, -17, 3, 3, "D"],
    [-4, -31, 8, 6, "D"],
  ];
  drawParts(ctx, parts, x, y);
  rect(ctx, x - 2, y - 26, 4, 1, "N");
  rect(ctx, x - 3, y - 30, 6, 1, "#3f484e"); // helmet shine
  pixelDigits(ctx, number, x - 3, y - 22, "W");

  // Stick: rests left of the skates, winds up behind right shoulder, follows through high left.
  const idle = { x: -3, y: 0 };
  const back = { x: 18, y: -24 };
  const through = { x: -14, y: -30 };
  const end = follow > 0
    ? { x: idle.x + (through.x - idle.x) * follow, y: idle.y + (through.y - idle.y) * follow }
    : { x: idle.x + (back.x - idle.x) * wind, y: idle.y + (back.y - idle.y) * wind };
  pixelLine(ctx, x + 8, y - 16, x + end.x, y + end.y, "K", 2);
  pixelLine(ctx, x + 8, y - 17, x + end.x, y + end.y - 1, "T", 1);
  rect(ctx, x + end.x - 6, y + end.y - 1, 7, 2, "K");
}

export function drawPuck(ctx: Ctx, x: number, y: number, shadowY: number | null) {
  if (shadowY !== null && shadowY - y > 1) {
    ctx.globalAlpha = 0.3;
    rect(ctx, x - 2, shadowY, 4, 1, "D");
    ctx.globalAlpha = 1;
  }
  rect(ctx, x - 2, y - 1, 4, 2, "K");
  rect(ctx, x - 1, y - 1, 2, 1, "#4a5358");
}

export function drawTrail(ctx: Ctx, points: { x: number; y: number }[]) {
  points.forEach((p, i) => {
    ctx.globalAlpha = ((i + 1) / points.length) * 0.5;
    rect(ctx, p.x - 1, p.y, 2, 1, "#3a4a50");
  });
  ctx.globalAlpha = 1;
}

export function powerColor(power: number) {
  return power < 0.4 ? "R" : power < 0.75 ? "Y" : "g";
}

/** Vertical segmented power meter next to the shooter. */
export function drawPowerBar(ctx: Ctx, x: number, y: number, power: number) {
  const h = 26;
  rect(ctx, x - 1, y - 1, 6, h + 2, "K");
  rect(ctx, x, y, 4, h, "#1b2328");
  const fill = Math.round(h * power);
  for (let i = 0; i < fill; i += 1) {
    if (i % 3 === 2) continue;
    rect(ctx, x, y + h - 1 - i, 4, 1, powerColor(i / h));
  }
}

export function drawReticle(ctx: Ctx, x: number, y: number, color: string, blink: boolean) {
  if (blink) return;
  const c = color;
  rect(ctx, x - 4, y, 3, 1, c);
  rect(ctx, x + 2, y, 3, 1, c);
  rect(ctx, x, y - 4, 1, 3, c);
  rect(ctx, x, y + 2, 1, 3, c);
  rect(ctx, x, y, 1, 1, c);
}
