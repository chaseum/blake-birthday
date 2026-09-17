import { useCallback, useEffect, useState } from "react";
import { SHOTS } from "../arena/geometry";
import { birthday } from "../config";
import { ArenaWorld, type CameraMove } from "../components/ArenaWorld";
import {
  GoalBoard,
  HighlightsBoard,
  IceDiveBoard,
  LineupBoard,
  LineupIntroBoard,
  PregameBoard,
  RevealBoard,
} from "../components/BroadcastBoards";
import { PhysicalTickets } from "../components/PhysicalTickets";
import { StarPuzzle } from "../components/StarPuzzle";
import { HockeyChallenge } from "../game/HockeyChallenge";
import { playArenaStart, playWhoosh } from "../audio/arenaAudio";

const STAGES = [
  "pregame",
  "lineupIntro",
  "lineup",
  "highlights",
  "iceDive",
  "shootout",
  "goal",
  "tickets",
  "final",
] as const;
type Stage = (typeof STAGES)[number];

const LINEUP_BEAT = 2400;
const HIGHLIGHT_BEAT = 2900;

// Module-level so a camera only "moves" (and blurs) when the shot really changes.
const CAM = {
  establishing: { shot: SHOTS.establishing, duration: 0 },
  pushIn: { shot: SHOTS.wide, duration: 14000, ease: "cubic-bezier(0.3, 0, 0.7, 1)" },
  toJumbotron: { shot: SHOTS.jumbotron, duration: 2100, blur: true },
  jumbotronTight: { shot: SHOTS.jumbotronTight, duration: 1400 },
  jumbotron: { shot: SHOTS.jumbotron, duration: 1200 },
  sky: { shot: SHOTS.sky, duration: 950, ease: "cubic-bezier(0.5, 0, 0.3, 1)", blur: true },
  iceWide: { shot: SHOTS.iceWide, duration: 560, ease: "cubic-bezier(0.7, 0, 0.3, 1)", blur: true },
  iceMid: { shot: SHOTS.iceMid, duration: 440, ease: "cubic-bezier(0.7, 0, 0.3, 1)", blur: true },
  puck: { shot: SHOTS.puck, duration: 620, ease: "cubic-bezier(0.8, 0, 0.2, 1)", blur: true },
  ticketReveal: { shot: SHOTS.ticketReveal, duration: 1600 },
  goalReturn: { shot: SHOTS.jumbotron, duration: 1350, ease: "cubic-bezier(0.2, 0.8, 0.2, 1)", blur: true },
} satisfies Record<string, CameraMove>;

const RIBBON: Record<Stage, string> = {
  pregame: "WELCOME TO BIRTHDAY NIGHT · ",
  lineupIntro: "TONIGHT'S STARTING LINEUP · ",
  lineup: "STARTING LINEUP · TEAM US · ",
  highlights: "SEASON HIGHLIGHTS · TEAM US · ",
  iceDive: "SHOOTOUT · ONE GOAL WINS · ",
  shootout: "SHOOTOUT · ONE GOAL WINS · ",
  goal: "GOAL · ",
  tickets: `${birthday.opponentAbbr} @ DAL · ${birthday.gameDay} ${birthday.gameDate} · ${birthday.gameTime} · `,
  final: `${birthday.opponentAbbr} @ DAL · ${birthday.gameDay} ${birthday.gameDate} · ${birthday.gameTime} · `,
};

/** Runs `[delayMs, action]` steps in order; returns a cleanup. */
function timeline(steps: [number, () => void][]) {
  let elapsed = 0;
  const timers = steps.map(([delay, action]) => {
    elapsed += delay;
    return window.setTimeout(action, elapsed);
  });
  return () => timers.forEach((timer) => window.clearTimeout(timer));
}

// Dev only: jump straight to a stage, e.g. /?stage=tickets (add &secret to unlock the bonus).
const devParams = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null;
const devStage = STAGES.find((name) => name === devParams?.get("stage"));
const devSecret = devParams?.has("secret") ?? false;

export function ArenaExperience() {
  const [stage, setStage] = useState<Stage>(devStage ?? "pregame");
  const [camera, setCamera] = useState<CameraMove>(CAM.establishing);
  const [beat, setBeat] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [speedLines, setSpeedLines] = useState(false);
  const [showPuck, setShowPuck] = useState(false);
  // Optional easter egg: found during the lineup, playable only on the final screen.
  const [secretFound, setSecretFound] = useState(devSecret);
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  const next = useCallback(() => {
    setStage((current) => STAGES[Math.min(STAGES.indexOf(current) + 1, STAGES.length - 1)]);
  }, []);
  const flash = () => setFlashKey((key) => key + 1);

  const start = () => {
    playArenaStart();
    next();
  };

  useEffect(() => {
    setBeat(0);
    setSpeedLines(false);
    setShowPuck(false);
    const advanceBeat = () => setBeat((current) => current + 1);

    switch (stage) {
      case "pregame":
        setCamera(CAM.establishing);
        return timeline([[60, () => setCamera(CAM.pushIn)]]);

      case "lineupIntro":
        setCamera(CAM.toJumbotron);
        return timeline([[2900, next]]);

      case "lineup": {
        setCamera(CAM.jumbotronTight);
        const beats = birthday.lineup.length;
        return timeline([
          ...Array.from({ length: beats - 1 }, (): [number, () => void] => [LINEUP_BEAT, advanceBeat]),
          [LINEUP_BEAT + 400, next],
        ]);
      }

      case "highlights": {
        setCamera(CAM.jumbotron);
        const beats = birthday.memories.length;
        return timeline([
          ...Array.from({ length: beats - 1 }, (): [number, () => void] => [HIGHLIGHT_BEAT, advanceBeat]),
          [HIGHLIGHT_BEAT, next],
        ]);
      }

      case "iceDive":
        // GTA-style switch: pull way out, then three hard cuts down onto the puck.
        setCamera(CAM.jumbotron);
        setShowPuck(true);
        return timeline([
          [1300, () => { playWhoosh(0.5); setCamera(CAM.sky); }],
          [1150, () => { playWhoosh(0.8); flash(); setCamera(CAM.iceWide); }],
          [700, () => { playWhoosh(0.9); flash(); setCamera(CAM.iceMid); }],
          [560, () => { playWhoosh(1); setSpeedLines(true); setCamera(CAM.puck); }],
          [700, () => { flash(); next(); }],
        ]);

      case "shootout":
        setCamera(CAM.puck);
        return;

      case "goal":
        // The horn already sounded in-game at the moment of the goal.
        setCamera(CAM.goalReturn);
        return timeline([[4600, next]]);

      case "tickets":
        setCamera(CAM.ticketReveal);
        return timeline([[14000, next]]);

      case "final":
        return;
    }
  }, [stage, next]);

  let board = <PregameBoard />;
  if (stage === "lineupIntro") board = <LineupIntroBoard />;
  if (stage === "lineup") board = <LineupBoard activeIndex={beat} onSecret={() => setSecretFound(true)} />;
  if (stage === "highlights") board = <HighlightsBoard activeIndex={beat} />;
  if (stage === "iceDive" || stage === "shootout") board = <IceDiveBoard />;
  if (stage === "goal") board = <GoalBoard />;
  if (stage === "tickets" || stage === "final") board = <RevealBoard />;

  // Opponent is only named after the winning goal, starting with the tickets.
  const revealed = stage === "tickets" || stage === "final";
  const scored = STAGES.indexOf(stage) >= STAGES.indexOf("goal");
  const skippable = stage !== "pregame" && stage !== "shootout" && stage !== "final";

  return (
    <main className={`experience experience--${stage}`}>
      <ArenaWorld
        image={birthday.arenaImage}
        camera={camera}
        ringText={`HAPPY BIRTHDAY ${birthday.birthdayName.toUpperCase()} · DALLAS STARS · FEATURED FAN · `}
        ribbonText={RIBBON[stage]}
        goalMode={stage === "goal"}
        revealed={revealed}
        homeScore={scored ? 1 : 0}
        showPuck={showPuck || stage === "shootout"}
        speedLines={speedLines}
        flashKey={flashKey}
        credit={birthday.arenaCredit}
      >
        {board}
      </ArenaWorld>

      {stage === "pregame" ? (
        <div className="start-cta">
          <button className="start-cta__button" onClick={start}>
            <span className="start-cta__play" aria-hidden="true">▶</span>
            PLAY
          </button>
          <small>sound on · best in fullscreen</small>
        </div>
      ) : null}

      {stage === "shootout" ? (
        <div className="game-overlay">
          <HockeyChallenge onWin={next} />
        </div>
      ) : null}

      {stage === "tickets" ? (
        <>
          <PhysicalTickets />
          <button className="tickets-continue" onClick={next}>
            CONTINUE ›
          </button>
        </>
      ) : null}

      {stage === "final" ? (
        <section className="final-note">
          <div className="final-note__photos" aria-hidden="true">
            {birthday.memories.slice(0, 4).map((memory, index) => (
              <img
                key={memory.src}
                src={memory.src}
                alt=""
                style={{
                  objectPosition: memory.position ?? "50% 50%",
                  objectFit: memory.fit ?? "cover",
                  transform: `rotate(${[-6, 4, -2, 7][index]}deg)`,
                }}
              />
            ))}
          </div>
          <div className="final-note__copy">
            <span>ONE MORE THING</span>
            <h1>Happy birthday, {birthday.birthdayName}.</h1>
            <p>{birthday.note}</p>
            <div className="final-note__actions">
              <button className="final-note__replay" onClick={() => setStage("pregame")}>
                REPLAY
              </button>
              {secretFound ? (
                <button className="final-note__bonus" onClick={() => setPuzzleOpen(true)}>
                  🐾 BONUS PUZZLE
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {secretFound && stage === "lineup" ? (
        <div className="secret-toast" role="status">
          🐾 SECRET FOUND · BONUS UNLOCKS AT THE END
        </div>
      ) : null}

      {puzzleOpen ? <StarPuzzle onClose={() => setPuzzleOpen(false)} /> : null}

      {skippable ? (
        <button className="skip-button" onClick={next}>
          SKIP ›
        </button>
      ) : null}
    </main>
  );
}
