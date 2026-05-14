# Audio System (v0.1 — 2026-05-12)

Lightweight static audio layer for BRAM. Files live under
`public/assets/audio/`, are preloaded by `BootScene`, and are played
through the singleton `AudioManager`. Missing files are silent no-ops,
not errors — the game runs in full silence cleanly if audio is
unavailable for any reason.

---

## Files

```
public/assets/audio/
├── sfx/
│   ├── ui_click.wav
│   ├── ui_hover.wav
│   ├── pickup_stone.wav
│   ├── repair_socket.wav
│   ├── repair_complete.wav
│   ├── block_push.wav
│   ├── invalid_bump.wav
│   ├── undo.wav
│   ├── reset.wav
│   ├── portal_open.wav
│   ├── bram_fall_apart.wav
│   ├── bram_reassemble.wav
│   ├── success_warm.wav
│   └── nilo_energy_pulse.wav
└── music/
    └── ambient_rattlewood_loop.wav
```

The v0.1 SFX are **programmatically synthesized** by
`scripts/generate-audio.mjs` — pure sine/triangle waves + light
noise + envelope shaping. No copyrighted material, no third-party
sample packs. Run `node scripts/generate-audio.mjs` to regenerate
all 15 files. Tweak the recipes there to refine the palette.

Total payload: ~475 KB of 16-bit mono WAV @ 22050 Hz.

---

## Code

| File | Role |
|---|---|
| `src/game/audio/AudioKeys.ts`    | Stable key constants + sfx/music category map. |
| `src/game/audio/AudioManager.ts` | Static play/loop/stop, volume buses, mute, localStorage. |
| `src/scenes/BootScene.ts`        | Preloads all WAVs, calls `AudioManager.init(this.game)`. |
| `scripts/generate-audio.mjs`     | Builds the WAV files from synth recipes. |

---

## Key list

### UI

| Key                    | Where it fires |
|---|---|
| `AudioKeys.UI_CLICK`   | Every `addButton` press, mute toggle. |
| `AudioKeys.UI_HOVER`   | Every `addButton` pointerover. |

### Grid puzzle

| Key                          | Where it fires |
|---|---|
| `AudioKeys.PICKUP_STONE`     | `attemptMove` when `result.collectedStone` is true. |
| `AudioKeys.REPAIR_SOCKET`    | `attemptMove` when `result.filledSocket` is true. |
| `AudioKeys.BLOCK_PUSH`       | `attemptMove` when `result.pushedBlock` is true. |
| `AudioKeys.INVALID_BUMP`     | `attemptMove` when `result.bumped` (wall or failed push). |
| `AudioKeys.UNDO`             | `attemptUndo` after the engine undoes a step. |
| `AudioKeys.RESET`            | `attemptReset` after the engine restores initial state. |
| `AudioKeys.PORTAL_OPEN`      | One-shot, fires once when the last socket is filled (gate just opened). |
| `AudioKeys.SUCCESS_WARM`     | 220 ms after `showSuccess` (so it doesn't clash with the portal_open cue). |

### Bram character

| Key                          | Where it fires |
|---|---|
| `AudioKeys.BRAM_FALL_APART`  | `Bram.fallApart()` — at the start of the fall sequence. |
| `AudioKeys.BRAM_REASSEMBLE`  | After the fall-apart anim completes, just before reassemble. |

### Music / ambient

| Key                            | Where it fires |
|---|---|
| `AudioKeys.AMBIENT_RATTLEWOOD` | `loop()` on `GridPuzzleLabScene.create`. Stopped on `exitToMenu()`. |

`AudioKeys.REPAIR_COMPLETE` and `AudioKeys.NILO_ENERGY` are wired
into the manager but not yet hooked into scenes. Reserved for the
v0.2 puzzle-room polish.

---

## AudioManager API

```ts
import { AudioManager } from '../game/audio/AudioManager';
import { AudioKeys }    from '../game/audio/AudioKeys';

AudioManager.init(game);                          // once, from BootScene
AudioManager.play(AudioKeys.UI_CLICK);            // one-shot
AudioManager.play(AudioKeys.PORTAL_OPEN, { volume: 0.85 });
AudioManager.loop(AudioKeys.AMBIENT_RATTLEWOOD);  // start (idempotent)
AudioManager.stop(AudioKeys.AMBIENT_RATTLEWOOD);  // stop loop / all instances
AudioManager.stopAll();

AudioManager.toggleMute();        // → new muted state (boolean)
AudioManager.isMuted();
AudioManager.setMasterVolume(0.5);  // 0..1
AudioManager.setSfxVolume(0.8);
AudioManager.setMusicVolume(0.4);   // applied to active music loops live
```

### Volume model

Three buses, multiplied together at play time:

```
finalVolume = perCallVolume * busVolume * masterVolume
```

`busVolume` is `sfxVolume` for any SFX key, `musicVolume` for any
music key. Categories are looked up in `AUDIO_CATEGORY` in
`AudioKeys.ts`.

### Safety guards

`play()` and `loop()` no-op cleanly when any of these are true:

- `AudioManager.muted === true`
- `AudioManager.game` is null (init never ran)
- `game.cache.audio.exists(key) === false` (file missing)
- The underlying Phaser call throws (decode error, etc.)

No console spam on missing files — only `BootScene`'s `loaderror`
handler logs once per missing asset.

---

## Persistence

Settings persist across sessions via `localStorage`:

| Key                          | Type   | Default |
|---|---|---|
| `bram.audio.muted`           | string `"true"`/`"false"` | `"false"` |
| `bram.audio.masterVolume`    | string number 0..1  | `"0.7"`  |
| `bram.audio.sfxVolume`       | string number 0..1  | `"1.0"`  |
| `bram.audio.musicVolume`     | string number 0..1  | `"0.55"` |

Loaded by `AudioManager.init()` from `BootScene.create()`. Writes
happen on any setter call.

---

## Mute toggle UI

`MenuScene.addMuteToggle()` draws a small speaker icon in the top-right
of the menu (procedural Phaser Graphics — no sprite needed). Click
toggles `AudioManager.toggleMute()` and the icon redraws with a red
slash + "muted" label when active.

---

## Future polish notes

- **Footstep sound** on every Bram move tween — currently unhooked
  (kept quiet so the chime palette stays clean). A very faint tap
  every 180 ms would lift the feel; trigger from `attemptMove`'s
  tween `onStart`.
- **Replace WAV with OGG** to cut payload ~80%. Add OGG output to
  `scripts/generate-audio.mjs` using the `ogg` npm package or by
  shelling out to `ffmpeg`.
- **Real instruments / Foley** — when the asset wishlist's P1 audio
  items (see `ASSET_WISHLIST.md`) land, swap our placeholder WAVs
  out by filename. No code change needed — only the WAV bytes.
- **Volume slider UI** — currently mute-only on the menu. A 3-slider
  panel (master / sfx / music) is one more `addMuteToggle`-shaped
  helper away.
- **Per-scene ambient swap** — when Clocktower Marsh tileset lands,
  add an `AMBIENT_CLOCKTOWER_LOOP` key and swap on scene enter/leave.
- **Pickup pitch randomization** — `play(key, { detune: ±50 })` would
  prevent the chime from feeling mechanical when picking up multiple
  stones in a row. The Phaser config field is already wired in
  `PlayOptions`.
