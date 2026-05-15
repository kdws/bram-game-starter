import Phaser from 'phaser';
import { Palette } from './palette';
import { AudioManager } from './audio/AudioManager';
import { AudioKeys } from './audio/AudioKeys';
import { GridAssets } from './assets/GridAssetKeys';

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
  hit.on('pointerover', () => { text.setScale(1.04); AudioManager.play(AudioKeys.UI_HOVER); });
  hit.on('pointerout',  () => text.setScale(1));
  hit.on('pointerdown', () => { AudioManager.play(AudioKeys.UI_CLICK); onClick(); });
  group.addMultiple([bg, text, hit]);
  return group;
}

/**
 * Storybook stone-frame button, used for primary CTAs in the menu.
 * Coordinates are CENTER-based (unlike addButton). Uses the blank
 * stone PNGs from Asset Pack 2 — falls back to addButton at the
 * equivalent rect when sprites aren't loaded.
 */
export type StoneAccent = 'blue' | 'green' | 'gold';

export function addStoneButton(
  scene: Phaser.Scene,
  label: string,
  cx: number,
  cy: number,
  w: number,
  h: number,
  accent: StoneAccent,
  onClick: () => void,
  options: { fontSize?: number; subtitle?: string } = {}
) {
  const baseKey  = accent === 'blue'  ? GridAssets.BTN_STONE_BLUE_BLANK
                 : accent === 'green' ? GridAssets.BTN_STONE_GREEN_BLANK
                 :                       GridAssets.BTN_STONE_GOLD_BLANK;
  // Only the blue button shipped with a hover variant; others reuse base.
  const hoverKey = accent === 'blue' ? GridAssets.BTN_STONE_BLUE_BLANK_HOVER : baseKey;

  if (!scene.textures.exists(baseKey)) {
    // Sprite isn't loaded yet — fall back to procedural button at top-left rect.
    return addButton(scene, label, cx - w / 2, cy - h / 2, w, h, onClick);
  }

  const group = scene.add.group();
  const img = scene.add.image(cx, cy, baseKey).setDisplaySize(w, h);
  const fontSize = options.fontSize ?? Math.min(28, Math.floor(h * 0.34));
  const text = scene.add.text(cx, cy + (options.subtitle ? -6 : 0), label, {
    fontFamily: 'Georgia, serif',
    fontSize: `${fontSize}px`,
    color: '#fff2d4',
    fontStyle: 'bold',
    shadow: { offsetX: 1, offsetY: 2, color: '#000', blur: 3, fill: true }
  }).setOrigin(0.5);

  let subtitle: Phaser.GameObjects.Text | null = null;
  if (options.subtitle) {
    subtitle = scene.add.text(cx, cy + 14, options.subtitle, {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#e8d2a4'
    }).setOrigin(0.5);
  }

  const hit = scene.add.zone(cx, cy, w, h).setInteractive({ useHandCursor: true });
  hit.on('pointerover', () => {
    img.setTexture(hoverKey).setDisplaySize(w * 1.04, h * 1.04);
    text.setScale(1.04);
    if (subtitle) subtitle.setScale(1.04);
    AudioManager.play(AudioKeys.UI_HOVER);
  });
  hit.on('pointerout',  () => {
    img.setTexture(baseKey).setDisplaySize(w, h);
    text.setScale(1);
    if (subtitle) subtitle.setScale(1);
  });
  hit.on('pointerdown', () => { AudioManager.play(AudioKeys.UI_CLICK); onClick(); });

  group.add(img); group.add(text); if (subtitle) group.add(subtitle); group.add(hit);
  return group;
}
