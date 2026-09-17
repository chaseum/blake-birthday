// Run: npm run check — surface mapping, camera framing, shootout difficulty, bonus puzzle.
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

// Shootout: rules + difficulty window (one goal should take roughly 2–5 tries).
import { makeNet, shotOutcome } from "../src/game/shootout.ts";
import { difficultyStats } from "./shootout.sim.ts";
{
  const net = makeNet(240, 113);
  assert.equal(shotOutcome(180, 100, net, []), "wide");
  assert.equal(shotOutcome(net.left, 100, net, []), "post");
  assert.equal(shotOutcome(240, net.top + 1, net, []), "crossbar");
  assert.equal(shotOutcome(240, 100, net, [{ x: 230, y: 90, w: 20, h: 20 }]), "save");
  assert.equal(shotOutcome(240, 100, net, []), "goal");
  const stats = difficultyStats();
  assert.ok(stats.mean >= 2 && stats.mean <= 5, `mean attempts ${stats.mean}`);
  assert.ok(stats.withinFive >= 0.85, `within five ${stats.withinFive}`);
  assert.ok(stats.firstTry <= 0.4, `first try ${stats.firstTry}`);
  console.log("shootout ok", stats);
}

// Bonus puzzle: exactly one valid placement.
import { REGIONS, SIZE, checkBoard, emptyBoard } from "../src/puzzle/starPuzzle.ts";
{
  const solutions: number[][] = [];
  const perm = (cols: number[]) => {
    if (cols.length === SIZE) {
      const board = emptyBoard();
      cols.forEach((c, r) => (board[r][c] = "star"));
      if (checkBoard(board).solved) solutions.push(cols);
      return;
    }
    for (let c = 0; c < SIZE; c += 1) if (!cols.includes(c)) perm([...cols, c]);
  };
  perm([]);
  assert.equal(REGIONS.every((row) => row.length === SIZE), true);
  assert.equal(solutions.length, 1, `puzzle solutions: ${JSON.stringify(solutions)}`);
  console.log("puzzle ok");
}
