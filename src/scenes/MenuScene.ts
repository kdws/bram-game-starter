import Phaser from 'phaser';
import { addButton, addPanel, addSmallText, addTitle } from '../game/ui';
import { Palette } from '../game/palette';
import { chapters } from '../data/progression';
import { RestorationProgressStrip } from '../game/ui/RestorationProgressStrip';
import { GameProgress } from '../game/progress/GameProgress';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor(Palette.night);
    this.drawCozyBackground();
    addTitle(this, 'BRAM', 72, 40, 76);
    addTitle(this, 'The Almost Boy', 78, 116, 34);
    addSmallText(this, 'A cozy math adventure about landing tricks, solving puzzles, and piecing yourself back together.', 82, 174, 24);

    addPanel(this, 64, 226, 1152, 110, 0.82);
    this.add.text(96, 244, 'Restoration', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffdf7a'
    });
    this.add.text(96, 268, `Life Sparks: ✦ ${GameProgress.lifeSparks()}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#f0dcae'
    });
    new RestorationProgressStrip(this, 360, 290, { cell: 52, gap: 16, showLabels: true });

    addPanel(this, 72, 360, 480, 296, 0.84);
    addSmallText(this, 'Play', 104, 372, 24);
    addButton(this, '▶ Play Vertical Slice', 104, 410, 416, 56, () => this.startSlice());
    addSmallText(this, 'Standalone demo modes', 104, 478, 20);
    addButton(this, 'Rattle Run', 104, 506, 130, 40, () => this.scene.start('RattleRunScene'));
    addButton(this, 'Platform', 244, 506, 130, 40, () => this.scene.start('PlatformScene'));
    addButton(this, 'Top-Down', 384, 506, 136, 40, () => this.scene.start('TopDownScene'));
    addButton(this, '◴ Clocktower Marsh: Tell Time', 104, 554, 416, 44, () => this.scene.start('ClockTowerScene'));
    addSmallText(this, 'Slice = guided story. Demos = endless practice.', 104, 606, 15);
    addButton(this, 'Reset progress', 104, 626, 200, 22, () => {
      GameProgress.reset();
      this.scene.restart();
    });

    addPanel(this, 620, 360, 596, 296, 0.78);
    addSmallText(this, 'Chapter spine', 652, 372, 26);
    chapters.forEach((chapter, index) => {
      const y = 408 + index * 76;
      this.add.text(652, y, `${index + 1}. ${chapter.name}`, {
        fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffdf7a'
      });
      this.add.text(674, y + 28, `${chapter.world} → Restore ${chapter.restoredPart}`, {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f0dcae', wordWrap: { width: 520 }
      });
    });

    addSmallText(this, 'Keyboard: arrows/WASD to move, space to jump/select. Touch/mouse buttons work in menus.', 78, 670, 18);
  }

  private startSlice() {
    GameProgress.reset();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('IntroScene');
    });
  }

  private drawCozyBackground() {
    const g = this.add.graphics();
    g.fillStyle(Palette.night, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 28; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.08, 0.28));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 220), Phaser.Math.Between(2, 5));
    }
    g.fillStyle(Palette.bark, 1);
    g.fillRoundedRect(1050, 80, 170, 130, 16);
    g.fillStyle(Palette.warmWindow, 0.9);
    g.fillRoundedRect(1080, 118, 38, 38, 8);
    g.fillRoundedRect(1148, 118, 38, 38, 8);
    g.fillStyle(Palette.moss, 1);
    g.fillCircle(1140, 70, 90);
    g.fillCircle(1200, 70, 60);
  }
}
