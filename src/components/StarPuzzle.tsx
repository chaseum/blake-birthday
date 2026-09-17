import { useState } from "react";
import { REGIONS, REGION_COLORS, checkBoard, emptyBoard, nextCell, type Board } from "../puzzle/starPuzzle";

const REGION_NAMES: Record<string, string> = {
  A: "green",
  B: "silver",
  C: "black",
  D: "mint",
  E: "white",
};

export function StarPuzzle({ onClose }: { onClose: () => void }) {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const { conflicts, solved } = checkBoard(board);

  const toggle = (r: number, c: number) =>
    setBoard((current) =>
      current.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? nextCell(cell) : cell))),
    );

  return (
    <div className="star-puzzle" role="dialog" aria-modal="true" aria-labelledby="star-puzzle-title">
      <div className="star-puzzle__card">
        <span className="star-puzzle__kicker">🐾 BONUS ROUND</span>
        <h2 id="star-puzzle-title">{solved ? "PERFECT LINE CHANGE!" : "STAR PLACEMENT"}</h2>
        <p>One ★ in every row, column and color. Stars can't touch — not even diagonally. Tap once for ★, twice to cross out.</p>

        <div className="star-puzzle__grid" style={{ gridTemplateColumns: `repeat(${REGIONS.length}, 1fr)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const region = REGIONS[r][c];
              const bad = conflicts.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  className={`star-puzzle__cell ${bad ? "star-puzzle__cell--bad" : ""}`}
                  style={{ background: REGION_COLORS[region] }}
                  data-light={region === "D" || region === "E" ? "" : undefined}
                  onClick={() => toggle(r, c)}
                  aria-label={`Row ${r + 1}, column ${c + 1}, ${REGION_NAMES[region]} region, ${cell}`}
                  disabled={solved}
                >
                  {cell === "star" ? "★" : cell === "mark" ? "×" : ""}
                </button>
              );
            }),
          )}
        </div>

        <div className="star-puzzle__actions">
          <button onClick={() => setBoard(emptyBoard())} disabled={solved}>
            RESET
          </button>
          <button onClick={onClose}>{solved ? "DONE" : "CLOSE"}</button>
        </div>
      </div>
    </div>
  );
}
