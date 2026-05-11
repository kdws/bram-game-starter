# Asset Pipeline

How concept art becomes a Phaser-ready, runtime-clean game asset.
Read alongside `ART_BIBLE.md` (look) and `ASSET_MANIFEST.md` (list).

---

## Stages

```
Concept Art  →  Locked Model Sheet  →  Clean Sprite Sheet  →
Texture Atlas  →  Phaser Animation Registry  →  Scene Integration
```

### 1. Concept Art

- Painterly, exploratory, allowed to be messy.
- May include parchment backgrounds, shading, labels, mood lighting.
- Lives in `assets/artwork/` (gitignored). Referenced via
  `ART_REFERENCE_INDEX.md`.
- **Not used at runtime.**

### 2. Locked Model Sheet

- One image per character / prop family.
- Settles proportions, palette, key poses, and silhouette
  before any animation work.
- Still may have parchment / annotation around the figure,
  but the figure itself is pose-stable.
- Sign-off: the model sheet matches `ART_BIBLE.md` exactly.

### 3. Clean Sprite Sheet

- Transparent PNG (no parchment, no labels, no baked shadows
  unless they belong to the sprite itself).
- Fixed frame size (e.g. 192×192 for Bram side-scroller v0.1).
- Consistent pivot (bottom-center).
- Consistent feet/baseline so the sprite does not bob.
- Frames laid out in a regular grid or named per-frame.
- Filename suffix `_v0.1`, `_v0.2`, etc. — never overwrite a
  shipped version in place.

### 4. Texture Atlas

- Combine clean sprite sheets into a packed atlas using
  TexturePacker (or equivalent) when there are many sprites.
- Output: `.png` + `.json` (Phaser 3 multi-atlas or JSON-array).
- One atlas per logical group: `bram_skeleton.atlas.json`,
  `nilo_human.atlas.json`, `props_rattlewood.atlas.json`, etc.

### 5. Phaser Animation Registry

- Load atlases in a `BootScene` `preload`.
- Define named animations once in a central registry
  (`src/game/animations.ts` once it exists), e.g.:
  ```ts
  scene.anims.create({
    key: 'bram-skeleton-idle',
    frames: scene.anims.generateFrameNames('bram_skeleton', {
      prefix: 'idle_', start: 1, end: 4, zeroPad: 4
    }),
    frameRate: 8,
    repeat: -1
  });
  ```
- Scenes never re-define animations.

### 6. Scene Integration

- Replace procedural `Graphics` drawings (e.g. `src/game/Bram.ts`,
  `src/game/characters.ts`) with sprite instances once the atlas
  exists and the animations are registered.
- Keep procedural fallbacks behind a flag for one or two builds in
  case an atlas fails to load — then remove.

---

## Current stage

The artwork collection in `assets/artwork/` is at the
**Concept Art / Model Reference** stage.

No locked model sheet, no clean sprite sheet, and no atlas exists
yet. Until those exist, the runtime keeps using procedural
`Graphics` drawings.

---

## First real asset: Bram Skeleton Side-Scroller v0.1

This is the first sprite sheet to produce. Everything else
follows from this — Bram is the most-shown character in the slice.

### File specs

| Field | Spec |
|---|---|
| Format | Transparent PNG |
| Frame size | 192 × 192 |
| Facing | Right |
| Pivot | Bottom center |
| Visual height | ~110–130 px (head crown to planted foot) |
| Background | None (full alpha) |
| Labels / annotations | None |
| Parchment | None |
| Baked UI | None |
| Shadows | Minimal — only a soft ground-contact disc if it does not interfere with collision/pivot |
| Feet | Consistent y position across all locomotion frames |
| Head/hair silhouette | Consistent shape across all frames |
| Outline | Optional dark ink outline; if used, must be uniform |
| Filename | `bram_skeleton_v0.1.png` (+ `.json` if atlas) |

### Animation list

| Animation | Frames | Loop | Notes |
|---|---:|---|---|
| `idle` | 4 | yes | gentle rattle/breath |
| `walk` | 6 | yes | side-scroller pace |
| `run` | 6 | yes | downhill/sprint pace |
| `jump_takeoff` | 1 | no | anticipation pose |
| `jump_midair` | 1 | no | held while airborne |
| `land` | 1 | no | brief landing crouch |
| `crouch` | 1 | held | low-profile pose |
| `celebrate` | 3 | no | warm pulse, small hop |
| `fall_apart` | 6 | no | bones scatter in discrete chunks |
| `reassemble` | 6 | no | reverse of `fall_apart`, warm glow |
| `skateboard_push` | 4 | no | downhill start |
| `skateboard_ride` | 2 | yes | balanced loop |
| `skateboard_ollie` | 4 | no | correct-answer landing |

### Frame naming convention

Zero-padded, snake_case animation prefix, four-digit frame index
starting at `0001`:

```
idle_0001
idle_0002
idle_0003
idle_0004
walk_0001
walk_0002
walk_0003
walk_0004
walk_0005
walk_0006
run_0001
run_0002
...
jump_takeoff_0001
jump_midair_0001
land_0001
crouch_0001
celebrate_0001
celebrate_0002
celebrate_0003
fall_apart_0001
fall_apart_0002
fall_apart_0003
fall_apart_0004
fall_apart_0005
fall_apart_0006
reassemble_0001
...
skate_push_0001
skate_push_0002
skate_push_0003
skate_push_0004
skate_ride_0001
skate_ride_0002
skate_ollie_0001
skate_ollie_0002
skate_ollie_0003
skate_ollie_0004
```

### Quality bar before shipping v0.1

- Silhouette test: render every frame as solid black on white. The
  pose must still read.
- Onion-skin test: stack all frames of a loop. Feet and head crown
  must align across all frames.
- Scale test: paste the sheet into the game at intended size; the
  character must read at typical zoom on a 1280×720 canvas.
- Story-bible test: every frame must match `STORY_BIBLE.md` and
  `ART_BIBLE.md` (no horror, no anatomical accuracy, glowing blue
  pinpoint eyes present, hair tuft consistent).

---

## After Bram v0.1

In priority order:

1. **Bram human v0.1** — same spec, same animation list minus
   skateboard tricks, plus a `getting_dressed_*` short cycle for
   the prologue.
2. **Nilo alien v0.1** — looping idle, pulse, reach, fizzle,
   `notice_bram` one-frame turn.
3. **Nilo human v0.1** — idle, walk, gesture, "knees are unstable"
   sway, look-around.
4. **Owl v0.1** — perched idle, head-tilt, take-off, land.
5. **Rattlewood tileset v0.1** — 64×64 tiles, mossy bark + dirt
   path + lantern post; see `MAP_PIPELINE.md` for tilemap rules.
6. **UI atlas v0.1** — parchment panels, answer buttons, life
   spark, restoration strip icons.

Do not skip the locked model sheet step. Skipping it is what made
the concept-art-derived sprites unusable.
