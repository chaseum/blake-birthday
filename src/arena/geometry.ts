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
 * Real LED surfaces visible in the photo, measured at 4–10× zoom on the
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
export const SURFACES = {
  // Center-hung scoreboard. Verticals lean inward toward the bottom (camera looks down).
  mainFront: [[860, 413], [1312, 405], [1298, 654], [867, 666]],
  scoreStripFront: [[923, 366], [1253, 364], [1253, 405], [923, 409]],
  tickerFront: [[852, 667], [1300, 655], [1301, 701], [857, 718]],
  leftPillar: [[843, 414], [860, 413], [867, 666], [850, 665]],
  rightPillar: [[1312, 405], [1330, 405], [1316, 653], [1298, 654]],
  leftFace: [[820, 404], [843, 414], [850, 665], [832, 645]],
  leftFaceTicker: [[840, 656], [852, 667], [857, 718], [845, 708]],

  // Bowl ribbon boards, one quad per physical LED run (curved runs split where the slope changes).
  ringUpperLeftA: [[0, 405], [174, 401], [174, 409], [0, 414]],
  ringUpperLeftB: [[176, 397], [258, 397], [258, 406], [176, 407]],
  ringUpperLeftC: [[258, 376], [815, 371], [815, 385], [258, 393]],
  ringUpperRightA: [[1331, 360], [1808, 357], [1808, 370], [1331, 374]],
  ringUpperRightB: [[1790, 418], [1920, 420], [1920, 436], [1790, 432]],
  ringMidLeftA: [[0, 580], [100, 563], [100, 577], [0, 591]],
  ringMidLeftB: [[100, 563], [260, 544], [260, 556], [100, 577]],
  ringMidLeftC: [[260, 544], [550, 531], [550, 541], [260, 556]],
  ringMidLeftD: [[550, 531], [825, 524], [825, 537], [550, 541]],
  ringMidRightA: [[1324, 510], [1620, 511], [1620, 525], [1324, 524]],
  ringMidRightB: [[1620, 511], [1920, 527], [1920, 540], [1620, 525]],
  ringLowerLeftA: [[115, 614], [258, 597], [258, 608], [115, 625]],
  ringLowerLeftB: [[258, 595], [550, 579], [550, 594], [258, 612]],
  ringLowerLeftC: [[550, 579], [828, 573], [828, 590], [550, 594]],
  ringLowerRightA: [[1321, 564], [1620, 565], [1620, 578], [1321, 576]],
  ringLowerRightB: [[1620, 565], [1920, 581], [1920, 592], [1620, 578]],
} satisfies Record<string, Quad>;

export type SurfaceName = keyof typeof SURFACES;

/** Ribbon runs, in bowl order, with the direction their text scrolls. */
export const RING_RUNS: { name: SurfaceName; reverse?: boolean }[] = [
  { name: "ringUpperLeftA" },
  { name: "ringUpperLeftB" },
  { name: "ringUpperLeftC" },
  { name: "ringUpperRightA", reverse: true },
  { name: "ringUpperRightB", reverse: true },
  { name: "ringMidLeftA" },
  { name: "ringMidLeftB" },
  { name: "ringMidLeftC" },
  { name: "ringMidLeftD" },
  { name: "ringMidRightA", reverse: true },
  { name: "ringMidRightB", reverse: true },
  { name: "ringLowerLeftA" },
  { name: "ringLowerLeftB" },
  { name: "ringLowerLeftC" },
  { name: "ringLowerRightA", reverse: true },
  { name: "ringLowerRightB", reverse: true },
];

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
