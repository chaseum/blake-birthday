/**
 * Meowdoku: one cat per row, column and colored region; cats may not touch,
 * even diagonally. Hidden easter egg (click the cat on the opening ice shot).
 * Never part of progression.
 *
 * To swap the layout, edit REGIONS (letters = regions). `npm run check`
 * verifies it still has exactly one solution.
 */
export const REGIONS = ["AAACC", "AABCC", "ABBCC", "ADDDC", "ADEEE"];
export const SIZE = REGIONS.length;

/** Coat colors: ginger, silver tabby, tuxedo, cream, calico. */
export const REGION_COLORS: Record<string, { fill: string; name: string }> = {
  A: { fill: "#e79a4f", name: "ginger" },
  B: { fill: "#9aa3ab", name: "silver" },
  C: { fill: "#3a3f47", name: "tuxedo" },
  D: { fill: "#f1dcc0", name: "cream" },
  E: { fill: "#c98fa8", name: "calico" },
};

export type Cell = "empty" | "cat" | "x";
export type Board = Cell[][];

export const emptyBoard = (): Board =>
  Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, (): Cell => "empty"));

/** LinkedIn Queens order: tap once to rule a cell out, again for a cat, again to clear. */
export const nextCell = (cell: Cell): Cell => (cell === "empty" ? "x" : cell === "x" ? "cat" : "empty");

/** Drag marking: empty cells become X; X and cats are left alone. */
export const markX = (board: Board, r: number, c: number): Board =>
  board[r][c] !== "empty" ? board : board.map((row, ri) => (ri !== r ? row : row.map((cell, ci) => (ci === c ? "x" : cell))));

/** Keys ("r,c") of cats that break a rule, and whether the board is solved. */
export function checkBoard(board: Board) {
  const cats: [number, number][] = [];
  board.forEach((row, r) => row.forEach((cell, c) => cell === "cat" && cats.push([r, c])));

  const conflicts = new Set<string>();
  cats.forEach(([r1, c1], i) =>
    cats.slice(i + 1).forEach(([r2, c2]) => {
      const sameLine = r1 === r2 || c1 === c2;
      const sameRegion = REGIONS[r1][c1] === REGIONS[r2][c2];
      const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
      if (sameLine || sameRegion || touching) {
        conflicts.add(`${r1},${c1}`);
        conflicts.add(`${r2},${c2}`);
      }
    }),
  );

  return { conflicts, solved: cats.length === SIZE && conflicts.size === 0 };
}
