import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ARENA, PUCK_SPOT, RING_RUNS, SURFACES, frameShot, type Rect } from "../arena/geometry";
import { ArenaRibbon } from "./ArenaRibbon";
import { ArenaSurface } from "./ArenaSurface";
import { CALIBRATION_SHOTS, CalibrationControls, CalibrationGuides } from "./CalibrationOverlay";
import { IceSkaters } from "./IceSkaters";
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
  revealed?: boolean;
  homeScore?: number;
  showPuck?: boolean;
  showSkaters?: boolean;
  speedLines?: boolean;
  flashKey?: number;
  credit?: {
    label: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
  };
};

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
  revealed = false,
  homeScore = 0,
  showPuck = false,
  showSkaters = false,
  speedLines = false,
  flashKey = 0,
  credit,
}: ArenaWorldProps) {
  const { vw, vh } = useViewport();
  const [calibOpacity, setCalibOpacity] = useState(0.5);
  const [calibShot, setCalibShot] = useState<string | null>(null);
  const shot = calibShot ? CALIBRATION_SHOTS[calibShot] : camera.shot;
  const { scale, cx, cy } = frameShot(shot, vw, vh);
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
      style={calibrate ? ({ "--calib-opacity": calibOpacity } as CSSProperties) : undefined}
    >
      <div
        className="arena-stage"
        style={{
          width: ARENA.width,
          height: ARENA.height,
          transform: `translate3d(${vw / 2}px, ${vh / 2}px, 0) scale(${scale}) translate3d(${-cx}px, ${-cy}px, 0)`,
          transitionDuration: `${calibShot ? 0 : camera.duration}ms`,
          transitionTimingFunction: camera.ease ?? "cubic-bezier(0.65, 0, 0.2, 1)",
        }}
      >
        <img className="arena-photo" src={image} alt="American Airlines Center ice rink" />

        {showSkaters ? <IceSkaters /> : null}

        {RING_RUNS.map(({ name, reverse }) => (
          <ArenaSurface key={name} name={name} className="led ring-board">
            <ArenaRibbon
              text={goalMode ? "GOAL · DALLAS STARS · " : ringText}
              tone={goalMode ? "goal" : name.startsWith("ringMid") ? "white" : "green"}
              reverse={reverse}
              offset={SURFACES[name][0][0] * 2}
            />
          </ArenaSurface>
        ))}

        <JumbotronSurface
          goalMode={goalMode}
          revealed={revealed}
          homeScore={homeScore}
          ribbonText={ribbonText}
        >
          {children}
        </JumbotronSurface>

        {showPuck ? (
          <div className="ice-puck" style={{ left: PUCK_SPOT[0], top: PUCK_SPOT[1] }} aria-hidden="true" />
        ) : null}

        <div className="arena-goal-light" aria-hidden="true" />
        {calibrate ? <CalibrationGuides /> : null}
      </div>

      {calibrate ? (
        <CalibrationControls
          opacity={calibOpacity}
          onOpacity={setCalibOpacity}
          shot={calibShot}
          onShot={setCalibShot}
        />
      ) : null}

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
