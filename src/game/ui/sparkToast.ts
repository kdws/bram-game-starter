import Phaser from 'phaser';
import { Palette } from '../palette';

export interface SparkToastOptions {
  message?: string;
  sparkCount?: number;
  duration?: number;
}

export function showLifeSparkToast(scene: Phaser.Scene, opts: SparkToastOptions = {}): void {
  const { width } = scene.scale.gameSize;
  const message = opts.message ?? 'Life Spark found!';
  const duration = opts.duration ?? 2200;
  const w = 360;
  const h = 110;
  const x = (width - w) / 2;
  const y = 90;

  const g = scene.add.graphics();
  g.fillStyle(Palette.ink, 0.94);
  g.lineStyle(3, Palette.gold, 1);
  g.fillRoundedRect(x, y, w, h, 18);
  g.strokeRoundedRect(x, y, w, h, 18);

  const spark = scene.add.text(x + 38, y + h / 2, '✦', {
    fontFamily: 'Georgia, serif',
    fontSize: '52px',
    color: '#ffdf7a'
  }).setOrigin(0.5);

  const title = scene.add.text(x + 76, y + 22, message, {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    color: '#ffe9ad'
  });

  const subtitle = scene.add.text(
    x + 76,
    y + 56,
    typeof opts.sparkCount === 'number' ? `Life Sparks: ${opts.sparkCount}` : 'The world remembers a little more.',
    {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#f0dcae'
    }
  );

  const items: Phaser.GameObjects.GameObject[] = [g, spark, title, subtitle];
  for (const item of items) (item as any).setDepth?.(2000);

  scene.tweens.add({
    targets: spark,
    scale: 1.18,
    yoyo: true,
    duration: 360,
    repeat: 1,
    ease: 'Sine.easeInOut'
  });

  scene.tweens.add({
    targets: items,
    alpha: 0,
    delay: duration - 420,
    duration: 420,
    ease: 'Quad.easeIn',
    onComplete: () => items.forEach(i => i.destroy())
  });
}
