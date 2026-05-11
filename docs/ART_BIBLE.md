# Art Bible

Source-of-truth for visual style, character design, world look,
and production readability. Pair this with `STORY_BIBLE.md` (what
is true) and `ASSET_PIPELINE.md` (how to ship it).

If a piece of concept art in `assets/artwork/` contradicts this
document, this document wins. Update this file first; redraw the
art second.

---

## A. Visual Style

- **Cozy hand-painted storybook fantasy.**
- Warm lantern light against deep navy moonlight.
- Soft parchment UI with golden trim and ink-brown body text.
- Painterly, layered, parallax backgrounds.
- Clean, readable gameplay silhouettes — no busy textures behind
  the player or interactables.
- Not horror. Not grimdark. Mistakes are funny and gentle.

### Tone words

Cozy, lantern-lit, handmade, gentle, brave, wistful, funny,
magical, mossy, golden, restorative.

### Palette anchors

| Role | Hex |
|---|---|
| Ink (body text, deep shadow) | `#272018` |
| Bark (wood, frames) | `#4e3a23` |
| Parchment (UI base) | `#f0dcae` |
| Parchment dark (UI trim) | `#c09a57` |
| Gold (highlights, sparks) | `#f6c760` |
| Glow (warm light) | `#ffdf7a` |
| Warm window (lamp interior) | `#ffc66d` |
| Moss (vegetation mid) | `#5c6b3a` |
| Leaf (vegetation high) | `#87965f` |
| Bone (skeleton, ivory UI) | `#f0e3c1` |
| Bone shadow | `#927f63` |
| Mist blue (night sky / Nilo cool tint) | `#9fb7b6` |
| Wrong (gentle red, never harsh) | `#c66f55` |
| Correct (gentle green) | `#a5d68c` |

These match `src/game/palette.ts`. Any new procedural scene
should use these constants by name, not raw hex.

### Avoid

Blood. Graves. Realistic body horror. Gore. Grim death imagery.
Horror lighting. Punishment language. Sharp monster teeth as a
dominant visual.

---

## B. Bram

### Human form

- Coastal boy.
- Messy brown hair (small tuft, slightly windblown).
- Green shirt.
- Brown shorts.
- Bare-legged or simple shoes — keep below-the-knee detail minimal
  for readable side-scroller silhouette.
- Expression range: curious, kind, brave. Never smug, never grim.

### Skeleton form

- Toy-like, bright bones — ivory `#f0e3c1` with soft `#927f63`
  shading; no anatomical accuracy.
- Glowing blue eyes (two pinpoints of `#9fb7b6`/`#c8e6ff`).
- Keeps the **same hair tuft and clothing silhouette** as human
  form so he reads as the same character.
- Funny, expressive poses (slight tilt, surprised stance, casual
  lean).
- Falls apart in discrete, large bone pieces, not a shatter.
  Reassembles in a single warm pulse.
- Reads as a child-shaped toy puppet, not a corpse.

### Skateboard

- Warm wood deck with small carved runes (decorative, not text).
- Two soft glowing wheels (`#ffdf7a` highlights).
- Sits behind the feet when riding; ahead and slightly tilted
  when not.

### Silhouette rules for Bram

- Head reads larger than realistic — slightly oversized for
  expressiveness, but never to a "chibi" extreme.
- Limbs are short and tapered.
- The blob of head + tuft + clothing must be identifiable at
  64×64 px against any background.

---

## C. Nilo

### Energy form (alien)

- Interdimensional electricity / potential. Not a creature, not a
  ghost.
- Translucent, current-like body — alpha around 0.55 on the main
  body, 0.4 on tendrils.
- Color: dominant `#6fb5e8` with `#9cd0f0` highlights and
  `#eaf6ff` inner stars.
- Flowing tendrils / fins around a soft central orb.
- Star-like inner lights, drifting slowly.
- Large glowing eyes — bigger than human-eye proportions, no whites.
- **Cannot touch the physical world directly.** When reaching, a
  spark line should fizzle just before contact unless Bram is
  acting as the bridge.
- Gentle vertical pulse (1.4s loop) and tendril drift; never
  jagged, never seizure-bright.

### Human form

- **Visually distinct from Bram at first glance.**
- Dark blue-black swept hair (longer than Bram's; styled, not
  tousled).
- Pale cool-tinted skin (`#d8dceb`).
- Teal-blue tunic (`#3c5878`) with a golden belt (`#c8a548`).
- Dark slate pants.
- Soft blue undertone halo around the head/shoulders (`#6fb5e8`
  at low alpha).
- Slightly otherworldly posture: head tilted, weight rarely
  centered, hands often held just above his sides as if not
  trusting gravity yet.
- Curious, unstable, learning the physical world.

### Silhouette rules for Nilo

- Hair shape on top of head reads **opposite** of Bram's tuft — a
  swept curve, not a spiky tuft.
- Outfit silhouette has a defined collar V and belt line that
  Bram does not.
- If you cannot tell Bram and Nilo apart at small size, the
  silhouette is wrong.

---

## D. Owl

- Wise coastal guide.
- Warm brown / silver feathers — `#5a4a32` body, `#6f5b3d`
  chest, with subtle `#f0e3c1` rim highlights.
- Large pale eye discs with dark pupils and a single `#ffdf7a`
  catchlight.
- Calm, dry humor. Speaks plainly.
- **Gentle explainer, not exposition machine.** Owl's job is to
  name what just happened and point forward — never to lecture.
- Reads at small size by his ear tufts and wide eye discs.

---

## E. World

- **Coastal House** — safe ordinary world. Cliffside silhouette,
  one or two warm lit windows, moon over ocean. The opening
  happens here.
- **Rattlewood** — warm forest repair chapter (Hands). Moss,
  roots, lanterns, cottages, mushrooms, small wooden bridges, owl
  signs. Palette tilts gold and moss.
- **Hollow Hills** — Feet chapter. Caves, mine carts, number
  stones, warm underground windows, rope ladders. Palette tilts
  bark + bone.
- **Clocktower Marsh** — Voice chapter. Fog, bells, clocks,
  reeds, brass gears, stepping stones. Palette tilts cool teal
  with warm lantern accents.
- **Moonlit Market** — Heart chapter. Coin stalls, kind
  merchants, hanging lights, exact-change puzzles, memory jars.
  Palette tilts gold + warm window.
- **Almost World** — sibling reality that bleeds in wherever
  something is broken. Beautiful but unfinished. Self-repairing
  when helped. **Not evil.** Distant silhouettes appear from
  windows and at horizons.

---

## F. Production Readability Rules

These are non-negotiable for shipped sprites and gameplay frames.

- **Player sprite must be cleaner than concept art.** Concept art
  has shading and texture that hides at small scale. Production
  sprites have firm silhouette and three or four flat shade tones.
- **No noisy sprite backgrounds.** Sprites ship on transparency.
  Parchment, shadows, labels, and decorative borders belong on the
  concept sheet, not the sprite.
- **Strong silhouette.** A black-fill silhouette of any character
  sprite must still read as that character at 64×64 px.
- **Consistent scale.** All Bram frames share the same height in
  pixels and the same feet position. Same for Nilo. Owl is its own
  scale class.
- **Consistent feet / pivot.** Bottom-center of the frame. The
  sprite's planted foot must sit at the same y coordinate across
  every locomotion frame, or the character bobs.
- **Readable at small sizes.** Test at 64×64 before approving any
  sheet.
- **Effects support clarity, not obscure gameplay.** Sparks,
  glows, and dust must never cover the player's silhouette or the
  interactable they are about to touch. Effects fade fast; the
  silhouette stays.
- **One source of truth per character.** When a clean v0.1 sheet
  exists, the procedural drawing in `src/game/characters.ts` and
  `src/game/Bram.ts` is retired (or kept only as a fallback) — not
  maintained in parallel.

---

## How this doc relates to others

- **`STORY_BIBLE.md`** — what is true about the characters and
  world. This file describes how they look.
- **`ART_REFERENCE_INDEX.md`** — what concept reference exists
  locally and where to find it.
- **`ASSET_PIPELINE.md`** — the production stages, file specs,
  and animation lists.
- **`ASSET_MANIFEST.md`** — the full list of shipped assets per
  vertical slice.
