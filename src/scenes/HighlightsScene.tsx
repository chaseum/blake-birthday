import { PrimaryButton } from "../components/PrimaryButton";
import { Scene } from "../components/Scene";
import { birthday } from "../config";

export function HighlightsScene({ onNext }: { onNext: () => void }) {
  return (
    <Scene eyebrow="Season review">
      <h1 className="display">The numbers are good.</h1>

      <div className="stats-grid">
        {birthday.highlights.map((highlight) => (
          <article className="stat" key={highlight.label}>
            <span className="micro">{highlight.label}</span>
            <strong>{highlight.value}</strong>
            {highlight.detail ? <p>{highlight.detail}</p> : null}
          </article>
        ))}
      </div>

      <PrimaryButton onClick={onNext}>One more highlight</PrimaryButton>
    </Scene>
  );
}
