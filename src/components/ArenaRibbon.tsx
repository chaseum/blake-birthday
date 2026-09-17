type ArenaRibbonProps = {
  text: string;
  tone?: "green" | "white" | "goal";
  size?: "ring" | "large";
  reverse?: boolean;
  /** Shift (content px) so neighbouring runs read as one continuous band. */
  offset?: number;
};

export function ArenaRibbon({ text, tone = "green", size = "ring", reverse = false, offset = 0 }: ArenaRibbonProps) {
  // Ring runs are offset by up to a photo-width, so they need a longer track.
  const repeats = size === "ring" ? 16 : 8;
  // Even count = two identical halves, so the -50% scroll loops seamlessly.
  return (
    <div className={`arena-ribbon arena-ribbon--${tone} arena-ribbon--${size}`} aria-hidden="true">
      <div
        className={`arena-ribbon__track ${reverse ? "arena-ribbon__track--reverse" : ""}`}
        style={offset ? { marginLeft: -offset } : undefined}
      >
        {Array.from({ length: repeats }, (_, index) => <span key={index}>{text}</span>)}
      </div>
    </div>
  );
}
