import Phaser from 'phaser';
import { Palette } from '../game/palette';
import { Bram } from '../game/Bram';
import { GridPuzzleEngine } from '../game/grid/GridPuzzleEngine';
import { CellType, Direction } from '../game/grid/GridTypes';
import { addPanel } from '../game/ui';
import { GridAssets } from '../game/assets/GridAssetKeys';
import { PUZZLE_ROOMS, DEFAULT_ROOM_ID, PuzzleRoom } from '../data/puzzleRooms';
import { AudioManager } from '../game/audio/AudioManager';
import { AudioKeys } from '../game/audio/AudioKeys';

const TILE = 48;

// Scale factors derived from asset dimensions so each sprite fills one TILE.
// Wall tile_01: 162×159  → 48/162 ≈ 0.296
// Floor tile_07/08: 153px → 48/153 ≈ 0.314
// Socket tiles: ~150px → 48/150 = 0.32
// Repair stone: 212px tall → 44/212 ≈ 0.208
// Push block: 226px tall → 46/226 ≈ 0.204
// Exits: 188px tall → 75/188 ≈ 0.399  (1.5× tile for arch presence)
const SC_WALL    = 48 / 162;
const SC_FLOOR   = 48 / 153;
const SC_SOCKET  = 48 / 150;
const SC_STONE   = 44 / 212;
const SC_BLOCK   = 46 / 226;
const SC_EXIT    = 75 / 188;

// Touch input thresholds (CSS pixels)
const TAP_MAX_DRAG    = 14; // ≤ this counts as a tap
const SWIPE_THRESHOLD = 30; // ≥ this commits a swipe move

// Map / hint / success copy now lives in `src/data/puzzleRooms.ts`.
// The scene receives `roomId` via init data and looks up the config.

export class GridPuzzleLabScene extends Phaser.Scene {
  private engine!: GridPuzzleEngine;
  private gridOriginX = 0;
  private gridOriginY = 0;

  // Graphics used only for the grid border and procedural fallback.
  private tileGraphics!: Phaser.GameObjects.Graphics;

  // Sprite layers
  private staticTileImages: Phaser.GameObjects.Image[] = [];
  // Dynamic cells may include Text badges (fallback for stones/sockets
  // with values that lack dedicated art), so the widest type is GameObject.
  private dynamicCellImages: Phaser.GameObjects.GameObject[] = [];

  private bram!: Bram;
  private hudInventory!: Phaser.GameObjects.Text;
  private hudProgress!: Phaser.GameObjects.Text;
  private tipText!: Phaser.GameObjects.Text;
  private tipBannerImg: Phaser.GameObjects.Image | null = null;
  private busy = false;
  private successOpen = false;
  private hasShownInvalidPushHint = false;
  private hasShownUndoHint = false;
  private hasShownMismatchHint = false;
  private hasShownPartialHint = false;
  private moveCount = 0;
  private pointerStart: { x: number; y: number } | null = null;
  private room: PuzzleRoom = PUZZLE_ROOMS[DEFAULT_ROOM_ID];
  private tutorialObjects: Phaser.GameObjects.GameObject[] = [];
  private niloSpirit?: Phaser.GameObjects.Sprite;

  constructor() { super('GridPuzzleLabScene'); }

  init(data: { roomId?: string }) {
    const id = data?.roomId ?? DEFAULT_ROOM_ID;
    this.room = PUZZLE_ROOMS[id] ?? PUZZLE_ROOMS[DEFAULT_ROOM_ID];
    // Reset per-scene state so re-entering doesn't carry hint-fired flags
    this.hasShownInvalidPushHint = false;
    this.hasShownUndoHint = false;
    this.hasShownMismatchHint = false;
    this.hasShownPartialHint = false;
    this.moveCount = 0;
    this.pointerStart = null;
    this.busy = false;
    this.successOpen = false;
    this.staticTileImages = [];
    this.dynamicCellImages = [];
    this.tipBannerImg = null;
    this.tutorialObjects = [];
    this.niloSpirit = undefined;
  }

  // ─── lifecycle ───────────────────────────────────────────────────────────

  create() {
    this.cameras.main.setBackgroundColor(0x121814);
    this.drawBackdrop();

    this.engine = new GridPuzzleEngine({
      ascii: this.room.map,
      numbered: this.room.numbered,
    });
    const w = this.engine.width * TILE;
    this.gridOriginX = Math.floor((1280 - w) / 2);
    this.gridOriginY = 132;

    this.buildTitleBar();
    this.buildHUD();

    // Grid border (Graphics layer, depth 0 implicitly)
    this.tileGraphics = this.add.graphics();
    this.drawGridBorder();

    // Static floor/wall sprite layer — built once, never changes
    if (this.spritesReady()) {
      this.buildStaticSpriteLayer();
      this.buildSceneryLayer();
    }

    // Register sprite-sheet animations before any animated helpers are created.
    this.registerVfxAnimations();

    // Initial dynamic cells (stones, sockets, push block, exit)
    this.renderDynamicCells();

    // Bram on top of everything in the grid
    const bramWorld = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram = new Bram(this, bramWorld.x, bramWorld.y, { scale: 0.45 });
    this.bram.setDepth(10);
    this.bram.setFacing(this.engine.bramFacing);
    this.createNiloSpirit(bramWorld.x, bramWorld.y);

    this.bindKeys();
    this.bindPointerInput();
    this.buildTouchControls();
    this.refreshHUD();

    this.maybeShowGestureTutorial();

    // Start cozy ambient pad for puzzle play. Already-running loops are
    // a no-op inside AudioManager.
    AudioManager.loop(AudioKeys.AMBIENT_RATTLEWOOD);
    this.events.once('shutdown', () => AudioManager.stop(AudioKeys.AMBIENT_RATTLEWOOD));
  }

  // ─── animation setup ─────────────────────────────────────────────────────

  private registerVfxAnimations() {
    const defs: Array<{ key: string; prefix: string; count: number; frameRate: number }> = [
      { key: GridAssets.VFX_BLUE_PICKUP_ANIM,  prefix: 'blue_pickup_sparkles_anim_',  count: 6, frameRate: 14 },
      { key: GridAssets.VFX_BLUE_BURST_ANIM,   prefix: 'blue_repair_burst_anim_',     count: 6, frameRate: 14 },
      { key: GridAssets.VFX_GOLD_VICTORY_ANIM, prefix: 'gold_victory_sparkles_anim_', count: 6, frameRate: 12 },
      { key: GridAssets.HINT_SWIPE_RIGHT,       prefix: 'hint_swipe_right_',           count: 6, frameRate: 8  },
      { key: GridAssets.HINT_TAP,               prefix: 'hint_tap_',                   count: 6, frameRate: 10 },
      { key: GridAssets.NILO_SPIRIT_IDLE,       prefix: 'nilo_spirit_idle_',            count: 3, frameRate: 6  },
    ];
    for (const { key, prefix, count, frameRate } of defs) {
      if (!this.textures.exists(key) || this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNames(key, {
          prefix, start: 1, end: count, zeroPad: 4, suffix: '.png'
        }),
        frameRate,
        repeat: key === GridAssets.NILO_SPIRIT_IDLE ? -1 : 0
      });
    }
  }

  /**
   * First-time gesture tutorial: shows a looping swipe-right finger and a
   * tap-with-ripple over the d-pad area, with a small "Swipe or tap" label.
   * Persists dismissal in localStorage so it only shows once across sessions.
   * Auto-dismisses when the player makes their first successful move.
   */
  private maybeShowGestureTutorial() {
    if (!this.spritesReady()) return;
    if (!this.textures.exists(GridAssets.HINT_SWIPE_RIGHT)) return;

    const LS_KEY = 'bram.tutorial.gestures.shown';
    try {
      if (localStorage.getItem(LS_KEY) === 'true') return;
    } catch { /* storage unavailable — show anyway */ }

    // Position over the d-pad zone (1090, 380) — that's where touch users
    // are already looking and where the finger gestures make sense.
    const cx = 1090;
    const cy = 480;

    const swipe = this.add.sprite(cx - 36, cy, GridAssets.HINT_SWIPE_RIGHT)
      .setScale(0.85).setDepth(60).setAlpha(0);
    swipe.play({ key: GridAssets.HINT_SWIPE_RIGHT, repeat: -1 });

    const tap = this.add.sprite(cx + 36, cy, GridAssets.HINT_TAP)
      .setScale(0.85).setDepth(60).setAlpha(0);
    tap.play({ key: GridAssets.HINT_TAP, repeat: -1 });

    const label = this.add.text(cx, cy + 64, 'Swipe or tap to move', {
      fontFamily: 'Georgia, serif', fontSize: '14px',
      color: '#ffe9ad', fontStyle: 'italic',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5).setDepth(60).setAlpha(0);

    this.tutorialObjects = [swipe, tap, label];

    // Fade in, then gently pulse the label so it stays alive but unobtrusive.
    this.tweens.add({
      targets: this.tutorialObjects,
      alpha: 0.92, duration: 360, ease: 'Quad.easeOut', delay: 600
    });
    this.tweens.add({
      targets: label, alpha: 0.65, duration: 1400,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 1200
    });

    try { localStorage.setItem(LS_KEY, 'true'); } catch { /* ignore */ }
  }

  private dismissGestureTutorial() {
    if (this.tutorialObjects.length === 0) return;
    const objs = this.tutorialObjects;
    this.tutorialObjects = [];
    this.tweens.killTweensOf(objs);
    this.tweens.add({
      targets: objs, alpha: 0, duration: 240, ease: 'Quad.easeIn',
      onComplete: () => { for (const o of objs) o.destroy(); }
    });
  }


  private createNiloSpirit(bramX: number, bramY: number) {
    if (!this.textures.exists(GridAssets.NILO_SPIRIT_IDLE)) return;
    this.niloSpirit = this.add.sprite(bramX + 40, bramY - 26, GridAssets.NILO_SPIRIT_IDLE)
      .setScale(0.42)
      .setAlpha(0.82)
      .setDepth(9);
    if (this.anims.exists(GridAssets.NILO_SPIRIT_IDLE)) {
      this.niloSpirit.play(GridAssets.NILO_SPIRIT_IDLE);
    }
    this.tweens.add({
      targets: this.niloSpirit,
      y: this.niloSpirit.y - 5,
      alpha: 0.96,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private moveNiloNear(x: number, y: number) {
    if (!this.niloSpirit) return;
    this.tweens.add({
      targets: this.niloSpirit,
      x: x + 40,
      y: y - 26,
      duration: 260,
      ease: 'Sine.easeOut'
    });
  }

  private pulseNilo() {
    if (!this.niloSpirit) return;
    this.tweens.add({
      targets: this.niloSpirit,
      scale: 0.52,
      alpha: 1,
      duration: 130,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  // ─── grid sprite layers ───────────────────────────────────────────────────

  private spritesReady(): boolean {
    return this.textures.exists(GridAssets.WALL);
  }

  /**
   * Place a handful of decorative plants/mushrooms on floor tiles that
   * aren't gameplay-critical, plus two lamp posts framing the grid.
   * Deterministic placement (no `Math.random`) so the scene looks the
   * same across resets.
   */
  private buildSceneryLayer() {
    // Floor tiles that should stay clear: every cell adjacent to gameplay
    // elements (stones/sockets/push block/exit) plus Bram's start tile.
    const reserved = new Set<string>();
    const key = (x: number, y: number) => `${x},${y}`;
    reserved.add(key(this.engine.bram.x, this.engine.bram.y));
    for (let y = 0; y < this.engine.height; y++) {
      for (let x = 0; x < this.engine.width; x++) {
        const c = this.engine.getCell(x, y);
        if (c !== 'floor') {
          // also reserve neighbors so we don't crowd pickups
          for (const [dx, dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) {
            reserved.add(key(x + dx, y + dy));
          }
        }
      }
    }

    // Hand-picked deterministic placements that read well across the map.
    // (gx, gy, key, scale, offsetX, offsetY)
    const placements: Array<[number, number, string, number, number, number]> = [
      [2,  3, GridAssets.DECO_FLOWER_BLUE,   0.28,  0,  6],
      [11, 3, GridAssets.DECO_PLANT_FERN,    0.32, -2,  8],
      [3,  5, GridAssets.DECO_PLANT_SPROUT,  0.34,  4,  4],
      [10, 5, GridAssets.DECO_MUSHROOM_PAIR, 0.40,  0,  6],
      [11, 7, GridAssets.DECO_FLOWER_PURPLE, 0.28, -3,  6],
      [3,  7, GridAssets.DECO_PLANT_TUFT,    0.38,  2,  4],
      [11, 1, GridAssets.DECO_ROCK_SMALL,    0.40, -4,  6],
      [2,  1, GridAssets.DECO_MUSHROOM_TALL, 0.34,  2,  4],
    ];
    for (const [gx, gy, k, sc, ox, oy] of placements) {
      if (reserved.has(key(gx, gy))) continue;
      const { x: cx, y: cy } = this.tileToWorld(gx, gy);
      this.add.image(cx + ox, cy + oy, k)
        .setScale(sc)
        .setDepth(2) // above floor, below dynamic cells
        .setAlpha(0.92);
    }

    // Lamp posts framing the grid (sit just outside the play area).
    const lampLeftX  = this.gridOriginX - 36;
    const lampRightX = this.gridOriginX + this.engine.width * TILE + 36;
    const lampY      = this.gridOriginY + 30;
    this.add.image(lampLeftX,  lampY, GridAssets.LAMP_POST)
      .setScale(0.34).setDepth(2);
    this.add.image(lampRightX, lampY, GridAssets.LAMP_POST)
      .setScale(0.34).setFlipX(true).setDepth(2);
  }

  private buildStaticSpriteLayer() {
    for (let y = 0; y < this.engine.height; y++) {
      for (let x = 0; x < this.engine.width; x++) {
        const cell = this.engine.getCell(x, y);
        if (cell !== 'wall' && cell !== 'floor') continue;
        const { x: cx, y: cy } = this.tileToWorld(x, y);

        if (cell === 'wall') {
          this.staticTileImages.push(
            this.add.image(cx, cy, GridAssets.WALL).setScale(SC_WALL).setDepth(2)
          );
        } else {
          // Alternate floor variant on checkerboard pattern for visual texture
          const key = (x + y) % 2 === 0 ? GridAssets.FLOOR : GridAssets.FLOOR_ALT;
          this.staticTileImages.push(
            this.add.image(cx, cy, key).setScale(SC_FLOOR).setDepth(1)
          );
        }
      }
    }
  }

  private renderDynamicCells() {
    for (const img of this.dynamicCellImages) img.destroy();
    this.dynamicCellImages = [];

    if (!this.spritesReady()) {
      // Procedural fallback: redraw everything via Graphics
      this.tileGraphics.clear();
      this.drawGridBorder();
      for (let y = 0; y < this.engine.height; y++)
        for (let x = 0; x < this.engine.width; x++)
          this.drawCellProcedural(x, y, this.engine.getCell(x, y));
      return;
    }

    for (let y = 0; y < this.engine.height; y++) {
      for (let x = 0; x < this.engine.width; x++) {
        const cell = this.engine.getCell(x, y);
        if (cell === 'wall' || cell === 'floor') continue;

        const { x: cx, y: cy } = this.tileToWorld(x, y);
        const imgs = this.makeCellSprites(cx, cy, cell, x, y);
        for (const img of imgs) this.dynamicCellImages.push(img);
      }
    }
  }

  private makeCellSprites(
    cx: number, cy: number, cell: CellType, gx: number, gy: number
  ): Phaser.GameObjects.GameObject[] {
    const out: Phaser.GameObjects.GameObject[] = [];

    // Each cell sits on a floor tile first
    const floorKey = (gx + gy) % 2 === 0 ? GridAssets.FLOOR : GridAssets.FLOOR_ALT;
    out.push(this.add.image(cx, cy, floorKey).setScale(SC_FLOOR).setDepth(1));

    const cellValue = this.engine.getCellValue(gx, gy);

    switch (cell) {
      case 'stone': {
        // Numbered variant if the engine tagged this cell with a value.
        const key = cellValue !== undefined
          ? `grid_number_stone_${cellValue}`
          : GridAssets.REPAIR_STONE;
        const hasArt = this.textures.exists(key);
        const img = this.add.image(cx, cy + 2, hasArt ? key : GridAssets.REPAIR_STONE)
          .setScale(SC_STONE).setDepth(4);
        out.push(img);
        // Fallback badge for values without dedicated art (e.g. 11+).
        if (cellValue !== undefined && !hasArt) {
          out.push(this.makeNumberBadge(cx, cy + 2, cellValue, '#fff2d4').setDepth(5));
        }
        break;
      }

      case 'socket_empty': {
        const key = cellValue !== undefined
          ? `grid_socket_unlit_${cellValue}`
          : GridAssets.SOCKET_EMPTY;
        const hasArt = this.textures.exists(key);
        const img = this.add.image(cx, cy, hasArt ? key : GridAssets.SOCKET_EMPTY)
          .setScale(SC_SOCKET).setDepth(3);
        out.push(img);
        if (cellValue !== undefined && !hasArt) {
          out.push(this.makeNumberBadge(cx, cy, cellValue, '#c8e6ff').setDepth(4));
        }
        break;
      }

      case 'socket_partial': {
        const img = this.add.image(cx, cy, GridAssets.SOCKET_PARTIAL)
          .setScale(SC_SOCKET).setDepth(3);
        this.tweens.add({
          targets: img, alpha: 0.68, duration: 850,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        out.push(img);
        const first = this.engine.getPartialSocketValue(gx, gy);
        const target = cellValue;
        if (first !== undefined && target !== undefined) {
          out.push(this.makePartialBadge(cx, cy, first, target).setDepth(5));
        }
        break;
      }

      case 'socket_filled': {
        const key = cellValue !== undefined
          ? `grid_socket_lit_${cellValue}`
          : GridAssets.SOCKET_FILLED;
        const hasArt = this.textures.exists(key);
        const filled = this.add.image(cx, cy, hasArt ? key : GridAssets.SOCKET_FILLED)
          .setScale(SC_SOCKET).setDepth(3);
        // gentle pulse to show active repair energy
        this.tweens.add({
          targets: filled, alpha: 0.75, duration: 900,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        out.push(filled);
        if (cellValue !== undefined && !hasArt) {
          out.push(this.makeNumberBadge(cx, cy, cellValue, '#eaf6ff').setDepth(4));
        }
        break;
      }

      case 'push_block':
        out.push(
          this.add.image(cx, cy + 1, GridAssets.PUSH_BLOCK)
            .setScale(SC_BLOCK).setDepth(4)
        );
        break;

      case 'exit': {
        const open = this.engine.allSocketsRepaired();
        const useGate = this.room.gateVisual === 'gate';
        const key  = useGate
          ? (open ? GridAssets.GATE_OPEN   : GridAssets.GATE_CLOSED)
          : (open ? GridAssets.EXIT_OPEN   : GridAssets.EXIT_CLOSED);
        const img  = this.add.image(cx, cy - 4, key).setScale(SC_EXIT).setDepth(5);
        if (open) {
          // soft glow pulse on the open portal / gate
          this.tweens.add({
            targets: img, alpha: 0.82, duration: 700,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
        }
        out.push(img);
        break;
      }
    }

    return out;
  }

  /**
   * Number badge rendered as a Text object, used when a tile carries a
   * value but no dedicated sprite exists (e.g. stones/sockets with value
   * 11+). Style is consistent with the baked numerals on 1–10 art.
   */
  private makeNumberBadge(cx: number, cy: number, value: number, color: string) {
    return this.add.text(cx, cy, String(value), {
      fontFamily: 'Georgia, serif',
      fontSize: value > 9 ? '13px' : '15px',
      fontStyle: 'bold',
      color,
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 2, fill: true }
    }).setOrigin(0.5);
  }

  private makePartialBadge(cx: number, cy: number, first: number, target: number) {
    const text = `${first} + ?`;
    const group = this.add.container(cx, cy);
    const bg = this.add.graphics();
    bg.fillStyle(0x142b3a, 0.82).fillRoundedRect(-26, -12, 52, 24, 8);
    bg.lineStyle(1, 0x8fdfff, 0.8).strokeRoundedRect(-26, -12, 52, 24, 8);
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Georgia, serif',
      fontSize: target > 10 ? '12px' : '13px',
      fontStyle: 'bold',
      color: '#dff8ff',
      shadow: { offsetX: 1, offsetY: 1, color: '#00111a', blur: 2, fill: true }
    }).setOrigin(0.5);
    group.add([bg, label]);
    return group;
  }

  /**
   * Flash a socket_reject overlay at the target tile and play a sour bump
   * sound. Called when the player tried to deposit a wrong-numbered stone.
   */
  private flashRejectAt(gx: number, gy: number) {
    if (!this.spritesReady()) return;
    if (!this.textures.exists(GridAssets.SOCKET_REJECT)) return;
    const { x: cx, y: cy } = this.tileToWorld(gx, gy);
    const flash = this.add.image(cx, cy, GridAssets.SOCKET_REJECT)
      .setScale(SC_SOCKET)
      .setDepth(45)
      .setAlpha(0);
    this.tweens.add({
      targets: flash, alpha: 1,
      duration: 100, yoyo: true, hold: 220, ease: 'Quad.easeOut',
      onComplete: () => flash.destroy()
    });
  }

  // ─── procedural drawCell (fallback only) ──────────────────────────────────

  private drawGridBorder() {
    const g = this.tileGraphics;
    const w = this.engine.width * TILE;
    const h = this.engine.height * TILE;
    g.fillStyle(Palette.ink, 0.55);
    g.fillRoundedRect(this.gridOriginX - 8, this.gridOriginY - 8, w + 16, h + 16, 12);
    g.lineStyle(2, Palette.parchmentDark, 0.7);
    g.strokeRoundedRect(this.gridOriginX - 8, this.gridOriginY - 8, w + 16, h + 16, 12);
  }

  private drawCellProcedural(gx: number, gy: number, cell: CellType) {
    const px = this.gridOriginX + gx * TILE;
    const py = this.gridOriginY + gy * TILE;
    const cx = px + TILE / 2;
    const cy = py + TILE / 2;
    const g = this.tileGraphics;

    if (cell === 'wall') {
      g.fillStyle(0x3a3a30, 1).fillRect(px, py, TILE, TILE);
      g.fillStyle(0x4a4a3e, 1).fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      g.lineStyle(1, 0x1a1a14, 0.85).strokeRect(px, py, TILE, TILE);
      g.lineStyle(1, 0x2a2a22, 0.8).lineBetween(px + 4, py + 22, px + TILE - 4, py + 22);
      g.fillStyle(Palette.moss, 1).fillEllipse(px + 14, py + 4, 16, 6);
      g.fillEllipse(px + TILE - 14, py + 6, 14, 5);
      g.fillStyle(Palette.leaf, 0.85).fillCircle(px + 12, py + 3, 2);
      g.fillCircle(px + TILE - 16, py + 5, 1.6);
      return;
    }

    g.fillStyle(0x4a3a28, 1).fillRect(px, py, TILE, TILE);
    g.fillStyle(0x5a4634, 0.55).fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
    g.lineStyle(1, 0x2a1f15, 0.7).strokeRect(px, py, TILE, TILE);

    if (cell === 'stone') {
      g.fillStyle(0x1a2a3a, 0.6).fillEllipse(cx, cy + 4, 18, 5);
      g.fillStyle(0x4a78a8, 1).fillCircle(cx, cy, 11);
      g.fillStyle(0x6fb5e8, 1).fillCircle(cx, cy, 9);
      g.lineStyle(2, 0xc8e6ff, 1).strokeCircle(cx, cy, 11);
      g.fillStyle(0xeaf6ff, 0.85).fillCircle(cx - 3, cy - 3, 3);
      g.fillStyle(0xffffff, 1).fillCircle(cx - 4, cy - 4, 1.4);
    } else if (cell === 'socket_empty') {
      g.fillStyle(0x14110d, 0.95).fillCircle(cx, cy, 15);
      g.lineStyle(2, 0x2a2218, 1).strokeCircle(cx, cy, 15);
      g.fillStyle(0x4a78a8, 0.18).fillCircle(cx, cy, 11);
      g.lineStyle(1, 0x6fb5e8, 0.5).strokeCircle(cx, cy, 8);
    } else if (cell === 'socket_partial') {
      g.fillStyle(0x6fb5e8, 0.16).fillCircle(cx, cy, 18);
      g.fillStyle(0x14110d, 0.95).fillCircle(cx, cy, 15);
      g.fillStyle(0x6fb5e8, 0.46).fillCircle(cx - 4, cy, 10);
      g.lineStyle(2, 0x8fdfff, 0.75).strokeCircle(cx, cy, 14);
    } else if (cell === 'socket_filled') {
      g.fillStyle(0x6fb5e8, 0.32).fillCircle(cx, cy, 19);
      g.fillStyle(0x6fb5e8, 0.85).fillCircle(cx, cy, 13);
      g.lineStyle(2, 0xc8e6ff, 1).strokeCircle(cx, cy, 13);
      g.fillStyle(0xeaf6ff, 0.95).fillCircle(cx, cy, 5);
      g.fillStyle(0xffffff, 1).fillCircle(cx - 2, cy - 2, 2);
    } else if (cell === 'push_block') {
      g.fillStyle(0x3a3a30, 1).fillRoundedRect(px + 5, py + 7, TILE - 10, TILE - 12, 8);
      g.lineStyle(2, 0x1a1a14, 1).strokeRoundedRect(px + 5, py + 7, TILE - 10, TILE - 12, 8);
      g.fillStyle(0x5a5a4a, 0.7).fillRoundedRect(px + 7, py + 9, TILE - 18, 6, 4);
      g.fillStyle(Palette.moss, 1).fillEllipse(cx - 7, py + 12, 12, 5);
      g.fillEllipse(cx + 8, py + 14, 8, 3);
      g.fillStyle(Palette.leaf, 0.9).fillCircle(cx - 9, py + 11, 1.8);
      g.fillCircle(cx + 9, py + 13, 1.4);
      g.fillStyle(Palette.gold, 0.65);
      g.fillTriangle(px + 8, cy - 3, px + 8, cy + 3, px + 13, cy);
      g.fillTriangle(px + TILE - 8, cy - 3, px + TILE - 8, cy + 3, px + TILE - 13, cy);
    } else if (cell === 'exit') {
      const open = this.engine.allSocketsRepaired();
      if (open) {
        g.fillStyle(0x6fb5e8, 0.25).fillRoundedRect(px + 2, py + 2, TILE - 4, TILE - 4, 10);
        g.fillStyle(0x6fb5e8, 0.55).fillRoundedRect(px + 6, py + 8, TILE - 12, TILE - 14, 9);
        g.lineStyle(3, 0xc8e6ff, 1).strokeRoundedRect(px + 6, py + 8, TILE - 12, TILE - 14, 9);
        g.lineStyle(2, 0xeaf6ff, 0.85);
        g.beginPath(); g.arc(cx, cy + 4, 13, Math.PI, 0, false); g.strokePath();
        g.fillStyle(0xffffff, 0.6).fillEllipse(cx, cy - 2, 10, 14);
      } else {
        g.fillStyle(0x4a4a3e, 1).fillRoundedRect(px + 4, py + 6, TILE - 8, TILE - 10, 9);
        g.lineStyle(2, 0x1a1a14, 1).strokeRoundedRect(px + 4, py + 6, TILE - 8, TILE - 10, 9);
        g.fillStyle(0x3a261a, 1).fillRoundedRect(px + 8, py + 10, TILE - 16, TILE - 16, 5);
        g.lineStyle(1, 0x1a1008, 1).strokeRoundedRect(px + 8, py + 10, TILE - 16, TILE - 16, 5);
        g.fillStyle(0x4a4036, 1).fillRect(px + 8, cy - 2, TILE - 16, 3);
        g.fillStyle(0x14110d, 1).fillCircle(cx, cy, 1.8);
      }
    }
  }

  // ─── title / HUD ──────────────────────────────────────────────────────────

  private buildTitleBar() {
    this.add.text(40, 24, this.room.title, {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#f0dcae',
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
    }).setDepth(15);

    // Tip strip: use the clean panel_wide parchment (tip_banner has baked
    // text we don't want).
    const tipY = 75;
    if (this.spritesReady()) {
      this.tipBannerImg = this.add.image(640, tipY, GridAssets.PANEL_WIDE)
        .setDisplaySize(940, 60)
        .setAlpha(0.92)
        .setDepth(14);
    }

    this.tipText = this.add.text(
      this.spritesReady() ? 640 : 40,
      tipY - 9,
      this.room.hints.welcome,
      {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: this.spritesReady() ? '#3a2410' : '#f0dcae',
        wordWrap: { width: 820 },
        shadow: this.spritesReady()
          ? undefined
          : { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
      }
    )
      .setOrigin(this.spritesReady() ? 0.5 : 0, 0)
      .setDepth(15);
  }

  private buildHUD() {
    addPanel(this, 28, 626, 1224, 70, 0.86);

    this.hudInventory = this.add.text(68, 638, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#ffe9ad'
    }).setDepth(15);

    this.hudProgress = this.add.text(68, 666, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#f0dcae'
    }).setDepth(15);

    // Undo / Reset: tappable icon buttons (also bound to U / R keys).
    if (this.spritesReady()) {
      this.makeIconButton(1148, 652, GridAssets.BTN_UNDO, 0.48, 'U', () => this.attemptUndo());
      this.makeIconButton(1204, 652, GridAssets.BTN_RESET, 0.48, 'R', () => this.attemptReset());

      this.add.text(1240, 666, 'Keys, swipe, or tap', {
        fontFamily: 'Georgia, serif', fontSize: '13px', color: '#a08866'
      }).setOrigin(1, 0).setDepth(15);
    } else {
      // Procedural fallback Undo / Reset
      this.makeProceduralIconButton(1148, 652, '↶', 'U', () => this.attemptUndo());
      this.makeProceduralIconButton(1204, 652, '⟲', 'R', () => this.attemptReset());

      this.add.text(1240, 642, 'Keyboard / Swipe / Tap  ·  M menu', {
        fontFamily: 'Georgia, serif', fontSize: '14px', color: '#a08866'
      }).setOrigin(1, 0).setDepth(15);
    }
  }

  private makeIconButton(
    cx: number, cy: number, spriteKey: string, scale: number,
    keyLabel: string, onTap: () => void
  ) {
    const img = this.add.image(cx, cy, spriteKey)
      .setScale(scale).setDepth(15).setAlpha(0.9);
    this.add.text(cx + 20, cy - 15, keyLabel, {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#ffe9ad'
    }).setDepth(16).setAlpha(0.7);

    const hit = this.add.zone(cx, cy, 56, 56)
      .setInteractive({ useHandCursor: true }).setDepth(17);
    hit.on('pointerover', () => img.setScale(scale * 1.08).setAlpha(1));
    hit.on('pointerout',  () => img.setScale(scale).setAlpha(0.9));
    hit.on('pointerdown', onTap);
  }

  private makeProceduralIconButton(
    cx: number, cy: number, glyph: string, keyLabel: string, onTap: () => void
  ) {
    const size = 48;
    const g = this.add.graphics().setDepth(15);
    g.fillStyle(Palette.bark, 0.9);
    g.lineStyle(2, Palette.gold, 0.85);
    g.fillRoundedRect(cx - size / 2, cy - size / 2, size, size, 8);
    g.strokeRoundedRect(cx - size / 2, cy - size / 2, size, size, 8);

    const text = this.add.text(cx, cy, glyph, {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#ffe9ad'
    }).setOrigin(0.5).setDepth(16);
    this.add.text(cx + 20, cy - 15, keyLabel, {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#ffe9ad'
    }).setDepth(16).setAlpha(0.7);

    const hit = this.add.zone(cx, cy, size, size)
      .setInteractive({ useHandCursor: true }).setDepth(17);
    hit.on('pointerover', () => text.setScale(1.1));
    hit.on('pointerout',  () => text.setScale(1));
    hit.on('pointerdown', onTap);
  }

  // ─── input ────────────────────────────────────────────────────────────────

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
    kb.on('keydown-M',     () => this.exitToMenu());
  }

  /**
   * On-screen directional pad placed to the right of the grid. Uses arrow
   * glow sprites if loaded; falls back to procedural arrow buttons.
   */
  private buildTouchControls() {
    const cx = 1090;            // center column to the right of the grid
    const cy = 380;             // vertically centered with grid
    const r  = 64;              // distance from center for each arrow

    this.makeDirButton(cx,     cy - r, 'up',    GridAssets.ARROW_UP);
    this.makeDirButton(cx,     cy + r, 'down',  GridAssets.ARROW_DOWN);
    this.makeDirButton(cx - r, cy,     'left',  GridAssets.ARROW_LEFT);
    this.makeDirButton(cx + r, cy,     'right', GridAssets.ARROW_RIGHT);
  }

  private makeDirButton(x: number, y: number, dir: Direction, spriteKey: string) {
    const useSprite = this.spritesReady() && this.textures.exists(spriteKey);
    const baseScale = 0.5;

    let visual: Phaser.GameObjects.Image | null = null;
    if (useSprite) {
      visual = this.add.image(x, y, spriteKey)
        .setScale(baseScale).setDepth(15).setAlpha(0.92);
    } else {
      this.drawProceduralArrow(x, y, dir);
    }

    const hit = this.add.zone(x, y, 60, 60)
      .setInteractive({ useHandCursor: true }).setDepth(17);
    hit.on('pointerover', () => visual?.setScale(baseScale * 1.08).setAlpha(1));
    hit.on('pointerout',  () => visual?.setScale(baseScale).setAlpha(0.92));
    hit.on('pointerdown', () => {
      // Quick press-tween for tactile feedback (sprite path only).
      if (visual) {
        this.tweens.add({
          targets: visual, scale: baseScale * 0.92,
          duration: 60, yoyo: true, ease: 'Sine.easeOut'
        });
      }
      this.attemptMove(dir);
    });
  }

  private drawProceduralArrow(cx: number, cy: number, dir: Direction) {
    const size = 56;
    const g = this.add.graphics().setDepth(15);
    g.fillStyle(Palette.bark, 0.92);
    g.lineStyle(2, Palette.gold, 0.9);
    g.fillRoundedRect(cx - size / 2, cy - size / 2, size, size, 10);
    g.strokeRoundedRect(cx - size / 2, cy - size / 2, size, size, 10);
    // Filled triangle
    g.fillStyle(0xffe9ad, 0.95);
    const h = 12;
    if (dir === 'up')    g.fillTriangle(cx, cy - h, cx - h, cy + h, cx + h, cy + h);
    if (dir === 'down')  g.fillTriangle(cx, cy + h, cx - h, cy - h, cx + h, cy - h);
    if (dir === 'left')  g.fillTriangle(cx - h, cy, cx + h, cy - h, cx + h, cy + h);
    if (dir === 'right') g.fillTriangle(cx + h, cy, cx - h, cy - h, cx - h, cy + h);
  }

  /**
   * Pointer input scoped to the grid area:
   *  - Drag > SWIPE_THRESHOLD: swipe-direction move.
   *  - Drag ≤ TAP_MAX_DRAG: tap-to-adjacent (only if target tile is
   *    one of Bram's 4-neighbors).
   *  - Anything in between is ignored.
   */
  private bindPointerInput() {
    const w = this.engine.width * TILE;
    const h = this.engine.height * TILE;
    const swipeZone = this.add.zone(this.gridOriginX, this.gridOriginY, w, h)
      .setOrigin(0, 0)
      .setInteractive();
    // No depth set — zones are non-rendering, just receive input.

    swipeZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.busy || this.successOpen) return;
      this.pointerStart = { x: p.x, y: p.y };
    });

    // Listen on the scene input for pointerup so a swipe that ends just
    // outside the zone still resolves cleanly.
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (!this.pointerStart) return;
      const start = this.pointerStart;
      this.pointerStart = null;
      if (this.busy || this.successOpen) return;

      const dx   = p.x - start.x;
      const dy   = p.y - start.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= TAP_MAX_DRAG) {
        // Treat as tap-to-adjacent (uses release point — that's where
        // the player's finger is when they commit).
        this.handleTapToAdjacent(p.x, p.y);
        return;
      }

      if (dist < SWIPE_THRESHOLD) return; // dead zone between tap and swipe

      // Swipe — dominant axis wins
      if (Math.abs(dx) > Math.abs(dy)) {
        this.attemptMove(dx > 0 ? 'right' : 'left');
      } else {
        this.attemptMove(dy > 0 ? 'down' : 'up');
      }
    });
  }

  private handleTapToAdjacent(px: number, py: number) {
    const gx = Math.floor((px - this.gridOriginX) / TILE);
    const gy = Math.floor((py - this.gridOriginY) / TILE);
    if (gx < 0 || gx >= this.engine.width)  return;
    if (gy < 0 || gy >= this.engine.height) return;

    const bx = this.engine.bram.x;
    const by = this.engine.bram.y;

    if (gx === bx + 1 && gy === by)      this.attemptMove('right');
    else if (gx === bx - 1 && gy === by) this.attemptMove('left');
    else if (gx === bx && gy === by + 1) this.attemptMove('down');
    else if (gx === bx && gy === by - 1) this.attemptMove('up');
    // Tap on Bram's tile or non-adjacent tile: ignored in v0.1
  }

  private attemptMove(dir: Direction) {
    if (this.busy || this.successOpen) return;
    const wasSolvedBefore = this.engine.allSocketsRepaired();
    const result = this.engine.tryMove(dir);
    this.bram.setFacing(this.engine.bramFacing);

    if (!result.moved) {
      if (result.bumped) {
        this.playBump(dir);
        AudioManager.play(AudioKeys.INVALID_BUMP);
      }
      if (result.attemptedPush && !this.hasShownInvalidPushHint && this.room.hints.invalidPush) {
        this.hasShownInvalidPushHint = true;
        this.setTip(this.room.hints.invalidPush);
      }
      // Wrong-number deposit: flash the socket_reject overlay at the target.
      if (result.numberMismatch) {
        const tx = this.engine.bram.x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0);
        const ty = this.engine.bram.y + (dir === 'up'   ? -1 : dir === 'down'  ? 1 : 0);
        this.flashRejectAt(tx, ty);
        this.pulseNilo();
        if (!this.hasShownMismatchHint && this.room.hints.numberMismatch) {
          this.hasShownMismatchHint = true;
          this.setTip(this.room.hints.numberMismatch);
        }
      }
      return;
    }

    this.moveCount += 1;
    this.busy = true;
    if (this.tutorialObjects.length > 0) this.dismissGestureTutorial();

    // Audio cues that should fire on commit (not after tween):
    if (result.pushedBlock)    AudioManager.play(AudioKeys.BLOCK_PUSH);
    if (result.collectedStone) AudioManager.play(AudioKeys.PICKUP_STONE);
    if (result.partialSocket)  AudioManager.play(AudioKeys.NILO_ENERGY, { volume: 0.7 });
    if (result.filledSocket)   AudioManager.play(AudioKeys.REPAIR_SOCKET);

    // "Gate just opened" cue — exit transitioned from closed to open
    // because this move filled the last socket.
    if (!wasSolvedBefore && this.engine.allSocketsRepaired()) {
      AudioManager.play(AudioKeys.PORTAL_OPEN, { volume: 0.85 });
    }

    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.moveNiloNear(target.x, target.y);
    if (result.partialSocket || result.filledSocket) this.pulseNilo();
    this.renderDynamicCells();
    this.refreshHUD();
    if (result.partialSocket && !this.hasShownPartialHint && this.room.hints.partial) {
      this.hasShownPartialHint = true;
      this.setTip(this.room.hints.partial);
    }

    this.tweens.add({
      targets: this.bram,
      x: target.x,
      y: target.y,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.busy = false;
        if (result.collectedStone) this.spawnPickupSparkle(target.x, target.y);
        if (result.partialSocket)  this.spawnPartialPulse(target.x, target.y, result.partialValue, result.numberValue);
        if (result.filledSocket)   this.spawnRepairBurst(target.x, target.y);
        if (result.filledSocket && result.pairUsed) {
          this.spawnEquationFlash(target.x, target.y, result.pairUsed[0], result.pairUsed[1]);
        }
        if (result.solved)         this.showSuccess();
      }
    });
  }

  private attemptUndo() {
    if (this.busy || this.successOpen) return;
    if (!this.engine.canUndo) return;
    this.engine.undo();
    AudioManager.play(AudioKeys.UNDO);
    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram.setPosition(target.x, target.y);
    this.bram.setFacing(this.engine.bramFacing);
    this.renderDynamicCells();
    this.refreshHUD();

    if (this.moveCount > 0 && !this.hasShownUndoHint && this.room.hints.firstUndo) {
      this.hasShownUndoHint = true;
      this.setTip(this.room.hints.firstUndo);
    }
  }

  private attemptReset() {
    if (this.successOpen) return;
    this.engine.reset();
    this.moveCount = 0;
    AudioManager.play(AudioKeys.RESET);
    const target = this.tileToWorld(this.engine.bram.x, this.engine.bram.y);
    this.bram.setPosition(target.x, target.y);
    this.bram.setFacing(this.engine.bramFacing);
    this.renderDynamicCells();
    this.refreshHUD();
  }

  private setTip(text: string) {
    if (!this.tipText) return;
    this.tipText.setText(text);
    this.tipText.setAlpha(0);
    if (this.tipBannerImg) this.tipBannerImg.setAlpha(0);
    this.tweens.killTweensOf(this.tipText);
    this.tweens.add({ targets: this.tipText, alpha: 1, duration: 240, ease: 'Quad.easeOut' });
    if (this.tipBannerImg) {
      this.tweens.add({ targets: this.tipBannerImg, alpha: 0.92, duration: 240, ease: 'Quad.easeOut' });
    }
  }

  // ─── HUD refresh ─────────────────────────────────────────────────────────

  private refreshHUD() {
    const generic  = this.engine.stonesCarried;
    const numbered = this.engine.numberedCarried;
    const total    = this.engine.countSocketsTotal();
    const done     = this.engine.countSocketsRepaired();
    const gateWord = this.room.gateVisual === 'gate' ? 'gate' : 'exit';
    const gateNote = this.engine.allSocketsRepaired()
      ? `    (${gateWord} open — step on E)` : '';

    // Inventory display: if there are numbered stones, list their values;
    // otherwise show the plain count.
    let invLine: string;
    if (numbered.length > 0) {
      const tags = numbered.map((v, i) => i === numbered.length - 1 ? `→[${v}]` : `[${v}]`).join(' ');
      invLine = `Stones: ${tags}` + (generic > 0 ? `   plus ${generic} plain` : '');
    } else {
      invLine = `Stones carried: ${generic}`;
    }
    this.hudInventory.setText(invLine);
    this.hudProgress.setText(`Sockets repaired: ${done} / ${total}${gateNote}`);
  }

  // ─── VFX ──────────────────────────────────────────────────────────────────

  private playBump(dir: Direction) {
    const dx = dir === 'left' ? -6 : dir === 'right' ? 6 : 0;
    const dy = dir === 'up'   ? -6 : dir === 'down'  ? 6 : 0;
    const startX = this.bram.x;
    const startY = this.bram.y;
    this.busy = true;
    this.tweens.add({
      targets: this.bram,
      x: startX + dx, y: startY + dy,
      duration: 80, yoyo: true, ease: 'Sine.easeOut',
      onComplete: () => { this.busy = false; this.bram.setPosition(startX, startY); }
    });

    // Puff of dust at the point of impact.
    if (this.spritesReady()) {
      const dustX = startX + (dir === 'left' ? -TILE / 2 : dir === 'right' ? TILE / 2 : 0);
      const dustY = startY + (dir === 'up'   ? -TILE / 2 : dir === 'down'  ? TILE / 2 : 0) + 6;
      const dust = this.add.image(dustX, dustY, GridAssets.VFX_BUMP_DUST)
        .setScale(0.22).setDepth(20).setAlpha(0.85);
      this.tweens.add({
        targets: dust, scale: 0.36, alpha: 0,
        duration: 380, ease: 'Quad.easeOut',
        onComplete: () => dust.destroy()
      });
    }
  }

  private spawnPartialPulse(x: number, y: number, first: number | null, target: number | null) {
    if (this.spritesReady() && this.textures.exists(GridAssets.VFX_BLUE_MOTES)) {
      const mote = this.add.image(x, y, GridAssets.VFX_BLUE_MOTES)
        .setScale(0.20).setDepth(44).setAlpha(0.85);
      this.tweens.add({
        targets: mote, scale: 0.34, alpha: 0,
        duration: 540, ease: 'Quad.easeOut',
        onComplete: () => mote.destroy()
      });
    }
    if (first !== null && target !== null) {
      const note = this.add.text(x + 14, y - 24, `${first} + ? = ${target}`, {
        fontFamily: 'Georgia, serif', fontStyle: 'bold',
        fontSize: '13px', color: '#dff8ff',
        shadow: { offsetX: 1, offsetY: 1, color: '#00111a', blur: 2, fill: true }
      }).setDepth(52);
      this.tweens.add({
        targets: note, y: note.y - 18, alpha: 0, duration: 850,
        onComplete: () => note.destroy()
      });
    }
  }

  private spawnPickupSparkle(x: number, y: number) {
    if (this.spritesReady() && this.textures.exists(GridAssets.VFX_BLUE_PICKUP_ANIM)) {
      const s = this.add.sprite(x, y + 4, GridAssets.VFX_BLUE_PICKUP_ANIM)
        .setScale(0.35).setDepth(50).setAlpha(0.95);
      s.play(GridAssets.VFX_BLUE_PICKUP_ANIM);
      s.once('animationcomplete', () => s.destroy());
    } else if (this.spritesReady()) {
      const s = this.add.image(x, y + 4, GridAssets.VFX_BLUE_PICKUP)
        .setScale(0.35).setDepth(50).setAlpha(0.95);
      this.tweens.add({
        targets: s, y: y - 30, alpha: 0, scaleX: 0.5, scaleY: 0.5,
        duration: 520, ease: 'Quad.easeOut',
        onComplete: () => s.destroy()
      });
    } else {
      for (let i = 0; i < 6; i++) {
        const star = this.add.text(x, y, '✦', {
          fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c8e6ff'
        }).setOrigin(0.5).setDepth(50);
        const a = (i / 6) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.25, 0.25);
        this.tweens.add({
          targets: star,
          x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 26 - 8,
          alpha: 0, duration: 520,
          onComplete: () => star.destroy()
        });
      }
    }
  }

  private spawnRepairBurst(x: number, y: number) {
    if (this.spritesReady() && this.textures.exists(GridAssets.VFX_BLUE_BURST_ANIM)) {
      const s = this.add.sprite(x, y, GridAssets.VFX_BLUE_BURST_ANIM)
        .setScale(0.32).setDepth(45).setAlpha(0.92);
      s.play(GridAssets.VFX_BLUE_BURST_ANIM);
      s.once('animationcomplete', () => s.destroy());
    } else if (this.spritesReady()) {
      const burst = this.add.image(x, y, GridAssets.VFX_BLUE_BURST)
        .setScale(0.22).setDepth(45).setAlpha(0.9);
      this.tweens.add({
        targets: burst, scale: 0.58, alpha: 0,
        duration: 680, ease: 'Quad.easeOut',
        onComplete: () => burst.destroy()
      });
    } else {
      const halo = this.add.graphics().setDepth(40);
      halo.fillStyle(0x6fb5e8, 0.5).fillCircle(x, y, 24);
      halo.fillStyle(0xc8e6ff, 0.25).fillCircle(x, y, 42);
      this.tweens.add({ targets: halo, alpha: 0, duration: 650, onComplete: () => halo.destroy() });
    }

    const tick = this.add.text(x + 16, y - 22, 'It stays.', {
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: '14px', color: '#c8e6ff'
    }).setDepth(50);
    this.tweens.add({
      targets: tick, y: tick.y - 18, alpha: 0, duration: 750,
      onComplete: () => tick.destroy()
    });
  }

  // ─── success state ────────────────────────────────────────────────────────

  private showSuccess() {
    this.successOpen = true;
    this.bram.celebrate();

    // Warm celebratory sting (slightly delayed so it doesn't collide
    // with the portal_open cue that fired on the last socket fill).
    this.time.delayedCall(220, () => AudioManager.play(AudioKeys.SUCCESS_WARM));

    // Gold halo under Bram's feet for the celebration.
    if (this.spritesReady()) {
      const halo = this.add.image(this.bram.x, this.bram.y + 24, GridAssets.VFX_GOLD_HALO)
        .setScale(0.30).setDepth(9).setAlpha(0);
      this.tweens.add({
        targets: halo, alpha: 0.95, scale: 0.45,
        duration: 600, ease: 'Quad.easeOut'
      });
      this.tweens.add({
        targets: halo, angle: 360,
        duration: 6000, repeat: -1, ease: 'Linear'
      });
    }

    const depth = 1000;
    const dim = this.add.graphics().setDepth(depth);
    dim.fillStyle(0x000000, 0.55).fillRect(0, 0, 1280, 720);

    if (this.spritesReady()) {
      this.showSuccessSprite(depth);
    } else {
      this.showSuccessProcedural(depth);
    }

    // Gold victory sparkles across the screen
    const useAnim = this.spritesReady() && this.textures.exists(GridAssets.VFX_GOLD_VICTORY_ANIM);
    for (let i = 0; i < 8; i++) {
      const sx = Phaser.Math.Between(300, 980);
      const sy = Phaser.Math.Between(180, 520);
      const spawnDelay = i * 80;

      if (useAnim) {
        const s = this.add.sprite(sx, sy, GridAssets.VFX_GOLD_VICTORY_ANIM)
          .setScale(Phaser.Math.FloatBetween(0.30, 0.54))
          .setDepth(depth + 2).setAlpha(0);
        this.tweens.add({
          targets: s, alpha: 0.9, y: sy - 20,
          duration: 300, delay: spawnDelay, ease: 'Quad.easeOut',
          onComplete: () => {
            s.play(GridAssets.VFX_GOLD_VICTORY_ANIM);
            s.once('animationcomplete', () => {
              this.tweens.add({ targets: s, alpha: 0, duration: 300, onComplete: () => s.destroy() });
            });
          }
        });
      } else if (this.spritesReady()) {
        const key = i % 2 === 0 ? GridAssets.VFX_GOLD_VICTORY : GridAssets.VFX_GOLD_SHOWER;
        const s = this.add.image(sx, sy, key)
          .setScale(Phaser.Math.FloatBetween(0.18, 0.34))
          .setDepth(depth + 2).setAlpha(0);
        this.tweens.add({
          targets: s, alpha: 0.9, y: sy - 28,
          duration: 800, delay: spawnDelay, ease: 'Quad.easeOut'
        });
        this.tweens.add({
          targets: s, alpha: 0, delay: 800 + spawnDelay, duration: 600,
          onComplete: () => s.destroy()
        });
      } else {
        const star = this.add.text(sx, sy, '✦', {
          fontFamily: 'Georgia, serif',
          fontSize: `${Phaser.Math.Between(14, 22)}px`,
          color: '#ffdf7a'
        }).setOrigin(0.5).setDepth(depth + 2).setAlpha(0);
        this.tweens.add({ targets: star, alpha: 0.9, y: sy - 30, duration: 900, delay: i * 70, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: star, alpha: 0, delay: 900 + i * 70, duration: 600, onComplete: () => star.destroy() });
      }
    }
  }

  /**
   * Flash an equation overlay above the socket just filled. Uses the
   * pre-rendered art for canonical Make-10 pairs; everything else (other
   * sums, doubles, larger numbers) gets a procedural chalkboard-style
   * text bubble so the equation always reads correctly.
   */
  private spawnEquationFlash(wx: number, wy: number, stoneA: number, stoneB: number) {
    const lo = Math.min(stoneA, stoneB);
    const hi = Math.max(stoneA, stoneB);
    const sum = stoneA + stoneB;

    let artKey: string | null = null;
    if (lo === hi) {
      // Doubles
      if      (lo === 1) artKey = GridAssets.EQ_1_PLUS_1;
      else if (lo === 2) artKey = GridAssets.EQ_2_PLUS_2;
      else if (lo === 3) artKey = GridAssets.EQ_3_PLUS_3;
      else if (lo === 4) artKey = GridAssets.EQ_4_PLUS_4;
    } else if (sum === 5) {
      if      (lo === 1 && hi === 4) artKey = GridAssets.EQ_1_PLUS_4;
      else if (lo === 2 && hi === 3) artKey = GridAssets.EQ_2_PLUS_3;
    } else if (sum === 10) {
      if      (lo === 1 && hi === 9) artKey = GridAssets.EQ_1_PLUS_9;
      else if (lo === 2 && hi === 8) artKey = GridAssets.EQ_2_PLUS_8;
      else if (lo === 3 && hi === 7) artKey = GridAssets.EQ_3_PLUS_7;
      else if (lo === 4 && hi === 6) artKey = GridAssets.EQ_4_PLUS_6;
    } else if (sum === 20) {
      if      (lo === 9  && hi === 11) artKey = GridAssets.EQ_11_PLUS_9;
      else if (lo === 8  && hi === 12) artKey = GridAssets.EQ_12_PLUS_8;
      else if (lo === 7  && hi === 13) artKey = GridAssets.EQ_13_PLUS_7;
      else if (lo === 6  && hi === 14) artKey = GridAssets.EQ_14_PLUS_6;
    }

    const startY = wy - TILE;
    let target: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    if (this.spritesReady() && artKey && this.textures.exists(artKey)) {
      target = this.add.image(wx, startY, artKey)
        .setScale(0.8).setDepth(55).setAlpha(0);
    } else {
      target = this.add.text(wx, startY, `${lo} + ${hi} = ${sum}`, {
        fontFamily: 'Georgia, serif', fontSize: '20px',
        color: '#fff2d4', fontStyle: 'bold',
        backgroundColor: '#2a1f12',
        padding: { x: 14, y: 6 },
        shadow: { offsetX: 1, offsetY: 2, color: '#000', blur: 3, fill: true }
      }).setOrigin(0.5).setDepth(55).setAlpha(0);
    }

    this.tweens.add({
      targets: target, alpha: 1, y: startY - 8,
      duration: 200, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: target, alpha: 0, y: startY - 28,
          duration: 400, delay: 700, ease: 'Quad.easeIn',
          onComplete: () => target.destroy()
        });
      }
    });
  }

  private showSuccessSprite(depth: number) {
    // Parchment panel (panel_medium: 286×295) scaled to 540×555
    const panel = this.add.image(640, 360, GridAssets.PANEL_MEDIUM)
      .setDisplaySize(540, 555).setDepth(depth + 1);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 280, ease: 'Quad.easeOut' });

    // "PUZZLE SOLVED!" banner (479×211) scaled to fit
    const banner = this.add.image(640, 195, GridAssets.SOLVED_BANNER)
      .setDisplaySize(580, 255).setDepth(depth + 2);
    banner.setAlpha(0);
    this.tweens.add({ targets: banner, alpha: 1, duration: 300, delay: 80, ease: 'Back.easeOut' });

    // Nilo + Bram portraits flanking the dialogue lines.
    const niloPortrait = this.add.image(450, 350, GridAssets.PORTRAIT_NILO)
      .setDisplaySize(140, 98).setDepth(depth + 3).setAlpha(0);
    const bramPortrait = this.add.image(830, 410, GridAssets.PORTRAIT_BRAM)
      .setScale(0)
      .setDepth(depth + 3).setAlpha(0);
    bramPortrait.setDisplaySize(140, 98).setFlipX(true);
    this.tweens.add({ targets: niloPortrait, alpha: 0.95, duration: 260, delay: 140 });
    this.tweens.add({ targets: bramPortrait, alpha: 0.95, duration: 260, delay: 240 });

    // Room-specific subtitle beneath the generic "PUZZLE SOLVED!" banner.
    const subtitle = this.add.text(640, 268, this.room.success.title, {
      fontFamily: 'Georgia, serif', fontSize: '22px',
      color: '#5a3818', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(depth + 3).setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 280, delay: 160 });

    const niloLine = this.add.text(640, 335, this.room.success.niloLine, {
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: '24px', color: '#2a1f12'
    }).setOrigin(0.5).setDepth(depth + 3).setAlpha(0);

    const bramLine = this.add.text(640, 395, this.room.success.bramLine, {
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: '22px', color: '#3a2a1a'
    }).setOrigin(0.5).setDepth(depth + 3).setAlpha(0);

    this.tweens.add({ targets: [niloLine, bramLine], alpha: 1, duration: 300, delay: 220 });

    // Sprite back button: real button image + label, hand cursor on hover.
    this.makeSpriteButton(640, 510, 'Return to menu', depth + 4, () => this.exitToMenu());
    void [panel, banner, niloPortrait, bramPortrait];
  }

  private makeSpriteButton(
    cx: number, cy: number, label: string, depth: number, onClick: () => void
  ) {
    const btn = this.add.image(cx - 110, cy, GridAssets.BTN_BACK)
      .setScale(0.6).setDepth(depth);
    const text = this.add.text(cx + 8, cy, label, {
      fontFamily: 'Georgia, serif', fontSize: '22px',
      color: '#2a1f12', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(depth);
    const hit = this.add.zone(cx, cy, 280, 60)
      .setInteractive({ useHandCursor: true }).setDepth(depth);
    hit.on('pointerover', () => { btn.setScale(0.66); text.setScale(1.04); });
    hit.on('pointerout',  () => { btn.setScale(0.6);  text.setScale(1);    });
    hit.on('pointerdown', onClick);
  }

  private showSuccessProcedural(depth: number) {
    const panel = this.add.graphics().setDepth(depth + 1);
    panel.fillStyle(Palette.parchment, 0.97);
    panel.lineStyle(4, Palette.parchmentDark, 1);
    panel.fillRoundedRect(360, 220, 560, 260, 20);
    panel.strokeRoundedRect(360, 220, 560, 260, 20);
    panel.lineStyle(2, Palette.gold, 0.55);
    panel.strokeRoundedRect(372, 232, 536, 236, 16);

    this.add.text(640, 260, this.room.success.title, {
      fontFamily: 'Georgia, serif', fontSize: '28px',
      color: '#7a4a18', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(depth + 2);

    this.add.text(640, 312, `${this.room.success.niloLine}   — Nilo`, {
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: '22px', color: '#2a1f12'
    }).setOrigin(0.5).setDepth(depth + 2);

    this.add.text(640, 350, `${this.room.success.bramLine}   — Bram`, {
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: '22px', color: '#2a1f12'
    }).setOrigin(0.5).setDepth(depth + 2);

    this.makeButton(480, 408, 320, 50, 'Return to menu', depth + 2, () => this.exitToMenu());
  }

  private makeButton(
    x: number, y: number, w: number, h: number,
    label: string, depth: number, onClick: () => void
  ) {
    const bg = this.add.graphics().setDepth(depth);
    bg.fillStyle(Palette.bark, 0.95);
    bg.lineStyle(3, Palette.gold, 0.9);
    bg.fillRoundedRect(x, y, w, h, 14);
    bg.strokeRoundedRect(x, y, w, h, 14);
    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#ffe9ad'
    }).setOrigin(0.5).setDepth(depth);
    const hit = this.add.zone(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true }).setDepth(depth);
    hit.on('pointerover', () => text.setScale(1.04));
    hit.on('pointerout',  () => text.setScale(1));
    hit.on('pointerdown', onClick);
    return { destroy() { bg.destroy(); text.destroy(); hit.destroy(); } };
  }

  /** Stop ambient + transition back to menu. Shared exit path. */
  private exitToMenu() {
    AudioManager.stop(AudioKeys.AMBIENT_RATTLEWOOD);
    this.scene.start('MenuScene');
  }

  // ─── backdrop ─────────────────────────────────────────────────────────────

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

  // ─── coordinates ─────────────────────────────────────────────────────────

  private tileToWorld(gx: number, gy: number): { x: number; y: number } {
    return {
      x: this.gridOriginX + gx * TILE + TILE / 2,
      y: this.gridOriginY + gy * TILE + TILE / 2
    };
  }
}
