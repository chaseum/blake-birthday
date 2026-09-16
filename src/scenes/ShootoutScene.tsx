import { Scene } from "../components/Scene";
import { ShootoutGame } from "../game/ShootoutGame";

export function ShootoutScene({ onGoal }: { onGoal: () => void }) {
  return (
    <Scene eyebrow="Overtime · Game winner" className="scene--game">
      <ShootoutGame onGoal={onGoal} />
    </Scene>
  );
}
