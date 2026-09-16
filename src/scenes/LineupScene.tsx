import { PlayerCard } from "../components/PlayerCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Scene } from "../components/Scene";
import { birthday } from "../config";

export function LineupScene({ onNext }: { onNext: () => void }) {
  return (
    <Scene eyebrow="Tonight's starting lineup">
      <h1 className="display">Team Us</h1>
      <p className="lede">Two-player roster. No trade requests accepted.</p>

      <div className="lineup-grid">
        {birthday.lineup.map((player) => (
          <PlayerCard key={player.name} player={player} />
        ))}
      </div>

      <PrimaryButton onClick={onNext}>Season highlights</PrimaryButton>
    </Scene>
  );
}
