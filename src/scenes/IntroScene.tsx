import { PrimaryButton } from "../components/PrimaryButton";
import { Scene } from "../components/Scene";
import { birthday } from "../config";

export function IntroScene({ onNext }: { onNext: () => void }) {
  return (
    <Scene eyebrow="American Airlines Center · Birthday Presentation">
      <div className="intro-lock">SPECIAL EVENT ACCESS</div>
      <h1 className="display display--xl">{birthday.birthdayName.toUpperCase()}</h1>
      <p className="lede">
        Tonight's presentation has one extremely specific audience member.
      </p>

      <PrimaryButton onClick={onNext}>Enter arena</PrimaryButton>
    </Scene>
  );
}
