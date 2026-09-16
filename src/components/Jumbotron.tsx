import type { ReactNode } from "react";

type JumbotronProps = {
  children: ReactNode;
  sideText?: string;
  goalMode?: boolean;
};

export function Jumbotron({
  children,
  sideText = "DALLAS STARS",
  goalMode = false,
}: JumbotronProps) {
  return (
    <div className={`jumbotron ${goalMode ? "jumbotron--goal" : ""}`}>
      <div className="jumbotron__crown">
        <span>AMERICAN AIRLINES CENTER</span>
      </div>

      <div className="jumbotron__side jumbotron__side--left">
        <span>{goalMode ? "GOAL" : sideText}</span>
      </div>

      <div className="jumbotron__screen">{children}</div>

      <div className="jumbotron__side jumbotron__side--right">
        <span>{goalMode ? "GOAL" : sideText}</span>
      </div>

      <div className="jumbotron__score-strip">
        <span>DAL</span>
        <strong>{goalMode ? "GOAL" : "BIRTHDAY NIGHT"}</strong>
        <span>★</span>
      </div>
    </div>
  );
}
