import { useCallback, useEffect, useState } from "react";
import { birthday } from "../config";
import { ArenaWorld, type CameraMode } from "../components/ArenaWorld";
import {
  GoalBoard,
  HighlightsBoard,
  IceDiveBoard,
  LineupBoard,
  PregameBoard,
  RevealBoard,
} from "../components/BroadcastBoards";
import { PhysicalTickets } from "../components/PhysicalTickets";
import { HockeyChallenge } from "../game/HockeyChallenge";
import { playArenaStart, playGoalCelebration } from "../audio/arenaAudio";

type Stage =
  | "pregame"
  | "lineup"
  | "highlights"
  | "iceDive"
  | "shootout"
  | "goal"
  | "tickets"
  | "final";

function cameraFor(stage: Stage): CameraMode {
  if (stage === "iceDive" || stage === "shootout") return "ice";
  if (stage === "goal") return "goal";
  if (stage === "lineup" || stage === "highlights" || stage === "tickets") {
    return "jumbotron";
  }
  return "wide";
}

export function ArenaExperience() {
  const [stage, setStage] = useState<Stage>("pregame");
  const [lineupIndex, setLineupIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const start = useCallback(() => {
    playArenaStart();
    setStage("lineup");
  }, []);

  const winShootout = useCallback(() => {
    setStage("goal");
  }, []);

  useEffect(() => {
    if (stage !== "lineup") return;

    setLineupIndex(0);
    const interval = window.setInterval(() => {
      setLineupIndex((current) =>
        Math.min(current + 1, birthday.lineup.length - 1),
      );
    }, 2200);

    const timeout = window.setTimeout(() => setStage("highlights"), 9200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "highlights") return;

    setHighlightIndex(0);
    const interval = window.setInterval(() => {
      setHighlightIndex((current) => (current + 1) % birthday.stats.length);
    }, 1900);
    const timeout = window.setTimeout(() => setStage("iceDive"), 8500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "iceDive") return;
    const timeout = window.setTimeout(() => setStage("shootout"), 2500);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "goal") return;
    playGoalCelebration();
    const timeout = window.setTimeout(() => setStage("tickets"), 3100);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  useEffect(() => {
    if (stage !== "tickets") return;
    const timeout = window.setTimeout(() => setStage("final"), 7800);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  let board = <PregameBoard onStart={start} />;
  if (stage === "lineup") board = <LineupBoard activeIndex={lineupIndex} />;
  if (stage === "highlights") board = <HighlightsBoard activeIndex={highlightIndex} />;
  if (stage === "iceDive" || stage === "shootout") board = <IceDiveBoard />;
  if (stage === "goal") board = <GoalBoard />;
  if (stage === "tickets" || stage === "final") board = <RevealBoard />;

  return (
    <main className={`experience experience--${stage}`}>
      <ArenaWorld
        image={birthday.arenaImage}
        camera={cameraFor(stage)}
        goalMode={stage === "goal"}
        dim={stage === "shootout"}
        credit={birthday.arenaCredit}
      >
        {board}
      </ArenaWorld>

      {stage === "shootout" ? (
        <div className="game-overlay">
          <HockeyChallenge onWin={winShootout} />
        </div>
      ) : null}

      {stage === "tickets" || stage === "final" ? <PhysicalTickets /> : null}

      {stage === "final" ? (
        <section className="final-note">
          <div className="final-note__photos" aria-hidden="true">
            {birthday.memories.slice(0, 3).map((memory, index) => (
              <img
                key={memory.src}
                src={memory.src}
                alt=""
                style={{
                  objectPosition: memory.position ?? "50% 50%",
                  transform: `rotate(${(index - 1) * 4}deg) translateY(${index % 2 ? 8 : 0}px)`,
                }}
              />
            ))}
          </div>
          <div className="final-note__copy">
            <span>ONE MORE THING</span>
            <h1>Happy birthday, {birthday.birthdayName}.</h1>
            <p>{birthday.note}</p>
            <button
              className="final-note__replay"
              onClick={() => setStage("pregame")}
            >
              REPLAY PRESENTATION
            </button>
          </div>
        </section>
      ) : null}

      <div className="presentation-skip" aria-hidden={stage === "pregame" || stage === "shootout" || stage === "final"}>
        {stage !== "pregame" && stage !== "shootout" && stage !== "final" ? (
          <button
            onClick={() => {
              if (stage === "lineup") setStage("highlights");
              else if (stage === "highlights") setStage("iceDive");
              else if (stage === "iceDive") setStage("shootout");
              else if (stage === "goal") setStage("tickets");
              else if (stage === "tickets") setStage("final");
            }}
          >
            SKIP ›
          </button>
        ) : null}
      </div>
    </main>
  );
}
