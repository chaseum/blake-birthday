// Run: npm run check  — fails if the surface mapping or camera framing math breaks.
import assert from "node:assert/strict";
import { ARENA, SURFACES, frameShot, quadTransform } from "../src/arena/geometry.ts";

const q = SURFACES.screen;
const m = quadTransform(960, 540, q).slice(9, -1).split(",").map(Number);
const project = (X: number, Y: number) => {
  const w = m[3] * X + m[7] * Y + m[15];
  return [(m[0] * X + m[4] * Y + m[12]) / w, (m[1] * X + m[5] * Y + m[13]) / w];
};
[[0, 0], [960, 0], [960, 540], [0, 540]].forEach(([X, Y], i) => {
  const [x, y] = project(X, Y);
  assert.ok(Math.abs(x - q[i][0]) < 1e-3 && Math.abs(y - q[i][1]) < 1e-3, `corner ${i}: ${x},${y}`);
});

const f = frameShot({ x: 0, y: 0, w: 10, h: 10 }, 1280, 720);
assert.ok(f.cx - 640 / f.scale >= 0 && f.cy - 360 / f.scale >= 0, "shot clamps to photo edge");
const wide = frameShot({ x: 0, y: 0, w: ARENA.width, h: ARENA.height }, 375, 812);
assert.ok(wide.scale * ARENA.height >= 812 - 1e-6, "cover on portrait");
console.log("geometry ok");
