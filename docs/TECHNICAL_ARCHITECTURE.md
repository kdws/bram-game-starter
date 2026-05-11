# Technical Architecture

## Recommended stack

- Phaser for the playable game scenes.
- TypeScript for safer game logic.
- Vite for local development and builds.
- Tiled for top-down and platform maps.
- Texture atlas workflow for sprite animation.
- LocalStorage/IndexedDB first; cloud sync later.

## Scene architecture

- BootScene: preload assets.
- MenuScene: prototype navigation.
- RattleRunScene: downhill trick math.
- PlatformScene: side-view puzzle platforming.
- TopDownScene: garden/adventure puzzle rooms.

## Learning architecture

- `skills.ts`: skill IDs and metadata.
- `problemGenerator.ts`: deterministic-ish problem templates.
- `mastery.ts`: local mastery tracking.
- Later: replace the simple mastery model with Elo or Bayesian Knowledge Tracing.

## Asset loading architecture

Eventually add:

```ts
export const AssetKeys = {
  BramSkateAtlas: 'bram-skate-atlas',
  RattlewoodTiles: 'rattlewood-tiles',
  RattlewoodMap: 'rattlewood-map'
};
```

Avoid scattering file paths through scenes. The prototype is intentionally simple; production should centralize assets.

