import { useEffect, useState, type ReactNode } from "react";
import { ARENA, PUCK_SPOT, SURFACES, frameShot, type Rect } from "../arena/geometry";
import { ArenaRibbon } from "./ArenaRibbon";
import { ArenaSurface } from "./ArenaSurface";
import { JumbotronSurface } from "./Jumbotron";

export type CameraMove = {
  shot: Rect;
  /** ms for the camera to arrive. */
  duration: number;
  ease?: string;
  /** Motion blur while travelling (whip pans / dives). */
  blur?: boolean;
};

type ArenaWorldProps = {
  image: string;
  camera: CameraMove;
  children: ReactNode;
  ringText: string;
  ribbonText: string;
  goalMode?: boolean;
  showPuck?: boolean;
  speedLines?: boolean;
  flashKey?: number;
  credit?: {
    label: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
  };
};

const RINGS = [
  SURFACES.ringUpperLeft,
  SURFACES.ringMidLeft,
  SURFACES.ringLowLeft,
  SURFACES.ringUpperRight,
  SURFACES.ringMidRight,
  SURFACES.ringLowRight,
];

const calibrate =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("calibrate");

function useViewport() {
  const read = () => ({ vw: window.innerWidth, vh: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const onResize = () => setSize(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export function ArenaWorld({
  image,
  camera,
  children,
  ringText,
  ribbonText,
  goalMode = false,
  showPuck = false,
  speedLines = false,
  flashKey = 0,
  credit,
}: ArenaWorldProps) {
  const { vw, vh } = useViewport();
  const { scale, cx, cy } = frameShot(camera.shot, vw, vh);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!camera.blur) return;
    setMoving(true);
    const timeout = window.setTimeout(() => setMoving(false), camera.duration * 0.8);
    return () => window.clearTimeout(timeout);
  }, [camera]);

  return (
    <div
      className={[
        "arena-world",
        goalMode ? "arena-world--goal" : "",
        moving ? "arena-world--moving" : "",
        calibrate ? "arena-world--calibrate" : "",
      ].join(" ")}
    >
      <div
        className="arena-stage"
        style={{
          width: ARENA.width,
          height: ARENA.height,
          transform: `translate3d(${vw / 2}px, ${vh / 2}px, 0) scale(${scale}) translate3d(${-cx}px, ${-cy}px, 0)`,
          transitionDuration: `${camera.duration}ms`,
          transitionTimingFunction: camera.ease ?? "cubic-bezier(0.65, 0, 0.2, 1)",
        }}
      >
        <img className="arena-photo" src={image} alt="American Airlines Center ice rink" />

        {RINGS.map((quad, index) => (
          <ArenaSurface key={index} quad={quad} width={1200} height={30} className="led ring-board">
            <ArenaRibbon
              text={goalMode ? "GOAL · DALLAS STARS · " : ringText}
              tone={goalMode ? "goal" : index % 3 === 1 ? "white" : "green"}
              reverse={index >= 3}
            />
          </ArenaSurface>
        ))}

        <JumbotronSurface goalMode={goalMode} ribbonText={ribbonText}>
          {children}
        </JumbotronSurface>

        {showPuck ? (
          <div className="ice-puck" style={{ left: PUCK_SPOT[0], top: PUCK_SPOT[1] }} aria-hidden="true" />
        ) : null}

        <div className="arena-goal-light" aria-hidden="true" />
      </div>

      <div className="camera-vignette" aria-hidden="true" />
      {speedLines ? <div className="speed-lines" aria-hidden="true" /> : null}
      {flashKey ? <div key={flashKey} className="camera-flash" aria-hidden="true" /> : null}

      {credit ? (
        <div className="arena-credit">
          <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
            {credit.label}
          </a>
          <span> · </span>
          <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
            {credit.license}
          </a>
        </div>
      ) : null}
    </div>
  );
}
