import type { ReactNode } from "react";
import { SURFACES } from "../arena/geometry";
import { birthday } from "../config";
import { ArenaRibbon } from "./ArenaRibbon";
import { ArenaSurface } from "./ArenaSurface";

type JumbotronSurfaceProps = {
  children: ReactNode;
  ribbonText: string;
  goalMode?: boolean;
};

/** Drives the center-hung board that is already in the photo. No fake hardware. */
export function JumbotronSurface({ children, ribbonText, goalMode = false }: JumbotronSurfaceProps) {
  const tone = goalMode ? "goal" : "green";
  return (
    <div className={`jumbotron-surface ${goalMode ? "jumbotron-surface--goal" : ""}`}>
      <ArenaSurface quad={SURFACES.scoreStrip} width={660} height={80} className="led score-strip">
        <span className="score-strip__team">COL</span>
        <b>0</b>
        <span className="score-strip__clock">{goalMode ? "GOAL" : birthday.gameTime}</span>
        <b>{goalMode ? 1 : 0}</b>
        <span className="score-strip__team score-strip__team--home">DAL ★</span>
      </ArenaSurface>

      <ArenaSurface quad={SURFACES.screen} width={960} height={540} className="led jumbo-screen">
        {children}
      </ArenaSurface>

      <ArenaSurface quad={SURFACES.nameRibbon} width={960} height={110} className="led">
        <ArenaRibbon text={goalMode ? "GOAL · GOAL · GOAL · " : ribbonText} tone={tone} size="large" />
      </ArenaSurface>

      {[SURFACES.sideLeft, SURFACES.sideRight].map((quad, index) => (
        <ArenaSurface key={index} quad={quad} width={60} height={600} className="led side-strip">
          <span>{goalMode ? "GOAL" : "HAPPY BIRTHDAY"}</span>
        </ArenaSurface>
      ))}
    </div>
  );
}
