type ArenaRibbonProps = {
  text: string;
  tone?: "green" | "white" | "goal";
  size?: "ring" | "large";
  reverse?: boolean;
};

export function ArenaRibbon({ text, tone = "green", size = "ring", reverse = false }: ArenaRibbonProps) {
  // Even count = two identical halves, so the -50% scroll loops seamlessly.
  return (
    <div className={`arena-ribbon arena-ribbon--${tone} arena-ribbon--${size}`} aria-hidden="true">
      <div className={`arena-ribbon__track ${reverse ? "arena-ribbon__track--reverse" : ""}`}>
        {Array.from({ length: 8 }, (_, index) => <span key={index}>{text}</span>)}
      </div>
    </div>
  );
}
