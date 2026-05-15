import Phaser from 'phaser';
import { GridAssets } from './GridAssetKeys';

const T  = 'assets/tilesets/rattlewood_grid/';
const CM = 'assets/tilesets/clocktower_marsh/';
const P  = 'assets/props/grid/';
const U  = 'assets/ui/grid/';
const UC = 'assets/ui/cinematic/';
const V  = 'assets/vfx/grid/';
const VA = 'assets/vfx/grid/animated/';
const EQ = 'assets/ui/grid/equations/';
const TU = 'assets/ui/tutorial/';
const SP = 'assets/sprites/';

export function loadGridAssets(scene: Phaser.Scene): void {
  // tiles
  scene.load.image(GridAssets.WALL,          T + 'tile_01.png');
  scene.load.image(GridAssets.FLOOR,         T + 'tile_07.png');
  scene.load.image(GridAssets.FLOOR_ALT,     T + 'tile_08.png');
  scene.load.image(GridAssets.SOCKET_EMPTY,  T + 'socket_unlit.png');
  scene.load.image(GridAssets.SOCKET_FILLED, T + 'socket_lit_c.png');
  scene.load.image(GridAssets.EXIT_CLOSED,   T + 'exit_closed_arch.png');
  scene.load.image(GridAssets.EXIT_OPEN,     T + 'exit_open_arch.png');

  // props
  scene.load.image(GridAssets.REPAIR_STONE,  P + 'repair_stone_glow.png');
  scene.load.image(GridAssets.PUSH_BLOCK,    P + 'push_block_stone.png');

  // Numbered stones 1–19
  for (const n of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]) {
    scene.load.image(`grid_number_stone_${n}`, P + `number_stone_${n}.png`);
  }
  // Numbered sockets 1–10
  for (const n of [1,2,3,4,5,6,7,8,9,10]) {
    scene.load.image(`grid_socket_unlit_${n}`, T + `socket_unlit_${n}.png`);
    scene.load.image(`grid_socket_lit_${n}`,   T + `socket_lit_${n}.png`);
  }
  // Socket value 20
  scene.load.image(GridAssets.SOCKET_UNLIT_20, T + 'socket_unlit_20.png');
  scene.load.image(GridAssets.SOCKET_LIT_20,   T + 'socket_lit_20.png');
  // Socket partial (sum_pair half-filled state)
  scene.load.image(GridAssets.SOCKET_PARTIAL,  T + 'socket_partial.png');
  // Gate + reject feedback
  scene.load.image(GridAssets.GATE_CLOSED,   T + 'gate_closed.png');
  scene.load.image(GridAssets.GATE_OPEN,     T + 'gate_open.png');
  scene.load.image(GridAssets.SOCKET_REJECT, T + 'socket_reject.png');

  // ui
  scene.load.image(GridAssets.TIP_BANNER,      U + 'tip_banner.png');
  scene.load.image(GridAssets.PANEL_SMALL,     U + 'panel_small.png');
  scene.load.image(GridAssets.PANEL_MEDIUM,    U + 'panel_medium.png');
  scene.load.image(GridAssets.PANEL_WIDE,      U + 'panel_wide.png');
  scene.load.image(GridAssets.SOLVED_BANNER,   U + 'banner_puzzle_solved.png');
  scene.load.image(GridAssets.BTN_UNDO,        U + 'button_undo.png');
  scene.load.image(GridAssets.BTN_RESET,       U + 'button_reset.png');
  scene.load.image(GridAssets.BTN_BACK,        U + 'button_back.png');
  scene.load.image(GridAssets.PORTRAIT_NILO,   U + 'portrait_nilo.png');
  scene.load.image(GridAssets.PORTRAIT_BRAM,   U + 'portrait_bram.png');
  scene.load.image(GridAssets.PORTRAIT_OWL,    U + 'portrait_owl.png');
  scene.load.image(GridAssets.CORNER_LEFT,     U + 'corner_ornament_left.png');
  scene.load.image(GridAssets.CORNER_RIGHT,    U + 'corner_ornament_right.png');
  scene.load.image(GridAssets.DIVIDER_LONG,    U + 'divider_long.png');
  scene.load.image(GridAssets.ORNAMENT_CENTER, U + 'ornament_line_center.png');
  scene.load.image(GridAssets.ARROW_UP,        U + 'arrow_up_glow.png');
  scene.load.image(GridAssets.ARROW_DOWN,      U + 'arrow_down_glow.png');
  scene.load.image(GridAssets.ARROW_LEFT,      U + 'arrow_left_glow.png');
  scene.load.image(GridAssets.ARROW_RIGHT,     U + 'arrow_right_glow.png');

  // props used as scenic decoration
  scene.load.image(GridAssets.LAMP_POST,     P + 'lamp_post.png');

  // tile decorations (in tilesets/rattlewood_grid/)
  scene.load.image(GridAssets.DECO_FLOWER_BLUE,   T + 'flower_blue_cluster.png');
  scene.load.image(GridAssets.DECO_FLOWER_PURPLE, T + 'flower_purple_cluster.png');
  scene.load.image(GridAssets.DECO_MUSHROOM_PAIR, T + 'mushroom_pair.png');
  scene.load.image(GridAssets.DECO_MUSHROOM_TALL, T + 'mushroom_tall.png');
  scene.load.image(GridAssets.DECO_PLANT_FERN,    T + 'plant_fern_a.png');
  scene.load.image(GridAssets.DECO_PLANT_SPROUT,  T + 'plant_sprout.png');
  scene.load.image(GridAssets.DECO_PLANT_TUFT,    T + 'plant_small_tuft.png');
  scene.load.image(GridAssets.DECO_ROCK_SMALL,    T + 'rock_small.png');

  // vfx — static
  scene.load.image(GridAssets.VFX_BLUE_PICKUP,  V + 'blue_pickup_sparkles.png');
  scene.load.image(GridAssets.VFX_BLUE_BURST,   V + 'blue_repair_burst.png');
  scene.load.image(GridAssets.VFX_BLUE_MOTES,   V + 'blue_energy_motes.png');
  scene.load.image(GridAssets.VFX_GOLD_VICTORY, V + 'gold_victory_sparkles.png');
  scene.load.image(GridAssets.VFX_GOLD_SHOWER,  V + 'gold_star_shower.png');
  scene.load.image(GridAssets.VFX_GOLD_HALO,    V + 'gold_halo_ring.png');
  scene.load.image(GridAssets.VFX_BUMP_DUST,    V + 'dust_bump_invalid.png');

  // vfx — animated atlases
  scene.load.atlas(GridAssets.VFX_BLUE_PICKUP_ANIM,  VA + 'blue_pickup_sparkles_anim.png',  VA + 'blue_pickup_sparkles_anim.json');
  scene.load.atlas(GridAssets.VFX_BLUE_BURST_ANIM,   VA + 'blue_repair_burst_anim.png',     VA + 'blue_repair_burst_anim.json');
  scene.load.atlas(GridAssets.VFX_GOLD_VICTORY_ANIM, VA + 'gold_victory_sparkles_anim.png', VA + 'gold_victory_sparkles_anim.json');

  // equation flash overlays
  scene.load.image(GridAssets.EQ_1_PLUS_9,  EQ + 'eq_1_plus_9.png');
  scene.load.image(GridAssets.EQ_2_PLUS_8,  EQ + 'eq_2_plus_8.png');
  scene.load.image(GridAssets.EQ_3_PLUS_7,  EQ + 'eq_3_plus_7.png');
  scene.load.image(GridAssets.EQ_4_PLUS_6,  EQ + 'eq_4_plus_6.png');
  scene.load.image(GridAssets.EQ_SUM_10,    EQ + 'eq_sum_10.png');
  scene.load.image(GridAssets.EQ_1_PLUS_4,  EQ + 'eq_1_plus_4.png');
  scene.load.image(GridAssets.EQ_2_PLUS_3,  EQ + 'eq_2_plus_3.png');
  scene.load.image(GridAssets.EQ_1_PLUS_1,  EQ + 'eq_1_plus_1.png');
  scene.load.image(GridAssets.EQ_2_PLUS_2,  EQ + 'eq_2_plus_2.png');
  scene.load.image(GridAssets.EQ_3_PLUS_3,  EQ + 'eq_3_plus_3.png');
  scene.load.image(GridAssets.EQ_4_PLUS_4,  EQ + 'eq_4_plus_4.png');
  scene.load.image(GridAssets.EQ_11_PLUS_9, EQ + 'eq_11_plus_9.png');
  scene.load.image(GridAssets.EQ_12_PLUS_8, EQ + 'eq_12_plus_8.png');
  scene.load.image(GridAssets.EQ_13_PLUS_7, EQ + 'eq_13_plus_7.png');
  scene.load.image(GridAssets.EQ_14_PLUS_6, EQ + 'eq_14_plus_6.png');

  // tutorial gesture atlases
  scene.load.atlas(GridAssets.HINT_SWIPE_RIGHT, TU + 'hint_swipe_right.png', TU + 'hint_swipe_right.json');
  scene.load.atlas(GridAssets.HINT_TAP,         TU + 'hint_tap.png',         TU + 'hint_tap.json');

  // blank stone buttons
  scene.load.image(GridAssets.BTN_STONE_BLUE_BLANK,       U + 'button_stone_blue_blank.png');
  scene.load.image(GridAssets.BTN_STONE_BLUE_BLANK_HOVER, U + 'button_stone_blue_blank_hover.png');
  scene.load.image(GridAssets.BTN_STONE_GOLD_BLANK,       U + 'button_stone_gold_blank.png');
  scene.load.image(GridAssets.BTN_STONE_GREEN_BLANK,      U + 'button_stone_green_blank.png');

  // cinematic portraits
  scene.load.image(GridAssets.PORTRAIT_BRAM_CINEMATIC, UC + 'portrait_bram_cinematic.png');
  scene.load.image(GridAssets.PORTRAIT_NILO_CINEMATIC, UC + 'portrait_nilo_cinematic.png');
  scene.load.image(GridAssets.PORTRAIT_OWL_CINEMATIC,  UC + 'portrait_owl_cinematic.png');

  // character sprite atlases
  scene.load.atlas(GridAssets.BRAM_ALMOST_ATLAS, SP + 'bram/almost/bram_almost_atlas.png',   SP + 'bram/almost/bram_almost_atlas.json');
  scene.load.atlas(GridAssets.NILO_SPIRIT_IDLE,  SP + 'nilo/nilo_spirit_idle.png',           SP + 'nilo/nilo_spirit_idle.json');

  // clocktower marsh tileset (second chapter — loaded now, used later)
  scene.load.image(GridAssets.CM_TILE_WALL,         CM + 'tile_wall_marsh.png');
  scene.load.image(GridAssets.CM_TILE_FLOOR,        CM + 'tile_floor_marsh.png');
  scene.load.image(GridAssets.CM_TILE_FLOOR_ALT,    CM + 'tile_floor_marsh_alt.png');
  scene.load.image(GridAssets.CM_EXIT_CLOSED,       CM + 'exit_closed_clocktower.png');
  scene.load.image(GridAssets.CM_EXIT_OPEN,         CM + 'exit_open_clocktower.png');
  scene.load.image(GridAssets.CM_SOCKET_UNLIT,      CM + 'socket_unlit_marsh.png');
  scene.load.image(GridAssets.CM_SOCKET_LIT,        CM + 'socket_lit_marsh.png');
  scene.load.image(GridAssets.CM_GATE_CLOSED,       CM + 'gate_closed_marsh.png');
  scene.load.image(GridAssets.CM_GATE_OPEN,         CM + 'gate_open_marsh.png');
  scene.load.image(GridAssets.CM_BRIDGE_PLANK,      CM + 'bridge_plank_marsh.png');
  scene.load.image(GridAssets.CM_DECO_CATTAIL,      CM + 'deco_cattail.png');
  scene.load.image(GridAssets.CM_DECO_LILYPAD,      CM + 'deco_lilypad.png');
  scene.load.image(GridAssets.CM_DECO_GEAR_SMALL,   CM + 'deco_gear_small.png');
  scene.load.image(GridAssets.CM_DECO_LANTERN_POST, CM + 'deco_lantern_post_marsh.png');
}
