import Phaser from 'phaser';
import { Palette } from '../game/palette';
import { Bram } from '../game/Bram';
import { GridPuzzleEngine } from '../game/grid/GridPuzzleEngine';
import { CellType, Direction } from '../game/grid/GridTypes';
import { addPanel, addSmallText, addTitle } from '../game/ui';

const TILE = 48;

const BROKEN_BRIDGE_MAP = `
##############
#B...........#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o....#
#............#
#.s.....o...E#
##############
`;

interface ButtonHandle {
  destroy(): void;
}

export class GridPuzzleLabScene extends Phaser.Scene {
  private engine!: GridPuzzleEngine;
  private gridOriginX = 0;
  private gridOriginY = 0;
  private tileGraphics!: Phaser.GameObjects.Graphics;
  private bram!: Bram;
  private hudInventory!: Phaser.GameObjects.Text;
  private hudProgress!: Phaser.GameObjects.Text;
  private busy = false;
  private successOpen = false;

  constructor() { super('GridPuzzleLabScene'); }

  create() {
    this.cameras.main.setBackgroundColor(0x121814);
    this.drawBackdrop();

    this.engine = new GridPuzzleEngine({ ascii: BROKEN_BRIDGE_MAP });
    const w = this.engine.width * TILE;
    const h = this.engine.height * TILE;
    this.gridOriginX = Math.floor((1280 - w) / 2);
    this.gridOriginY = 132;

    addTitle(this, 'Puzzle Lab: Broken Bridge', 40, 24, 28);
    addSmallText(
      this,
      'Carry repair stones onto empty sockets. Reach the gate when all four sockets are repaired.',
      40, 62, 16
    );

    addPanel(this, 28, 626, 1224, 70, 0.86);
    this.hudInventory = this.add.text(60, 638, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffe9ad'
    });
    this.hudProgress = this.add.text(60, 666, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#f0dcae'
    });
    this.add.text(1240, 642, 'Arrows / WASD  ·  U undo  ·  R reset  ·  M menu', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#a08866'
    }).setOrigin(1, 0);

    this.tileGraphics = this.add.graphics();
    this.renderGrid();

    const bramWorld = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram = new Bram(this, bramWorld.x, bramWorld.y, { scale: 0.45 });
    this.bram.setFacing(this.engine.bramFacing);

    this.bindKeys();
    this.refreshHUD();
  }

  // ---------- input ----------

  private bindKeys() {
    const kb = this.input.keyboard;
    if (!kb) return;
    kb.on('keydown-LEFT',  () => this.attemptMove('left'));
    kb.on('keydown-RIGHT', () => this.attemptMove('right'));
    kb.on('keydown-UP',    () => this.attemptMove('up'));
    kb.on('keydown-DOWN',  () => this.attemptMove('down'));
    kb.on('keydown-A',     () => this.attemptMove('left'));
    kb.on('keydown-D',     () => this.attemptMove('right'));
    kb.on('keydown-W',     () => this.attemptMove('up'));
    kb.on('keydown-S',     () => this.attemptMove('down'));
    kb.on('keydown-U',     () => this.attemptUndo());
    kb.on('keydown-R',     () => this.attemptReset());
    kb.on('keydown-M',     () => this.scene.start('MenuScene'));
  }

  private attemptMove(dir: Direction) {
    if (this.busy || this.successOpen) return;
    const result = this.engine.tryMove(dir);
    this.bram.setFacing(this.engine.bramFacing);

    if (!result.moved) {
      if (result.bumped) this.playBump(dir);
      return;
    }

    this.busy = true;
    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.renderGrid();
    this.refreshHUD();
    this.tweens.add({
      targets: this.bram,
      x: target.x,
      y: target.y,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.busy = false;
        if (result.collectedStone) this.spawnPickupSparkle(target.x, target.y);
        if (result.filledSocket)   this.spawnRepairBurst(target.x, target.y);
        if (result.solved)         this.showSuccess();
      }
    });
  }

  private attemptUndo() {
    if (this.busy || this.successOpen) return;
    if (!this.engine.canUndo) return;
    this.engine.undo();
    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram.setPosition(target.x, target.y);
    this.bram.setFacing(this.engine.bramFacing);
    this.renderGrid();
    this.refreshHUD();
  }

  private attemptReset() {
    if (this.successOpen) return;
    this.engine.reset();
    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram.setPosition(target.x, target.y);
    this.bram.setFacing(this.engine.bramFacing);
    this.renderGrid();
    this.refreshHUD();
  }

  // ---------- rendering ----------

  private drawBackdrop() {
    const g = this.add.graphics();
    g.fillStyle(0x121814, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 70; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.04, 0.16));
      g.fillCircle(
        Phaser.Math.Between(0, 1280),
        Phaser.Math.Between(0, 720),
        Phaser.Math.FloatBetween(1, 2.5)
      );
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x1a2218, 0.7 - i * 0.1);
      g.fillCircle(180 + i * 260, 540 - i * 30, 260 - i * 18);
    }
  }

  private renderGrid() {
    const g = this.tileGraphics;
    g.clear();

    const w = this.engine.width * TILE;
    const h = this.engine.height * TILE;
    g.fillStyle(Palette.ink, 0.55);
    g.fillRoundedRect(this.gridOriginX - 8, this.gridOriginY - 8, w + 16, h + 16, 12);
    g.lineStyle(2, Palette.parchmentDark, 0.7);
    g.strokeRoundedRect(this.gridOriginX - 8, this.gridOriginY - 8, w + 16, h + 16, 12);

    for (let y = 0; y < this.engine.height; y++) {
      for (let x = 0; x < this.engine.width; x++) {
        this.drawCell(x, y, this.engine.getCell(x, y));
      }
    }
  }

  private drawCell(gx: number, gy: number, cell: CellType) {
    const px = this.gridOriginX + gx * TILE;
    const py = this.gridOriginY + gy * TILE;
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    const g = this.tileGraphics;

    if (cell === 'wall') {
      g.fillStyle(Palette.bark, 1);
      g.fillRect(px, py, TILE, TILE);
      g.lineStyle(1, 0x2a1808, 1);
      g.strokeRect(px, py, TILE, TILE);
      g.lineStyle(2, Palette.parchmentDark, 0.45);
      g.lineBetween(px + 4, py + 4, px + TILE - 4, py + 4);
      g.lineBetween(px + 4, py + TILE - 4, px + TILE - 4, py + TILE - 4);
      return;
    }

    // walkable floor base
    g.fillStyle(0x2a2218, 0.95);
    g.fillRect(px, py, TILE, TILE);
    g.lineStyle(1, 0x3a2e1f, 0.45);
    g.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);

    if (cell === 'stone') {
      g.fillStyle(Palette.gold, 1);
      g.fillCircle(cx, cy, 11);
      g.lineStyle(2, Palette.parchmentDark, 1);
      g.strokeCircle(cx, cy, 11);
      g.fillStyle(0xfff5d8, 0.7);
      g.fillCircle(cx - 3, cy - 3, 3);
    } else if (cell === 'socket_empty') {
      g.fillStyle(0x14110d, 0.95);
      g.fillCircle(cx, cy, 14);
      g.lineStyle(2, Palette.parchmentDark, 0.7);
      g.strokeCircle(cx, cy, 14);
      g.lineStyle(2, 0x6a4030, 0.6);
      g.lineBetween(cx - 7, cy - 7, cx + 7, cy + 7);
      g.lineBetween(cx - 7, cy + 7, cx + 7, cy - 7);
    } else if (cell === 'socket_filled') {
      g.fillStyle(Palette.glow, 0.85);
      g.fillCircle(cx, cy, 14);
      g.lineStyle(2, Palette.gold, 1);
      g.strokeCircle(cx, cy, 14);
      g.fillStyle(0xfff5d8, 0.9);
      g.fillCircle(cx - 3, cy - 3, 3);
    } else if (cell === 'push_block') {
      g.fillStyle(Palette.bark, 1);
      g.fillRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 4);
      g.lineStyle(2, Palette.parchmentDark, 1);
      g.strokeRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 4);
      g.lineStyle(2, 0x8a6a3a, 1);
      g.lineBetween(px + 6, cy, px + TILE - 6, cy);
    } else if (cell === 'exit') {
      const open = this.engine.allSocketsRepaired();
      if (open) {
        g.fillStyle(Palette.glow, 0.35);
        g.fillRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 8);
        g.lineStyle(3, Palette.gold, 1);
        g.strokeRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 8);
        g.lineStyle(2, Palette.gold, 0.85);
        g.beginPath();
        g.arc(cx, cy + 6, 13, Math.PI, 0, false);
        g.strokePath();
      } else {
        g.fillStyle(Palette.ink, 0.85);
        g.fillRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 8);
        g.lineStyle(2, Palette.parchmentDark, 0.85);
        g.strokeRoundedRect(px + 4, py + 4, TILE - 8, TILE - 8, 8);
        g.lineStyle(2, Palette.boneShadow, 0.9);
        g.lineBetween(px + 8, cy, px + TILE - 8, cy);
        g.lineBetween(cx, py + 8, cx, py + TILE - 8);
      }
    }
  }

  private refreshHUD() {
    const carrying = this.engine.stonesCarried;
    const total = this.engine.countSocketsTotal();
    const done = this.engine.countSocketsRepaired();
    const gateNote = this.engine.allSocketsRepaired() ? '    (gate open — step on E)' : '';
    this.hudInventory.setText(`Stones carried: ${carrying}`);
    this.hudProgress.setText(`Sockets repaired: ${done} / ${total}${gateNote}`);
  }

  // ---------- effects ----------

  private playBump(dir: Direction) {
    const dx = dir === 'left' ? -6 : dir === 'right' ? 6 : 0;
    const dy = dir === 'up' ? -6 : dir === 'down' ? 6 : 0;
    const startX = this.bram.x;
    const startY = this.bram.y;
    this.busy = true;
    this.tweens.add({
      targets: this.bram,
      x: startX + dx,
      y: startY + dy,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.busy = false;
        this.bram.setPosition(startX, startY);
      }
    });
  }

  private spawnPickupSparkle(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const s = this.add.text(x, y, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#ffdf7a'
      }).setOrigin(0.5).setDepth(50);
      const a = (i / 6) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.25, 0.25);
      this.tweens.add({
        targets: s,
        x: x + Math.cos(a) * 26,
        y: y + Math.sin(a) * 26 - 8,
        alpha: 0,
        duration: 520,
        onComplete: () => s.destroy()
      });
    }
  }

  private spawnRepairBurst(x: number, y: number) {
    const halo = this.add.graphics().setDepth(40);
    halo.fillStyle(Palette.glow, 0.45).fillCircle(x, y, 24);
    halo.fillStyle(Palette.glow, 0.22).fillCircle(x, y, 40);
    this.tweens.add({
      targets: halo,
      alpha: 0,
      duration: 650,
      onComplete: () => halo.destroy()
    });
    const tick = this.add.text(x + 16, y - 22, 'It stays.', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '14px',
      color: '#ffdf7a'
    }).setDepth(50);
    this.tweens.add({
      targets: tick,
      y: tick.y - 18,
      alpha: 0,
      duration: 750,
      onComplete: () => tick.destroy()
    });
  }

  // ---------- success state ----------

  private showSuccess() {
    this.successOpen = true;
    this.bram.celebrate();

    const depth = 1000;
    const dim = this.add.graphics().setDepth(depth);
    dim.fillStyle(0x000000, 0.55).fillRect(0, 0, 1280, 720);

    const panel = this.add.graphics().setDepth(depth);
    panel.fillStyle(Palette.parchment, 0.97);
    panel.lineStyle(4, Palette.parchmentDark, 1);
    panel.fillRoundedRect(360, 220, 560, 260, 20);
    panel.strokeRoundedRect(360, 220, 560, 260, 20);
    panel.lineStyle(2, Palette.gold, 0.55);
    panel.strokeRoundedRect(372, 232, 536, 236, 16);

    const title = this.add.text(640, 260, 'The bridge holds.', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#7a4a18',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(depth);

    const niloLine = this.add.text(640, 312, '“It stayed.”   — Nilo', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '22px',
      color: '#2a1f12'
    }).setOrigin(0.5).setDepth(depth);

    const bramLine = this.add.text(640, 350, '“Just enough.”   — Bram', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '22px',
      color: '#2a1f12'
    }).setOrigin(0.5).setDepth(depth);

    this.makeButton(480, 408, 320, 50, 'Return to menu', depth, () => this.scene.start('MenuScene'));

    // tiny ambient sparkles around the panel
    for (let i = 0; i < 10; i++) {
      const sx = Phaser.Math.Between(360, 920);
      const sy = Phaser.Math.Between(220, 480);
      const s = this.add.text(sx, sy, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: `${Phaser.Math.Between(14, 22)}px`,
        color: '#ffdf7a'
      }).setOrigin(0.5).setDepth(depth + 1).setAlpha(0);
      this.tweens.add({
        targets: s,
        alpha: 0.9,
        y: sy - 30,
        duration: 900,
        delay: i * 70,
        ease: 'Quad.easeOut'
      });
      this.tweens.add({
        targets: s,
        alpha: 0,
        delay: 900 + i * 70,
        duration: 600,
        onComplete: () => s.destroy()
      });
    }

    // refs not strictly required, but listed to satisfy noUnusedLocals if enabled later
    void [dim, panel, title, niloLine, bramLine];
  }

  private makeButton(x: number, y: number, w: number, h: number, label: string, depth: number, onClick: () => void): ButtonHandle {
    const bg = this.add.graphics().setDepth(depth);
    bg.fillStyle(Palette.bark, 0.95);
    bg.lineStyle(3, Palette.gold, 0.9);
    bg.fillRoundedRect(x, y, w, h, 14);
    bg.strokeRoundedRect(x, y, w, h, 14);
    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#ffe9ad'
    }).setOrigin(0.5).setDepth(depth);
    const hit = this.add.zone(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);
    hit.on('pointerover', () => text.setScale(1.04));
    hit.on('pointerout', () => text.setScale(1));
    hit.on('pointerdown', onClick);
    return {
      destroy() { bg.destroy(); text.destroy(); hit.destroy(); }
    };
  }

  // ---------- coordinates ----------

  private tileToWorld(gx: number, gy: number): { x: number; y: number } {
    return {
      x: this.gridOriginX + gx * TILE + TILE / 2,
      y: this.gridOriginY + gy * TILE + TILE / 2
    };
  }
}
