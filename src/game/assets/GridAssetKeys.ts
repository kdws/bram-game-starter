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

  // Numbered stones 1–10 (props/grid/number_stone_<N>.png)
  NUMBER_STONE_1:  'grid_number_stone_1',
  NUMBER_STONE_2:  'grid_number_stone_2',
  NUMBER_STONE_3:  'grid_number_stone_3',
  NUMBER_STONE_4:  'grid_number_stone_4',
  NUMBER_STONE_5:  'grid_number_stone_5',
  NUMBER_STONE_6:  'grid_number_stone_6',
  NUMBER_STONE_7:  'grid_number_stone_7',
  NUMBER_STONE_8:  'grid_number_stone_8',
  NUMBER_STONE_9:  'grid_number_stone_9',
  NUMBER_STONE_10: 'grid_number_stone_10',

  // Numbered sockets — unlit (empty) and lit (filled), values 1–10
  SOCKET_UNLIT_1:  'grid_socket_unlit_1',
  SOCKET_UNLIT_2:  'grid_socket_unlit_2',
  SOCKET_UNLIT_3:  'grid_socket_unlit_3',
  SOCKET_UNLIT_4:  'grid_socket_unlit_4',
  SOCKET_UNLIT_5:  'grid_socket_unlit_5',
  SOCKET_UNLIT_6:  'grid_socket_unlit_6',
  SOCKET_UNLIT_7:  'grid_socket_unlit_7',
  SOCKET_UNLIT_8:  'grid_socket_unlit_8',
  SOCKET_UNLIT_9:  'grid_socket_unlit_9',
  SOCKET_UNLIT_10: 'grid_socket_unlit_10',

  SOCKET_LIT_1:  'grid_socket_lit_1',
  SOCKET_LIT_2:  'grid_socket_lit_2',
  SOCKET_LIT_3:  'grid_socket_lit_3',
  SOCKET_LIT_4:  'grid_socket_lit_4',
  SOCKET_LIT_5:  'grid_socket_lit_5',
  SOCKET_LIT_6:  'grid_socket_lit_6',
  SOCKET_LIT_7:  'grid_socket_lit_7',
  SOCKET_LIT_8:  'grid_socket_lit_8',
  SOCKET_LIT_9:  'grid_socket_lit_9',
  SOCKET_LIT_10: 'grid_socket_lit_10',

  // Gate (alternate exit visual for Number Gate rooms)
  GATE_CLOSED:   'grid_gate_closed',
  GATE_OPEN:     'grid_gate_open',

  // Socket reject feedback (flash on wrong-number deposit)
  SOCKET_REJECT: 'grid_socket_reject',

  // --- ui (ui/grid/) — shared across scenes despite the "grid" namespace ---
  TIP_BANNER:        'grid_ui_tip_banner',       // (has baked text — kept but unused)
  PANEL_SMALL:       'grid_ui_panel_small',
  PANEL_MEDIUM:      'grid_ui_panel_medium',
  PANEL_WIDE:        'grid_ui_panel_wide',       // clean parchment strip for tip bar
  SOLVED_BANNER:     'grid_ui_solved_banner',
  BTN_UNDO:          'grid_ui_btn_undo',
  BTN_RESET:         'grid_ui_btn_reset',
  BTN_BACK:          'grid_ui_btn_back',
  PORTRAIT_NILO:     'grid_ui_portrait_nilo',
  PORTRAIT_BRAM:     'grid_ui_portrait_bram',
  PORTRAIT_OWL:      'grid_ui_portrait_owl',
  CORNER_LEFT:       'grid_ui_corner_left',      // gold filigree corner
  CORNER_RIGHT:      'grid_ui_corner_right',
  DIVIDER_LONG:      'grid_ui_divider_long',
  ORNAMENT_CENTER:   'grid_ui_ornament_center',
  ARROW_UP:          'grid_ui_arrow_up',
  ARROW_DOWN:        'grid_ui_arrow_down',
  ARROW_LEFT:        'grid_ui_arrow_left',
  ARROW_RIGHT:       'grid_ui_arrow_right',

  // --- props used as scenic decoration ---
  LAMP_POST:      'grid_prop_lamp_post',

  // --- tiles used as scenic decoration ---
  DECO_FLOWER_BLUE:   'grid_deco_flower_blue',
  DECO_FLOWER_PURPLE: 'grid_deco_flower_purple',
  DECO_MUSHROOM_PAIR: 'grid_deco_mushroom_pair',
  DECO_MUSHROOM_TALL: 'grid_deco_mushroom_tall',
  DECO_PLANT_FERN:    'grid_deco_plant_fern',
  DECO_PLANT_SPROUT:  'grid_deco_plant_sprout',
  DECO_PLANT_TUFT:    'grid_deco_plant_tuft',
  DECO_ROCK_SMALL:    'grid_deco_rock_small',

  // --- vfx (vfx/grid/) ---
  VFX_BLUE_PICKUP:  'grid_vfx_blue_pickup',
  VFX_BLUE_BURST:   'grid_vfx_blue_burst',
  VFX_BLUE_MOTES:   'grid_vfx_blue_motes',
  VFX_GOLD_VICTORY: 'grid_vfx_gold_victory',
  VFX_GOLD_SHOWER:  'grid_vfx_gold_shower',
  VFX_GOLD_HALO:    'grid_vfx_gold_halo',
  VFX_BUMP_DUST:    'grid_vfx_bump_dust',
} as const;

export type GridAssetKey = (typeof GridAssets)[keyof typeof GridAssets];
