// Stable Phaser loader keys for the Grid Puzzle visual layer.
// These map to files under public/assets/{tilesets,props,ui,vfx}/.
export const GridAssets = {
  // --- tiles (tilesets/rattlewood_grid/) ---
  WALL:           'grid_wall',
  FLOOR:          'grid_floor',
  FLOOR_ALT:      'grid_floor_alt',
  SOCKET_EMPTY:   'grid_socket_empty',
  SOCKET_FILLED:  'grid_socket_filled',
  EXIT_CLOSED:    'grid_exit_closed',
  EXIT_OPEN:      'grid_exit_open',

  // --- props (props/grid/) ---
  REPAIR_STONE:   'grid_repair_stone',
  PUSH_BLOCK:     'grid_push_block',

  // --- ui (ui/grid/) ---
  TIP_BANNER:     'grid_ui_tip_banner',
  PANEL_MEDIUM:   'grid_ui_panel_medium',
  SOLVED_BANNER:  'grid_ui_solved_banner',
  BTN_UNDO:       'grid_ui_btn_undo',
  BTN_RESET:      'grid_ui_btn_reset',
  PORTRAIT_NILO:  'grid_ui_portrait_nilo',

  // --- vfx (vfx/grid/) ---
  VFX_BLUE_PICKUP:  'grid_vfx_blue_pickup',
  VFX_BLUE_BURST:   'grid_vfx_blue_burst',
  VFX_GOLD_VICTORY: 'grid_vfx_gold_victory',
  VFX_GOLD_SHOWER:  'grid_vfx_gold_shower',
} as const;

export type GridAssetKey = (typeof GridAssets)[keyof typeof GridAssets];
