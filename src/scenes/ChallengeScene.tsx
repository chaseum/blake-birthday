import { PrimaryButton } from "../components/PrimaryButton";
import { Scene } from "../components/Scene";

export function ChallengeScene({ onNext }: { onNext: () => void }) {
  return (
    <Scene eyebrow="Birthday present status · Locked" className="scene--dark">
      <h1 className="display display--xl">
        One shot.
        <br />
        Win your present.
      </h1>
      <p className="lede">
        Drag the puck backward. Pick a corner. Do not choke.
      </p>

      <PrimaryButton onClick={onNext}>Take the shot</PrimaryButton>
    </Scene>
  );
}
