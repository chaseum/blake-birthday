import { useEffect, useRef, useState } from "react";
import { playMeowdokuPlace, playMeowdokuSolved, playUiClick } from "../audio/arenaAudio";
import { REGIONS, REGION_COLORS, SIZE, checkBoard, emptyBoard, nextCell, type Board } from "../puzzle/meowdoku";
import { CatFace } from "./CatEasterEgg";

/** Hidden easter egg. Opening/closing never touches the birthday flow. */
export function Meowdoku({ onClose }: { onClose: () => void }) {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const { conflicts, solved } = checkBoard(board);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (solved) playMeowdokuSolved();
  }, [solved]);

  const toggle = (r: number, c: number) => {
    playMeowdokuPlace(nextCell(board[r][c]));
    // Functional update: fast double-taps must not read a stale board.
    setBoard((current) => current.map((row, ri) => row.map((old, ci) => (ri === r && ci === c ? nextCell(old) : old))));
  };

  return (
    <div className="meowdoku" role="dialog" aria-modal="true" aria-labelledby="meowdoku-title">
      <div className="meowdoku__card">
        <button ref={closeRef} className="meowdoku__close" onClick={onClose} aria-label="Close Meowdoku">
          ×
        </button>
        <h2 id="meowdoku-title">
          <CatFace className="meowdoku__logo" />
          {solved ? "PURR-FECT!" : "MEOWDOKU"}
        </h2>
        <p>
          One cat in every row, column and color. Cats need their space — no touching, not even diagonally. Tap: cat → ✕ → empty.
        </p>

        <div
          className={`meowdoku__grid ${solved ? "meowdoku__grid--solved" : ""}`}
          style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const region = REGIONS[r][c];
              // Thick borders where the region changes, so regions read at a glance.
              const edge = (dr: number, dc: number) => REGIONS[r + dr]?.[c + dc] !== undefined && REGIONS[r + dr][c + dc] !== region;
              return (
                <button
                  key={`${r}-${c}`}
                  className={[
                    "meowdoku__cell",
                    conflicts.has(`${r},${c}`) ? "meowdoku__cell--bad" : "",
                    edge(0, 1) ? "meowdoku__cell--edge-r" : "",
                    edge(1, 0) ? "meowdoku__cell--edge-b" : "",
                  ].join(" ")}
                  style={{ background: REGION_COLORS[region].fill, color: region === "C" ? "#fff8ef" : undefined }}
                  onClick={() => toggle(r, c)}
                  aria-label={`Row ${r + 1}, column ${c + 1}, ${REGION_COLORS[region].name} region, ${cell === "x" ? "crossed out" : cell}`}
                  disabled={solved}
                >
                  {cell === "cat" ? <CatFace className="meowdoku__cat" /> : cell === "x" ? <span className="meowdoku__x">✕</span> : null}
                </button>
              );
            }),
          )}
        </div>

        <div className="meowdoku__actions">
          <button
            onClick={() => {
              playUiClick();
              setBoard(emptyBoard());
            }}
          >
            RESET
          </button>
          <button onClick={onClose}>{solved ? "BACK TO THE GAME" : "CLOSE"}</button>
        </div>
      </div>
    </div>
  );
}
