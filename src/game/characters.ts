import Phaser from 'phaser';
import { Palette } from './palette';

export function drawHumanBram(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  // hair: messy brown tuft
  g.fillStyle(0x5b3a1a, 1);
  g.fillEllipse(0, -54, 40, 22);
  g.fillTriangle(-10, -58, 0, -72, 8, -58);
  g.fillTriangle(6, -58, 18, -62, 14, -52);
  // face
  g.fillStyle(0xf2d2a8, 1);
  g.fillCircle(0, -42, 18);
  // eyes
  g.fillStyle(0x1a1410, 1);
  g.fillCircle(-6, -42, 2);
  g.fillCircle(6, -42, 2);
  // smile
  g.lineStyle(2, 0x1a1410, 1);
  g.beginPath();
  g.arc(0, -36, 4, 0.2, Math.PI - 0.2);
  g.strokePath();
  // neck
  g.fillStyle(0xf2d2a8, 1);
  g.fillRect(-4, -26, 8, 6);
  // shirt - mossy green
  g.fillStyle(0x6b8f4a, 1);
  g.fillRoundedRect(-19, -22, 38, 32, 6);
  // shorts - warm brown
  g.fillStyle(0x3a2a1a, 1);
  g.fillRoundedRect(-17, 8, 34, 20, 4);
  // legs
  g.fillStyle(0xf2d2a8, 1);
  g.fillRoundedRect(-10, 28, 6, 16, 2);
  g.fillRoundedRect(4, 28, 6, 16, 2);
  // arms
  g.fillStyle(0xf2d2a8, 1);
  g.fillRoundedRect(-25, -18, 6, 26, 3);
  g.fillRoundedRect(19, -18, 6, 26, 3);
  c.add(g);
  return c;
}

export function drawAlienNilo(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setScale(scale);
  const halo = scene.add.graphics();
  halo.fillStyle(0x4a90c8, 0.18);
  halo.fillCircle(0, 0, 80);
  halo.fillStyle(0x6fb5e8, 0.10);
  halo.fillCircle(0, 0, 110);
  c.add(halo);

  const tendrils = scene.add.graphics();
  tendrils.fillStyle(0x8fc8ed, 0.42);
  tendrils.fillTriangle(-40, 24, -10, 24, -28, 92);
  tendrils.fillTriangle(40, 24, 10, 24, 28, 90);
  tendrils.fillTriangle(-14, 24, 14, 24, 0, 104);
  tendrils.fillStyle(0xa8d8f0, 0.34);
  tendrils.fillTriangle(-60, -2, -42, 6, -56, 52);
  tendrils.fillTriangle(60, -2, 42, 6, 56, 50);
  c.add(tendrils);

  const body = scene.add.graphics();
  body.fillStyle(0x6fb5e8, 0.55);
  body.fillEllipse(0, 0, 78, 98);
  body.fillStyle(0x9cd0f0, 0.38);
  body.fillEllipse(0, -6, 60, 70);
  // inner stars
  body.fillStyle(0xeaf6ff, 0.95);
  body.fillCircle(-12, -8, 2);
  body.fillCircle(8, -16, 2);
  body.fillCircle(4, 10, 2);
  body.fillCircle(-6, 22, 1.5);
  body.fillCircle(14, 18, 1.5);
  // big glowing eyes
  body.fillStyle(0xeaf6ff, 1);
  body.fillEllipse(-14, -8, 16, 22);
  body.fillEllipse(14, -8, 16, 22);
  body.fillStyle(0x2a5680, 1);
  body.fillCircle(-14, -6, 6);
  body.fillCircle(14, -6, 6);
  body.fillStyle(0xffffff, 1);
  body.fillCircle(-12, -8, 2);
  body.fillCircle(16, -8, 2);
  c.add(body);

  scene.tweens.add({ targets: halo, alpha: 0.55, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: tendrils, y: 4, yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut' });
  return c;
}

export function drawHumanNilo(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setScale(scale);
  const halo = scene.add.graphics();
  halo.fillStyle(0x6fb5e8, 0.16);
  halo.fillCircle(0, -10, 56);
  c.add(halo);
  const g = scene.add.graphics();
  // hair: longer swept dark blue-black, distinct from Bram's tuft
  g.fillStyle(0x1a2840, 1);
  g.fillEllipse(0, -54, 46, 26);
  g.fillTriangle(-22, -52, -32, -22, -14, -36);
  g.fillTriangle(20, -54, 28, -34, 22, -26);
  // pale cool-tinted face
  g.fillStyle(0xd8dceb, 1);
  g.fillCircle(0, -42, 18);
  // larger calm eyes with pale-blue glow
  g.fillStyle(0xeaf6ff, 1);
  g.fillCircle(-7, -42, 4.5);
  g.fillCircle(7, -42, 4.5);
  g.fillStyle(0x4a78a8, 1);
  g.fillCircle(-7, -42, 2.5);
  g.fillCircle(7, -42, 2.5);
  // serene mouth
  g.lineStyle(2, 0x2a3040, 1);
  g.lineBetween(-3, -34, 3, -34);
  // neck
  g.fillStyle(0xd8dceb, 1);
  g.fillRect(-4, -26, 8, 6);
  // tunic - deep teal-blue
  g.fillStyle(0x3c5878, 1);
  g.fillRoundedRect(-21, -22, 42, 42, 6);
  // collar v
  g.fillStyle(0x6f9cc8, 1);
  g.fillTriangle(-10, -22, 10, -22, 0, -6);
  // golden belt
  g.fillStyle(0xc8a548, 1);
  g.fillRect(-21, 14, 42, 4);
  // pants
  g.fillStyle(0x1a2030, 1);
  g.fillRoundedRect(-19, 18, 38, 22, 4);
  // legs
  g.fillStyle(0xd8dceb, 1);
  g.fillRoundedRect(-10, 40, 6, 12, 2);
  g.fillRoundedRect(4, 40, 6, 12, 2);
  // arms
  g.fillRoundedRect(-27, -20, 6, 32, 3);
  g.fillRoundedRect(21, -20, 6, 32, 3);
  c.add(g);
  return c;
}

export function drawOwl(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setScale(scale);
  const body = scene.add.graphics();
  body.fillStyle(0x5a4a32, 1);
  body.fillEllipse(0, 8, 100, 120);
  body.fillStyle(0x6f5b3d, 1);
  body.fillEllipse(0, 0, 84, 90);
  body.fillStyle(0x3a2c1c, 1);
  body.fillTriangle(-38, -50, -16, -24, -24, -18);
  body.fillTriangle(38, -50, 16, -24, 24, -18);
  body.fillStyle(Palette.bone, 1);
  body.fillCircle(-20, -14, 16);
  body.fillCircle(20, -14, 16);
  body.fillStyle(Palette.ink, 1);
  body.fillCircle(-20, -14, 8);
  body.fillCircle(20, -14, 8);
  body.fillStyle(Palette.glow, 1);
  body.fillCircle(-17, -17, 3);
  body.fillCircle(23, -17, 3);
  body.fillStyle(Palette.gold, 1);
  body.fillTriangle(-6, 2, 6, 2, 0, 14);
  c.add(body);
  return c;
}
