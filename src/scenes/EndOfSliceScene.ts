import Phaser from 'phaser';
import { Palette } from '../game/palette';
import { addButton, addPanel, addSmallText, addTitle } from '../game/ui';
import { RestorationProgressStrip } from '../game/ui/RestorationProgressStrip';
import { GameProgress } from '../game/progress/GameProgress';

export class EndOfSliceScene extends Phaser.Scene {
  constructor() { super('EndOfSliceScene'); }

  create() {
    this.cameras.main.setBackgroundColor(Palette.night);
    this.drawBackdrop();

    addTitle(this, 'End of slice', 64, 56, 48);
    addSmallText(this, 'You finished the first chapter of Bram’s restoration.', 64, 118, 22);

    addPanel(this, 64, 180, 1152, 130, 0.86);
    new RestorationProgressStrip(this, 110, 250, { cell: 56, gap: 18, showLabels: true });

    addPanel(this, 280, 360, 720, 200, 0.9);
    this.add.text(640, 410, 'Life Sparks collected', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#f0dcae'
    }).setOrigin(0.5);
    this.add.text(640, 460, `✦ ${GameProgress.lifeSparks()}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '58px',
      color: '#ffdf7a'
    }).setOrigin(0.5);
    this.add.text(640, 522, '“Then we start with hands. Find enough Life Sparks, and the world will remember you.”', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '18px',
      color: '#f0dcae',
      wordWrap: { width: 660 },
      align: 'center'
    }).setOrigin(0.5, 0);

    addButton(this, 'Return to menu', 460, 612, 360, 56, () => this.scene.start('MenuScene'));
    this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('MenuScene'));
    this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('MenuScene'));

    addSmallText(this, 'Next chapters (feet, eyes, voice, heart) come after the first art pass.', 64, 686, 16);
  }

  private drawBackdrop() {
    const g = this.add.graphics();
    g.fillStyle(Palette.night, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.05, 0.18));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(2, 4));
    }
  }
}
