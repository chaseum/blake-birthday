import { PrimaryButton } from "../components/PrimaryButton";
import { Scene } from "../components/Scene";
import { birthday } from "../config";

export function RevealScene({ onNext }: { onNext: () => void }) {
  return (
    <Scene eyebrow="Final · Birthday night" className="scene--reveal">
      <div className="matchup">
        <div>
          <span className="micro">Away</span>
          <strong>{birthday.opponent}</strong>
        </div>

        <span className="matchup__at">@</span>

        <div className="matchup__home">
          <span className="micro">Home</span>
          <strong>{birthday.homeTeam}</strong>
        </div>
      </div>

      <h1 className="display display--xl reveal-title">WE'RE GOING.</h1>

      <div className="ticket-facts">
        <span>{birthday.gameDate}</span>
        <span>{birthday.gameTime}</span>
        <span>{birthday.venue}</span>
      </div>

      <PrimaryButton onClick={onNext}>Open your ticket</PrimaryButton>
    </Scene>
  );
}
