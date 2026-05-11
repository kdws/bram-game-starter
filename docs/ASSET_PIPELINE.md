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

| Asset | Stage | Location |
|---|---|---|
| Concept collection | Concept Art | `assets/artwork/` (gitignored) |
| Bram Skeleton v0.1 | **Atlas + Scene Integration** ✅ | `public/assets/sprites/bram/skeleton/` |
| Bram Human | Concept | reference sheet only |
| Nilo (alien + human) | Concept | reference sheet only |
| Owl | Concept | reference sheet only |
| Tilesets, props, UI | Concept | reference sheet only |

## Runtime asset path convention

Production-served assets live under `public/assets/...`. Vite's
dev server serves them directly, and the production build copies
them verbatim into `dist/assets/...`. Reference them in Phaser
loaders by their absolute URL, e.g.:

```ts
scene.load.atlas(
  'BRAM_SKELETON_ATLAS',
  '/assets/sprites/bram/skeleton/bram_skeleton_atlas.png',
  '/assets/sprites/bram/skeleton/bram_skeleton_atlas.json'
);
```

Do **not** put runtime assets in the project-root `assets/`
directory — those are not copied into the production build. That
path is reserved for concept-only material (and it's gitignored).

---

## First real asset: Bram Skeleton Side-Scroller v0.1 ✅ shipped

Status: **shipped at v0.1**. Files live in
`public/assets/sprites/bram/skeleton/`. Loaded and registered in
`BootScene`; rendered through `src/game/Bram.ts` (which keeps a
procedural fallback in case the atlas fails to load). Replace the
v0.1 art when the painterly pass is ready — names, frame counts,
pivot, and hitbox must stay identical.

### Naming note

The first generated sprite atlas was an **engineering dummy** and
is not canonical art. It was discarded.

The currently integrated Bram skeleton atlas is the **first
canonical runtime sprite pass**. It came from the style-matched
**Bram Skeleton Side-Scroller v0.2** source pack, but is treated
in-code as the **v0.1 runtime atlas** — i.e. our first stable
integration. Future redraws should preserve frame names, frame
size, pivot/feet alignment, animation keys, and atlas JSON
structure so they can be dropped in without touching code.

Glossary:
- **engineering dummy v0.1** — discarded, not visual canon.
- **runtime Bram skeleton atlas v0.1** — currently in-game,
  canonical.
- **style source pack v0.2** — the visual/art pass that produced
  the integrated atlas.

Per-instance runtime tuning (scale, pivot offset, hitbox, anim
timing) is tracked separately in `docs/SPRITE_QA.md`.

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
