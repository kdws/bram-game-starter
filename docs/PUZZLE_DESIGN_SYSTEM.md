# Puzzle Design System

Cross-puzzle plumbing for BRAM. This document specifies the
**shape** every puzzle in the game must conform to — independent
of its mechanics. Mechanics-specific specs live in their own docs
(e.g. `GRID_PUZZLE_SYSTEM.md`).

Read alongside `PUZZLE_GAMEPLAY_DESIGN.md` (the design canon,
§1–§16), `STORY_BIBLE.md` (character voice for hints and beats),
and `ART_BIBLE.md` (visual language for prompts and rewards).

---

## Why a shared puzzle type

The game's mechanic library is wide: arcade gates, grid logic,
brainteasers, side-scroller traversal, repair rituals. Each will
be implemented differently. But every puzzle still needs the same
**presentation, hint, mastery, and reward plumbing**:

- A prompt at the start.
- A success beat at the end.
- A three-tier hint ladder.
- An optional `skillIds` list for adaptive practice.
- An optional cosmetic reward.

Encoding these in a shared `PuzzleDef` keeps the variety of
mechanics from fragmenting the surrounding systems.

---

## Files

| File | Role |
|---|---|
| `src/game/puzzles/PuzzleTypes.ts` | Shared `PuzzleDef`, hint, reward, and enum types. |
| `src/game/grid/GridTypes.ts` | `GridPuzzleDef extends PuzzleDef` plus grid-only types. |
| `src/game/grid/GridPuzzleEngine.ts` | Mechanics for one grid kind. |
| Future: `src/game/puzzles/arcade/*` etc. | One folder per mechanic family. |

---

## `PuzzleDef`

```ts
interface PuzzleDef {
  id: string;
  title: string;
  kind: PuzzleKind;
  chapter?: PuzzleChapter;
  skillIds?: SkillId[];
  difficulty: Difficulty;
  prompt: string;
  successText: string;
  hints: PuzzleHint[];
  repairTheme: RepairTheme;
  reward?: PuzzleReward;
  optional?: boolean;
}
```

Authoring conventions:

- **`id`** — kebab-case, chapter-scoped. Example:
  `hands/broken-bridge-grid-01`.
- **`kind`** — one of six: `arcade_math`, `room_puzzle`,
  `brainteaser`, `side_scroller_environmental`, `grid_logic`,
  `repair_ritual`.
- **`difficulty`** — `tutorial | easy | medium | hard | optional`.
  `optional` puzzles never block main story completion (§13).
- **`prompt`** — short, child-readable, one or two sentences.
- **`successText`** — short. Often a single Bram, Nilo, or Owl
  line ("Just enough." / "It stayed." / "Well rung.").
- **`hints`** — exactly 1–3 entries, levels 1/2/3 (Nilo notices,
  Bram explains, Owl scaffolds). Never reveal the answer
  outright unless accessibility / parent settings allow it.

### Six puzzle kinds (§4)

```
arcade_math                    Math Blaster-style fluency
room_puzzle                    Zelda-style locks / switches
brainteaser                    Layton-style story riddles
side_scroller_environmental    traversal / bridges / lifts
grid_logic                     Chip's Challenge-style tile rooms
repair_ritual                  chapter finale synthesis
```

A scene implements one or more kinds. The shared types let a
single hint/reward/mastery system run across all of them.

---

## Hints (§11)

Always three levels, additive (level 2 does not replace level 1):

| Level | Speaker | Job |
|---|---|---|
| 1 | Nilo  | Notice something without naming the answer. |
| 2 | Bram  | Practical guidance. State the situation. |
| 3 | Owl   | Structured strategy. Teach a counting/decomposition move. |

Author lines in-voice:

- Nilo speaks in slightly off-kilter sentences ("The bridge still has gaps.").
- Bram speaks plainly ("We have 7 stones. The bridge needs 12.").
- Owl speaks warmly and pedagogically ("Try counting up from 7: 8, 9, 10, 11, 12.").

The UI is responsible for pacing — typically: show level 1 after
the first wrong attempt or after N seconds of no progress; level 2
after a second wrong attempt or longer wait; level 3 thereafter.

---

## Rewards (§12)

No loot boxes, no gambling, no streak pressure, no daily-quest
manipulation, no pay-to-skip. Approved reward kinds:

```
life_spark | shell | sticker | patch | glow_color | lore | stamp
```

A puzzle may omit `reward` entirely. The most powerful "reward"
remains the **visible world repair** — the puzzle scene should
show the world becoming a little more whole on success, before
any cosmetic is granted.

---

## Mastery integration (§13)

`PuzzleDef.skillIds: SkillId[]` lets the surrounding system call
`recordAttempt(skillId, correct)` from
`src/learning/mastery.ts`. Today this is wired for the existing
math problems; adaptive selection of optional/practice puzzles
should consume the same mastery ratings.

Adaptive selection drives:

- Practice content order
- Hint timing (faster hints when mastery is low)
- Optional challenge rooms (unlock when mastery is high)
- Rattle Run difficulty buckets

It must **not** rewrite hand-authored puzzles or skip narrative
beats. Authored design wins; mastery picks among already-authored
content.

---

## Authoring a new puzzle (workflow)

1. Decide kind. Pick the smallest kind that fits.
2. Pick the smallest skill set. Prefer one `skillId` per puzzle —
   "this puzzle teaches X" — over kitchen-sink combos.
3. Write the prompt first. If it doesn't read in one breath, the
   puzzle is doing too much.
4. Write the success line second. It is the story payoff.
5. Write the three hints. Level 3 must still leave the player
   doing the math.
6. Decide if it's required (`optional: false`) or sidequest
   (`optional: true`).
7. Implement the scene/engine for the kind.
8. Hook into the mastery layer.
9. Decide the reward (or skip).

---

## Future expansion

Likely additions:

- `arcade_math/` folder with `RattleRunEngine`, `MeteorEngine`,
  `EnergyMeter` mechanics.
- `brainteaser/` folder with a small `BrainteaserScene` that
  consumes a `PuzzleDef` plus a `riddle: { question, answer,
  acceptable: string[] }` payload.
- Side-scroller environmental puzzles often piggyback on existing
  scenes (PlatformScene, RattleRunScene). They still get a
  `PuzzleDef` for the prompt/hint/reward surface even if the
  mechanics live in the scene.

Whenever a new mechanic appears, define a `XxxPuzzleDef extends
PuzzleDef` in that folder and write a sibling
`<KIND>_PUZZLE_SYSTEM.md` doc — same shape as
`GRID_PUZZLE_SYSTEM.md`.
