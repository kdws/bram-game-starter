import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addButton, addPanel, addSmallText, addTitle } from '../game/ui';
import { RestorationProgressStrip } from '../game/ui/RestorationProgressStrip';
import { GameProgress, RestorationStageId } from '../game/progress/GameProgress';

interface RestorationSceneData {
  stage?: RestorationStageId;
}

const STAGE_COPY: Partial<Record<RestorationStageId, { line: string; sparkLabel: string }>> = {
  hands:  { line: 'Bram remembered his hands.',  sparkLabel: 'around his hands' },
  feet:   { line: 'Bram remembered his feet.',   sparkLabel: 'around his feet' },
  eyes:   { line: 'Bram remembered his eyes.',   sparkLabel: 'around his eyes' },
  voice:  { line: 'Bram remembered his voice.',  sparkLabel: 'around his voice' },
  heart:  { line: 'Bram remembered his heart.',  sparkLabel: 'around his heart' },
  human:  { line: 'Bram is almost-boy no more.', sparkLabel: 'all around him' }
};

export class RestorationScene extends Phaser.Scene {
  private targetStage: RestorationStageId = 'hands';
  private bram!: Bram;
  private strip!: RestorationProgressStrip;

  constructor() { super('RestorationScene'); }

  init(data: RestorationSceneData) {
    this.targetStage = data?.stage ?? GameProgress.currentStage();
  }

  create() {
    this.cameras.main.setBackgroundColor(0x14110d);
    this.drawCozyBackground();

    addTitle(this, 'The world remembers.', 64, 56, 38);

    this.strip = new RestorationProgressStrip(this, 64, 132, { cell: 52, gap: 16, showLabels: true });

    this.bram = new Bram(this, 640, 430, { scale: 2.0 });

    const halo = this.add.graphics();
    halo.setDepth(0);
    this.drawHalo(halo);
    this.tweens.add({
      targets: halo,
      alpha: 0.35,
      yoyo: true,
      repeat: -1,
      duration: 1100,
      ease: 'Sine.easeInOut'
    });

    addPanel(this, 240, 540, 800, 100, 0.9);
    const copy = STAGE_COPY[this.targetStage] ?? STAGE_COPY.hands!;
    const lineText = this.add.text(640, 590, copy.line, {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#ffe9ad'
    }).setOrigin(0.5);
    lineText.setAlpha(0);
    this.tweens.add({ targets: lineText, alpha: 1, duration: 700, delay: 600 });

    this.time.delayedCall(900, () => {
      GameProgress.restoreStage(this.targetStage);
      this.strip.refresh();
      this.spawnSparks();
      this.bram.setWarmGlow?.(true);
    });

    addButton(this, 'Continue →', 540, 660, 200, 50, () => {
      this.scene.start('EndOfSliceScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('EndOfSliceScene'));
    this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('EndOfSliceScene'));

    addSmallText(this, `Glow ${copy.sparkLabel}.`, 64, 690, 16);
  }

  private drawCozyBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x14110d, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 80; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.05, 0.18));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(2, 5));
    }
    for (let r = 320; r > 80; r -= 40) {
      g.fillStyle(Palette.glow, 0.04);
      g.fillCircle(640, 430, r);
    }
  }

  private drawHalo(g: Phaser.GameObjects.Graphics) {
    g.clear();
    g.fillStyle(Palette.glow, 0.18);
    g.fillCircle(640, 430, 220);
    g.fillStyle(Palette.glow, 0.28);
    g.fillCircle(640 - 50, 430 + 30, 60);
    g.fillCircle(640 + 50, 430 + 30, 60);
  }

  private spawnSparks() {
    for (let i = 0; i < 14; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const radius = Phaser.Math.FloatBetween(60, 130);
      const sx = 640 + Math.cos(angle) * radius;
      const sy = 430 + Math.sin(angle) * radius;
      const s = this.add.text(sx, sy, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: `${Phaser.Math.Between(24, 42)}px`,
        color: '#ffdf7a'
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: s,
        alpha: 0.9,
        y: sy - 60,
        duration: 1100,
        delay: i * 60,
        ease: 'Quad.easeOut'
      });
      this.tweens.add({
        targets: s,
        alpha: 0,
        delay: 1100 + i * 60,
        duration: 700,
        onComplete: () => s.destroy()
      });
    }
  }
}
