/**
 * Optional Meowdoku-style bonus: place one ★ per row, column and colored
 * region; stars may not touch, even diagonally. Unlocked by clicking the cat
 * during the lineup. Never blocks the main flow.
 *
 * To swap the layout, edit REGIONS (letters = regions). `npm run check`
 * verifies it still has exactly one solution.
 */
export const REGIONS = ["AAACC", "AABCC", "ABBCC", "ADDDC", "ADEEE"];
export const SIZE = REGIONS.length;

export const REGION_COLORS: Record<string, string> = {
  A: "#006847",
  B: "#8f8f8c",
  C: "#1b2420",
  D: "#2ee88a",
  E: "#d9dedb",
};

export type Cell = "empty" | "star" | "mark";
export type Board = Cell[][];

export const emptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, (): Cell => "empty"));

export const nextCell = (cell: Cell): Cell => (cell === "empty" ? "star" : cell === "star" ? "mark" : "empty");

/** Keys ("r,c") of stars that break a rule, and whether the board is solved. */
export function checkBoard(board: Board) {
  const stars: [number, number][] = [];
  board.forEach((row, r) => row.forEach((cell, c) => cell === "star" && stars.push([r, c])));

  const conflicts = new Set<string>();
  stars.forEach(([r1, c1], i) =>
    stars.slice(i + 1).forEach(([r2, c2]) => {
      const sameLine = r1 === r2 || c1 === c2;
      const sameRegion = REGIONS[r1][c1] === REGIONS[r2][c2];
      const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
      if (sameLine || sameRegion || touching) {
        conflicts.add(`${r1},${c1}`);
        conflicts.add(`${r2},${c2}`);
      }
    }),
  );

  return { conflicts, solved: stars.length === SIZE && conflicts.size === 0 };
}
