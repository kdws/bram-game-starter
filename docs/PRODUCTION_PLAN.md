# Production Plan

## Phase 0 — Prototype setup

- Use Phaser 3.90 for the first build because it has a mature plugin/tutorial ecosystem.
- Keep the prototype Phaser-only. Add React only when the parent dashboard or account flow needs it.
- Keep all save data local at first.
- Use placeholder vector/shape art until the gameplay loop is fun.

## Phase 1 — Vertical slice

Goal: 10-15 minutes of playable game.

1. Rattle Run downhill sequence with addition within 20.
2. One platforming room with a subtraction bridge puzzle.
3. One top-down garden room with exact-change coin puzzle.
4. Bram fall-apart/reassemble failure loop.
5. 10 Life Sparks to restore hands.
6. Local mastery tracking.

## Phase 2 — Production art pass

1. Lock Bram character model sheet.
2. Make 3 animation sets: skateboard, platform side-view, top-down walk.
3. Build Rattlewood tileset.
4. Build top-down garden tileset.
5. Replace prototype UI with parchment UI assets.
6. Add sound effects.

## Phase 3 — Math system

1. Add skill graph.
2. Add per-skill mastery values.
3. Add scaffolded hints.
4. Add parent-facing skill summary.
5. Keep problem generators deterministic/testable.

## Phase 4 — Tooling

1. Use Tiled for top-down maps and side-view platforming maps.
2. Export Tiled maps as JSON.
3. Load maps into Phaser tilemaps.
4. Pack animation frames into texture atlases.
5. Add an asset registry file so scenes never hardcode filenames.

## Phase 5 — First external playtest

Test with 3-5 kids. Watch silently. Track:

- Do they understand why math appears?
- Do they laugh at fall-apart failures?
- Are questions too fast?
- Do they ask to keep playing?
- Do parents understand the learning value?

