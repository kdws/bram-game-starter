import {
  CellType,
  Direction,
  EngineState,
  GridMap,
  MoveResult,
  NumberedAcceptMode,
  NumberedCell,
  TilePos
} from './GridTypes';

/**
 * Pure (Phaser-free) state machine for a grid puzzle room. Owns the grid,
 * Bram's position, inventory, and an undo stack. Scenes call `tryMove`,
 * `undo`, `reset` and read the state via the getters.
 *
 * Rules in v0.1:
 *  - Bram moves one tile at a time.
 *  - Walking into a wall: bump (no move, facing still updates).
 *  - Walking onto a stone: collect (+1 inventory), cell becomes floor.
 *  - Walking onto an empty socket: if carrying ≥ 1 stone, fill it (cell
 *    becomes socket_filled, inventory -1) and step onto it. Otherwise bump.
 *  - Walking onto a filled socket: passable (acts like floor).
 *  - Walking onto a push block: if the cell beyond is *floor*, push
 *    the block into it and step into the vacated cell. Otherwise the
 *    move bumps and `attemptedPush` is set so the scene can surface the
 *    "blocks need empty space" teaching hint. Pushing onto sockets,
 *    stones, exits, other blocks, or walls all bump.
 *  - Walking onto exit: always allowed. "Solved" only fires when all
 *    sockets are filled AND Bram is standing on exit.
 *
 * No death, no lives. Every mutation pushes a snapshot onto the undo
 * stack, including bumps (so undo also un-rotates Bram if needed).
 */
const DEFAULT_LEGEND: Record<string, CellType | 'start'> = {
  '#': 'wall',
  '.': 'floor',
  ' ': 'floor',
  'E': 'exit',
  's': 'stone',
  'o': 'socket_empty',
  'b': 'push_block',
  'B': 'start'
};

export class GridPuzzleEngine {
  private readonly initial: EngineState;
  private state: EngineState;
  private readonly undoStack: EngineState[] = [];

  constructor(map: GridMap) {
    this.initial = this.parseMap(map.ascii, map.numbered);
    this.state = this.cloneState(this.initial);
  }

  // ---------- read ----------

  get width(): number {
    return this.state.grid[0]?.length ?? 0;
  }
  get height(): number {
    return this.state.grid.length;
  }
  get bram(): TilePos {
    return { ...this.state.bram };
  }
  get bramFacing(): Direction {
    return this.state.bramFacing;
  }
  get stonesCarried(): number {
    return this.state.stonesCarried;
  }
  /** Read-only copy of the value-tagged stones Bram is carrying. */
  get numberedCarried(): number[] {
    return this.state.numberedCarried.slice();
  }
  /** Total stones in inventory (generic + numbered). */
  get totalStonesCarried(): number {
    return this.state.stonesCarried + this.state.numberedCarried.length;
  }
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Numbered value associated with a cell, if any. */
  getCellValue(x: number, y: number): number | undefined {
    return this.state.cellValues[`${x},${y}`];
  }

  /** Per-socket accept mode. Returns 'exact' if not explicitly set. */
  getCellAcceptMode(x: number, y: number): NumberedAcceptMode {
    return this.state.cellAcceptModes[`${x},${y}`] ?? 'exact';
  }

  getCell(x: number, y: number): CellType {
    if (y < 0 || y >= this.state.grid.length) return 'wall';
    const row = this.state.grid[y];
    if (x < 0 || x >= row.length) return 'wall';
    return row[x];
  }

  countCells(type: CellType): number {
    let n = 0;
    for (const row of this.state.grid) {
      for (const c of row) if (c === type) n++;
    }
    return n;
  }

  countInitial(type: CellType): number {
    let n = 0;
    for (const row of this.initial.grid) {
      for (const c of row) if (c === type) n++;
    }
    return n;
  }

  /** Sockets that started life empty and are now repaired. */
  countSocketsRepaired(): number {
    return this.countCells('socket_filled');
  }

  /** Sockets that started empty in the map. */
  countSocketsTotal(): number {
    // Initial empty + initial filled (none initially, but future-proof).
    return this.countInitial('socket_empty') + this.countInitial('socket_filled');
  }

  allSocketsRepaired(): boolean {
    return this.countCells('socket_empty') === 0
        && this.countSocketsTotal() > 0;
  }

  isBramOnExit(): boolean {
    return this.getCell(this.state.bram.x, this.state.bram.y) === 'exit';
  }

  get isSolved(): boolean {
    return this.allSocketsRepaired() && this.isBramOnExit();
  }

  /** Snapshot of the live grid (read-only copy). */
  snapshotGrid(): CellType[][] {
    return this.state.grid.map(row => row.slice());
  }

  // ---------- write ----------

  tryMove(dir: Direction): MoveResult {
    const result: MoveResult = {
      moved: false,
      bumped: false,
      attemptedPush: false,
      collectedStone: false,
      filledSocket: false,
      pushedBlock: false,
      reachedExit: false,
      solved: false,
      numberMismatch: false,
      numberValue: null
    };

    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const nx = this.state.bram.x + dx;
    const ny = this.state.bram.y + dy;
    const target = this.getCell(nx, ny);
    const targetKey = `${nx},${ny}`;
    const targetValue = this.state.cellValues[targetKey];

    // Always capture a snapshot before any mutation so undo can restore
    // facing, position, inventory, and grid.
    const snapshot = this.cloneState(this.state);
    let mutated = false;

    // Facing follows the attempted direction even on a bump — feels good
    // and lets Bram "look" at obstacles.
    if (this.state.bramFacing !== dir) {
      this.state.bramFacing = dir;
      mutated = true;
    }

    if (target === 'wall') {
      result.bumped = true;
      if (mutated) this.undoStack.push(snapshot);
      return result;
    }

    if (target === 'push_block') {
      const bx = nx + dx;
      const by = ny + dy;
      const beyond = this.getCell(bx, by);
      // Only floor is a valid push target. Sockets, exits, stones, walls,
      // and other blocks all bump and flag attemptedPush.
      if (beyond !== 'floor') {
        result.bumped = true;
        result.attemptedPush = true;
        if (mutated) this.undoStack.push(snapshot);
        return result;
      }
      this.state.grid[by][bx] = 'push_block';
      this.state.grid[ny][nx] = 'floor';
      this.state.bram = { x: nx, y: ny };
      result.pushedBlock = true;
      result.moved = true;
      this.finalizeMove(result, snapshot);
      return result;
    }

    if (target === 'socket_empty') {
      // Numbered socket: needs a matching numbered stone (exact mode) or
      // any pair summing to the socket value (sum_pair mode).
      if (targetValue !== undefined) {
        const mode = this.state.cellAcceptModes[targetKey] ?? 'exact';

        if (mode === 'sum_pair') {
          const pair = this.findSumPair(this.state.numberedCarried, targetValue);
          if (!pair) {
            result.bumped = true;
            result.numberMismatch = true;
            result.numberValue = targetValue;
            if (mutated) this.undoStack.push(snapshot);
            return result;
          }
          // Remove the higher index first so the lower index stays valid.
          const [iA, iB] = pair[0] > pair[1] ? pair : [pair[1], pair[0]];
          this.state.numberedCarried.splice(iA, 1);
          this.state.numberedCarried.splice(iB, 1);
          this.state.grid[ny][nx] = 'socket_filled';
          result.filledSocket = true;
          result.numberValue = targetValue;
          this.state.bram = { x: nx, y: ny };
          result.moved = true;
          this.finalizeMove(result, snapshot);
          return result;
        }

        // exact mode (default)
        const idx = this.state.numberedCarried.indexOf(targetValue);
        if (idx < 0) {
          result.bumped = true;
          result.numberMismatch = true;
          result.numberValue = targetValue;
          if (mutated) this.undoStack.push(snapshot);
          return result;
        }
        this.state.numberedCarried.splice(idx, 1);
        this.state.grid[ny][nx] = 'socket_filled';
        // cellValues[targetKey] stays — the socket is now lit with that value.
        result.filledSocket = true;
        result.numberValue = targetValue;
        this.state.bram = { x: nx, y: ny };
        result.moved = true;
        this.finalizeMove(result, snapshot);
        return result;
      }
      // Plain socket: needs any generic stone in inventory.
      if (this.state.stonesCarried <= 0) {
        result.bumped = true;
        if (mutated) this.undoStack.push(snapshot);
        return result;
      }
      this.state.stonesCarried -= 1;
      this.state.grid[ny][nx] = 'socket_filled';
      result.filledSocket = true;
      this.state.bram = { x: nx, y: ny };
      result.moved = true;
      this.finalizeMove(result, snapshot);
      return result;
    }

    if (target === 'stone') {
      if (targetValue !== undefined) {
        this.state.numberedCarried.push(targetValue);
        result.numberValue = targetValue;
        // Remove the value from cellValues — the cell is now plain floor.
        delete this.state.cellValues[targetKey];
      } else {
        this.state.stonesCarried += 1;
      }
      this.state.grid[ny][nx] = 'floor';
      result.collectedStone = true;
    }

    if (target === 'exit') {
      result.reachedExit = true;
    }

    this.state.bram = { x: nx, y: ny };
    result.moved = true;
    this.finalizeMove(result, snapshot);
    return result;
  }

  undo(): boolean {
    const prev = this.undoStack.pop();
    if (!prev) return false;
    this.state = prev;
    return true;
  }

  reset(): void {
    this.state = this.cloneState(this.initial);
    this.undoStack.length = 0;
  }

  // ---------- internals ----------

  private finalizeMove(result: MoveResult, snapshot: EngineState): void {
    if (this.isSolved) result.solved = true;
    this.undoStack.push(snapshot);
  }

  /**
   * Find two indices in `values` whose entries sum to `target`. Returns
   * `null` if no such pair exists. Used by sum_pair sockets.
   * O(n²) but n ≤ 10 in practice.
   */
  private findSumPair(values: number[], target: number): [number, number] | null {
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] + values[j] === target) return [i, j];
      }
    }
    return null;
  }

  private parseMap(
    ascii: string,
    numbered?: Record<string, NumberedCell>
  ): EngineState {
    const rows = ascii.replace(/^\n+|\n+$/g, '').split('\n').map(r => r.replace(/\s+$/, ''));
    const height = rows.length;
    const width = rows.reduce((m, r) => Math.max(m, r.length), 0);

    let bram: TilePos = { x: 0, y: 0 };
    let bramFound = false;
    const grid: CellType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: CellType[] = [];
      const raw = rows[y];
      for (let x = 0; x < width; x++) {
        const ch = raw[x] ?? '#';
        const mapped = DEFAULT_LEGEND[ch] ?? 'wall';
        if (mapped === 'start') {
          bram = { x, y };
          bramFound = true;
          row.push('floor');
        } else {
          row.push(mapped);
        }
      }
      grid.push(row);
    }

    if (!bramFound) {
      // Fallback: drop Bram on the first floor tile if the map forgot a B.
      outer: for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (grid[y][x] === 'floor') { bram = { x, y }; break outer; }
        }
      }
    }

    // Apply numbered overlay. The ASCII must already place `s` (stone) or
    // `o` (socket_empty) at each tagged position; the overlay just records
    // the value (and accept-mode for sockets).
    const cellValues: Record<string, number> = {};
    const cellAcceptModes: Record<string, NumberedAcceptMode> = {};
    if (numbered) {
      for (const [key, info] of Object.entries(numbered)) {
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);
        if (Number.isNaN(x) || Number.isNaN(y)) continue;
        if (y < 0 || y >= height || x < 0 || x >= width) continue;
        const cell = grid[y][x];
        const wantStone  = info.kind === 'stone'  && cell === 'stone';
        const wantSocket = info.kind === 'socket' && cell === 'socket_empty';
        if (!wantStone && !wantSocket) {
          // Tag points at the wrong cell type — skip silently in prod.
          continue;
        }
        cellValues[key] = info.value;
        if (info.kind === 'socket' && info.acceptMode) {
          cellAcceptModes[key] = info.acceptMode;
        }
      }
    }

    return {
      bram,
      bramFacing: 'right',
      stonesCarried: 0,
      numberedCarried: [],
      grid,
      cellValues,
      cellAcceptModes
    };
  }

  private cloneState(s: EngineState): EngineState {
    return {
      bram: { ...s.bram },
      bramFacing: s.bramFacing,
      stonesCarried: s.stonesCarried,
      numberedCarried: s.numberedCarried.slice(),
      grid: s.grid.map(row => row.slice()),
      cellValues: { ...s.cellValues },
      cellAcceptModes: { ...s.cellAcceptModes }
    };
  }
}
