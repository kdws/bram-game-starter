import type { PuzzleDef } from '../puzzles/PuzzleTypes';

/**
 * Discrete grid cell types. Sockets have two states (empty / filled) so the
 * engine can render and reason about them as a single cell.
 *
 * Extending the legend later: add a new CellType plus an entry in
 * DEFAULT_LEGEND in GridPuzzleEngine.ts. No other engine changes required
 * unless the new cell introduces a new movement rule.
 */
export type CellType =
  | 'wall'
  | 'floor'
  | 'exit'
  | 'stone'
  | 'socket_empty'
  | 'socket_filled'
  | 'push_block';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface TilePos {
  x: number;
  y: number;
}

/**
 * Engine state snapshot. Bram's position, facing, inventory count, and the
 * full grid. The undo stack is just an array of these.
 *
 * `numberedCarried` parallels `stonesCarried` but for value-tagged stones
 * (Number Gate rooms). `cellValues` maps `"x,y"` to the value associated
 * with that cell (numbered stone before pickup, or numbered socket — both
 * before and after fill, since the visual needs the value either way).
 */
export interface EngineState {
  bram: TilePos;
  bramFacing: Direction;
  stonesCarried: number;
  numberedCarried: number[];
  grid: CellType[][];
  cellValues: Record<string, number>;
}

/**
 * Outcome of a single move attempt. Multiple flags can be true on one move
 * (e.g. collected a stone AND reached the exit). The scene uses these to
 * choose feedback (sparkle, glow, success beat).
 */
export interface MoveResult {
  moved: boolean;
  bumped: boolean;
  /**
   * True when Bram tried to push a block but the cell beyond was not floor.
   * Implies `bumped: true, moved: false`. The scene uses this to surface
   * the "Blocks need empty space behind them." teaching hint.
   */
  attemptedPush: boolean;
  collectedStone: boolean;
  filledSocket: boolean;
  pushedBlock: boolean;
  reachedExit: boolean;
  solved: boolean;
  /**
   * True when Bram tried to step onto a numbered socket but had no matching
   * numbered stone in inventory. Implies `bumped: true, moved: false`.
   * The scene uses this to flash a socket_reject animation.
   */
  numberMismatch: boolean;
  /** The numbered value involved in the last pickup / fill / mismatch. */
  numberValue: number | null;
}

/**
 * ASCII map input plus optional side data for numbered cells.
 *
 * Legend (default):
 *   #  wall
 *   .  floor (or any whitespace)
 *   B  Bram start (becomes floor after parse)
 *   E  exit
 *   s  repair stone
 *   o  socket (empty initially)
 *   b  push block
 *
 * `numbered` overrides the value tag of a stone or socket at a specific
 * tile, keyed by `"x,y"`. The ASCII still uses `s` and `o` for the slot;
 * the overlay just labels it with a required/carried number. Used by
 * Number Gate rooms.
 */
export interface NumberedCell {
  kind: 'stone' | 'socket';
  value: number;
}

export interface GridMap {
  ascii: string;
  numbered?: Record<string, NumberedCell>;
}

/**
 * Concrete grid puzzle definition. Extends the shared PuzzleDef shape from
 * `src/game/puzzles/PuzzleTypes.ts` with the grid-specific payload.
 */
export interface GridPuzzleDef extends PuzzleDef {
  kind: 'grid_logic';
  map: GridMap;
}
