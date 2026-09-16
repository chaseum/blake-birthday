type ArenaRibbonProps = {
  text: string;
  tone?: "green" | "white";
};

export function ArenaRibbon({ text, tone = "green" }: ArenaRibbonProps) {
  const repeated = Array.from({ length: 6 }, (_, index) => (
    <span key={index}>{text}</span>
  ));

  return (
    <div className={`arena-ribbon arena-ribbon--${tone}`} aria-hidden="true">
      <div className="arena-ribbon__track">{repeated}</div>
    </div>
  );
}
