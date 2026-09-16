import { useEffect } from "react";
import { Scene } from "../components/Scene";
import { playGoalCelebration } from "../audio/goalHorn";

export function GoalScene({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    playGoalCelebration();
    const timer = window.setTimeout(onDone, 2100);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <Scene className="scene--goal">
      <div className="goal-light" aria-hidden="true" />
      <h1 className="goal-word">GOAL</h1>
      <p className="goal-subtitle">Birthday surprise unlocked.</p>
    </Scene>
  );
}
