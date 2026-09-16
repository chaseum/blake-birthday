import { birthday } from "../config";

export function PregameBoard({ onStart }: { onStart: () => void }) {
  return (
    <div className="board board--pregame">
      <div className="board-kicker">BIRTHDAY NIGHT · SPECIAL PRESENTATION</div>
      <div className="board-name">{birthday.birthdayName.toUpperCase()}</div>
      <div className="board-lock">SPECIAL EVENT ACCESS · READY</div>
      <button className="arena-button" onClick={onStart}>START PRESENTATION</button>
    </div>
  );
}

export function LineupBoard({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="board board--lineup">
      <div className="broadcast-topline">
        <span>TONIGHT'S STARTING LINEUP</span>
        <span>TEAM US</span>
      </div>

      <div
        className="lineup-pan"
        style={{ transform: `translateX(calc(50% - ${activeIndex * 44 + 22}%))` }}
      >
        {birthday.lineup.map((member, index) => (
          <article
            className={`lineup-player ${index === activeIndex ? "lineup-player--active" : ""}`}
            key={member.name}
          >
            <div className="lineup-player__photo">
              <img
                src={member.image}
                alt={member.name}
                style={{ objectPosition: member.imagePosition ?? "50% 50%" }}
              />
              <span className="lineup-player__number">{member.number}</span>
            </div>
            <div className="lineup-player__lower-third">
              <small>{member.role}</small>
              <strong>{member.name}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HighlightsBoard({ activeIndex }: { activeIndex: number }) {
  const stat = birthday.stats[activeIndex % birthday.stats.length];
  const memory = birthday.memories[activeIndex % birthday.memories.length];
  const nextMemory = birthday.memories[(activeIndex + 1) % birthday.memories.length];

  return (
    <div className="board board--highlights">
      <div className="broadcast-slash broadcast-slash--one" />
      <div className="broadcast-slash broadcast-slash--two" />

      <div className="highlight-photo highlight-photo--primary">
        <img
          src={memory.src}
          alt={memory.alt}
          style={{ objectPosition: memory.position ?? "50% 50%" }}
        />
      </div>
      <div className="highlight-photo highlight-photo--secondary">
        <img
          src={nextMemory.src}
          alt=""
          style={{ objectPosition: nextMemory.position ?? "50% 50%" }}
        />
      </div>

      <div className="broadcast-stat">
        <span className="broadcast-stat__label">SEASON HIGHLIGHT</span>
        <span className="broadcast-stat__category">{stat.label}</span>
        <strong>{stat.value}</strong>
        <p>{stat.detail}</p>
      </div>

      <div className="broadcast-caption">{memory.caption}</div>
    </div>
  );
}

export function IceDiveBoard() {
  return (
    <div className="board board--ice-dive">
      <span>FINAL CHALLENGE</span>
      <strong>WIN IT ON THE ICE</strong>
      <small>2 GOALS TO UNLOCK THE PRESENT</small>
    </div>
  );
}

export function GoalBoard() {
  return (
    <div className="board board--goal">
      <span className="goal-mini">DALLAS</span>
      <strong>GOAL</strong>
      <span className="goal-mini">BIRTHDAY PRESENT UNLOCKED</span>
    </div>
  );
}

export function RevealBoard() {
  return (
    <div className="board board--reveal">
      <span className="board-kicker">FRIDAY · JANUARY 22 · 7:00 PM</span>
      <strong>WE'RE GOING.</strong>
      <div className="reveal-matchup">
        <span>COLORADO AVALANCHE</span>
        <b>@</b>
        <span>DALLAS STARS</span>
      </div>
    </div>
  );
}
