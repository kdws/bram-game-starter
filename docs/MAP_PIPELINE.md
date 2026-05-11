# Map Pipeline

## Why Tiled

Tiled lets us design platforming rooms and top-down Zelda-style rooms visually, then export JSON maps for Phaser.

## Suggested map specs

### Top-down rooms

- Tile size: 32x32 or 48x48.
- Orientation: orthogonal.
- Layers: ground, decoration, collision, puzzle objects, NPCs, triggers.
- Object properties: `type`, `target`, `skillId`, `requiresAmount`, `dialogueId`.

### Platform rooms

- Tile size: 32x32 or 64x64.
- Layers: background, collision, one-way platforms, interactables, hazards, puzzle labels.
- Object properties: `skillId`, `answer`, `opensGateId`, `hintId`.

## Export

Export maps as JSON and load them through Phaser's tilemap loader.

## Example object properties

```json
{
  "type": "math_gate",
  "skillId": "add-within-20",
  "opensGateId": "rattlewood-east-gate",
  "difficulty": 0.35
}
```

