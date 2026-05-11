import Phaser from 'phaser';

export const BRAM_SKELETON_ATLAS = 'BRAM_SKELETON_ATLAS';

const PNG_PATH = '/assets/sprites/bram/skeleton/bram_skeleton_atlas.png';
const JSON_PATH = '/assets/sprites/bram/skeleton/bram_skeleton_atlas.json';

export interface BramAnimDef {
  frames: string[];
  frameRate: number;
  repeat: number;
}

/**
 * v0.1-runtime metadata for Bram's skeleton atlas.
 *
 * Naming note: the first atlas (engineering dummy) was discarded as non-canon.
 * The currently integrated atlas comes from the style-matched **v0.2 source
 * pack** but is treated in-code as the **v0.1 runtime atlas** — i.e. the first
 * canonical in-game sprite. Future redraws must preserve frame names, frame
 * size, pivot/feet alignment, animation keys, and atlas JSON structure. See
 * `docs/ASSET_PIPELINE.md` and `docs/SPRITE_QA.md`.
 */
export const BRAM_SKELETON_META = {
  frameWidth: 192,
  frameHeight: 192,
  origin: { x: 0.5, y: 0.9167 },
  hitbox: { x: 72, y: 34, w: 56, h: 132 }
} as const;

export const BRAM_SKELETON_ANIMATIONS: Record<string, BramAnimDef> = {
  bram_skeleton_idle:         { frames: framesFor('idle_', 4),         frameRate: 4,  repeat: -1 },
  bram_skeleton_curious:      { frames: framesFor('curious_', 1),      frameRate: 1,  repeat: 0  },
  bram_skeleton_walk:         { frames: framesFor('walk_', 6),         frameRate: 8,  repeat: -1 },
  bram_skeleton_run:          { frames: framesFor('run_', 6),          frameRate: 10, repeat: -1 },
  bram_skeleton_jump_takeoff: { frames: framesFor('jump_takeoff_', 1), frameRate: 1,  repeat: 0  },
  bram_skeleton_jump_midair:  { frames: framesFor('jump_midair_', 1),  frameRate: 1,  repeat: 0  },
  bram_skeleton_land:         { frames: framesFor('land_', 1),         frameRate: 1,  repeat: 0  },
  bram_skeleton_crouch:       { frames: framesFor('crouch_', 1),       frameRate: 1,  repeat: 0  },
  bram_skeleton_celebrate:    { frames: framesFor('celebrate_', 3),    frameRate: 7,  repeat: 0  },
  bram_skeleton_worried:      { frames: framesFor('worried_', 1),      frameRate: 1,  repeat: 0  },
  bram_skeleton_fall_apart:   { frames: framesFor('fall_apart_', 6),   frameRate: 12, repeat: 0  },
  bram_skeleton_reassemble:   { frames: framesFor('reassemble_', 6),   frameRate: 12, repeat: 0  },
  bram_skeleton_skate_push:   { frames: framesFor('skate_push_', 4),   frameRate: 8,  repeat: -1 },
  bram_skeleton_skate_ride:   { frames: framesFor('skate_ride_', 2),   frameRate: 4,  repeat: -1 },
  bram_skeleton_skate_ollie:  { frames: framesFor('skate_ollie_', 4),  frameRate: 10, repeat: 0  }
};

export const BRAM_SKELETON_IDLE_FRAME = 'idle_0001.png';

function framesFor(prefix: string, count: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    out.push(`${prefix}${String(i).padStart(4, '0')}.png`);
  }
  return out;
}

export function loadBramSkeletonAtlas(scene: Phaser.Scene): void {
  if (scene.textures.exists(BRAM_SKELETON_ATLAS)) return;
  scene.load.atlas(BRAM_SKELETON_ATLAS, PNG_PATH, JSON_PATH);
}

export function registerBramSkeletonAnimations(scene: Phaser.Scene): void {
  for (const [key, def] of Object.entries(BRAM_SKELETON_ANIMATIONS)) {
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: def.frames.map(frame => ({ key: BRAM_SKELETON_ATLAS, frame })),
      frameRate: def.frameRate,
      repeat: def.repeat
    });
  }
}

export function bramSkeletonReady(scene: Phaser.Scene): boolean {
  return scene.textures.exists(BRAM_SKELETON_ATLAS)
      && scene.anims.exists('bram_skeleton_idle');
}
