import type { PlayerCard as PlayerCardModel } from "../types";

export function PlayerCard({ player }: { player: PlayerCardModel }) {
  return (
    <article className="player-card">
      <div className="player-card__image-wrap">
        <img
          className="player-card__image"
          src={player.image}
          alt={`${player.name} player card`}
        />
        <span className="player-card__number">{player.number}</span>
      </div>

      <div className="player-card__copy">
        <span className="micro">{player.position}</span>
        <h2>{player.name}</h2>
        <span className="player-card__team">{player.team}</span>

        <ul>
          {player.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
