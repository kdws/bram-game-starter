import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addPanel, addSmallText, addTitle } from '../game/ui';
import { DialogueBox, DialogueLine } from '../game/ui/DialogueBox';
import { RestorationProgressStrip } from '../game/ui/RestorationProgressStrip';

export class IntroScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private bram!: Bram;
  private owl!: Phaser.GameObjects.Container;

  constructor() { super('IntroScene'); }

  create() {
    this.cameras.main.setBackgroundColor(Palette.night);
    this.drawNightForest();

    addTitle(this, 'A cold morning in Rattlewood', 64, 36, 32);
    addSmallText(this, 'A Life Spark drifts above the path. Someone is talking to you.', 64, 78, 20);

    new RestorationProgressStrip(this, 64, 150, { cell: 48, gap: 14, showLabels: false });

    this.owl = this.makeOwl(940, 430);
    this.bram = new Bram(this, 360, 540, { scale: 1.2 });

    this.tweens.add({
      targets: this.owl,
      y: this.owl.y - 12,
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut'
    });

    this.dialogue = new DialogueBox(this, 80, 540, 1120, 140);

    const lines: DialogueLine[] = [
      { speaker: 'Owl', text: 'Easy there, little rattler. You’re not gone. You’re just… misplaced.' },
      { speaker: 'Bram', text: 'My hands are bones. My everything is bones.' },
      { speaker: 'Owl', text: 'Then we start with hands. Find enough Life Sparks, and the world will remember you.' },
      { speaker: 'Owl', text: 'Your board knows the downhill path. Solve what it asks, and it will carry you safely.' }
    ];

    this.dialogue.play(lines, {
      onComplete: () => this.startSlice()
    });

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));
    addSmallText(this, 'ESC to leave the woods.', 64, 690, 16);
  }

  private startSlice() {
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('RattleRunScene', { mode: 'slice' });
    });
  }

  private drawNightForest() {
    const g = this.add.graphics();
    g.fillStyle(Palette.night, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 60; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.05, 0.22));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(20, 440), Phaser.Math.Between(2, 4));
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x1f2a1f, 0.75 - i * 0.1);
      g.fillCircle(160 + i * 240, 480 - i * 24, 220 - i * 18);
    }
    g.fillStyle(0x2a221b, 1);
    g.fillRect(0, 580, 1280, 140);
    g.lineStyle(4, Palette.parchmentDark, 0.35);
    g.lineBetween(0, 580, 1280, 580);
    const sparkX = 920;
    const sparkY = 300;
    const spark = this.add.text(sparkX, sparkY, '✦', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#ffdf7a'
    }).setOrigin(0.5);
    this.tweens.add({ targets: spark, y: sparkY - 18, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: spark, alpha: 0.55, yoyo: true, repeat: -1, duration: 900 });
  }

  private makeOwl(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(0x5a4a32, 1);
    body.fillEllipse(0, 8, 110, 132);
    body.fillStyle(0x6f5b3d, 1);
    body.fillEllipse(0, 0, 92, 100);
    body.fillStyle(0x3a2c1c, 1);
    body.fillTriangle(-44, -56, -20, -28, -28, -22);
    body.fillTriangle(44, -56, 20, -28, 28, -22);
    body.fillStyle(Palette.bone, 1);
    body.fillCircle(-22, -16, 18);
    body.fillCircle(22, -16, 18);
    body.fillStyle(Palette.ink, 1);
    body.fillCircle(-22, -16, 9);
    body.fillCircle(22, -16, 9);
    body.fillStyle(Palette.glow, 1);
    body.fillCircle(-19, -19, 3);
    body.fillCircle(25, -19, 3);
    body.fillStyle(Palette.gold, 1);
    body.fillTriangle(-6, 0, 6, 0, 0, 14);
    body.fillStyle(0x4a3a26, 1);
    body.fillRect(-22, 64, 8, 22);
    body.fillRect(14, 64, 8, 22);
    body.fillStyle(Palette.gold, 1);
    body.fillTriangle(-26, 86, -10, 86, -18, 96);
    body.fillTriangle(10, 86, 26, 86, 18, 96);

    const branch = this.add.graphics();
    branch.fillStyle(Palette.bark, 1);
    branch.fillRoundedRect(-80, 96, 200, 18, 6);
    branch.fillStyle(Palette.moss, 1);
    branch.fillCircle(-60, 98, 8);
    branch.fillCircle(80, 98, 7);

    c.add([branch, body]);
    return c;
  }
}
