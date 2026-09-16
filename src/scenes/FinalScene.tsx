import { Scene } from "../components/Scene";
import { birthday } from "../config";

export function FinalScene({ onRestart }: { onRestart: () => void }) {
  return (
    <Scene eyebrow="See you at puck drop" className="scene--final">
      <article className="souvenir-ticket">
        <div className="souvenir-ticket__photo">
          <img src={birthday.revealPhoto} alt="Us together" />
        </div>

        <div className="souvenir-ticket__body">
          <span className="micro">Birthday admission · two seats</span>
          <h1>{birthday.homeTeam}</h1>
          <p className="souvenir-ticket__opponent">vs. {birthday.opponent}</p>

          <dl>
            <div>
              <dt>Date</dt>
              <dd>{birthday.gameDate}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{birthday.gameTime}</dd>
            </div>
            <div>
              <dt>Arena</dt>
              <dd>{birthday.venue}</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>{birthday.seatText}</dd>
            </div>
          </dl>

          <p className="birthday-note">{birthday.note}</p>
        </div>
      </article>

      <button className="text-button" onClick={onRestart}>
        replay
      </button>
    </Scene>
  );
}
