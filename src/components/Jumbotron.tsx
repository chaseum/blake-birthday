import type { ReactNode } from "react";
import { birthday } from "../config";
import { ArenaRibbon } from "./ArenaRibbon";
import { ArenaSurface } from "./ArenaSurface";

type JumbotronSurfaceProps = {
  children: ReactNode;
  ribbonText: string;
  goalMode?: boolean;
  /** The opponent stays "???" until the ticket reveal. */
  revealed?: boolean;
  homeScore?: number;
};

/**
 * Drives every visible LED face of the real center-hung board. Each face is
 * projected on its own, but the art reads as one wrapped scoreboard:
 * left face → left pillar → front → right pillar, ticker continuing round the corner.
 */
export function JumbotronSurface({
  children,
  ribbonText,
  goalMode = false,
  revealed = false,
  homeScore = 0,
}: JumbotronSurfaceProps) {
  const tone = goalMode ? "goal" : "green";
  const ticker = goalMode ? "GOAL · GOAL · GOAL · " : ribbonText;
  const name = birthday.birthdayName.toUpperCase();

  return (
    <div className={`jumbotron-surface ${goalMode ? "jumbotron-surface--goal" : ""}`}>
      <ArenaSurface name="scoreStripFront" width={660} height={84} className="led score-strip">
        <span className="score-strip__team">{revealed ? birthday.opponentAbbr : "???"}</span>
        <b>0</b>
        <span className="score-strip__clock">{goalMode ? "GOAL" : birthday.gameTime}</span>
        <b>{homeScore}</b>
        <span className="score-strip__team score-strip__team--home">
          <img src={birthday.teamLogos.stars} alt={birthday.homeTeam} />
          DAL
        </span>
      </ArenaSurface>

      {/* Light the front screen throws onto the truss and crowd. */}
      <ArenaSurface name="mainFront" width={960} height={540} className="jumbo-bloom" />

      <ArenaSurface name="mainFront" width={960} height={540} className="led jumbo-screen">
        {children}
        <div className="jumbo-glass" aria-hidden="true" />
      </ArenaSurface>

      {/* Side faces: narrow and heavily foreshortened, so simple vertical graphics only. */}
      <ArenaSurface name="leftFace" width={90} height={960} className="led side-face">
        <span>{goalMode ? "GOAL" : name}</span>
      </ArenaSurface>
      <ArenaSurface name="leftPillar" width={64} height={960} className="led pillar">
        <span>{goalMode ? "★ GOAL ★" : "★ HAPPY ★"}</span>
      </ArenaSurface>
      <ArenaSurface name="rightPillar" width={64} height={960} className="led pillar">
        <span>{goalMode ? "★ GOAL ★" : "BIRTHDAY ★"}</span>
      </ArenaSurface>

      <ArenaSurface name="tickerFront" width={960} height={118} className="led">
        <ArenaRibbon text={ticker} tone={tone} size="large" />
      </ArenaSurface>
      {/* Ticker wraps the corner; same text and speed so it reads as one band. */}
      <ArenaSurface name="leftFaceTicker" width={40} height={118} className="led">
        <ArenaRibbon text={ticker} tone={tone} size="large" />
      </ArenaSurface>
    </div>
  );
}
