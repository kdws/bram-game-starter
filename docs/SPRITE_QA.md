# Bram Skeleton — Sprite QA Notes

Living QA log for the **v0.1 runtime atlas** (sourced from the
style-matched v0.2 pack, treated in code as v0.1 runtime). Update
this file whenever scale, pivot, hitbox, or timing changes.

Read alongside `ASSET_PIPELINE.md` (the spec) and `ART_BIBLE.md`
(the visual rules).

---

## Current runtime values

| Setting | Value | Defined in |
|---|---|---|
| Frame size | 192 × 192 | `BRAM_SKELETON_META.frameWidth/Height` |
| Pivot (origin) | (0.5, 0.9167) | `BRAM_SKELETON_META.origin` |
| Sprite base scale | 0.7 | `Bram.ts → SPRITE_BASE_SCALE` |
| Feet offset (container-local) | +38 | `Bram.ts → FEET_OFFSET_Y` |
| Native hitbox | x=72 y=34 w=56 h=132 | `BRAM_SKELETON_META.hitbox` |
| Idle | `bram_skeleton_idle` @ 4 fps × 4 frames | atlas |
| Skate idle | `bram_skeleton_skate_ride` @ 4 fps × 2 frames | atlas |

Effective visual height at scene scale `s` (no container scale):
`192 × SPRITE_BASE_SCALE × s = 134.4 × s` pixels.

---

## Dev debug overlay

Press **H** in any scene that contains a Bram to toggle the
debug overlay. Build-gated by `import.meta.env.DEV`, so it
disappears in production.

The overlay shows:

- **Magenta rectangle** — the 192×192 sprite frame bounds (so
  you can see how much transparent padding sits around the
  visible character).
- **Green rectangle** — the suggested hitbox (`72, 34, 56, 132`
  at native size, scaled).
- **Yellow crosshair** — the feet pivot at container y=+38.
- **Red crosshair** — the container origin (0, 0).

In `PlatformScene` the arcade body bottom now sits on the
yellow feet crosshair (see "PlatformScene" below).

---

## Per-scene QA

### PlatformScene

Bram is the player. Physics body was tuned during this QA pass:

- **Before:** `setSize(58, 90).setOffset(-29, -76)` — body bottom
  at container y=+14, feet at y=+38 → feet sank 24 px into the
  platform.
- **After:** `setSize(58, 90).setOffset(-29, -52)` — body bottom
  at container y=+38 = feet line. Bram stands cleanly on platforms.

Trade-off: head is no longer inside the collision body. That's
standard platformer practice (head can clip into low ceilings
without bonking). Confirm any future low-ceiling sections re-tune
this if needed.

### RattleRunScene

- Scale 1.15, no physics body.
- Bram is tween-positioned between gates; gravity is disabled.
- Feet at world y ≈ 549, road at x=190 is at world y ≈ 549.3 —
  feet sit on the road line cleanly.
- Skateboard mode: idle animation is `bram_skeleton_skate_ride`
  (passed via `{ skateboard: true }`).
- **Note:** the procedural code path used to draw a wooden board
  separately; the v0.1 sprite already includes the board, so the
  procedural board overlay is suppressed in sprite mode. Fall-back
  procedural mode still draws its own board.

### TopDownScene

- Scale 0.82.
- The sprite is side-view; top-down would normally use a 4-direction
  sheet. We are knowingly using the side-view here for v0.1 — it
  looks odd when Bram walks "up" but is functional and consistent
  with our scope ("do not add Nilo/Owl sprites yet; do not add
  top-down sheet yet").
- Movement is via container x/y; feet line is decorative.

### ClockTowerScene

- Scale 0.95, decorative placement at (160, 600).
- Feet at world y ≈ 636 land inside the wide marsh-ground band
  (y=560–720). Reads as standing on the marsh edge.

### IntroScene

- Scale 1.2, at (360, 540).
- Feet at world y ≈ 586. Forest floor band starts at y=580.
  Bram stands cleanly on the forest floor.

### RestorationScene

- Scale 2.0 — intentionally big for the cosmic restoration moment.
- No ground line; Bram floats inside a glowing halo.

### PrologueScene — Panels 9, 11, 12, 13

- Skeleton appears in Panel 9 (scale 1.7), 11 (0.95), 12 (1.0),
  13 (1.05).
- Each panel's background composition was checked: feet line lands
  within the visible ground/counter area for each panel. No
  adjustments needed.

---

## Animation timing

| Animation | Frames × fps | Duration | Notes |
|---|---|---|---|
| idle | 4 × 4 | 1000 ms | gentle bob, loops |
| walk | 6 × 8 | 750 ms | loops |
| run | 6 × 10 | 600 ms | loops |
| jump_takeoff | 1 × 1 | one shot | hold pose |
| jump_midair | 1 × 1 | one shot | hold pose |
| land | 1 × 1 | one shot | hold pose |
| crouch | 1 × 1 | one shot | hold pose |
| celebrate | 3 × 7 | 430 ms | plays then returns to idle |
| worried | 1 × 1 | one shot | not yet wired into gameplay |
| curious | 1 × 1 | one shot | not yet wired into gameplay |
| fall_apart | 6 × 12 | 500 ms | auto-chains to reassemble |
| reassemble | 6 × 12 | 500 ms | auto-returns to idle |
| skate_push | 4 × 8 | 500 ms | loops; not yet wired |
| skate_ride | 2 × 4 | 500 ms | loops; default skate idle |
| skate_ollie | 4 × 10 | 400 ms | one shot; not yet wired |

`celebrate()` plays the celebrate clip *and* keeps the procedural
hop + warm-glow tween. The hop is ~360 ms and the warm glow holds
for 500 ms — these layer nicely over the 430 ms clip and add a
little extra punch.

`fallApart()` chains `fall_apart → reassemble → idle` using
`Phaser.Animations.Events.ANIMATION_COMPLETE`. Total ~1000 ms.
Calling scenes wait 1400 ms before resetting Bram's position
(see `RattleRunScene.chooseGate` and `PlatformScene.answer`), so
the chain always completes before the scene resets.

---

## Known limitations (v0.1 runtime)

- **Top-down side-view mismatch.** `TopDownScene` uses the side
  sprite. Acceptable for v0.1 — future work is a 4-direction
  top-down sheet for Bram.
- **No left-facing frames.** All frames are right-facing. When
  Bram needs to face left, the call site will need
  `sprite.setFlipX(true)`. No scene flips Bram today.
- **`worried`, `curious`, `skate_push`, `skate_ollie` are not
  wired** to gameplay events yet. They're loaded and registered,
  ready for the next pass.
- **No idle "ground shadow."** A subtle elliptical shadow at the
  feet line would help anchor Bram on uneven ground. Not yet in
  v0.1.
- **Procedural fallback always renders feet at +38.** If a future
  sprite revision changes the pivot, update both
  `BRAM_SKELETON_META.origin` *and* `FEET_OFFSET_Y` together.
- **Container collide-world-bounds in PlatformScene** assumes the
  body covers the bottom half of Bram (post-QA tuning). If the
  PlatformScene body is ever resized, re-test on the bottom-of-
  world rim.

---

## Future redraw constraints

A v0.2-runtime (i.e. the final hand-animated pass) **must**
preserve:

- Atlas key: `BRAM_SKELETON_ATLAS`
- Frame size: 192 × 192
- Pivot: (0.5, 0.9167)
- Native hitbox: (72, 34, 56, 132)
- All 15 animation keys: `bram_skeleton_idle`, `_curious`, `_walk`,
  `_run`, `_jump_takeoff`, `_jump_midair`, `_land`, `_crouch`,
  `_celebrate`, `_worried`, `_fall_apart`, `_reassemble`,
  `_skate_push`, `_skate_ride`, `_skate_ollie`
- Frame names ending in `.png` (Phaser atlas frame names match the
  atlas JSON exactly)
- Atlas JSON structure: Phaser JSONHash (`{ frames: { … }, meta: { … } }`)

If any of these change, integration breaks. Add a new atlas key
(`BRAM_SKELETON_ATLAS_V2`, etc.) instead and migrate `Bram.ts`
behind a flag.

---

## Polish notes (parking lot for the next pass)

- Add a subtle ground shadow under Bram's feet.
- Tune `celebrate` to also play a brief blue Life-Spark puff so the
  visual matches the story beat.
- Wire `worried` to `RattleRunScene`'s "wrong answer but not the
  third miss" beat, so the fall-apart isn't the only failure read.
- Wire `curious` to the prologue's panel 6/7 — Bram peeking.
- Wire `skate_push` to the start of Rattle Run and `skate_ollie`
  to a correct-answer celebration.
- Consider a smaller `SPRITE_BASE_SCALE` (e.g. 0.6) for `TopDownScene`
  if/when a real top-down sheet replaces the side-view.
