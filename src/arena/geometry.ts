/**
 * Arena coordinate system.
 *
 * Everything is measured in pixels of the source photo (public/arena/aac-interior.jpg,
 * 1920×1440). The stage renders the photo at that native size, so a surface quad
 * measured in an image editor drops straight in. Add `?calibrate` to the URL to
 * outline every surface when re-measuring.
 */

export type Point = readonly [number, number];
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Point, Point, Point, Point];
export type Rect = { x: number; y: number; w: number; h: number };

export const ARENA = { width: 1920, height: 1440 };

/**
 * Center-hung scoreboard faces, measured at 4–10× zoom on the
 * illuminated pixels only (never the bezel, truss or sponsor placards).
 *
 * Deliberately NOT mapped (they are physical, non-LED, or not visible):
 * - RYSE and paylocity sponsor placards either side of the score strip
 * - the red paylocity header on the jumbotron's left face
 * - the "American Airlines Center" crown sign
 * - the Mustang Club / TexasFord.com sign (x≈285–425, y≈433–442)
 * - the teal fascia and suite windows between ribbon rows
 * - the jumbotron's right face (hidden: the camera is left of center)
 */
const JUMBO_SURFACES = {
  // Center-hung scoreboard. Verticals lean inward toward the bottom (camera looks down).
  mainFront: [[860, 413], [1312, 405], [1298, 654], [867, 666]],
  scoreStripFront: [[923, 366], [1253, 364], [1253, 405], [923, 409]],
  tickerFront: [[852, 667], [1300, 655], [1301, 701], [857, 718]],
  leftPillar: [[843, 414], [859, 414], [866, 665], [850, 665]],
  rightPillar: [[1313, 405], [1330, 405], [1316, 653], [1300, 653]],
  leftFace: [[820, 404], [841, 415], [850, 665], [832, 645]],
  leftFaceTicker: [[840, 656], [852, 667], [857, 718], [845, 708]],
} satisfies Record<string, Quad>;

/**
 * Bowl ribbon boards.
 *
 * A run is a polyline of control points measured ON the illuminated strip:
 * `[x, yTop, yBottom]` in photo pixels. Segments are generated between
 * consecutive points, so neighbours share their corners exactly — no seams, no
 * height steps, and the board follows the photo's curve instead of one long
 * straight chord. Re-measure with `?calibrate`: every point sits on a real LED
 * edge (the upper/left runs were read off the lit "JOHNSTON"/graphics frames).
 *
 * The six runs below are six separate physical boards, so the gaps between them
 * are real. The bands at x<256/y≈405 and x>1788/y≈420 are deliberately NOT
 * mapped: they are lit concrete walkway edges above the suites (no LED content
 * anywhere in the photo), and a ribbon there reads as an overlay on the fascia.
 */
const RIBBON_RUNS = [
  // Far upper deck, left of the scoreboard. Lit at x≈640–770 ("HAPPY"/graphics frame).
  { name: "ringUpperLeft", points: [[256, 381, 393], [400, 377, 390], [550, 375, 388], [680, 372, 387], [830, 371, 386]] },
  // Far upper deck, right of the scoreboard. Lit at x≈1330–1430.
  { name: "ringUpperRight", reverse: true, points: [[1325, 361, 376], [1450, 360, 373], [1600, 359, 371], [1700, 358, 370], [1805, 357, 369]] },
  // Club-level ring, left of the scoreboard. Lit at x≈300–400, 520–590, 730–800.
  { name: "ringMidLeft", points: [[0, 572, 587], [100, 562, 577], [200, 552, 567], [300, 544, 558], [400, 537, 551], [500, 532, 546], [600, 529, 543], [700, 526, 540], [830, 524, 538]] },
  // Club-level ring, right of the scoreboard. Lit at x≈1410–1470, 1600–1690.
  { name: "ringMidRight", reverse: true, points: [[1320, 515, 529], [1440, 512, 526], [1560, 512, 526], [1680, 517, 531], [1800, 523, 537], [1920, 529, 543]] },
  // Lower-bowl ring, left of the scoreboard. Lit at x≈330–410, 540–600, 730–800.
  { name: "ringLowerLeft", points: [[0, 617, 632], [100, 610, 625], [200, 603, 617], [300, 597, 610], [400, 592, 605], [500, 588, 601], [600, 584, 597], [700, 581, 593], [830, 578, 590]] },
  // Lower-bowl ring, right of the scoreboard. Lit at x≈1400–1460, 1590–1640.
  { name: "ringLowerRight", reverse: true, points: [[1320, 563, 576], [1440, 564, 577], [1560, 565, 578], [1680, 571, 584], [1800, 577, 591], [1920, 584, 598]] },
] satisfies { name: string; reverse?: boolean; points: readonly (readonly [number, number, number])[] }[];

/** Ribbon runs, in bowl order, with scroll direction and where each sits in its run. */
export type RingRun = { name: string; reverse?: boolean; offset: number };

const RING_SURFACES: Record<string, Quad> = {};
export const RING_RUNS: RingRun[] = [];

for (const run of RIBBON_RUNS) {
  let offset = 0;
  for (let i = 0; i < run.points.length - 1; i += 1) {
    const [x0, t0, b0] = run.points[i];
    const [x1, t1, b1] = run.points[i + 1];
    const name = `${run.name}${i + 1}`;
    const quad: Quad = [[x0, t0], [x1, t1], [x1, b1], [x0, b0]];
    RING_SURFACES[name] = quad;
    RING_RUNS.push({ name, reverse: run.reverse, offset });
    // Content px, so a neighbouring segment picks the scroll up where this one left off.
    offset += quadSize(quad).width;
  }
}

export const SURFACES: Record<string, Quad> & typeof JUMBO_SURFACES = {
  ...JUMBO_SURFACES,
  ...RING_SURFACES,
};

export type SurfaceName = keyof typeof JUMBO_SURFACES | (string & {});

/** Pixel size for projecting content onto a quad at ~1:1 with the photo (×density). */
export function quadSize(quad: Quad, density = 2) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const w = (Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x3, y2 - y3)) / 2;
  const h = (Math.hypot(x3 - x0, y3 - y0) + Math.hypot(x2 - x1, y2 - y1)) / 2;
  return { width: Math.round(w * density), height: Math.round(h * density) };
}

/** Where the camera can point. Each shot is the photo region to frame. */
export const SHOTS = {
  establishing: { x: 0, y: 160, w: 1920, h: 1280 },
  wide: { x: 300, y: 250, w: 1560, h: 1000 },
  jumbotron: { x: 820, y: 352, w: 540, h: 376 },
  // Jumbotron in the upper part of frame, leaving room for the tickets below.
  ticketReveal: { x: 560, y: 340, w: 1050, h: 790 },
  jumbotronTight: { x: 850, y: 395, w: 480, h: 330 },
  sky: { x: 0, y: 0, w: 1920, h: 1440 },
  iceWide: { x: 560, y: 820, w: 1000, h: 480 },
  iceMid: { x: 860, y: 930, w: 420, h: 220 },
  puck: { x: 1036, y: 1004, w: 64, h: 36 },
} satisfies Record<string, Rect>;

/** Center-ice faceoff spot, where the puck sits before the challenge. */
export const PUCK_SPOT: Point = [1068, 1022];

/**
 * matrix3d that maps a w×h box (transform-origin 0 0) onto `quad`.
 * Standard square→quad projective mapping (Heckbert), scaled by w/h.
 */
export function quadTransform(w: number, h: number, quad: Quad) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const k = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + k * y3;

  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.join(",")})`;
}

/**
 * Stage transform that frames `rect` in a vw×vh viewport without ever showing
 * past the photo's edges. Returns scale plus the photo point placed at center.
 */
export function frameShot(rect: Rect, vw: number, vh: number) {
  const cover = Math.max(vw / ARENA.width, vh / ARENA.height);
  const scale = Math.max(cover, Math.min(vw / rect.w, vh / rect.h));
  const halfW = vw / scale / 2;
  const halfH = vh / scale / 2;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    scale,
    cx: clamp(rect.x + rect.w / 2, halfW, ARENA.width - halfW),
    cy: clamp(rect.y + rect.h / 2, halfH, ARENA.height - halfH),
  };
}
