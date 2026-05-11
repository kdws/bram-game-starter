import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { PrologueScene } from './scenes/PrologueScene';
import { IntroScene } from './scenes/IntroScene';
import { RattleRunScene } from './scenes/RattleRunScene';
import { PlatformScene } from './scenes/PlatformScene';
import { TopDownScene } from './scenes/TopDownScene';
import { RestorationScene } from './scenes/RestorationScene';
import { EndOfSliceScene } from './scenes/EndOfSliceScene';
import { ClockTowerScene } from './scenes/ClockTowerScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#18140f',
  pixelArt: false,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    PrologueScene,
    IntroScene,
    RattleRunScene,
    PlatformScene,
    TopDownScene,
    RestorationScene,
    EndOfSliceScene,
    ClockTowerScene
  ]
};

new Phaser.Game(config);
