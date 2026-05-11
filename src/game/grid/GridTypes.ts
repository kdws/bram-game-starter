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
 */
export interface EngineState {
  bram: TilePos;
  bramFacing: Direction;
  stonesCarried: number;
  grid: CellType[][];
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
}

/**
 * ASCII map input. Future additions (push-block values, number stones)
 * can attach a per-tile values dictionary keyed by `x,y` strings.
 *
 * Legend (default):
 *   #  wall
 *   .  floor (or any whitespace)
 *   B  Bram start (becomes floor after parse)
 *   E  exit
 *   s  repair stone
 *   o  socket (empty initially)
 *   b  push block
 */
export interface GridMap {
  ascii: string;
}

/**
 * Concrete grid puzzle definition. Extends the shared PuzzleDef shape from
 * `src/game/puzzles/PuzzleTypes.ts` with the grid-specific payload.
 */
export interface GridPuzzleDef extends PuzzleDef {
  kind: 'grid_logic';
  map: GridMap;
}
