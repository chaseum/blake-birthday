import { useCallback, useState } from "react";
import { ChallengeScene } from "./scenes/ChallengeScene";
import { FinalScene } from "./scenes/FinalScene";
import { GoalScene } from "./scenes/GoalScene";
import { HighlightsScene } from "./scenes/HighlightsScene";
import { IntroScene } from "./scenes/IntroScene";
import { LineupScene } from "./scenes/LineupScene";
import { RevealScene } from "./scenes/RevealScene";
import { ShootoutScene } from "./scenes/ShootoutScene";

const scenes = [
  "intro",
  "lineup",
  "highlights",
  "challenge",
  "shootout",
  "goal",
  "reveal",
  "final",
] as const;

type SceneName = (typeof scenes)[number];

export default function App() {
  const [scene, setScene] = useState<SceneName>("intro");

  const next = useCallback(() => {
    setScene((current) => {
      const index = scenes.indexOf(current);
      return scenes[Math.min(index + 1, scenes.length - 1)];
    });
  }, []);

  if (scene === "intro") return <IntroScene onNext={next} />;
  if (scene === "lineup") return <LineupScene onNext={next} />;
  if (scene === "highlights") return <HighlightsScene onNext={next} />;
  if (scene === "challenge") return <ChallengeScene onNext={next} />;
  if (scene === "shootout") return <ShootoutScene onGoal={next} />;
  if (scene === "goal") return <GoalScene onDone={next} />;
  if (scene === "reveal") return <RevealScene onNext={next} />;

  return <FinalScene onRestart={() => setScene("intro")} />;
}
