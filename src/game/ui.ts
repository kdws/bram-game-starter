import Phaser from 'phaser';
import { Palette } from './palette';

export function addPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, alpha = 0.92) {
  const g = scene.add.graphics();
  g.fillStyle(Palette.ink, alpha);
  g.lineStyle(3, Palette.parchmentDark, 0.9);
  g.fillRoundedRect(x, y, w, h, 18);
  g.strokeRoundedRect(x, y, w, h, 18);
  return g;
}

export function addTitle(scene: Phaser.Scene, text: string, x: number, y: number, size = 44) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Georgia, serif',
    fontSize: `${size}px`,
    color: '#f0dcae',
    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
  });
}

export function addSmallText(scene: Phaser.Scene, text: string, x: number, y: number, size = 24) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Georgia, serif',
    fontSize: `${size}px`,
    color: '#f0dcae',
    wordWrap: { width: 920 },
    shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
  });
}

export function addButton(scene: Phaser.Scene, label: string, x: number, y: number, w: number, h: number, onClick: () => void) {
  const group = scene.add.group();
  const bg = scene.add.graphics();
  bg.fillStyle(Palette.bark, 0.95);
  bg.lineStyle(3, Palette.gold, 0.9);
  bg.fillRoundedRect(x, y, w, h, 16);
  bg.strokeRoundedRect(x, y, w, h, 16);
  const text = scene.add.text(x + w / 2, y + h / 2, label, {
    fontFamily: 'Georgia, serif',
    fontSize: '26px',
    color: '#ffe9ad'
  }).setOrigin(0.5);
  const hit = scene.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true });
  hit.on('pointerover', () => text.setScale(1.04));
  hit.on('pointerout', () => text.setScale(1));
  hit.on('pointerdown', onClick);
  group.addMultiple([bg, text, hit]);
  return group;
}
