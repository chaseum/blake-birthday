import type { ReactNode } from "react";
import { SURFACES, quadSize, quadTransform, type SurfaceName } from "../arena/geometry";

type ArenaSurfaceProps = {
  name: SurfaceName;
  /** Virtual resolution the content is authored at; defaults to the quad's own size ×2. */
  width?: number;
  height?: number;
  className?: string;
  children?: ReactNode;
};

/** A real LED surface in the arena photo, driven like a tiny display. */
export function ArenaSurface({ name, width, height, className = "", children }: ArenaSurfaceProps) {
  const quad = SURFACES[name];
  const size = quadSize(quad);
  const w = width ?? size.width;
  const h = height ?? size.height;
  return (
    <div
      className={`arena-surface ${className}`}
      data-surface={name}
      style={{ width: w, height: h, transform: quadTransform(w, h, quad) }}
    >
      {children}
    </div>
  );
}
