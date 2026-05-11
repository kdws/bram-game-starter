# Grid Puzzle System

Chip's-Challenge / Zelda / Sokoban-style **repair rooms** for
BRAM. Turn-based grid movement, no death, no lives, infinite
undo, full reset, generous hints. Aligns with
`PUZZLE_GAMEPLAY_DESIGN.md` §7E and §8.

Read alongside `PUZZLE_DESIGN_SYSTEM.md` (the cross-puzzle
plumbing) and `STORY_BIBLE.md` (Nilo/Bram/Owl voice).

---

## Architecture

```
ASCII map  →  GridPuzzleEngine (state machine, Phaser-free)
                         ↑
                         │
                         ▼
              GridPuzzleLabScene (Phaser renderer + input)
```

The **engine** owns state. The **scene** owns rendering, input,
and timing. The scene never mutates `engine.state` directly — it
calls `engine.tryMove(dir) | undo() | reset()` and renders from
the resulting state.

This split lets us:

- Write engine unit tests with no Phaser.
- Reuse the engine in other scenes (chapter rooms, repair
  rituals) without rebuilding rules.
- Swap renderers (e.g. a different chapter's tileset) without
  touching rules.

---

## Files

| File | Role |
|---|---|
| `src/game/grid/GridTypes.ts` | `CellType`, `Direction`, `EngineState`, `MoveResult`, `GridMap`, `GridPuzzleDef`. |
| `src/game/grid/GridPuzzleEngine.ts` | Pure state machine. Parses ASCII maps, applies moves, manages undo. |
| `src/scenes/GridPuzzleLabScene.ts` | The first playable demo (Broken Bridge). |

---

## ASCII map format

```
##############
#B...........#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
```

Default legend (parsed in `GridPuzzleEngine`):

```
#   wall
.   floor
(space)  floor (same as `.`)
B   Bram start (becomes floor after parse)
E   exit
s   repair stone
o   socket (empty initially)
b   push block
```

Adding new tile glyphs: add a new `CellType` in `GridTypes.ts`,
add an entry to `DEFAULT_LEGEND` in `GridPuzzleEngine.ts`, and
extend the scene's `drawCell()` to render the new type.

---

## v0.1 rules

- Bram moves one tile per keypress (arrow keys or WASD).
- Walking into a **wall**: bump (no move; facing still updates).
- Walking onto a **stone**: collect (+1 to `stonesCarried`); the
  cell becomes floor.
- Walking onto an **empty socket**: requires `stonesCarried ≥ 1`.
  Consumes one stone, fills the socket, Bram steps onto it. If
  the inventory is empty, bump.
- Walking onto a **filled socket**: passable (acts like floor).
- Walking onto a **push block**: if the cell beyond is floor or
  exit, push the block one tile in the direction of movement and
  step into the vacated tile. Otherwise bump. Stones, sockets,
  and walls cannot be the cell beyond.
- Walking onto **exit**: always allowed.

Solved condition:

```
isSolved = (no empty sockets remain) AND (Bram is standing on exit)
```

The exit visual changes (closed → open / glowing) the moment the
last empty socket is filled. Stepping on the open exit triggers
the success state.

---

## Quality of life (§8 required)

- **Unlimited undo** (`U`). Every legal move and every bump pushes
  a state snapshot onto a stack.
- **Reset** (`R`). Restores the initial parsed state and clears
  the undo stack.
- **No lives, no death.** Mistakes are recoverable.
- **Soft failure.** Bumps animate as a small lean toward the wall
  and back. No score penalty.
- **Generous hit zones for kids.** All input is keyboard-only at
  v0.1; touch is future work.
- **One new mechanic per room.** Maps should not stack push
  blocks, sliding tiles, and creatures in the same beginner room.
- **Optional hard rooms clearly marked.** Use `difficulty: 'optional'`
  on the `PuzzleDef`.

---

## Engine API

```ts
class GridPuzzleEngine {
  constructor(map: GridMap);

  // read
  readonly width: number;
  readonly height: number;
  readonly bram: TilePos;
  readonly bramFacing: Direction;
  readonly stonesCarried: number;
  readonly canUndo: boolean;
  readonly isSolved: boolean;
  getCell(x: number, y: number): CellType;
  countCells(type: CellType): number;
  countInitial(type: CellType): number;
  countSocketsRepaired(): number;
  countSocketsTotal(): number;
  allSocketsRepaired(): boolean;
  isBramOnExit(): boolean;
  snapshotGrid(): CellType[][];

  // write
  tryMove(dir: Direction): MoveResult;
  undo(): boolean;
  reset(): void;
}
```

`MoveResult` is a flat bag of booleans the scene uses to decide
feedback:

```ts
interface MoveResult {
  moved: boolean;
  bumped: boolean;
  collectedStone: boolean;
  filledSocket: boolean;
  pushedBlock: boolean;
  reachedExit: boolean;
  solved: boolean;
}
```

Multiple flags can be true on one move (e.g.
`{ moved: true, collectedStone: true }` when stepping onto a
stone cell). Always check `moved` first to decide whether to
animate Bram into the new tile.

---

## Scene responsibilities

The scene must:

1. Construct the engine with an ASCII map.
2. Center the grid on the camera. (`gridOriginX/Y` are integer
   pixels so tiles don't shimmer.)
3. Render the grid (background, tiles) using procedural Graphics
   for v0.1.
4. Render Bram at the engine's `bram` tile, using the existing
   `Bram` class. Call `bram.setFacing(engine.bramFacing)` after
   every state change.
5. Bind keyboard input. The required bindings are:
   - Arrow keys + WASD: movement
   - `U`: undo
   - `R`: reset
   - `M`: return to menu
6. After each move:
   - Re-render the grid (cells may have changed).
   - Refresh the HUD (stones carried, sockets repaired / total).
   - Tween Bram into the new tile (~180 ms).
   - Spawn the right feedback effect (sparkle on stone pickup,
     repair burst on socket fill, success panel on solved).
7. Hold the busy flag during Bram's move tween so inputs don't
   stack and break the tween.

---

## First playable demo: Broken Bridge

Map (in `GridPuzzleLabScene.ts`):

```
##############
#B...........#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
```

Counts: 4 stones, 4 sockets, 1 exit. Tutorial difficulty.

Player flow:

1. Walk left to pick up the first stone.
2. Walk right to fill the first socket.
3. Repeat for the remaining three stone/socket pairs.
4. Reach the bottom-right exit. Gate is now open.

Success beat:

> Title: **The bridge holds.**
> Nilo: *"It stayed."*
> Bram: *"Just enough."*

A small constellation of `✦` sparkles drifts over the panel,
then a "Return to menu" button.

---

## Future grid mechanics (§7E)

Each of these can be added one at a time in its own demo room:

| Mechanic | New cell types / rules |
|---|---|
| Push blocks | `push_block` (already in engine, untested by maps) |
| Sliding tiles / ice | `slide_n/s/e/w` — Bram continues until blocked |
| Force floors / conveyors | `force_n/s/e/w` — moves Bram on engine "tick" |
| Toggle switches | `switch_off/on`, `gate_closed/open` + linkage |
| Number stones / plates | values dict on a per-tile basis |
| Moving creatures | a `Creature[]` parallel to `grid`, updated on tick |
| Number-key doors | inventory by key kind |
| Hazards | bump-back tiles, "scatter and reassemble at start" tiles |

Adding "tickable" things (creatures, conveyors) will require the
engine to run a post-move tick step. Today the engine has no
tick — every state change is caused by Bram's move.

---

## Testing

The engine is Phaser-free, so it's straightforward to unit-test
once we add a test harness. Suggested first tests:

- Map parser turns `B`/`E`/`s`/`o`/`#` into the right
  `CellType`s and places Bram correctly.
- `tryMove('right')` into a wall sets `bumped`, does not move,
  but does update `bramFacing`.
- `tryMove` onto a stone sets `collectedStone`, increments
  `stonesCarried`, and turns the cell into floor.
- `tryMove` onto an empty socket without a stone bumps; with a
  stone fills and steps.
- Push block: legal push moves the block and Bram; illegal push
  bumps.
- `undo()` reverses any single move including bumps (facing
  restored).
- `reset()` clears undo stack and restores initial state.
- `isSolved` becomes true only when all sockets are filled AND
  Bram is on exit.

These mirror the v0.1 acceptance criteria in
`PUZZLE_GAMEPLAY_DESIGN.md` §15.
