# BRAM Asset Wishlist (2026-05-12)

A prioritized list of assets that would unlock new puzzle types or
dramatically improve the game's feel. Hand this to ChatGPT or another
image-gen tool — every entry includes the look brief, the dimensions
to deliver, and the runtime path we'd drop the file into.

**Canon visual rules** (apply to everything):

- Cozy storybook fantasy.
- Mossy stone walls; warm sandy stone floors; ivy/leaf accents.
- **Blue** = Nilo's repair energy, sockets, repair stones, open portal.
- **Gold** = Bram's Life Sparks, victory warmth, success panels.
- Readable kid-friendly silhouettes.
- Transparent PNG; no parchment backgrounds baked in unless noted.
- Consistent scale across each family (e.g., all number stones same size).

---

## P0 — Unlocks puzzle types we can't build today

### 1. Number stones (full set 1–10)

We have `number_stone_3.png`, `_4`, `_6`, `_7`. Need **1, 2, 5, 8, 9, 10**.

- Match the visual style of the existing 4 stones exactly: round-topped
  grey stone with a carved blue glyph, soft moss base, blue gem dot.
- Same dimensions: ~194×197 transparent PNG.
- Drop into: `public/assets/props/grid/number_stone_<N>.png`.

### 2. Numbered sockets (full set 1–10)

A new family. Pair to the numbered stones above.

- Look: same recessed circular socket plate as `socket_unlit.png` but with
  a single large carved number in the center (1–10), un-lit / faintly
  glowing blue.
- Provide both empty and filled variants:
  - `socket_unlit_<N>.png` — number visible, no glow.
  - `socket_lit_<N>.png` — same socket plate with full blue energy fill.
- ~145×155 transparent PNG each (match existing socket tiles).
- Drop into: `public/assets/tilesets/rattlewood_grid/`.

### 3. Locked gate + open gate tiles

For key-and-gate rooms using the existing `key_gold.png` and `key_moon.png`.

- `gate_closed.png` — iron-banded stone door with a keyhole; same arch
  silhouette as `exit_closed_arch.png` but with a darker frame and
  obvious lock.
- `gate_open.png` — same arch, door swung partially open showing a
  warm interior, no portal glow (unlike the exit's blue portal).
- ~228×188 transparent PNG each (match exit arch size).
- Drop into: `public/assets/tilesets/rattlewood_grid/`.

### 4. Wrong-order feedback tile

A mid-state for when a number is placed in the wrong socket — the
stone bounces back and the socket shows a brief "no" state.

- `socket_reject.png` — same socket plate but with a desaturated grey
  glow and a faint red ring.
- ~145×155 transparent PNG.
- Drop into: `public/assets/tilesets/rattlewood_grid/`.

---

## P1 — Dramatic feel upgrade (audio)

### 5. Sound effects (8–12 short clips)

Format: OGG Vorbis, mono, 22050 Hz, < 1 second each. Cozy/warm, not harsh.

| File | When it plays |
|---|---|
| `pickup_stone.ogg` | Bram steps on a repair stone — bright glass chime |
| `socket_fill.ogg`  | Stone clicks into socket — warm bell tone |
| `push_block.ogg`   | Push block grinds one tile — low stone scrape |
| `bump_wall.ogg`    | Bram hits a wall — soft dust thud |
| `victory.ogg`      | Puzzle solved — short 1-second fanfare (gold timbre) |
| `button_click.ogg` | Any button press — tiny wood/parchment tap |
| `tip_appear.ogg`   | New tip text fades in — soft page rustle |
| `menu_open.ogg`    | Scene transitions / menu opens — gentle harp pluck |

Drop into: `public/assets/audio/sfx/`.

### 6. Background music

- `rattlewood_ambient.ogg` — 30–60 second seamless loop. Cozy fantasy
  pad with subtle marimba/harp accents. Mood: warm, hopeful,
  storybook. No melody (or very gentle one), should not distract
  from puzzle-solving.
- `menu_theme.ogg` — 60–90 second seamless loop. Same instrument
  palette, slightly more melodic.

Drop into: `public/assets/audio/music/`.

### 7. Animated VFX sprite sheets

Right now the VFX are single PNGs scaled and faded with tweens.
Multi-frame versions would feel much more alive.

For each effect, deliver as a horizontal sprite sheet of 6 frames at
the existing dimensions, plus a JSON atlas:

- `blue_pickup_sparkles_anim.png` + `.json` — 6 frames, sparkles
  bursting upward then dissolving.
- `blue_repair_burst_anim.png` + `.json` — 6 frames, blue radial
  burst expanding and fading.
- `gold_victory_sparkles_anim.png` + `.json` — 6 frames, gold stars
  rising and twinkling out.

Drop into: `public/assets/vfx/grid/animated/`.

---

## P2 — Chapter expansion

### 8. Clocktower Marsh tileset

Currently we have Rattlewood tiles only. The Clocktower Marsh chapter
needs its own palette: cooler greys, mossy bricks, gear motifs, water
edges, lantern light. Same dimensions as `rattlewood_grid/`.

### 9. Coastal House tileset

For the prologue's beach scenes: warm wooden planks, sand, driftwood,
shells, a window frame, a kitchen interior. Same dimensions.

### 10. Nilo in-world spirit sprite

Translucent blue ghost-Nilo follower for puzzle rooms. Currently
Nilo only appears as a portrait. Three-frame idle loop:

- `nilo_spirit_idle.png` — sprite sheet 3 frames × 96×128.
- Soft blue gradient body, glowing core, wispy edges, suggestion of a
  human silhouette but ethereal.
- Drop into: `public/assets/sprites/nilo/`.

### 11. Bram "almost" overlay

A pale blue version of Bram for when he's been touched by Nilo's
energy. Same skeleton/human pose set, blue-shifted palette, slight
transparency. Could be a re-tint of the existing atlas or a new one.

---

## P3 — Polish

### 12. Generic stone buttons (no baked text)

Current sprite buttons (`button_play_blue`, `button_adventure_green`,
etc.) have **baked labels** ("PLAY", "ADVENTURE", "COLLECTION", "SHOP")
which don't match our custom menu items. Need blank versions of each
frame so we can overlay our own text:

- `button_stone_blue_blank.png`
- `button_stone_green_blank.png`
- `button_stone_gold_blank.png`
- `button_stone_blue_blank_active.png` (hover variant)
- (etc.)

Same dimensions as the existing buttons (~310×134).

### 13. Cinematic-size portraits

Current portraits (220×154) are HUD-sized speech bubbles. For
full-panel dialogue moments we want larger versions without the
speech-bubble frame:

- `portrait_bram_large.png` — 480×640, full body or shoulder-up,
  no frame.
- `portrait_nilo_large.png` — 480×640.
- `portrait_owl_large.png` — 320×320.

### 14. Hint pointer / tutorial finger

- `hint_finger.png` — 96×96. A small parchment-colored pointing hand
  for "tap here" tutorial moments.
- `hint_arrow_glow.png` — 64×64. A pulsing arrow for "go this way"
  moments.

---

## Delivery format

For each asset:

- **Transparent PNG**, no anti-aliased halos.
- **Filename exactly as listed.**
- Drop into the runtime path noted, or into a zip we extract there.
- If providing sprite sheets, include the JSON atlas in Phaser's
  "JSON Hash" or "JSON Array" format.
- Test that the asset visually pairs with at least one existing
  sibling (e.g., new number stones should sit next to the existing
  3/4/6/7 stones without looking out of place).

---

## Status

| Priority | Item | Status |
|---|---|---|
| P0 | Number stones 1, 2, 5, 8, 9, 10 | ✅ shipped 2026-05-12 (P0 Number Gate Asset Pack) |
| P0 | Numbered sockets 1–10 (lit + unlit) | ✅ shipped 2026-05-12 |
| P0 | Gate closed / open | ✅ shipped 2026-05-12 |
| P0 | Socket reject state | ✅ shipped 2026-05-12 |
| P1 | Sound effects (8–12) | ✅ shipped 2026-05-12 (synthesized placeholders, see AUDIO_SYSTEM.md) |
| P1 | Background music (2 loops) | 🟡 1 of 2 shipped (ambient_rattlewood_loop). menu_theme still needed. |
| P1 | Animated VFX sheets (3 effects) | ⏳ awaiting |
| P2 | Clocktower Marsh tileset | ⏳ awaiting |
| P2 | Coastal House tileset | ⏳ awaiting |
| P2 | Nilo spirit sprite | ⏳ awaiting |
| P2 | Bram "almost" overlay | ⏳ awaiting |
| P3 | Generic stone buttons | ⏳ awaiting |
| P3 | Cinematic portraits | ⏳ awaiting |
| P3 | Hint pointer / finger | ⏳ awaiting |
