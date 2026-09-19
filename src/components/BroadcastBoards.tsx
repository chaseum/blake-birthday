import { useEffect, useState, type CSSProperties } from "react";
import { birthday } from "../config";
import type { MemoryPhoto } from "../types";
import { StarsLogo, VictorBadge } from "./StarsBrand";

/** Every board is authored at 960×540 and projected onto the real screen. */

/** Dev-only: a broken media path should be loud, not an empty head. `npm run check` catches config typos. */
const warnMissing = import.meta.env.DEV
  ? (e: { currentTarget: HTMLImageElement | HTMLVideoElement }) =>
      console.warn("[media] failed to load", e.currentTarget.currentSrc || e.currentTarget.getAttribute("src"))
  : undefined;

function Photo({ memory, className = "" }: { memory: MemoryPhoto; className?: string }) {
  if (memory.video) {
    // Broadcast footage, not a player: muted, inline, no controls. Only mounted after PLAY.
    return (
      <video
        className={`board-photo ${className}`}
        src={memory.video}
        poster={memory.src}
        aria-label={memory.alt}
        style={{ objectPosition: memory.position ?? "50% 50%" }}
        onError={warnMissing}
        // Pre-cut to the payoff; no loop, so the last frame holds until the slide ends.
        muted
        autoPlay
        playsInline
        disablePictureInPicture
        preload="auto"
      />
    );
  }
  return (
    <img
      className={`board-photo ${memory.fit === "contain" ? "board-photo--contain" : ""} ${className}`}
      src={memory.src}
      alt={memory.alt}
      style={{ objectPosition: memory.position ?? "50% 50%" }}
      onError={warnMissing}
    />
  );
}

export function PregameBoard() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(
      () => setIndex((current) => (current + 1) % birthday.fanCam.length),
      2600,
    );
    return () => window.clearInterval(interval);
  }, []);
  const memory = birthday.fanCam[index];

  return (
    <div className="board board--pregame">
      <div className="pregame-cam" key={memory.src}>
        <Photo memory={memory} />
        <span className="pregame-cam__tag">● FAN CAM</span>
      </div>
      <div className="pregame-copy">
        <span>WELCOME TO</span>
        <strong>BIRTHDAY NIGHT</strong>
        <em>{birthday.birthdayName.toUpperCase()}</em>
      </div>
      <StarsLogo className="pregame-stars-logo" decorative />
      <div className="pregame-victor" aria-label="Victor E. Green mascot cameo">
        <VictorBadge decorative />
        <span>VICTOR E. GREEN</span>
      </div>
    </div>
  );
}

export function LineupIntroBoard() {
  return (
    <div className="board board--bumper">
      <div className="bumper-bar bumper-bar--1" />
      <div className="bumper-bar bumper-bar--2" />
      <div className="bumper-bar bumper-bar--3" />
      <div className="bumper-copy">
        <StarsLogo className="bumper-stars-logo" decorative />
        <span>TONIGHT'S</span>
        <strong>STARTING LINEUP</strong>
      </div>
    </div>
  );
}

/**
 * Wii Sports-style lineup: players stand in a row receding to a vanishing
 * point and the camera tracks down the line, one player at a time.
 */
export function LineupBoard({ activeIndex }: { activeIndex: number }) {
  const active = birthday.lineup[activeIndex];

  return (
    <div className="board board--lineup">
      <div className="lineup-sky" />
      <div className="lineup-field" />

      <div className="lineup-row">
        {birthday.lineup.map((member, index) => {
          const d = index - activeIndex;
          const depth = d >= 0 ? 1 / (1 + d * 0.7) : 1 + -d * 0.9;
          const style: CSSProperties = {
            transform: `translate(${d >= 0 ? 40 + 620 * (1 - depth) : 40 + d * 420}px, ${
              (1 - depth) * -190
            }px) scale(${depth})`,
            zIndex: 50 - Math.abs(d),
            opacity: d < -1 ? 0 : 1,
            filter: d === 0 ? "none" : `brightness(${0.75 - Math.min(Math.abs(d), 3) * 0.1})`,
          };
          return (
            <div className="lineup-player" style={style} key={member.name}>
              <div className="lineup-player__head">
                <img
                  src={member.image}
                  alt={member.name}
                  style={{ objectPosition: member.imagePosition ?? "50% 50%" }}
                  onError={warnMissing}
                />
              </div>
              <div className="lineup-player__body">
                <span>{member.number}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lineup-bug">
        <StarsLogo className="lineup-bug__logo" decorative />
        STARTING LINEUP
        <b>
          {activeIndex + 1}/{birthday.lineup.length}
        </b>
      </div>

      <div className="lineup-plate" key={active.name}>
        <span className="lineup-plate__number">{active.number}</span>
        <div>
          <small>{active.role}</small>
          <strong>{active.name}</strong>
        </div>
      </div>
    </div>
  );
}

/** TV-broadcast highlight package: sweeping wipes, big numbers, photos. */
export function HighlightsBoard({ activeIndex }: { activeIndex: number }) {
  const memory = birthday.memories[activeIndex % birthday.memories.length];
  const stat = birthday.stats[activeIndex % birthday.stats.length];

  return (
    <div className="board board--highlights" key={activeIndex}>
      <div className="highlight-media">
        <Photo memory={memory} className="highlight-media__img" />
      </div>

      <div className="highlight-panel">
        <span className="highlight-panel__label">{stat.label}</span>
        <strong
          className={`highlight-panel__value ${stat.value.length > 4 ? "highlight-panel__value--long" : ""}`}
        >
          {stat.value}
        </strong>
        <p>{stat.detail}</p>
      </div>

      <div className="highlight-bug">
        <StarsLogo className="highlight-bug__logo" decorative />
        <span>BLAKE'S SEASON</span>
      </div>

      <div className="highlight-ticker">
        <b>
          {activeIndex + 1}/{birthday.memories.length}
        </b>
        <span>{memory.caption}</span>
      </div>

      <div className="sweep" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function IceDiveBoard() {
  return (
    <div className="board board--ice-dive">
      <span>FINAL CHALLENGE</span>
      <strong>SHOOTOUT</strong>
      <small>ONE GOAL UNLOCKS THE PRESENT</small>
    </div>
  );
}

export function GoalBoard() {
  return (
    <div className="board board--goal">
      <div className="goal-rays" />
      <StarsLogo className="goal-logo" decorative />
      <strong>
        {"GOAL".split("").map((letter, index) => (
          <span key={index} style={{ animationDelay: `${index * 70}ms` }}>
            {letter}
          </span>
        ))}
      </strong>
      <em>{birthday.birthdayName.toUpperCase()} SCORES!</em>
    </div>
  );
}

export function RevealBoard() {
  return (
    <div className="board board--reveal">
      <span className="reveal-kicker">
        {birthday.gameDay} · {birthday.gameDate} · {birthday.gameTime}
      </span>
      <strong>WE'RE GOING.</strong>
      <div className="reveal-matchup">
        <span>{birthday.opponent.toUpperCase()}</span>
        <b>@</b>
        <span className="reveal-home">
          <StarsLogo className="reveal-home__logo" decorative />
          {birthday.homeTeam.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
