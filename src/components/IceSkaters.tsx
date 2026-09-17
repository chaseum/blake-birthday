import type { CSSProperties } from "react";

/**
 * Warm-up skaters drawn onto the photographed ice. Positions are the skater's
 * feet in photo pixels; size follows the real players by the bench
 * (~36px tall at y≈880, growing toward the camera).
 */
type Skater = {
  x: number;
  y: number;
  /** Glide offset in photo px (there and back). */
  dx: number;
  dy: number;
  seconds: number;
  delay: number;
  jersey: "home" | "white";
  featured?: boolean;
};

const SKATERS: Skater[] = [
  { x: 540, y: 905, dx: 180, dy: 6, seconds: 11, delay: -2, jersey: "home" },
  { x: 1320, y: 915, dx: -210, dy: 10, seconds: 13, delay: -7, jersey: "white" },
  { x: 1530, y: 960, dx: -160, dy: 22, seconds: 12, delay: -4, jersey: "home" },
  { x: 700, y: 1085, dx: 140, dy: -18, seconds: 14, delay: -9, jersey: "white" },
  { x: 1400, y: 1120, dx: 120, dy: -25, seconds: 15, delay: -1, jersey: "home" },
  // Featured / mystery player: a touch brighter, with a spotlight that follows.
  { x: 880, y: 1000, dx: 90, dy: 14, seconds: 9, delay: -3, jersey: "home", featured: true },
];

const heightAt = (y: number) => 36 + (y - 880) * 0.06;

function SkaterSprite({ jersey, featured }: Pick<Skater, "jersey" | "featured">) {
  const body = jersey === "home" ? "#0b6a45" : "#d9ebe3";
  const trim = jersey === "home" ? "#d9ebe3" : "#0b6a45";
  return (
    <svg viewBox="0 0 16 40" className="skater__sprite" aria-hidden="true">
      <ellipse cx="8" cy="39" rx="7" ry="1.3" fill="rgba(0,0,0,.35)" />
      {/* stick */}
      <path d="M11 20 L15 38 L10 38.5" stroke="#1a1f1c" strokeWidth="1.1" fill="none" />
      {/* legs + skates (mid-stride) */}
      <path d="M6 26 L4 37 M10 26 L11.5 37" stroke="#111714" strokeWidth="2.4" />
      <path d="M2.5 38 H6 M10 38 H13.5" stroke="#9aa5a2" strokeWidth="1" />
      {/* pants, jersey, hem stripe */}
      <rect x="4.5" y="21" width="7" height="6" rx="1.5" fill="#111714" />
      <path d="M3.5 11 Q8 8.5 12.5 11 L13 22 H3 Z" fill={body} />
      <rect x="3" y="19" width="10" height="1.4" fill={trim} />
      {featured ? (
        <text x="8" y="17.5" fontSize="5.5" textAnchor="middle" fill={trim} fontWeight="900">
          01
        </text>
      ) : null}
      {/* arms, gloves */}
      <path d="M4 12 L2.6 19 M12 12 L12.8 19" stroke={body} strokeWidth="2.2" />
      <circle cx="12.3" cy="20" r="1.3" fill="#111714" />
      {/* helmet */}
      <circle cx="8" cy="7.2" r="3.1" fill="#111714" />
      <rect x="6.3" y="7.4" width="3.4" height="2.2" fill="#b98a6a" />
    </svg>
  );
}

export function IceSkaters() {
  return (
    <div className="ice-skaters" aria-hidden="true">
      {SKATERS.map((s, i) => {
        const h = heightAt(s.y);
        const style = {
          left: s.x,
          top: s.y,
          height: h,
          width: h * 0.4,
          "--dx": `${s.dx}px`,
          "--dy": `${s.dy}px`,
          animationDuration: `${s.seconds}s`,
          animationDelay: `${s.delay}s`,
        } as CSSProperties;
        return (
          <div key={i} className={`skater ${s.featured ? "skater--featured" : ""}`} style={style}>
            <SkaterSprite jersey={s.jersey} featured={s.featured} />
          </div>
        );
      })}
    </div>
  );
}
