import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    this.load.image('concept-downhill', '/assets/concept/downhill-rattle-run.png');
    this.load.image('concept-platform', '/assets/concept/platforming.png');
    this.load.image('concept-topdown', '/assets/concept/top-down-puzzles.png');
  }
  create() {
    this.scene.start('MenuScene');
  }
}
