import Phaser from 'phaser';
import { loadBramSkeletonAtlas, registerBramSkeletonAnimations } from '../game/sprites/bramSkeletonAtlas';
import { loadGridAssets } from '../game/assets/loadGridAssets';
import { AudioKeys } from '../game/audio/AudioKeys';
import { AudioManager } from '../game/audio/AudioManager';

const SFX  = 'assets/audio/sfx/';
const MUSIC = 'assets/audio/music/';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    loadBramSkeletonAtlas(this);
    loadGridAssets(this);
    this.preloadAudio();

    // Loader can soft-fail; we log so a missing asset is visible in console
    // but the runtime still boots into the procedural / silent fallback.
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('[BootScene] failed to load', file.key, file.src);
    });
  }

  create() {
    registerBramSkeletonAnimations(this);
    AudioManager.init(this.game);
    this.scene.start('MenuScene');
  }

  private preloadAudio() {
    // SFX
    this.load.audio(AudioKeys.UI_CLICK,        SFX + 'ui_click.wav');
    this.load.audio(AudioKeys.UI_HOVER,        SFX + 'ui_hover.wav');
    this.load.audio(AudioKeys.PICKUP_STONE,    SFX + 'pickup_stone.wav');
    this.load.audio(AudioKeys.REPAIR_SOCKET,   SFX + 'repair_socket.wav');
    this.load.audio(AudioKeys.REPAIR_COMPLETE, SFX + 'repair_complete.wav');
    this.load.audio(AudioKeys.BLOCK_PUSH,      SFX + 'block_push.wav');
    this.load.audio(AudioKeys.INVALID_BUMP,    SFX + 'invalid_bump.wav');
    this.load.audio(AudioKeys.UNDO,            SFX + 'undo.wav');
    this.load.audio(AudioKeys.RESET,           SFX + 'reset.wav');
    this.load.audio(AudioKeys.PORTAL_OPEN,     SFX + 'portal_open.wav');
    this.load.audio(AudioKeys.BRAM_FALL_APART, SFX + 'bram_fall_apart.wav');
    this.load.audio(AudioKeys.BRAM_REASSEMBLE, SFX + 'bram_reassemble.wav');
    this.load.audio(AudioKeys.SUCCESS_WARM,    SFX + 'success_warm.wav');
    this.load.audio(AudioKeys.NILO_ENERGY,     SFX + 'nilo_energy_pulse.wav');

    // Music / ambient
    this.load.audio(AudioKeys.AMBIENT_RATTLEWOOD, MUSIC + 'ambient_rattlewood_loop.wav');
    this.load.audio(AudioKeys.MENU_THEME,         MUSIC + 'menu_theme.ogg');
  }
}
