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

## v0.2 rules

- Bram moves one tile per keypress (arrow keys or WASD).
- Walking into a **wall**: bump (no move; facing still updates).
- Walking onto a **stone**: collect (+1 to `stonesCarried`); the
  cell becomes floor.
- Walking onto an **empty socket**: requires `stonesCarried ≥ 1`.
  Consumes one stone, fills the socket, Bram steps onto it. If
  the inventory is empty, bump.
- Walking onto a **filled socket**: passable (acts like floor).
- Walking onto a **push block**: if the cell beyond is **floor**,
  push the block one tile in the direction of movement and step
  into the vacated tile. Otherwise the move bumps and the engine
  flags `attemptedPush` so the scene can show the
  "blocks need empty space" teaching hint. Sockets (empty or
  filled), stones, exits, walls, and other blocks all bump.
- Walking onto **exit**: always allowed.

Push-rule change in v0.2: v0.1 allowed pushing a block onto the
exit, which destroyed the exit cell. v0.2 tightens the rule to
"floor only," which is also a clearer mental model for kids and
makes the teaching hint consistent.

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
- **Generous hit zones for kids.** All input is keyboard, touch, or
  mouse — see Controls below.
- **One new mechanic per room.** Maps should not stack push
  blocks, sliding tiles, and creatures in the same beginner room.
- **Optional hard rooms clearly marked.** Use `difficulty: 'optional'`
  on the `PuzzleDef`.

---

## Controls (v0.3 — keyboard + touch)

The scene exposes four parallel input paths. They all route into
the same `attemptMove(dir) | attemptUndo() | attemptReset()` methods,
which gate on `busy` (tween in flight) and `successOpen` (panel up)
so nothing fires during animations.

### Keyboard

| Key | Action |
|---|---|
| Arrow keys / WASD | Move Bram one tile in that direction |
| `U` | Undo |
| `R` | Reset |
| `M` | Return to menu |

### On-screen D-pad

Four glowing arrow buttons sit in the right column to the right of
the grid (centered around `(1090, 380)`). Each is a `60×60` hit zone
with a sprite arrow (`arrow_*_glow.png`) when assets are loaded, or
a procedural rounded-square arrow otherwise. Pressing one calls
`attemptMove(dir)`.

### On-screen Undo / Reset

In the bottom HUD strip: tappable icons using `button_undo.png` and
`button_reset.png` sprites (procedural fallback if missing). The
keyboard label (`U` / `R`) floats above each icon as a hint.

### Swipe (grid area)

The grid area `(gridOriginX, gridOriginY, width*TILE, height*TILE)`
hosts an interactive zone. On `pointerdown` we record the start point;
on `pointerup` we compute `(dx, dy)`:

- `dist ≤ TAP_MAX_DRAG (14 px)` → treated as a **tap**.
- `dist ≥ SWIPE_THRESHOLD (30 px)` → **swipe**, dominant axis decides
  direction.
- Anything between is ignored (dead zone — prevents accidental
  micro-drags from firing moves).

The scene-level `pointerup` listener resolves swipes that end just
outside the grid zone too.

### Tap-to-adjacent (grid area)

A tap (distance ≤ `TAP_MAX_DRAG`) hit-tests the tile under the release
point. If that tile is one of Bram's 4-neighbors, the inferred
direction is passed to `attemptMove`. Taps on Bram's tile or on
non-adjacent tiles are ignored in v0.1 (future v0.2 work: pathfind
on longer-range taps).

### Gating

All four input paths share the same gates inside `attemptMove`:

```ts
if (this.busy || this.successOpen) return;
```

No move can fire while the 180 ms Bram-tween or the 80 ms wall-bump
yoyo is in flight. Multiple rapid arrow taps cleanly queue at zero,
i.e. they're dropped — by design, to keep child playtests
predictable.

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

## First playable demo: Broken Bridge (v0.2)

Map (in `GridPuzzleLabScene.ts`):

```
##############
#B...........#
#.s.....o....#
#............#
#.s....bo....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
```

Counts: 4 stones, 4 sockets, **1 push block**, 1 exit. Tutorial
difficulty.

The push block sits in row 4 directly to the left of a repair
socket. Pushing **right** — the obvious next step toward the
socket — bumps because the cell beyond is the socket itself.
That's the teaching moment. Pushing up or down both clear the
path, so the puzzle is forgiving while still rewarding "look
before pushing."

### Teaching purpose

> Push blocks introduce spatial planning and make undo feel
> useful.

Three layered teaching hints fire from the scene as events
happen. They replace the bottom-of-title tip line in place:

| Trigger | Tip text |
|---|---|
| Scene start | "Collect stones, repair sockets, and push blocks out of the way." |
| First `attemptedPush` (bumped) | "Blocks need empty space behind them." |
| First undo after at least one move | "Good — one step back is part of solving." |

Each hint fires once per scene visit; later events of the same
kind do not re-fire.

### Visual direction (v0.3 — sprite integration, 2026-05-12)

Sliced runtime sprites from `bram_sliced_runtime_assets_rebuilt`
ship under `public/assets/` and are loaded by `loadGridAssets()`
in `BootScene`. `GridPuzzleLabScene` renders two layers:

- **Static sprite layer** (walls + floors): created once at `create()`
  time; never torn down.
- **Dynamic sprite pool** (stones, sockets, push block, exit): destroyed
  and recreated each `renderDynamicCells()` call after every player move.
- **Procedural fallback**: if `this.textures.exists(GridAssets.WALL)`
  returns false, the scene falls back to the original Graphics-based
  `drawCellProcedural()`.

Key asset mappings:

| Cell type | Asset key | File |
|---|---|---|
| Wall | `grid_wall` | `tilesets/rattlewood_grid/tile_01.png` |
| Floor (even) | `grid_floor` | `tilesets/rattlewood_grid/tile_07.png` |
| Floor (odd) | `grid_floor_alt` | `tilesets/rattlewood_grid/tile_08.png` |
| Socket empty | `grid_socket_empty` | `tilesets/rattlewood_grid/socket_unlit.png` |
| Socket filled | `grid_socket_filled` | `tilesets/rattlewood_grid/socket_lit_c.png` |
| Repair stone | `grid_repair_stone` | `props/grid/repair_stone_glow.png` |
| Push block | `grid_push_block` | `props/grid/push_block_stone.png` |
| Exit closed | `grid_exit_closed` | `tilesets/rattlewood_grid/exit_closed_arch.png` |
| Exit open | `grid_exit_open` | `tilesets/rattlewood_grid/exit_open_arch.png` |

Keys are defined in `src/game/assets/GridAssetKeys.ts`.

The old v0.2 procedural visual pass (below) remains authoritative
as fallback documentation:

### Visual direction (v0.2 procedural pass — fallback)

Procedural tile visuals were tuned to match the local concept
reference packs (see `ASSET_INTEGRATION_MANIFEST.md` and
`ART_REFERENCE_INDEX.md`):

- **Walls** — mossy grey stone with moss/vine tufts along the
  top edge. Subtle mortar joint across the middle.
- **Floor** — warm sandy stone tile with a faint inner highlight.
- **Repair stones** — blue gem on a small shadowed base, with a
  pale highlight. Reads as Nilo's potential in physical form.
- **Empty socket** — recessed dark stone with a faint blue inner
  ring showing where the energy belongs.
- **Filled socket** — glowing blue circle with a bright pale-blue
  center and a wider soft halo. Nilo's energy "remembered."
- **Push block** — mossy grey boulder with denser moss tufts and
  gold push-direction arrows on the left and right edges. Clearly
  distinct from both walls (square, lighter moss) and stones
  (round, blue).
- **Exit (closed)** — stone arch with a wooden door, metal
  banding, and a small keyhole.
- **Exit (open)** — blue glowing portal under the same stone arch
  shape, with a pale catchlight inside.

Color rule of thumb: **blue = Nilo's energy / repair**, **gold =
Bram's Life Sparks / victory warmth**. Sockets, repair stones,
the open exit, and in-world pickup/repair VFX use the blue
palette. The success panel and Bram's celebration use the warm
gold/parchment palette.

### Player flow

1. Pick up the row-2 stone, fill the row-2 socket.
2. Pick up the row-4 stone, walk toward the row-4 socket and
   meet the push block. Try pushing right — bump. (Tip fires.)
3. Push up or down to clear the path, then fill the socket.
4. Pick up the row-6 stone, fill its socket. Same for row 8.
5. Reach the bottom-right exit. Gate is now open.

### Success beat

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
| Push blocks | `push_block` — **implemented in v0.2, used in Broken Bridge demo** |
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
