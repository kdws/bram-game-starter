/**
 * Stable Phaser loader keys for the audio layer.
 *
 * Files live under public/assets/audio/{sfx,music}/. AudioManager
 * looks them up by these keys via `this.game.cache.audio.exists`.
 * Missing files are no-ops, not errors — see AudioManager.play().
 */

export type AudioCategory = 'sfx' | 'music';

export const AudioKeys = {
  // ─── UI ───────────────────────────────────────────────────────────────
  UI_CLICK:        'audio_ui_click',
  UI_HOVER:        'audio_ui_hover',

  // ─── Grid puzzle moves ────────────────────────────────────────────────
  PICKUP_STONE:    'audio_pickup_stone',
  REPAIR_SOCKET:   'audio_repair_socket',
  REPAIR_COMPLETE: 'audio_repair_complete',
  BLOCK_PUSH:      'audio_block_push',
  INVALID_BUMP:    'audio_invalid_bump',
  UNDO:            'audio_undo',
  RESET:           'audio_reset',
  PORTAL_OPEN:     'audio_portal_open',

  // ─── Bram character ───────────────────────────────────────────────────
  BRAM_FALL_APART: 'audio_bram_fall_apart',
  BRAM_REASSEMBLE: 'audio_bram_reassemble',

  // ─── Success / spirit ─────────────────────────────────────────────────
  SUCCESS_WARM:    'audio_success_warm',
  NILO_ENERGY:     'audio_nilo_energy',

  // ─── Music / ambient ──────────────────────────────────────────────────
  AMBIENT_RATTLEWOOD: 'audio_ambient_rattlewood',
} as const;

export type AudioKey = (typeof AudioKeys)[keyof typeof AudioKeys];

/**
 * Static category lookup. Used by AudioManager to apply SFX vs music
 * volume buses correctly.
 */
export const AUDIO_CATEGORY: Record<string, AudioCategory> = {
  [AudioKeys.UI_CLICK]:           'sfx',
  [AudioKeys.UI_HOVER]:           'sfx',
  [AudioKeys.PICKUP_STONE]:       'sfx',
  [AudioKeys.REPAIR_SOCKET]:      'sfx',
  [AudioKeys.REPAIR_COMPLETE]:    'sfx',
  [AudioKeys.BLOCK_PUSH]:         'sfx',
  [AudioKeys.INVALID_BUMP]:       'sfx',
  [AudioKeys.UNDO]:               'sfx',
  [AudioKeys.RESET]:              'sfx',
  [AudioKeys.PORTAL_OPEN]:        'sfx',
  [AudioKeys.BRAM_FALL_APART]:    'sfx',
  [AudioKeys.BRAM_REASSEMBLE]:    'sfx',
  [AudioKeys.SUCCESS_WARM]:       'sfx',
  [AudioKeys.NILO_ENERGY]:        'sfx',
  [AudioKeys.AMBIENT_RATTLEWOOD]: 'music',
};
