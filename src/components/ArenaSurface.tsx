import type { ReactNode } from "react";
import { quadTransform, type Quad } from "../arena/geometry";

type ArenaSurfaceProps = {
  quad: Quad;
  /** Virtual resolution the content is authored at; it's projected onto the quad. */
  width: number;
  height: number;
  className?: string;
  children?: ReactNode;
};

/** A real LED surface in the arena photo, driven like a tiny display. */
export function ArenaSurface({ quad, width, height, className = "", children }: ArenaSurfaceProps) {
  return (
    <div
      className={`arena-surface ${className}`}
      style={{ width, height, transform: quadTransform(width, height, quad) }}
    >
      {children}
    </div>
  );
}
