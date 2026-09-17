import { ARENA, SHOTS, SURFACES, type Rect } from "../arena/geometry";

/** Dev aid, only mounted with `?calibrate`. Lives inside the stage, so it follows the camera. */
export function CalibrationGuides() {
  const entries = Object.entries(SURFACES);
  return (
    <svg
      className="calibration-guides"
      width={ARENA.width}
      height={ARENA.height}
      viewBox={`0 0 ${ARENA.width} ${ARENA.height}`}
      aria-hidden="true"
    >
      {entries.map(([name, quad], i) => {
        const color = `hsl(${(i * 137.5) % 360} 100% 60%)`;
        const points = quad.map(([x, y]) => `${x},${y}`).join(" ");
        const [lx, ly] = quad[0];
        return (
          <g key={name} stroke={color} fill={color}>
            <polygon points={points} fill="none" strokeWidth={0.6} />
            <text x={lx + 1} y={ly - 2} fontSize={5} stroke="none" paintOrder="stroke">
              {name}
            </text>
            {quad.map(([x, y], c) => (
              <g key={c}>
                <circle cx={x} cy={y} r={1.1} stroke="#000" strokeWidth={0.3} />
                <text x={x + 1.5} y={y + (c < 2 ? -1 : 4)} fontSize={2.6} stroke="none">
                  {["TL", "TR", "BR", "BL"][c]} {x},{y}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** Camera presets for checking alignment at each framing the experience uses. */
export const CALIBRATION_SHOTS: Record<string, Rect> = {
  wide: SHOTS.wide,
  jumbotron: SHOTS.jumbotron,
  tight: SHOTS.jumbotronTight,
  "board L": { x: 800, y: 395, w: 110, h: 340 },
  "board R": { x: 1250, y: 355, w: 110, h: 320 },
  "bowl L": { x: 0, y: 350, w: 850, h: 290 },
  "bowl R": { x: 1300, y: 340, w: 620, h: 270 },
};

type ControlsProps = {
  opacity: number;
  onOpacity: (value: number) => void;
  shot: string | null;
  onShot: (value: string | null) => void;
};

export function CalibrationControls({ opacity, onOpacity, shot, onShot }: ControlsProps) {
  return (
    <div className="calibration-controls">
      <div>
        <b>content</b>
        {[0, 0.25, 0.5, 1].map((value) => (
          <button key={value} aria-pressed={opacity === value} onClick={() => onOpacity(value)}>
            {value * 100}%
          </button>
        ))}
      </div>
      <div>
        <b>camera</b>
        <button aria-pressed={shot === null} onClick={() => onShot(null)}>
          live
        </button>
        {Object.keys(CALIBRATION_SHOTS).map((name) => (
          <button key={name} aria-pressed={shot === name} onClick={() => onShot(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
