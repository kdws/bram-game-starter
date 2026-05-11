import Phaser from 'phaser';
import { Palette } from '../palette';
import {
  GameProgress,
  RESTORATION_STAGES,
  RestorationStageId
} from '../progress/GameProgress';

export interface RestorationStripOptions {
  cell?: number;
  gap?: number;
  showLabels?: boolean;
}

const DEFAULT_OPTIONS: Required<RestorationStripOptions> = {
  cell: 58,
  gap: 18,
  showLabels: true
};

function monogramFor(id: RestorationStageId): string {
  switch (id) {
    case 'skeleton': return 'S';
    case 'hands':    return 'H';
    case 'feet':     return 'F';
    case 'eyes':     return 'E';
    case 'voice':    return 'V';
    case 'heart':    return '♥';
    case 'human':    return '★';
  }
}

export class RestorationProgressStrip extends Phaser.GameObjects.Container {
  private opts: Required<RestorationStripOptions>;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: RestorationStripOptions = {}) {
    super(scene, x, y);
    this.opts = { ...DEFAULT_OPTIONS, ...opts };
    scene.add.existing(this);
    this.refresh();
  }

  refresh(): void {
    this.removeAll(true);
    const { cell, gap, showLabels } = this.opts;
    const radius = cell / 2 - 4;
    const stride = cell + gap;
    const current = GameProgress.currentStage();
    const restored = new Set<RestorationStageId>(GameProgress.get().restoredStages);
    restored.add('skeleton');

    RESTORATION_STAGES.forEach((stage, i) => {
      const cx = i * stride;
      const isRestored = restored.has(stage.id);
      const isCurrent = stage.id === current && !isRestored;

      if (i > 0) {
        const line = this.scene.add.graphics();
        const prevRestored = restored.has(RESTORATION_STAGES[i - 1].id);
        const connected = prevRestored && isRestored;
        line.lineStyle(3, Palette.parchmentDark, connected ? 0.95 : 0.3);
        line.lineBetween(cx - stride + radius, 0, cx - radius, 0);
        this.add(line);
      }

      const ring = this.scene.add.graphics();
      let fill = Palette.ink;
      let stroke = Palette.boneShadow;
      let fillAlpha = 0.55;
      let strokeAlpha = 0.7;
      if (isRestored) {
        fill = Palette.gold;
        stroke = Palette.parchmentDark;
        fillAlpha = 1;
        strokeAlpha = 1;
      } else if (isCurrent) {
        fill = Palette.bark;
        stroke = Palette.gold;
        fillAlpha = 1;
        strokeAlpha = 1;
      }
      ring.fillStyle(fill, fillAlpha);
      ring.lineStyle(3, stroke, strokeAlpha);
      ring.fillCircle(cx, 0, radius);
      ring.strokeCircle(cx, 0, radius);
      this.add(ring);

      const monoColor = isRestored ? '#3b2b16' : isCurrent ? '#ffe9ad' : '#7a5e2c';
      const mono = this.scene.add.text(cx, 0, monogramFor(stage.id), {
        fontFamily: 'Georgia, serif',
        fontSize: `${Math.floor(cell * 0.46)}px`,
        color: monoColor
      }).setOrigin(0.5);
      this.add(mono);

      if (isCurrent) {
        const halo = this.scene.add.graphics();
        halo.lineStyle(3, Palette.glow, 0.7);
        halo.strokeCircle(cx, 0, radius + 6);
        this.add(halo);
        this.scene.tweens.add({
          targets: halo,
          alpha: 0.25,
          yoyo: true,
          repeat: -1,
          duration: 750,
          ease: 'Sine.easeInOut'
        });
      }

      if (showLabels) {
        const labelColor = isRestored ? '#ffe9ad' : isCurrent ? '#ffdf7a' : '#a08866';
        const label = this.scene.add.text(cx, radius + 10, stage.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          color: labelColor
        }).setOrigin(0.5, 0);
        this.add(label);
      }
    });
  }
}
