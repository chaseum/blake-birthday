import type { ReactNode } from "react";
import { ArenaRibbon } from "./ArenaRibbon";
import { Jumbotron } from "./Jumbotron";

export type CameraMode = "wide" | "jumbotron" | "ice" | "goal";

type ArenaWorldProps = {
  image: string;
  camera: CameraMode;
  children: ReactNode;
  goalMode?: boolean;
  dim?: boolean;
  credit?: {
    label: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
  };
};

export function ArenaWorld({
  image,
  camera,
  children,
  goalMode = false,
  dim = false,
  credit,
}: ArenaWorldProps) {
  return (
    <div
      className={`arena-world arena-world--${camera} ${dim ? "arena-world--dim" : ""}`}
    >
      <div className="arena-camera">
        <img className="arena-photo" src={image} alt="American Airlines Center ice rink" />
        <div className="arena-photo__shade" />
        <div className="arena-crowd-glow" />

        <div className="arena-ribbon-wrap arena-ribbon-wrap--top">
          <ArenaRibbon text="HAPPY BIRTHDAY BLAKE · DALLAS STARS · FEATURED FAN · " />
        </div>
        <div className="arena-ribbon-wrap arena-ribbon-wrap--lower">
          <ArenaRibbon
            text="TONIGHT ONLY · TEAM US · JAN 22 2027 · AMERICAN AIRLINES CENTER · "
            tone="white"
          />
        </div>

        <div className="jumbotron-anchor">
          <Jumbotron goalMode={goalMode}>{children}</Jumbotron>
        </div>

        <div className="ice-spotlight" aria-hidden="true" />
      </div>
      <div className="camera-vignette" aria-hidden="true" />
      {camera === "ice" ? <div className="speed-lines" aria-hidden="true" /> : null}
      {credit ? (
        <div className="arena-credit">
          <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
            {credit.label}
          </a>
          <span> · </span>
          <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
            {credit.license}
          </a>
        </div>
      ) : null}
    </div>
  );
}
