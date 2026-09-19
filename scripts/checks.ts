// Run: npm run check — surface mapping, camera framing, shootout difficulty, content + media, Meowdoku.
import assert from "node:assert/strict";
import { ARENA, SURFACES, frameShot, quadTransform } from "../src/arena/geometry.ts";

// Every quad is convex, clockwise and inside the photo.
for (const [name, quad] of Object.entries(SURFACES)) {
  quad.forEach(([x, y]) => assert.ok(x >= 0 && x <= ARENA.width && y >= 0 && y <= ARENA.height, `${name} outside photo`));
  quad.forEach((p, i) => {
    const [a, b, c] = [p, quad[(i + 1) % 4], quad[(i + 2) % 4]];
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    assert.ok(cross > 0, `${name} not convex/clockwise at corner ${i}`);
  });
}

const q = SURFACES.mainFront;
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


// Content: every configured local media path exists and is web-safe; birthday identity is consistent.
import { existsSync } from "node:fs";
import { birthday } from "../src/config.ts";
{
  const media: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === "string") {
      if (/\.(jpe?g|png|webp|gif|avif|heic|dng|svg|mp4|webm|mov|mp3|ogg|wav|m4a)$/i.test(value)) media.push(value);
    } else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(birthday);
  const missing = media.filter((src) => !src.startsWith("http") && !existsSync(new URL(`../public${src}`, import.meta.url)));
  assert.deepEqual(missing, [], `missing configured media: ${missing.map((m) => `public${m}`).join(", ")}`);
  const raw = media.filter((src) => /\.(heic|dng|mov)$/i.test(src));
  assert.deepEqual(raw, [], `not browser-safe: ${raw.join(", ")}`);

  assert.deepEqual(birthday.lineup.map((m) => m.name), ["BLAKE", "CHASE", "THE DUO", "FRITZ"]);
  assert.equal(birthday.playerNumber, String(birthday.age));
  assert.equal(birthday.lineup[0].number, birthday.playerNumber, "Blake wears his age");
  assert.equal(birthday.stats.length, birthday.memories.length, "stats pair with memories");
  assert.ok(birthday.memories.length >= 5 && birthday.memories.length <= 6, "highlights stay 5–6 slides");
  assert.ok(!JSON.stringify(birthday.memories).match(/hackathon/i), "no hackathon in highlights");
  assert.equal(birthday.finalPhotos.length, 5, "collage has five slots");
  const copy = JSON.stringify([birthday.memories, birthday.stats]);
  assert.ok(!/started talking|first met|tradeee/i.test(copy), "highlights are about Blake, not a relationship timeline");
  console.log(`media ok (${new Set(media).size} files)`);
}

// Meowdoku: exactly one valid placement.
import { REGIONS, SIZE, checkBoard, emptyBoard, markX, nextCell } from "../src/puzzle/meowdoku.ts";
{
  // Queens-style tap cycle, and dragging only ever turns empty cells into X.
  assert.deepEqual([nextCell("empty"), nextCell("x"), nextCell("cat")], ["x", "cat", "empty"]);
  const b = emptyBoard();
  b[0][1] = "cat";
  assert.equal(markX(b, 0, 0)[0][0], "x");
  assert.equal(markX(b, 0, 1), b, "drag never touches a cat");

  assert.ok(REGIONS.every((row) => row.length === SIZE));
  assert.equal(new Set(REGIONS.join("")).size, SIZE, "one region per cat");
  let solutions = 0;
  const place = (cols: number[]) => {
    if (cols.length === SIZE) {
      const board = emptyBoard();
      cols.forEach((c, r) => (board[r][c] = "cat"));
      if (checkBoard(board).solved) solutions += 1;
      return;
    }
    for (let c = 0; c < SIZE; c += 1) if (!cols.includes(c)) place([...cols, c]);
  };
  place([]);
  assert.equal(solutions, 1, `meowdoku has ${solutions} solutions`);
  console.log("meowdoku ok");
}
