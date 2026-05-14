import Phaser from 'phaser';
import { addButton, addPanel, addSmallText, addTitle } from '../game/ui';
import { Palette } from '../game/palette';
import { chapters } from '../data/progression';
import { RestorationProgressStrip } from '../game/ui/RestorationProgressStrip';
import { GameProgress } from '../game/progress/GameProgress';
import { GridAssets } from '../game/assets/GridAssetKeys';
import { AudioManager } from '../game/audio/AudioManager';
import { AudioKeys } from '../game/audio/AudioKeys';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  private hasUiSprites(): boolean {
    return this.textures.exists(GridAssets.CORNER_LEFT);
  }

  create() {
    this.cameras.main.setBackgroundColor(Palette.night);
    this.drawCozyBackground();

    addTitle(this, 'BRAM', 72, 40, 76);
    addTitle(this, 'The Almost Boy', 78, 116, 34);
    addSmallText(this, 'A cozy math adventure about landing tricks, solving puzzles, and piecing yourself back together.', 82, 174, 24);

    // Storybook ornamentation: page corners + dividers
    this.addPageOrnaments();
    this.addTitleDivider();

    // --- Restoration strip ---
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

    // --- Play panel ---
    addPanel(this, 72, 360, 480, 320, 0.84);
    addSmallText(this, 'Play', 104, 372, 22);
    this.addPanelHostPortrait(72 + 480 - 28, 360 + 28, GridAssets.PORTRAIT_BRAM);
    this.addSectionDivider(280, 408, 380);

    addButton(this, '▶ Begin Story', 104, 420, 416, 58, () => this.startStory());
    addButton(this, 'Replay Vertical Slice', 104, 486, 416, 34, () => this.startSlice());

    addSmallText(this, 'Standalone demos', 104, 528, 17);
    this.addSectionDivider(280, 552, 380, 0.6);

    addButton(this, 'Rattle Run', 104, 562, 130, 34, () => this.scene.start('RattleRunScene'));
    addButton(this, 'Platform', 244, 562, 130, 34, () => this.scene.start('PlatformScene'));
    addButton(this, 'Top-Down', 384, 562, 136, 34, () => this.scene.start('TopDownScene'));
    addButton(this, '◴ Clocktower Marsh: Tell Time', 104, 602, 416, 34, () => this.scene.start('ClockTowerScene'));
    addButton(this, '▦ Puzzle Lab: Broken Bridge', 104, 640, 200, 34, () => this.scene.start('GridPuzzleLabScene', { roomId: 'broken_bridge' }));
    addButton(this, '▦ Stone Garden', 314, 640, 206, 34, () => this.scene.start('GridPuzzleLabScene', { roomId: 'stone_garden' }));

    // Reset progress: sprite back-icon + label if loaded, fallback otherwise
    if (this.hasUiSprites()) {
      this.addSpriteResetButton(104, 690);
    } else {
      addButton(this, 'Reset progress', 104, 690, 200, 22, () => {
        GameProgress.reset();
        this.scene.restart();
      });
    }

    // --- Chapter spine ---
    addPanel(this, 620, 360, 596, 320, 0.78);
    addSmallText(this, 'Chapter spine', 652, 372, 26);
    this.addPanelHostPortrait(620 + 596 - 28, 360 + 28, GridAssets.PORTRAIT_NILO);
    this.addSectionDivider(810, 410, 380);

    chapters.forEach((chapter, index) => {
      const y = 422 + index * 76;
      this.add.text(652, y, `${index + 1}. ${chapter.name}`, {
        fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffdf7a'
      });
      this.add.text(674, y + 28, `${chapter.world} → Restore ${chapter.restoredPart}`, {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f0dcae', wordWrap: { width: 520 }
      });
    });

    addSmallText(this, 'Keyboard: arrows/WASD to move, space to jump/select. Touch/mouse buttons work in menus.', 78, 706, 14);

    this.addMuteToggle();
  }

  /**
   * Small speaker icon in the top-right that toggles AudioManager mute.
   * State persists via localStorage.
   */
  private addMuteToggle() {
    const cx = 1208;
    const cy = 72;
    const r  = 22;

    const g = this.add.graphics().setDepth(20);
    const label = this.add.text(cx + r + 10, cy, '', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#f0dcae'
    }).setOrigin(0, 0.5).setDepth(20);

    const redraw = () => {
      g.clear();
      g.fillStyle(Palette.bark, 0.85);
      g.lineStyle(2, Palette.gold, 0.9);
      g.fillCircle(cx, cy, r);
      g.strokeCircle(cx, cy, r);
      // Speaker triangle/body
      g.fillStyle(0xffe9ad, 1);
      g.fillRect(cx - 10, cy - 4, 5, 8);
      g.fillTriangle(cx - 5, cy - 8, cx - 5, cy + 8, cx + 4, cy);
      if (AudioManager.isMuted()) {
        // red "muted" slash
        g.lineStyle(3, 0xff6a5a, 1);
        g.lineBetween(cx - 12, cy - 12, cx + 12, cy + 12);
        label.setText('muted');
      } else {
        // two small arcs to show sound waves
        g.lineStyle(2, 0xffe9ad, 1);
        g.beginPath(); g.arc(cx + 4, cy, 8, -Math.PI / 3, Math.PI / 3); g.strokePath();
        g.beginPath(); g.arc(cx + 4, cy, 12, -Math.PI / 4, Math.PI / 4); g.strokePath();
        label.setText('');
      }
    };
    redraw();

    const hit = this.add.zone(cx, cy, r * 2 + 4, r * 2 + 4)
      .setInteractive({ useHandCursor: true }).setDepth(21);
    hit.on('pointerover', () => g.setAlpha(0.85));
    hit.on('pointerout',  () => g.setAlpha(1));
    hit.on('pointerdown', () => {
      AudioManager.toggleMute();
      redraw();
      // Click sound only fires if NOT muted (manager guards it)
      AudioManager.play(AudioKeys.UI_CLICK);
    });
  }

  // ─── ornament helpers ────────────────────────────────────────────────────

  /** Four storybook corner filigrees framing the whole page. */
  private addPageOrnaments() {
    if (!this.hasUiSprites()) return;
    const k = GridAssets.CORNER_LEFT;
    const r = GridAssets.CORNER_RIGHT;
    const scale = 0.62;
    // top-left
    this.add.image(28, 28, k).setOrigin(0, 0).setScale(scale).setAlpha(0.85);
    // top-right
    this.add.image(1252, 28, r).setOrigin(1, 0).setScale(scale).setAlpha(0.85);
    // bottom-left (flipped vertically)
    this.add.image(28, 692, k).setOrigin(0, 1).setScale(scale).setAlpha(0.85).setFlipY(true);
    // bottom-right
    this.add.image(1252, 692, r).setOrigin(1, 1).setScale(scale).setAlpha(0.85).setFlipY(true);
  }

  /** Long ornate divider beneath the subtitle/intro line. */
  private addTitleDivider() {
    if (!this.hasUiSprites()) return;
    const div = this.add.image(640, 215, GridAssets.DIVIDER_LONG)
      .setOrigin(0.5).setAlpha(0.85);
    const sc = 740 / div.width;
    div.setScale(sc, sc);
  }

  private addSectionDivider(cx: number, cy: number, targetW: number, alpha = 0.9) {
    if (!this.hasUiSprites()) return;
    const div = this.add.image(cx, cy, GridAssets.ORNAMENT_CENTER)
      .setOrigin(0.5).setAlpha(alpha);
    const sc = targetW / div.width;
    div.setScale(sc, sc);
  }

  /** A character portrait pinned to the top-right of a panel as section host. */
  private addPanelHostPortrait(x: number, y: number, key: string) {
    if (!this.hasUiSprites()) return;
    this.add.image(x, y, key)
      .setOrigin(1, 0)
      .setScale(0.42)
      .setAlpha(0.95)
      .setDepth(5);
  }

  private addSpriteResetButton(x: number, y: number) {
    const btn = this.add.image(x, y, GridAssets.BTN_RESET)
      .setOrigin(0, 0.5).setScale(0.34).setAlpha(0.9);
    const label = this.add.text(x + 50, y, 'Reset progress', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f0dcae'
    }).setOrigin(0, 0.5);
    const hit = this.add.zone(x, y, 210, 36)
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => { btn.setScale(0.38); label.setScale(1.04); });
    hit.on('pointerout',  () => { btn.setScale(0.34); label.setScale(1);    });
    hit.on('pointerdown', () => {
      GameProgress.reset();
      this.scene.restart();
    });
  }

  // ─── flow ────────────────────────────────────────────────────────────────

  private startStory() {
    GameProgress.reset();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PrologueScene');
    });
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
