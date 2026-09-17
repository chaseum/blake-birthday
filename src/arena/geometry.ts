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

/** Real LED surfaces visible in the photo. */
export const SURFACES = {
  screen: [[865, 409], [1300, 408], [1300, 655], [865, 665]],
  scoreStrip: [[925, 367], [1256, 367], [1256, 407], [925, 407]],
  nameRibbon: [[863, 665], [1301, 655], [1301, 703], [863, 716]],
  // Ring (fascia) LED boards that wrap the bowl.
  ringUpperLeft: [[257, 377], [826, 371], [826, 384], [257, 390]],
  ringMidLeft: [[300, 542], [800, 526], [800, 539], [300, 559]],
  ringLowLeft: [[300, 592], [800, 578], [800, 590], [300, 607]],
  ringUpperRight: [[1330, 360], [1805, 357], [1805, 372], [1330, 377]],
  ringMidRight: [[1330, 510], [1920, 530], [1920, 543], [1330, 523]],
  ringLowRight: [[1330, 559], [1920, 577], [1920, 590], [1330, 571]],
} satisfies Record<string, Quad>;

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
