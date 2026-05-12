import Phaser from 'phaser';
import { loadBramSkeletonAtlas, registerBramSkeletonAnimations } from '../game/sprites/bramSkeletonAtlas';
import { loadGridAssets } from '../game/assets/loadGridAssets';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    loadBramSkeletonAtlas(this);
    loadGridAssets(this);
    // Loader can soft-fail; we log so a missing atlas is visible in console
    // but the runtime still boots into the procedural fallback.
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('[BootScene] failed to load', file.key, file.src);
    });
  }

  create() {
    registerBramSkeletonAnimations(this);
    this.scene.start('MenuScene');
  }
}
