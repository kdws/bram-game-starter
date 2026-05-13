import Phaser from 'phaser';
import { GridAssets } from './GridAssetKeys';

const T = 'assets/tilesets/rattlewood_grid/';
const P = 'assets/props/grid/';
const U = 'assets/ui/grid/';
const V = 'assets/vfx/grid/';

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

  // vfx
  scene.load.image(GridAssets.VFX_BLUE_PICKUP,  V + 'blue_pickup_sparkles.png');
  scene.load.image(GridAssets.VFX_BLUE_BURST,   V + 'blue_repair_burst.png');
  scene.load.image(GridAssets.VFX_BLUE_MOTES,   V + 'blue_energy_motes.png');
  scene.load.image(GridAssets.VFX_GOLD_VICTORY, V + 'gold_victory_sparkles.png');
  scene.load.image(GridAssets.VFX_GOLD_SHOWER,  V + 'gold_star_shower.png');
  scene.load.image(GridAssets.VFX_GOLD_HALO,    V + 'gold_halo_ring.png');
  scene.load.image(GridAssets.VFX_BUMP_DUST,    V + 'dust_bump_invalid.png');
}
