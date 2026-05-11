import Phaser from 'phaser';
import { Palette } from '../game/palette';
import { Bram } from '../game/Bram';
import {
  drawHumanBram,
  drawAlienNilo,
  drawHumanNilo,
  drawOwl
} from '../game/characters';

type PanelFn = (c: Phaser.GameObjects.Container) => void;

interface SpeechOptions {
  width?: number;
  height?: number;
  tail?: 'down-left' | 'down-right' | 'down' | 'none';
}

interface OrbOptions {
  scale?: number;
  crackle?: boolean;
  haloAlpha?: number;
}

export class PrologueScene extends Phaser.Scene {
  private panelIndex = 0;
  private panelContainer?: Phaser.GameObjects.Container;
  private advancing = false;
  private hintLabel!: Phaser.GameObjects.Text;
  private panels: PanelFn[] = [];

  // Panel 14 interactive repair state
  private repairActive = false;
  private repairComplete = false;
  private repairTilesLeft = 0;
  private repairTargets: Array<{ x: number; y: number; label: string }> = [];
  private repairHintLabel?: Phaser.GameObjects.Text;
  private repairDragHandler?: (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => void;
  private repairDragEndHandler?: (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => void;

  constructor() { super('PrologueScene'); }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0808);
    this.drawAmbientBackdrop();

    this.hintLabel = this.add.text(640, 678, 'Space / Enter / click to continue   ·   M for menu', {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: '#7a5e2c'
    }).setOrigin(0.5);

    this.panels = [
      (c) => this.panelCoastalHouse(c),
      (c) => this.panelSleeping(c),
      (c) => this.panelFlash(c),
      (c) => this.panelOrbOverWater(c),
      (c) => this.panelOrbBouncing(c),
      (c) => this.panelOrbTurns(c),
      (c) => this.panelClinkDownstairs(c),
      (c) => this.panelGettingDressed(c),
      (c) => this.panelHallway(c),
      (c) => this.panelPeekKitchen(c),
      (c) => this.panelReveal(c),
      (c) => this.panelNiloNotices(c),
      (c) => this.panelBrokenVisions(c),
      (c) => this.panelFirstRepair(c),
      (c) => this.panelTheWorldCalls(c),
      (c) => this.panelGivingHimself(c),
      (c) => this.panelSkeleton(c),
      (c) => this.panelNiloHuman(c),
      (c) => this.panelOwlArrives(c),
      (c) => this.panelTogether(c)
    ];

    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());
    this.input.keyboard?.on('keydown-RIGHT', () => this.advance());
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));
    this.input.on('pointerdown', () => this.advance());

    this.renderPanel(0);
  }

  // ---------- flow ----------

  private advance() {
    if (this.advancing) return;
    if (this.repairActive && !this.repairComplete) return;
    if (this.panelIndex >= this.panels.length - 1) {
      this.finish();
      return;
    }
    this.advancing = true;
    if (this.panelContainer) {
      this.tweens.add({
        targets: this.panelContainer,
        alpha: 0,
        duration: 240,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.panelIndex += 1;
          this.renderPanel(this.panelIndex);
          this.advancing = false;
        }
      });
    } else {
      this.panelIndex += 1;
      this.renderPanel(this.panelIndex);
      this.advancing = false;
    }
  }

  private finish() {
    this.advancing = true;
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('IntroScene');
    });
  }

  private renderPanel(index: number) {
    this.teardownRepair();
    this.panelContainer?.destroy();
    const c = this.add.container(0, 0);
    this.panelContainer = c;
    this.drawPanelFrame(c);
    this.panels[index](c);
    this.drawPageMarker(c, index);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 380, ease: 'Quad.easeOut' });
  }

  private teardownRepair() {
    if (this.repairDragHandler) {
      this.input.off('drag', this.repairDragHandler);
      this.repairDragHandler = undefined;
    }
    if (this.repairDragEndHandler) {
      this.input.off('dragend', this.repairDragEndHandler);
      this.repairDragEndHandler = undefined;
    }
    this.repairActive = false;
    this.repairComplete = false;
    this.repairTilesLeft = 0;
    this.repairTargets = [];
    this.repairHintLabel = undefined;
  }

  private drawPageMarker(c: Phaser.GameObjects.Container, index: number) {
    const t = this.add.text(1212, 50, `${index + 1} / ${this.panels.length}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#a08866'
    }).setOrigin(1, 0);
    c.add(t);
  }

  // ---------- frame and ambience ----------

  private drawAmbientBackdrop() {
    const g = this.add.graphics();
    g.fillStyle(0x0a0808, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 50; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.03, 0.12));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 3));
    }
  }

  private drawPanelFrame(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a140d, 1);
    g.fillRoundedRect(40, 40, 1200, 600, 20);
    g.lineStyle(3, Palette.parchmentDark, 0.85);
    g.strokeRoundedRect(40, 40, 1200, 600, 20);
    g.lineStyle(2, Palette.gold, 0.4);
    g.strokeRoundedRect(54, 54, 1172, 572, 16);
    c.add(g);
  }

  // ---------- text helpers ----------

  private addCaption(c: Phaser.GameObjects.Container, text: string) {
    const bg = this.add.graphics();
    bg.fillStyle(Palette.parchment, 0.96);
    bg.lineStyle(3, Palette.parchmentDark, 1);
    bg.fillRoundedRect(80, 540, 1120, 62, 12);
    bg.strokeRoundedRect(80, 540, 1120, 62, 12);
    const t = this.add.text(640, 571, text, {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '22px',
      color: '#3b2b16',
      align: 'center',
      wordWrap: { width: 1080 }
    }).setOrigin(0.5);
    c.add([bg, t]);
  }

  private addFooter(c: Phaser.GameObjects.Container, text: string) {
    const t = this.add.text(640, 612, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      color: '#ffdf7a',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    c.add(t);
  }

  private addSpeechBubble(c: Phaser.GameObjects.Container, x: number, y: number, speaker: string, text: string, opts: SpeechOptions = {}) {
    const w = opts.width ?? 300;
    const h = opts.height ?? 80;
    const tail = opts.tail ?? 'down';
    const bg = this.add.graphics();
    bg.fillStyle(0xfff8e0, 0.96);
    bg.lineStyle(3, 0x4a3a26, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    if (tail !== 'none') {
      bg.fillStyle(0xfff8e0, 0.96);
      bg.lineStyle(3, 0x4a3a26, 1);
      let tipX = x;
      if (tail === 'down-left') tipX = x - 30;
      if (tail === 'down-right') tipX = x + 30;
      const baseLeft = tipX - 12;
      const baseRight = tipX + 12;
      const baseY = y + h / 2 - 1;
      const tipY = y + h / 2 + 20;
      bg.fillTriangle(baseLeft, baseY, baseRight, baseY, tipX, tipY);
      bg.lineBetween(baseLeft, baseY, tipX, tipY);
      bg.lineBetween(baseRight, baseY, tipX, tipY);
    }
    const sp = this.add.text(x, y - h / 2 + 14, speaker, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#7a4a18',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    const tx = this.add.text(x, y + 6, text, {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      color: '#2a1f12',
      wordWrap: { width: w - 28 },
      align: 'center'
    }).setOrigin(0.5);
    c.add([bg, sp, tx]);
  }

  // ---------- shared visual helpers ----------

  private drawOceanBackdrop(c: Phaser.GameObjects.Container, opts: { moonX?: number; moonY?: number; horizonY?: number; sky?: number; water?: number } = {}) {
    const moonX = opts.moonX ?? 1000;
    const moonY = opts.moonY ?? 200;
    const horizonY = opts.horizonY ?? 320;
    const sky = opts.sky ?? 0x16223a;
    const water = opts.water ?? 0x0e1a2e;
    const g = this.add.graphics();
    // sky
    g.fillStyle(sky, 1).fillRect(80, 80, 1120, horizonY - 80);
    // stars
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xfff5d8, Phaser.Math.FloatBetween(0.25, 0.85));
      g.fillCircle(80 + Math.random() * 1120, 90 + Math.random() * (horizonY - 110), Phaser.Math.FloatBetween(0.5, 1.6));
    }
    // moon
    g.fillStyle(0xfff5d8, 0.22).fillCircle(moonX, moonY, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(moonX, moonY, 34);
    g.fillStyle(sky, 1).fillCircle(moonX - 6, moonY - 8, 28);
    // water base
    g.fillStyle(water, 1).fillRect(80, horizonY, 1120, 530 - horizonY);
    // horizon line + faint band
    g.lineStyle(2, 0x3a4860, 0.6).lineBetween(80, horizonY, 1200, horizonY);
    g.fillStyle(0x3a4860, 0.3).fillRect(80, horizonY, 1120, 14);
    // ripples
    for (let i = 0; i < 50; i++) {
      g.fillStyle(0x4a78a8, Phaser.Math.FloatBetween(0.1, 0.32));
      const yy = horizonY + 14 + Math.random() * (530 - horizonY - 14);
      const len = Phaser.Math.Between(40, 110);
      const xx = 80 + Math.random() * (1120 - len);
      g.fillRoundedRect(xx, yy, len, 2, 1);
    }
    // moonlight reflection on water
    g.fillStyle(0xfff5d8, 0.18);
    for (let i = 0; i < 14; i++) {
      const reflY = horizonY + 6 + i * 14;
      const reflW = 80 + i * 6;
      g.fillRoundedRect(moonX - reflW / 2, reflY, reflW, 3, 1);
    }
    c.add(g);
  }

  private drawOrb(c: Phaser.GameObjects.Container, x: number, y: number, opts: OrbOptions = {}): Phaser.GameObjects.Graphics {
    const sc = opts.scale ?? 1;
    const haloA = opts.haloAlpha ?? 0.16;
    const crackle = opts.crackle !== false;
    const g = this.add.graphics();
    g.fillStyle(0x6fb5e8, haloA).fillCircle(x, y, 70 * sc);
    g.fillStyle(0x9cd0f0, haloA * 1.6).fillCircle(x, y, 44 * sc);
    g.fillStyle(0xc8e6ff, 0.7).fillCircle(x, y, 22 * sc);
    g.fillStyle(0xeaf6ff, 1).fillCircle(x, y, 14 * sc);
    g.fillStyle(0xffffff, 1).fillCircle(x, y, 7 * sc);
    if (crackle) {
      g.lineStyle(2, 0xeaf6ff, 0.9);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Phaser.Math.FloatBetween(0, 0.4);
        const r1 = 18 * sc;
        const r2 = (32 + Math.random() * 12) * sc;
        const x1 = x + Math.cos(a) * r1;
        const y1 = y + Math.sin(a) * r1;
        const xm = x + Math.cos(a) * ((r1 + r2) / 2) + Phaser.Math.FloatBetween(-6, 6);
        const ym = y + Math.sin(a) * ((r1 + r2) / 2) + Phaser.Math.FloatBetween(-6, 6);
        const x2 = x + Math.cos(a) * r2;
        const y2 = y + Math.sin(a) * r2;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(xm, ym);
        g.lineTo(x2, y2);
        g.strokePath();
      }
    }
    c.add(g);
    this.tweens.add({ targets: g, alpha: 0.7, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    return g;
  }

  private drawBedroomBackdrop(c: Phaser.GameObjects.Container, flash = false) {
    const wallColor = flash ? 0x6fb5e8 : 0x1c1a2a;
    const g = this.add.graphics();
    g.fillStyle(wallColor, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    if (flash) {
      g.fillStyle(0xeaf6ff, 0.4).fillRect(80, 80, 1120, 380);
    }
    c.add(g);
  }

  private drawKitchenBackdrop(c: Phaser.GameObjects.Container, opts: { mist?: number } = {}) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // counter
    g.fillStyle(0x3a2818, 1).fillRoundedRect(120, 360, 1040, 110, 8);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(120, 350, 1040, 18, 4);
    // cabinets above
    g.fillStyle(0x2a1a12, 1).fillRoundedRect(160, 130, 880, 150, 8);
    for (let i = 0; i < 5; i++) {
      g.lineStyle(2, 0x1a1008, 1).lineBetween(160 + i * 176, 130, 160 + i * 176, 280);
    }
    if (opts.mist !== undefined) {
      g.fillStyle(0x6fb5e8, opts.mist).fillRect(80, 80, 1120, 380);
    }
    c.add(g);
  }

  private drawBrokenClockOnCounter(c: Phaser.GameObjects.Container, x: number, y: number, opts: { numbers?: boolean; ticking?: boolean } = {}) {
    const g = this.add.graphics();
    g.fillStyle(Palette.parchment, 0.94).fillCircle(x, y, 34);
    g.lineStyle(3, Palette.parchmentDark, 1).strokeCircle(x, y, 34);
    if (opts.numbers !== false) {
      const positions: Array<[number, string]> = [[0, '12'], [Math.PI / 2, '3'], [Math.PI, '6'], [-Math.PI / 2, '9']];
      positions.forEach(([a, label]) => {
        const tx = x + Math.sin(a) * 22;
        const ty = y - Math.cos(a) * 22;
        const t = this.add.text(tx, ty, label, {
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          color: '#3b2b16',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        c.add(t);
      });
    }
    g.lineStyle(2, 0x1a1410, 1);
    g.lineBetween(x, y, x, y - 18);
    g.lineBetween(x, y, x + (opts.ticking ? 14 : -10), y + (opts.ticking ? -4 : 8));
    if (!opts.ticking) {
      g.lineStyle(2, 0x6a4030, 0.7);
      g.lineBetween(x - 18, y - 12, x - 4, y + 6);
      g.lineBetween(x + 4, y + 26, x + 16, y + 8);
    }
    c.add(g);
  }

  private drawFadingPlant(c: Phaser.GameObjects.Container, x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x3a2818, 1).fillRoundedRect(x - 22, y, 44, 26, 4);
    g.fillStyle(0x5b6a3a, 0.7);
    g.fillEllipse(x - 14, y - 6, 18, 22);
    g.fillEllipse(x + 12, y - 4, 16, 20);
    g.fillStyle(0x7a5e2c, 0.85);
    g.fillEllipse(x, y - 14, 12, 16);
    c.add(g);
  }

  private drawFloatingSpoon(c: Phaser.GameObjects.Container, x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0xcfd6df, 1).fillRoundedRect(x - 3, y - 14, 6, 30, 2);
    g.fillStyle(0xcfd6df, 1).fillEllipse(x, y - 18, 14, 16);
    g.fillStyle(0xeaf6ff, 0.6).fillEllipse(x, y, 36, 6);
    c.add(g);
    this.tweens.add({ targets: g, y: -6, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });
  }

  private drawTremblingGlass(c: Phaser.GameObjects.Container, x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0xa8d0e8, 0.45).fillRoundedRect(x - 12, y - 30, 24, 36, 4);
    g.lineStyle(2, 0xc8e6ff, 0.85).strokeRoundedRect(x - 12, y - 30, 24, 36, 4);
    g.fillStyle(0x4a78a8, 0.5).fillRoundedRect(x - 10, y - 10, 20, 14, 3);
    c.add(g);
    this.tweens.add({ targets: g, x: 2, yoyo: true, repeat: -1, duration: 90, ease: 'Linear' });
  }

  // ---------- panels ----------

  private panelCoastalHouse(c: Phaser.GameObjects.Container) {
    this.drawOceanBackdrop(c, { moonX: 940, moonY: 200, horizonY: 320 });

    // cliff foreground
    const g = this.add.graphics();
    g.fillStyle(0x141812, 1).fillEllipse(360, 540, 720, 130);
    g.fillStyle(0x1a1f1a, 1).fillEllipse(360, 510, 600, 80);
    // tall grass tufts
    for (let i = 0; i < 12; i++) {
      const tx = 90 + i * 50;
      const ty = 470 + Math.sin(i) * 6;
      g.fillStyle(0x2a3520, 1);
      g.fillTriangle(tx - 3, ty + 10, tx + 3, ty + 10, tx, ty);
    }
    c.add(g);

    // little coastal house silhouette
    const house = this.add.graphics();
    // body
    house.fillStyle(0x2a1f15, 1).fillRoundedRect(220, 380, 200, 130, 4);
    // roof
    house.fillStyle(0x3a261a, 1);
    house.fillTriangle(200, 380, 440, 380, 320, 310);
    // chimney
    house.fillStyle(0x3a261a, 1).fillRect(360, 320, 22, 50);
    // windows lit (Bram's window)
    house.fillStyle(Palette.warmWindow, 0.7).fillRoundedRect(250, 408, 40, 40, 4);
    house.fillStyle(Palette.warmWindow, 0.4).fillRoundedRect(348, 410, 38, 36, 4);
    // door
    house.fillStyle(0x1a1008, 1).fillRoundedRect(308, 444, 28, 66, 3);
    c.add(house);

    // a few stars subtly above the house
    const sg = this.add.graphics();
    for (let i = 0; i < 10; i++) {
      sg.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.4, 0.85));
      sg.fillCircle(140 + i * 90, 110 + (i % 3) * 20, Phaser.Math.FloatBetween(0.6, 1.4));
    }
    c.add(sg);

    this.addCaption(c, 'Bram’s house by the sea.');
  }

  private panelSleeping(c: Phaser.GameObjects.Container) {
    this.drawBedroomBackdrop(c);
    const g = this.add.graphics();
    // window with moonlit ocean glimpse
    g.fillStyle(0x16223a, 1).fillRoundedRect(220, 130, 280, 220, 10);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(220, 130, 280, 220, 10);
    g.lineBetween(360, 130, 360, 350);
    g.lineBetween(220, 240, 500, 240);
    g.fillStyle(0x0e1a2e, 1).fillRect(220, 250, 280, 100);
    // moon
    g.fillStyle(0xfff5d8, 0.22).fillCircle(420, 200, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(420, 200, 30);
    g.fillStyle(0x16223a, 1).fillCircle(414, 192, 24);
    // moon reflection on water
    g.fillStyle(0xfff5d8, 0.25);
    for (let i = 0; i < 6; i++) g.fillRoundedRect(404 - i * 4, 264 + i * 12, 40 + i * 6, 2, 1);
    // bed
    g.fillStyle(0x3a2818, 1).fillRoundedRect(600, 380, 540, 92, 10);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(600, 350, 60, 100, 8);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(660, 332, 480, 56, 8);
    g.fillStyle(0x6f8b9d, 0.6).fillRoundedRect(670, 340, 460, 18, 6);
    g.fillStyle(0xf0e0c0, 1).fillRoundedRect(670, 316, 120, 36, 10);
    c.add(g);

    // skateboard against wall
    const sk = this.add.graphics();
    sk.fillStyle(Palette.ink, 1).fillRoundedRect(540, 410, 60, 12, 4);
    sk.fillStyle(0x111111, 1).fillCircle(552, 426, 6);
    sk.fillCircle(588, 426, 6);
    sk.lineStyle(2, Palette.bark, 1).strokeRoundedRect(540, 410, 60, 12, 4);
    c.add(sk);
    sk.setAngle(-72);
    sk.setPosition(540, 510);

    // Bram head on pillow (sleeping)
    const head = this.add.container(720, 322);
    const hg = this.add.graphics();
    hg.fillStyle(0xf2d2a8, 1).fillCircle(0, 0, 18);
    hg.lineStyle(2, 0x1a1410, 1);
    hg.lineBetween(-8, -2, -3, -2);
    hg.lineBetween(3, -2, 8, -2);
    hg.fillStyle(0x1a1410, 1).fillRect(-2, 6, 4, 1);
    hg.fillStyle(0x5b3a1a, 1);
    hg.fillEllipse(0, -14, 36, 16);
    hg.fillTriangle(-12, -16, -2, -28, 6, -16);
    head.add(hg);
    c.add(head);
    this.tweens.add({ targets: head, y: 320, yoyo: true, repeat: -1, duration: 2200, ease: 'Sine.easeInOut' });

    // bedside table + digital clock 2:17
    const t = this.add.graphics();
    t.fillStyle(0x4a3a2a, 1).fillRoundedRect(1080, 360, 130, 100, 8);
    t.lineStyle(2, 0x2a1f15, 1).strokeRoundedRect(1080, 360, 130, 100, 8);
    t.fillStyle(0x1a1410, 1).fillRoundedRect(1100, 384, 90, 40, 5);
    c.add(t);
    const clockTxt = this.add.text(1145, 402, '2:17', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ff5a3a',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    c.add(clockTxt);
    this.tweens.add({ targets: clockTxt, alpha: 0.6, yoyo: true, repeat: -1, duration: 800 });

    this.addCaption(c, 'Middle of the night.');
  }

  private panelFlash(c: Phaser.GameObjects.Container) {
    // bedroom under sudden blue flash
    this.drawBedroomBackdrop(c, true);
    const g = this.add.graphics();
    // window blown with blue-white light
    g.fillStyle(0xeaf6ff, 1).fillRoundedRect(220, 130, 280, 220, 10);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(220, 130, 280, 220, 10);
    g.lineBetween(360, 130, 360, 350);
    g.lineBetween(220, 240, 500, 240);
    // crackle radiating outward
    g.lineStyle(3, 0x9cd0f0, 0.85);
    for (let i = 0; i < 9; i++) {
      const a = Phaser.Math.FloatBetween(-Math.PI * 0.45, Math.PI * 0.45);
      const x1 = 360 + Math.cos(a) * 100;
      const y1 = 240 + Math.sin(a) * 100;
      const x2 = 360 + Math.cos(a) * 240;
      const y2 = 240 + Math.sin(a) * 240;
      g.lineBetween(x1, y1, x2, y2);
    }
    g.fillStyle(0xffffff, 0.55).fillCircle(360, 240, 64);
    // bed
    g.fillStyle(0x3a2818, 1).fillRoundedRect(600, 380, 540, 92, 10);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(660, 360, 480, 30, 8);
    g.fillStyle(0xf0e0c0, 1).fillRoundedRect(670, 354, 100, 22, 8);
    c.add(g);

    // Bram sitting up startled
    const bram = drawHumanBram(this, 760, 332, 0.6);
    c.add(bram);
    // motion lines around his head (startled)
    const m = this.add.graphics();
    m.lineStyle(2, 0xffe9ad, 0.85);
    m.lineBetween(800, 280, 818, 268);
    m.lineBetween(740, 270, 728, 256);
    m.lineBetween(780, 264, 780, 248);
    c.add(m);

    this.addCaption(c, 'A sudden flash.');
  }

  private panelOrbOverWater(c: Phaser.GameObjects.Container) {
    this.drawOceanBackdrop(c, { moonX: 980, moonY: 180, horizonY: 280 });

    // window frame foreground (we're "looking through")
    const frame = this.add.graphics();
    frame.fillStyle(0x1a140d, 0.85);
    frame.fillRect(80, 80, 1120, 36);
    frame.fillRect(80, 480, 1120, 50);
    frame.fillRect(80, 80, 36, 450);
    frame.fillRect(1164, 80, 36, 450);
    // mullion
    frame.fillStyle(0x2a1f15, 1).fillRect(636, 80, 8, 450);
    frame.fillRect(80, 290, 1120, 8);
    c.add(frame);

    // orb darting over water
    this.drawOrb(c, 460, 340, { scale: 1.1 });
    // trail
    const tg = this.add.graphics();
    tg.lineStyle(3, 0x9cd0f0, 0.55);
    tg.beginPath();
    tg.moveTo(820, 240);
    tg.lineTo(700, 280);
    tg.lineTo(580, 320);
    tg.lineTo(460, 340);
    tg.strokePath();
    for (let i = 0; i < 8; i++) {
      tg.fillStyle(0xc8e6ff, 0.35 - i * 0.04);
      const tx = 820 - i * 50;
      const ty = 240 + i * 14;
      tg.fillCircle(tx, ty, 5 - i * 0.4);
    }
    c.add(tg);

    // Bram silhouette at window from inside (bottom-right of frame)
    const head = this.add.container(1090, 460);
    const hg = this.add.graphics();
    hg.fillStyle(0xf2d2a8, 1).fillCircle(0, 0, 16);
    hg.fillStyle(0x1a1410, 1).fillCircle(-5, 0, 2);
    hg.fillStyle(0x5b3a1a, 1);
    hg.fillEllipse(0, -12, 32, 14);
    head.add(hg);
    c.add(head);

    this.addSpeechBubble(c, 1020, 160, 'Bram', 'Lightning doesn’t do that.', { width: 300, height: 70, tail: 'down-right' });
  }

  private panelOrbBouncing(c: Phaser.GameObjects.Container) {
    this.drawOceanBackdrop(c, { moonX: 1080, moonY: 160, horizonY: 260 });

    // three orb positions along a bouncing arc
    const positions: Array<{ x: number; y: number; scale: number }> = [
      { x: 240, y: 160, scale: 1.0 },
      { x: 560, y: 360, scale: 0.85 },
      { x: 920, y: 240, scale: 1.05 }
    ];
    // dotted trajectory
    const tg = this.add.graphics();
    tg.lineStyle(2, 0xc8e6ff, 0.5);
    const traj: Array<[number, number]> = [
      [120, 240], [200, 190], [240, 160], [320, 200], [400, 280],
      [480, 340], [560, 360], [640, 330], [720, 290], [820, 250], [920, 240], [1020, 270]
    ];
    for (let i = 0; i < traj.length - 1; i++) {
      tg.lineBetween(traj[i][0], traj[i][1], traj[i + 1][0], traj[i + 1][1]);
    }
    c.add(tg);

    positions.forEach((p, i) => {
      this.drawOrb(c, p.x, p.y, { scale: p.scale, haloAlpha: i === positions.length - 1 ? 0.2 : 0.12 });
    });

    // ripples on water surface from a bounce point
    const rg = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      rg.lineStyle(2, 0x9cd0f0, 0.5 - i * 0.1);
      rg.strokeEllipse(620, 380, 80 + i * 50, 14 + i * 6);
    }
    c.add(rg);

    this.addCaption(c, 'It moved like lightning…');
  }

  private panelOrbTurns(c: Phaser.GameObjects.Container) {
    this.drawOceanBackdrop(c, { moonX: 1080, moonY: 170, horizonY: 300 });

    // orb closer to shore, facing camera
    this.drawOrb(c, 760, 330, { scale: 1.4 });
    // light from orb sweeping toward foreground house
    const beam = this.add.graphics();
    beam.fillStyle(0xc8e6ff, 0.22);
    beam.fillTriangle(760, 330, 280, 480, 280, 540);
    beam.fillTriangle(760, 330, 360, 540, 280, 540);
    c.add(beam);

    // foreground window sill + Bram ducking down (just top of head + hands)
    const sill = this.add.graphics();
    sill.fillStyle(0x2a1f15, 1).fillRect(80, 470, 1120, 60);
    sill.fillStyle(0x3a2818, 1).fillRect(80, 462, 1120, 12);
    c.add(sill);
    // window frame edges
    const frame = this.add.graphics();
    frame.fillStyle(0x1a140d, 0.85);
    frame.fillRect(80, 80, 1120, 30);
    frame.fillRect(80, 80, 30, 460);
    frame.fillRect(1170, 80, 30, 460);
    c.add(frame);

    // Bram peeking eyes over the sill
    const eyes = this.add.graphics();
    eyes.fillStyle(0x5b3a1a, 1);
    eyes.fillEllipse(260, 460, 32, 14);
    eyes.fillTriangle(248, 460, 268, 442, 274, 462);
    eyes.fillStyle(0xf2d2a8, 1);
    eyes.fillEllipse(260, 466, 28, 14);
    eyes.fillStyle(0x1a1410, 1);
    eyes.fillCircle(254, 466, 2);
    eyes.fillCircle(266, 466, 2);
    c.add(eyes);

    this.addCaption(c, '…but lightning didn’t look back.');
  }

  private panelClinkDownstairs(c: Phaser.GameObjects.Container) {
    this.drawBedroomBackdrop(c);
    const g = this.add.graphics();
    // open door to dark hallway (left side)
    g.fillStyle(0x271a10, 1).fillRoundedRect(120, 130, 240, 360, 8);
    g.fillStyle(0x1a120a, 1).fillRoundedRect(135, 145, 210, 330, 6);
    // floor edge
    g.fillStyle(0x3a2818, 1).fillRect(120, 470, 240, 20);
    // bedside lamp soft glow
    g.fillStyle(Palette.warmWindow, 0.16).fillCircle(900, 240, 180);
    g.fillStyle(0x4a3a2a, 1).fillRoundedRect(880, 340, 60, 100, 8);
    g.fillStyle(Palette.warmWindow, 0.85).fillCircle(910, 320, 28);
    // bed
    g.fillStyle(0x3a2818, 1).fillRoundedRect(420, 380, 440, 90, 10);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(460, 362, 380, 30, 8);
    c.add(g);

    // SFX "clink…" coming from doorway
    const sfx = this.add.text(170, 200, 'clink…', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '34px',
      color: '#ffdf7a'
    });
    c.add(sfx);
    this.tweens.add({ targets: sfx, alpha: 0.4, yoyo: true, repeat: -1, duration: 600 });

    // Bram sitting up, head turned toward doorway
    const bram = drawHumanBram(this, 600, 370, 0.7);
    c.add(bram);

    this.addCaption(c, 'A sound downstairs.');
  }

  private panelGettingDressed(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x231f30, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // soft lamp
    g.fillStyle(Palette.warmWindow, 0.18).fillCircle(280, 220, 160);
    g.fillStyle(0x4a3a2a, 1).fillRoundedRect(260, 320, 60, 100, 8);
    g.fillStyle(Palette.warmWindow, 0.85).fillCircle(290, 300, 28);
    // bed
    g.fillStyle(0x3a2818, 1).fillRoundedRect(620, 400, 540, 80, 10);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(670, 380, 480, 30, 8);
    c.add(g);

    const bram = drawHumanBram(this, 540, 400, 1.4);
    c.add(bram);
    const motion = this.add.graphics();
    motion.lineStyle(2, Palette.parchmentDark, 0.6);
    motion.lineBetween(440, 320, 460, 340);
    motion.lineBetween(610, 320, 590, 340);
    motion.lineBetween(530, 290, 530, 320);
    c.add(motion);
    // shirt + shorts pile on bed
    const pile = this.add.graphics();
    pile.fillStyle(0x6b8f4a, 1).fillRoundedRect(820, 370, 60, 14, 4);
    pile.fillStyle(0x3a2a1a, 1).fillRoundedRect(900, 374, 50, 10, 4);
    c.add(pile);

    this.addCaption(c, 'He got dressed because being dressed felt braver.');
  }

  private panelHallway(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x3a2818, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x271a10, 1).fillRect(80, 80, 1120, 70);
    g.fillStyle(0x1a120a, 1).fillRect(80, 460, 1120, 70);
    g.fillStyle(0x4a3018, 1).fillRect(80, 380, 1120, 80);
    for (let x = 100; x < 1200; x += 90) {
      g.lineStyle(2, 0x2a1808, 0.55).lineBetween(x, 380, x, 460);
    }
    // pictures + sconce
    for (let i = 0; i < 4; i++) {
      const fx = 200 + i * 250;
      g.fillStyle(0x2a1a10, 1).fillRoundedRect(fx, 170, 100, 80, 6);
      g.fillStyle(Palette.parchment, 0.55).fillRoundedRect(fx + 8, 178, 84, 64, 4);
    }
    g.fillStyle(Palette.warmWindow, 0.18).fillCircle(1050, 280, 90);
    g.fillStyle(Palette.warmWindow, 0.9).fillCircle(1050, 280, 12);
    c.add(g);

    // blue flicker spilling from far doorway
    const flicker = this.add.graphics();
    flicker.fillStyle(0x6fb5e8, 0.32).fillEllipse(1170, 380, 80, 220);
    flicker.fillStyle(0x9cd0f0, 0.18).fillEllipse(1170, 380, 160, 320);
    c.add(flicker);
    this.tweens.add({ targets: flicker, alpha: 0.6, yoyo: true, repeat: -1, duration: 480 });

    const bram = drawHumanBram(this, 540, 410, 1.1);
    c.add(bram);

    this.addCaption(c, 'He followed the sound.');
  }

  private panelPeekKitchen(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x231a14, 1).fillRect(80, 80, 480, 450);
    g.fillStyle(0x1a2638, 1).fillRect(560, 80, 640, 450);
    g.fillStyle(0x1a120a, 1).fillRect(540, 80, 30, 450);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // counter slice visible
    g.fillStyle(0x3a2818, 1).fillRoundedRect(580, 380, 600, 80, 6);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(580, 372, 600, 14, 4);
    // blue mist
    g.fillStyle(0x6fb5e8, 0.22).fillCircle(820, 320, 200);
    g.fillStyle(0x6fb5e8, 0.12).fillCircle(820, 320, 320);
    c.add(g);

    // wrong-but-ordinary kitchen details
    this.drawFloatingSpoon(c, 740, 230);
    this.drawTremblingGlass(c, 980, 350);
    this.drawBrokenClockOnCounter(c, 870, 200, { numbers: false });
    this.drawFadingPlant(c, 1080, 350);

    // Bram peeking head from the corner (left side)
    const peek = this.add.container(530, 320);
    const pg = this.add.graphics();
    pg.fillStyle(0xf2d2a8, 1).fillCircle(0, 0, 18);
    pg.fillStyle(0x1a1410, 1).fillCircle(6, 0, 2);
    pg.fillStyle(0x5b3a1a, 1);
    pg.fillEllipse(0, -14, 36, 16);
    pg.fillTriangle(-12, -16, 0, -28, 8, -16);
    peek.add(pg);
    c.add(peek);

    this.addCaption(c, 'He peeked around the corner.');
  }

  private panelReveal(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.14 });
    // broken clock with no numbers
    this.drawBrokenClockOnCounter(c, 870, 360, { numbers: false });
    // Nilo (alien) hovering over the clock, reaching toward it but cannot touch
    const nilo = drawAlienNilo(this, 780, 290, 1.0);
    c.add(nilo);
    // a faint blue "almost reaching" line that fizzles before contact
    const fizz = this.add.graphics();
    fizz.lineStyle(2, 0xc8e6ff, 0.7);
    fizz.lineBetween(810, 330, 850, 350);
    fizz.lineBetween(810, 330, 820, 348);
    fizz.fillStyle(0xeaf6ff, 0.7).fillCircle(845, 352, 3);
    c.add(fizz);
    this.tweens.add({ targets: fizz, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });

    // Bram peeking at far left
    const peek = this.add.container(180, 380);
    const pg = this.add.graphics();
    pg.fillStyle(0xf2d2a8, 1).fillCircle(0, 0, 16);
    pg.fillStyle(0x1a1410, 1).fillCircle(5, 0, 1.8);
    pg.fillStyle(0x5b3a1a, 1);
    pg.fillEllipse(0, -12, 32, 14);
    peek.add(pg);
    c.add(peek);

    this.addSpeechBubble(c, 740, 160, 'Nilo', 'Hold… please hold…', { width: 280, height: 70, tail: 'down-right' });
  }

  private panelNiloNotices(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.16 });
    // Nilo turned a bit toward Bram
    const nilo = drawAlienNilo(this, 820, 300, 1.05);
    c.add(nilo);
    // Bram stepping out from the corner
    const bram = drawHumanBram(this, 280, 420, 1.3);
    c.add(bram);

    // three speech bubbles stacked
    this.addSpeechBubble(c, 540, 130, 'Nilo', 'You can touch.', { width: 240, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 220, 220, 'Bram', 'You’re not supposed to be in here.', { width: 320, height: 80, tail: 'down' });
    this.addSpeechBubble(c, 620, 310, 'Nilo', 'I am not supposed to be anywhere.', { width: 340, height: 80, tail: 'down-right' });
  }

  private panelBrokenVisions(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.18 });
    const nilo = drawAlienNilo(this, 240, 380, 0.95);
    c.add(nilo);
    const bram = drawHumanBram(this, 1060, 420, 1.1);
    c.add(bram);

    // floating vision icons around the center
    const visions: Array<{ kind: 'bridge' | 'tower' | 'garden' | 'market' | 'loop'; x: number; y: number }> = [
      { kind: 'bridge', x: 460, y: 260 },
      { kind: 'tower',  x: 600, y: 180 },
      { kind: 'garden', x: 760, y: 260 },
      { kind: 'market', x: 880, y: 200 },
      { kind: 'loop',   x: 720, y: 360 }
    ];
    visions.forEach((v, i) => {
      const obj = this.drawVisionIcon(v.kind, v.x, v.y);
      c.add(obj);
      this.tweens.add({ targets: obj, y: v.y - 10, yoyo: true, repeat: -1, duration: 1400 + i * 120, ease: 'Sine.easeInOut' });
    });

    this.addSpeechBubble(c, 460, 110, 'Nilo', 'This world is coming apart.', { width: 320, height: 70, tail: 'down-left' });
    this.addSpeechBubble(c, 1010, 250, 'Bram', 'What are you?', { width: 240, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 360, 420, 'Nilo', 'Potential. Too much potential.', { width: 320, height: 80, tail: 'down-right' });
  }

  private drawVisionIcon(kind: 'bridge' | 'tower' | 'garden' | 'market' | 'loop', x: number, y: number): Phaser.GameObjects.Container {
    const cn = this.add.container(x, y);
    const ring = this.add.graphics();
    ring.fillStyle(0x6fb5e8, 0.22).fillCircle(0, 0, 44);
    ring.lineStyle(2, 0xc8e6ff, 0.7).strokeCircle(0, 0, 38);
    cn.add(ring);
    const g = this.add.graphics();
    if (kind === 'bridge') {
      g.fillStyle(Palette.bark, 1).fillRoundedRect(-26, -2, 52, 8, 3);
      g.lineStyle(2, Palette.parchmentDark, 1).strokeRoundedRect(-26, -2, 52, 8, 3);
      g.lineStyle(2, Palette.bark, 1);
      g.beginPath(); g.arc(0, 8, 26, Math.PI, 0, false); g.strokePath();
    } else if (kind === 'tower') {
      g.fillStyle(0x3a261a, 1).fillRoundedRect(-9, -22, 18, 38, 3);
      g.fillStyle(Palette.parchment, 0.9).fillCircle(0, -22, 9);
      g.lineStyle(2, 0x1a1410, 1).strokeCircle(0, -22, 9);
      g.lineBetween(0, -22, 0, -28);
      g.lineBetween(0, -22, 5, -18);
    } else if (kind === 'garden') {
      g.fillStyle(0x5b7a3a, 1).fillEllipse(-10, 4, 20, 22);
      g.fillStyle(0x7a9a4a, 1).fillEllipse(10, 0, 22, 24);
      g.fillStyle(Palette.gold, 0.9).fillCircle(2, -8, 5);
    } else if (kind === 'market') {
      g.fillStyle(0xc26a4a, 1).fillTriangle(-26, 14, 26, 14, 0, -18);
      g.fillStyle(0x3a2818, 1).fillRect(-22, 14, 44, 4);
    } else {
      g.lineStyle(3, Palette.gold, 0.9);
      g.beginPath(); g.arc(-10, 0, 14, 0, Math.PI * 2, false); g.strokePath();
      g.beginPath(); g.arc(10, 0, 14, 0, Math.PI * 2, false); g.strokePath();
    }
    cn.add(g);
    return cn;
  }

  private panelFirstRepair(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.12 });
    const cx = 640;
    const cy = 280;

    // empty clock face (no numbers, no hands yet)
    const face = this.add.graphics();
    face.fillStyle(Palette.parchment, 0.96).fillCircle(cx, cy, 92);
    face.lineStyle(5, Palette.parchmentDark, 1).strokeCircle(cx, cy, 92);
    face.lineStyle(3, Palette.gold, 0.65).strokeCircle(cx, cy, 82);
    // anchor notches as drop hints
    const anchors = [
      { x: cx, y: cy - 60 },
      { x: cx + 60, y: cy },
      { x: cx, y: cy + 60 },
      { x: cx - 60, y: cy }
    ];
    anchors.forEach(a => {
      face.fillStyle(Palette.parchmentDark, 0.35).fillCircle(a.x, a.y, 22);
      face.lineStyle(2, Palette.parchmentDark, 0.55).strokeCircle(a.x, a.y, 22);
    });
    // tiny minute ticks around the rim
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      const x1 = cx + Math.cos(a) * 76;
      const y1 = cy + Math.sin(a) * 76;
      const x2 = cx + Math.cos(a) * 82;
      const y2 = cy + Math.sin(a) * 82;
      face.lineStyle(2, Palette.boneShadow, 0.7).lineBetween(x1, y1, x2, y2);
    }
    // ghost center boss
    face.fillStyle(Palette.gold, 0.45).fillCircle(cx, cy, 5);
    c.add(face);

    // Nilo on the right (always visible during repair)
    const nilo = drawAlienNilo(this, 980, 320, 0.95);
    c.add(nilo);

    // prompt + hint slot above the clock
    const prompt = this.add.text(cx, 140, 'Place 12, 3, 6, and 9 to anchor the clock.', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '20px',
      color: '#ffe9ad'
    }).setOrigin(0.5);
    c.add(prompt);
    this.repairHintLabel = this.add.text(cx, 172, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      color: '#ffdf7a'
    }).setOrigin(0.5);
    c.add(this.repairHintLabel);

    this.startRepair(c);
  }

  // ---------- interactive repair ----------

  private startRepair(panel: Phaser.GameObjects.Container) {
    const cx = 640;
    const cy = 280;
    this.repairActive = true;
    this.repairComplete = false;
    this.repairTargets = [
      { x: cx,      y: cy - 60, label: '12' },
      { x: cx + 60, y: cy,      label: '3'  },
      { x: cx,      y: cy + 60, label: '6'  },
      { x: cx - 60, y: cy,      label: '9'  }
    ];
    this.repairTilesLeft = this.repairTargets.length;

    const startPositions = Phaser.Utils.Array.Shuffle([
      { x: 220, y: 440 },
      { x: 320, y: 440 },
      { x: 420, y: 440 },
      { x: 520, y: 440 }
    ]) as Array<{ x: number; y: number }>;

    this.repairTargets.forEach((target, i) => {
      const tile = this.makeRepairTile(target.label, startPositions[i].x, startPositions[i].y, i);
      panel.add(tile);
    });

    this.repairDragHandler = (_pointer, gameObject, dragX, dragY) => {
      const obj = gameObject as Phaser.GameObjects.Container;
      if (!obj.getData || obj.getData('placed')) return;
      obj.x = dragX;
      obj.y = dragY;
    };
    this.repairDragEndHandler = (_pointer, gameObject) => {
      const obj = gameObject as Phaser.GameObjects.Container;
      if (!obj.getData || obj.getData('placed')) return;
      this.evaluateTilePlacement(obj, panel);
    };
    this.input.on('drag', this.repairDragHandler);
    this.input.on('dragend', this.repairDragEndHandler);
  }

  private makeRepairTile(label: string, x: number, y: number, targetIndex: number): Phaser.GameObjects.Container {
    const tile = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(Palette.parchment, 1).fillCircle(0, 0, 30);
    bg.lineStyle(4, Palette.parchmentDark, 1).strokeCircle(0, 0, 30);
    bg.lineStyle(2, Palette.gold, 0.75).strokeCircle(0, 0, 24);
    const t = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#3b2b16',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    tile.add([bg, t]);
    tile.setSize(64, 64);
    tile.setInteractive(new Phaser.Geom.Circle(0, 0, 34), Phaser.Geom.Circle.Contains);
    this.input.setDraggable(tile);
    tile.setData('startX', x);
    tile.setData('startY', y);
    tile.setData('targetIndex', targetIndex);
    tile.setData('placed', false);
    this.tweens.add({ targets: tile, scale: 1.06, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    return tile;
  }

  private evaluateTilePlacement(tile: Phaser.GameObjects.Container, panel: Phaser.GameObjects.Container) {
    const targetIndex = tile.getData('targetIndex') as number;
    const target = this.repairTargets[targetIndex];
    const dx = tile.x - target.x;
    const dy = tile.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const THRESHOLD = 70; // generous hit zone for kids
    if (dist <= THRESHOLD) {
      this.tweens.killTweensOf(tile);
      tile.setData('placed', true);
      tile.disableInteractive();
      tile.setScale(1);
      this.tweens.add({
        targets: tile,
        x: target.x,
        y: target.y,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.spawnTickEffect(target.x, target.y, panel);
          this.repairTilesLeft -= 1;
          if (this.repairTilesLeft <= 0) this.onRepairComplete(panel);
        }
      });
    } else {
      this.tweens.add({
        targets: tile,
        x: tile.getData('startX') as number,
        y: tile.getData('startY') as number,
        duration: 320,
        ease: 'Quad.easeInOut'
      });
      this.showRepairHint('Clocks keep 12 at the top.');
    }
  }

  private spawnTickEffect(x: number, y: number, panel: Phaser.GameObjects.Container) {
    const tick = this.add.text(x + 28, y - 26, 'tick', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '16px',
      color: '#ffdf7a'
    });
    panel.add(tick);
    this.tweens.add({
      targets: tick,
      y: tick.y - 28,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => tick.destroy()
    });
    for (let i = 0; i < 6; i++) {
      const s = this.add.text(x, y, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#ffdf7a'
      }).setOrigin(0.5);
      panel.add(s);
      const angle = (i / 6) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
      this.tweens.add({
        targets: s,
        x: x + Math.cos(angle) * 34,
        y: y + Math.sin(angle) * 34,
        alpha: 0,
        duration: 540,
        ease: 'Quad.easeOut',
        onComplete: () => s.destroy()
      });
    }
  }

  private showRepairHint(text: string) {
    if (!this.repairHintLabel) return;
    this.tweens.killTweensOf(this.repairHintLabel);
    this.repairHintLabel.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.repairHintLabel,
      alpha: 0,
      delay: 1800,
      duration: 500,
      onComplete: () => this.repairHintLabel?.setText('')
    });
  }

  private onRepairComplete(panel: Phaser.GameObjects.Container) {
    const cx = 640;
    const cy = 280;

    // hide the prompt/hint slot
    if (this.repairHintLabel) this.repairHintLabel.setText('');

    // warm halo behind the clock
    const glow = this.add.graphics();
    glow.fillStyle(Palette.glow, 0.22).fillCircle(cx, cy, 140);
    glow.fillStyle(Palette.glow, 0.12).fillCircle(cx, cy, 200);
    glow.setAlpha(0);
    panel.add(glow);
    panel.sendToBack(glow);
    this.tweens.add({ targets: glow, alpha: 1, duration: 320 });
    this.tweens.add({ targets: glow, alpha: 0.7, yoyo: true, repeat: -1, duration: 950, delay: 320, ease: 'Sine.easeInOut' });

    // clock hands fade in (a ticking arrangement)
    const hands = this.add.graphics();
    hands.lineStyle(4, Palette.bark, 1).lineBetween(cx, cy, cx, cy - 38);
    hands.lineStyle(3, Palette.ink, 1).lineBetween(cx, cy, cx + 34, cy + 10);
    hands.fillStyle(Palette.gold, 1).fillCircle(cx, cy, 6);
    hands.setAlpha(0);
    panel.add(hands);
    this.tweens.add({ targets: hands, alpha: 1, duration: 360 });

    // Bram's hand reaches in
    const handG = this.add.graphics();
    handG.fillStyle(0xf2d2a8, 1).fillEllipse(420, 320, 60, 24);
    handG.fillStyle(0xf2d2a8, 1).fillRoundedRect(360, 314, 70, 14, 6);
    handG.setAlpha(0);
    panel.add(handG);
    this.tweens.add({ targets: handG, alpha: 1, duration: 320 });

    // animated spark from hand to clock center
    this.time.delayedCall(360, () => {
      const spark = this.add.graphics();
      spark.lineStyle(2, 0xeaf6ff, 0.95);
      spark.beginPath();
      spark.moveTo(460, 314);
      spark.lineTo(510, 290);
      spark.lineTo(540, 270);
      spark.lineTo(580, 260);
      spark.lineTo(cx, cy);
      spark.strokePath();
      spark.fillStyle(0xeaf6ff, 1).fillCircle(cx, cy, 6);
      spark.fillStyle(0xc8e6ff, 0.6).fillCircle(cx, cy, 14);
      spark.setAlpha(0);
      panel.add(spark);
      this.tweens.add({ targets: spark, alpha: 1, duration: 220 });
      this.tweens.add({ targets: spark, alpha: 0.4, yoyo: true, repeat: -1, duration: 360, delay: 220 });
    });

    // dialogue + continue hint after a beat
    this.time.delayedCall(950, () => {
      this.addSpeechBubble(panel, 280, 160, 'Bram', 'Just enough.', { width: 220, height: 70, tail: 'down-right' });
      this.addSpeechBubble(panel, 990, 150, 'Nilo', 'What’s next?', { width: 240, height: 70, tail: 'down' });
      const cont = this.add.text(cx, 478, 'Click or press space to continue', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: '#ffdf7a',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      panel.add(cont);
      this.tweens.add({ targets: cont, alpha: 0.5, yoyo: true, repeat: -1, duration: 700 });
      this.repairComplete = true;
    });
  }

  private panelTheWorldCalls(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.18 });
    // window showing distant broken places
    const g = this.add.graphics();
    g.fillStyle(0x16223a, 1).fillRoundedRect(360, 130, 560, 220, 12);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(360, 130, 560, 220, 12);
    g.fillStyle(0xfff5d8, 0.22).fillCircle(840, 200, 36);
    g.fillStyle(0xfff5d8, 1).fillCircle(840, 200, 22);
    g.fillStyle(0x16223a, 1).fillCircle(836, 196, 18);
    // distant silhouettes inside the window
    g.fillStyle(0x2c3a4a, 1);
    g.fillTriangle(400, 340, 470, 250, 540, 340);
    g.fillTriangle(540, 340, 620, 240, 700, 340);
    g.fillTriangle(700, 340, 800, 220, 900, 340);
    // tower silhouette + small clock dot
    g.fillStyle(0x3a4860, 1).fillRoundedRect(620, 240, 28, 100, 4);
    g.fillStyle(Palette.parchment, 0.9).fillCircle(634, 246, 8);
    // a bridge silhouette over the dip
    g.lineStyle(3, 0x2c3a4a, 1);
    g.beginPath(); g.arc(490, 330, 26, Math.PI, 0, false); g.strokePath();
    c.add(g);
    // glowing blue paths floating from window into kitchen
    const paths = this.add.graphics();
    paths.lineStyle(3, 0x9cd0f0, 0.55);
    paths.beginPath();
    paths.moveTo(640, 340); paths.lineTo(560, 410); paths.lineTo(420, 460);
    paths.moveTo(700, 340); paths.lineTo(800, 410); paths.lineTo(940, 460);
    paths.strokePath();
    c.add(paths);

    const nilo = drawAlienNilo(this, 240, 410, 1.05);
    c.add(nilo);
    const bram = drawHumanBram(this, 1070, 440, 1.1);
    c.add(bram);

    this.addSpeechBubble(c, 250, 130, 'Nilo', 'Too many. Too many broken.', { width: 280, height: 70, tail: 'down' });
    this.addSpeechBubble(c, 1010, 250, 'Bram', 'Then we fix them.', { width: 260, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 220, 360, 'Nilo', 'I cannot touch.', { width: 240, height: 70, tail: 'down' });
    this.addSpeechBubble(c, 1030, 380, 'Bram', 'Then use mine.', { width: 220, height: 70, tail: 'down-right' });
  }

  private panelGivingHimself(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.22 });
    const halo = this.add.graphics();
    halo.fillStyle(0x6fb5e8, 0.32).fillCircle(640, 320, 230);
    halo.fillStyle(0x9cd0f0, 0.2).fillCircle(640, 320, 310);
    halo.fillStyle(0xeaf6ff, 0.55).fillCircle(640, 320, 90);
    c.add(halo);
    this.tweens.add({ targets: halo, alpha: 0.85, yoyo: true, repeat: -1, duration: 950, ease: 'Sine.easeInOut' });

    const bram = drawHumanBram(this, 640, 420, 1.5);
    c.add(bram);

    const labels = [
      { sym: 'H', name: 'hands', x: 460, y: 220 },
      { sym: 'F', name: 'feet',  x: 540, y: 160 },
      { sym: 'E', name: 'eyes',  x: 640, y: 130 },
      { sym: 'V', name: 'voice', x: 740, y: 160 },
      { sym: '♥', name: 'heart', x: 820, y: 220 }
    ];
    labels.forEach((l, i) => {
      const ring = this.add.graphics();
      ring.fillStyle(0xffdf7a, 0.95).fillCircle(l.x, l.y, 18);
      ring.lineStyle(3, 0xc8a548, 1).strokeCircle(l.x, l.y, 18);
      const sym = this.add.text(l.x, l.y, l.sym, {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#3b2b16',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      const lab = this.add.text(l.x, l.y + 30, l.name, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#ffe9ad'
      }).setOrigin(0.5);
      c.add([ring, sym, lab]);
      this.tweens.add({
        targets: [ring, sym, lab],
        y: '-=18',
        yoyo: true,
        repeat: -1,
        duration: 1100 + i * 80,
        ease: 'Sine.easeInOut'
      });
    });

    this.addCaption(c, 'He gave too much, too quickly.');
  }

  private panelSkeleton(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.16 });
    const halo = this.add.graphics();
    halo.fillStyle(Palette.glow, 0.2).fillCircle(640, 340, 200);
    c.add(halo);

    const skel = new Bram(this, 640, 400, { scale: 1.7 });
    c.add(skel);

    for (let i = 0; i < 8; i++) {
      const sx = 460 + i * 46;
      const sy = 180 + Math.sin(i) * 26;
      const s = this.add.text(sx, sy, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#ffdf7a'
      }).setOrigin(0.5);
      c.add(s);
      this.tweens.add({ targets: s, y: sy - 14, yoyo: true, repeat: -1, duration: 1200 + i * 100 });
    }

    this.addSpeechBubble(c, 870, 180, 'Bram', 'I think I helped too hard.', { width: 300, height: 70, tail: 'down-left' });
  }

  private panelNiloHuman(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.16 });
    const halo = this.add.graphics();
    halo.fillStyle(0x6fb5e8, 0.22).fillCircle(640, 320, 220);
    c.add(halo);

    // faded alien echo
    const echo = drawAlienNilo(this, 380, 320, 0.8);
    echo.setAlpha(0.3);
    c.add(echo);

    // arrow of transformation
    const arrow = this.add.graphics();
    arrow.lineStyle(4, Palette.gold, 0.85);
    arrow.lineBetween(470, 320, 600, 320);
    arrow.fillStyle(Palette.gold, 0.85);
    arrow.fillTriangle(590, 308, 610, 320, 590, 332);
    c.add(arrow);

    const human = drawHumanNilo(this, 800, 400, 1.45);
    c.add(human);

    // Bram skeleton on right edge looking up
    const skel = new Bram(this, 1090, 440, { scale: 0.95 });
    c.add(skel);

    this.addSpeechBubble(c, 360, 150, 'Nilo', 'I have edges.', { width: 220, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 1020, 210, 'Bram', 'You have knees.', { width: 240, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 600, 260, 'Nilo', 'Knees are unstable.', { width: 280, height: 70, tail: 'down-right' });
  }

  private panelOwlArrives(c: Phaser.GameObjects.Container) {
    this.drawKitchenBackdrop(c, { mist: 0.1 });
    const g = this.add.graphics();
    // window
    g.fillStyle(0x162033, 1).fillRoundedRect(420, 130, 440, 240, 12);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(420, 130, 440, 240, 12);
    g.lineBetween(640, 130, 640, 370);
    g.lineBetween(420, 250, 860, 250);
    // moon
    g.fillStyle(0xfff5d8, 0.22).fillCircle(540, 200, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(540, 200, 34);
    g.fillStyle(0x16223a, 1).fillCircle(534, 192, 28);
    // sill
    g.fillStyle(0x3a2818, 1).fillRoundedRect(412, 370, 456, 18, 6);
    c.add(g);

    const owl = drawOwl(this, 740, 332, 0.95);
    c.add(owl);
    this.tweens.add({ targets: owl, y: 324, yoyo: true, repeat: -1, duration: 1700, ease: 'Sine.easeInOut' });

    const skel = new Bram(this, 220, 440, { scale: 1.0 });
    c.add(skel);
    const nilo = drawHumanNilo(this, 1080, 440, 1.0);
    c.add(nilo);

    this.addSpeechBubble(c, 200, 150, 'Owl', 'Easy there, little rattler. You’re just… misplaced.', { width: 360, height: 100, tail: 'down' });
    this.addSpeechBubble(c, 1040, 220, 'Nilo', 'I broke him.', { width: 220, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 540, 480, 'Owl', 'No. He gave too much, and you had nowhere to put it.', { width: 480, height: 60, tail: 'none' });
  }

  private panelTogether(c: Phaser.GameObjects.Container) {
    // ocean horizon at dawn-ish
    this.drawOceanBackdrop(c, { moonX: 1000, moonY: 160, horizonY: 300, sky: 0x1a2840 });

    // Almost World silhouette on the right
    const g = this.add.graphics();
    g.fillStyle(0x2c3a4a, 1);
    g.fillTriangle(740, 470, 860, 250, 980, 470);
    g.fillTriangle(880, 470, 1000, 280, 1120, 470);
    g.fillTriangle(1000, 470, 1140, 220, 1240, 470);
    g.fillStyle(0x4a5868, 0.75);
    g.fillRoundedRect(900, 320, 70, 150, 8);
    g.fillStyle(Palette.warmWindow, 0.9).fillCircle(936, 360, 8);
    g.fillCircle(926, 400, 6);
    // glowing path of sparks across the water
    for (let i = 0; i < 18; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.4, 0.95));
      const sx = 360 + i * 32;
      const sy = 360 + Math.sin(i * 0.5) * 26;
      g.fillCircle(sx, sy, Phaser.Math.FloatBetween(1.6, 3.2));
    }
    // foreground hill
    g.fillStyle(0x1a1410, 1).fillEllipse(360, 510, 720, 110);
    c.add(g);

    const skel = new Bram(this, 240, 470, { scale: 1.05 });
    c.add(skel);
    const owl = drawOwl(this, 360, 445, 0.7);
    c.add(owl);
    const nilo = drawHumanNilo(this, 500, 470, 1.05);
    c.add(nilo);

    this.addSpeechBubble(c, 280, 130, 'Nilo', 'What’s next?', { width: 220, height: 70, tail: 'down-left' });
    this.addSpeechBubble(c, 560, 200, 'Bram', 'We fix one thing.', { width: 240, height: 70, tail: 'down-left' });
    this.addSpeechBubble(c, 880, 280, 'Owl', 'At a time.', { width: 220, height: 70, tail: 'down-left' });

    this.addFooter(c, 'Fix one thing at a time.');
  }
}
