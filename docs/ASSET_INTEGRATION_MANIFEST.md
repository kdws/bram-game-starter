# BRAM Grid Puzzle Asset Integration Pack

This manifest describes the new concept/pre-production asset sheets intended to guide the next implementation pass for BRAM's grid puzzle and UI style.

## Contents

### 01_grid_tiles

- `fantasy_game_tile_set_concept_layout.png`

Purpose:
- Top-down grid tile reference for mossy stone walls, floor tiles, bridge planks, water edges, glowing repair sockets, doors, and signs.
- Use as art direction for the Grid Puzzle Lab visual upgrade.

Notes:
- This is a concept sheet, not a clean runtime tileset yet.
- Production version should be redrawn or sliced into consistent tile sizes, likely 48x48 or 64x64.
- Keep tile readability high for kids.

### 02_grid_props

- `fantasy_game_asset_collection_sheet.png`

Purpose:
- Prop and interactable references for repair stones, keys, gates, pressure plates, lanterns, crates, numbered stones, bells, and environmental puzzle objects.

Notes:
- Useful for designing Broken Bridge v0.2, Number Gate, and future Zelda/Chip's Challenge style rooms.
- Production props need transparent PNGs and consistent scale.

### 03_ui_and_effects

- `whimsical_fantasy_rpg_ui_assets.png`

Purpose:
- Reference for parchment dialogue boxes, buttons, arrow controls, undo/reset icons, hint portraits, repair effects, spark bursts, and success banners.

Notes:
- UI should remain warm, readable, and non-horror.
- Useful for replacing procedural panels later.

### 04_puzzle_room_reference

- `fantasy_dungeon_puzzle_concept_art.png`

Purpose:
- Top-down puzzle room composition reference showing a mossy stone repair room, glowing pads, movable stones, blocked path, exit gate, and step-by-step puzzle flow.

Notes:
- Strong reference for Grid Puzzle Lab v0.2.
- Do not use as a baked gameplay background for the final game; use it to derive modular room tiles and objects.

## Integration recommendation

Do not commit these as final production runtime assets unless using Git LFS or a dedicated art asset repository.

Recommended placement for local reference:

```text
assets/artwork/grid_puzzle_reference/
```

Recommended placement for production runtime assets once cleaned:

```text
public/assets/tilesets/rattlewood_grid/
public/assets/props/grid/
public/assets/ui/
```

## Next implementation step

Use these sheets to upgrade Grid Puzzle Lab v0.2:

1. Keep current procedural grid system intact.
2. Add a push block to the Broken Bridge map.
3. Improve procedural visuals to match the new reference sheets:
   - mossy stone walls
   - warm floor tiles
   - blue glowing repair sockets
   - readable push block
   - repaired bridge/exit glow
4. Add document notes to `docs/GRID_PUZZLE_SYSTEM.md` referencing this asset pack as visual direction.

## Canon reminders

- BRAM is cozy storybook fantasy, not horror.
- Nilo is interdimensional potential/electricity, not a villain.
- Bram willingly helps and teaches “just enough.”
- Puzzles are repairs.
- The mantra is: **Fix one thing at a time.**

