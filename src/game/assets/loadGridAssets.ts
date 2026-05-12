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
  scene.load.image(GridAssets.TIP_BANNER,    U + 'tip_banner.png');
  scene.load.image(GridAssets.PANEL_MEDIUM,  U + 'panel_medium.png');
  scene.load.image(GridAssets.SOLVED_BANNER, U + 'banner_puzzle_solved.png');
  scene.load.image(GridAssets.BTN_UNDO,      U + 'button_undo.png');
  scene.load.image(GridAssets.BTN_RESET,     U + 'button_reset.png');
  scene.load.image(GridAssets.PORTRAIT_NILO, U + 'portrait_nilo.png');

  // vfx
  scene.load.image(GridAssets.VFX_BLUE_PICKUP,  V + 'blue_pickup_sparkles.png');
  scene.load.image(GridAssets.VFX_BLUE_BURST,   V + 'blue_repair_burst.png');
  scene.load.image(GridAssets.VFX_GOLD_VICTORY, V + 'gold_victory_sparkles.png');
  scene.load.image(GridAssets.VFX_GOLD_SHOWER,  V + 'gold_star_shower.png');
}
