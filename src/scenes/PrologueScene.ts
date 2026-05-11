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

export class PrologueScene extends Phaser.Scene {
  private panelIndex = 0;
  private panelContainer?: Phaser.GameObjects.Container;
  private advancing = false;
  private hintLabel!: Phaser.GameObjects.Text;
  private panels: PanelFn[] = [];

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
      (c) => this.panel1Sleeping(c),
      (c) => this.panel2Waking(c),
      (c) => this.panel3GettingDressed(c),
      (c) => this.panel4Hallway(c),
      (c) => this.panel5Peeking(c),
      (c) => this.panel6Reveal(c),
      (c) => this.panel7GentleWave(c),
      (c) => this.panel8GivingHimself(c),
      (c) => this.panel9Skeleton(c),
      (c) => this.panel10NiloHuman(c),
      (c) => this.panel11BothInKitchen(c),
      (c) => this.panel12OwlArrives(c),
      (c) => this.panel13Together(c)
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
    this.panelContainer?.destroy();
    const c = this.add.container(0, 0);
    this.panelContainer = c;
    this.drawPanelFrame(c);
    this.panels[index](c);
    this.drawPageMarker(c, index);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 380, ease: 'Quad.easeOut' });
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

  // ---------- helpers ----------

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

  // ---------- panel 1: asleep ----------

  private panel1Sleeping(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    // wall
    g.fillStyle(0x1c1a2a, 1).fillRect(80, 80, 1120, 380);
    // floor
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // window
    g.fillStyle(0x16223a, 1).fillRoundedRect(220, 130, 280, 220, 10);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(220, 130, 280, 220, 10);
    g.lineBetween(360, 130, 360, 350);
    g.lineBetween(220, 240, 500, 240);
    // moon
    g.fillStyle(0xfff5d8, 0.22).fillCircle(420, 200, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(420, 200, 34);
    g.fillStyle(0x16223a, 1).fillCircle(412, 192, 28);
    // stars
    for (let i = 0; i < 25; i++) {
      g.fillStyle(0xfff5d8, Phaser.Math.FloatBetween(0.3, 0.85));
      const sx = Phaser.Math.Between(230, 490);
      const sy = Phaser.Math.Between(140, 340);
      if (Math.hypot(sx - 420, sy - 200) > 60) g.fillCircle(sx, sy, Phaser.Math.FloatBetween(0.5, 1.6));
    }
    // bed frame
    g.fillStyle(0x3a2818, 1).fillRoundedRect(600, 380, 540, 92, 10);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(600, 350, 60, 100, 8);
    // mattress + blanket
    g.fillStyle(0x4a6878, 1).fillRoundedRect(660, 332, 480, 56, 8);
    g.fillStyle(0x6f8b9d, 0.6).fillRoundedRect(670, 340, 460, 18, 6);
    // pillow
    g.fillStyle(0xf0e0c0, 1).fillRoundedRect(670, 316, 120, 36, 10);
    c.add(g);

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

  // ---------- panel 2: waking ----------

  private panel2Waking(c: Phaser.GameObjects.Container) {
    // reuse bedroom backdrop (simplified)
    const g = this.add.graphics();
    g.fillStyle(0x1c1a2a, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    g.fillStyle(0x16223a, 1).fillRoundedRect(220, 130, 280, 220, 10);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(220, 130, 280, 220, 10);
    g.fillStyle(0xfff5d8, 0.22).fillCircle(420, 200, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(420, 200, 34);
    g.fillStyle(0x16223a, 1).fillCircle(412, 192, 28);
    g.fillStyle(0x3a2818, 1).fillRoundedRect(600, 380, 540, 92, 10);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(600, 350, 60, 100, 8);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(660, 360, 480, 30, 8);
    g.fillStyle(0xf0e0c0, 1).fillRoundedRect(670, 354, 100, 22, 8);
    c.add(g);

    // Bram sitting up (small body silhouette)
    const bram = drawHumanBram(this, 760, 332, 0.65);
    c.add(bram);

    // sound effect "clink" from kitchen direction (left)
    const s = this.add.text(170, 200, '*clink*', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '28px',
      color: '#ffdf7a'
    });
    c.add(s);
    this.tweens.add({ targets: s, alpha: 0.5, yoyo: true, repeat: -1, duration: 700 });

    this.addCaption(c, 'A clink in the kitchen.');
  }

  // ---------- panel 3: getting dressed ----------

  private panel3GettingDressed(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x231f30, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // bedside lamp soft glow
    g.fillStyle(Palette.warmWindow, 0.18).fillCircle(280, 220, 160);
    g.fillStyle(0x4a3a2a, 1).fillRoundedRect(260, 320, 60, 100, 8);
    g.fillStyle(Palette.warmWindow, 0.85).fillCircle(290, 300, 28);
    // bed
    g.fillStyle(0x3a2818, 1).fillRoundedRect(620, 400, 540, 80, 10);
    g.fillStyle(0x4a6878, 1).fillRoundedRect(670, 380, 480, 30, 8);
    c.add(g);

    // Bram standing, lifting shirt over head
    const bram = drawHumanBram(this, 540, 400, 1.4);
    c.add(bram);
    const motion = this.add.graphics();
    motion.lineStyle(2, Palette.parchmentDark, 0.6);
    motion.lineBetween(440, 320, 460, 340);
    motion.lineBetween(610, 320, 590, 340);
    motion.lineBetween(530, 290, 530, 320);
    c.add(motion);

    // a folded pile (shorts) on bed
    const pile = this.add.graphics();
    pile.fillStyle(0x6b8f4a, 1).fillRoundedRect(820, 370, 60, 14, 4);
    pile.fillStyle(0x3a2a1a, 1).fillRoundedRect(900, 374, 50, 10, 4);
    c.add(pile);

    this.addCaption(c, 'He gets dressed…');
  }

  // ---------- panel 4: hallway ----------

  private panel4Hallway(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    // hallway walls
    g.fillStyle(0x3a2818, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x271a10, 1).fillRect(80, 80, 1120, 70);
    g.fillStyle(0x1a120a, 1).fillRect(80, 460, 1120, 70);
    // floor planks
    g.fillStyle(0x4a3018, 1).fillRect(80, 380, 1120, 80);
    for (let x = 100; x < 1200; x += 90) {
      g.lineStyle(2, 0x2a1808, 0.55).lineBetween(x, 380, x, 460);
    }
    // framed pictures
    for (let i = 0; i < 4; i++) {
      const fx = 200 + i * 250;
      g.fillStyle(0x2a1a10, 1).fillRoundedRect(fx, 170, 100, 80, 6);
      g.fillStyle(Palette.parchment, 0.55).fillRoundedRect(fx + 8, 178, 84, 64, 4);
    }
    // sconce glow
    g.fillStyle(Palette.warmWindow, 0.2).fillCircle(1050, 280, 90);
    g.fillStyle(Palette.warmWindow, 0.9).fillCircle(1050, 280, 12);
    c.add(g);

    // Bram walking right, slightly small for hallway depth
    const bram = drawHumanBram(this, 460, 410, 1.1);
    c.add(bram);
    // motion lines behind
    const motion = this.add.graphics();
    motion.lineStyle(3, Palette.parchmentDark, 0.4);
    motion.lineBetween(380, 390, 420, 390);
    motion.lineBetween(360, 410, 410, 410);
    motion.lineBetween(380, 430, 420, 430);
    c.add(motion);

    this.addCaption(c, '…and follows the sound.');
  }

  // ---------- panel 5: peeking ----------

  private panel5Peeking(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    // dark hallway side (left third)
    g.fillStyle(0x231a14, 1).fillRect(80, 80, 480, 450);
    // kitchen side (right two-thirds) - blue cool tint
    g.fillStyle(0x1a2638, 1).fillRect(560, 80, 640, 450);
    // doorway/corner edge
    g.fillStyle(0x1a120a, 1).fillRect(540, 80, 30, 450);
    // floor
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // mysterious blue glow spilling from kitchen
    g.fillStyle(0x6fb5e8, 0.22).fillCircle(820, 320, 200);
    g.fillStyle(0x6fb5e8, 0.12).fillCircle(820, 320, 320);
    // hint silhouette in kitchen
    g.fillStyle(0x2c4660, 0.6).fillEllipse(820, 310, 110, 150);
    c.add(g);

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

    this.addCaption(c, 'He peeks around the corner.');
  }

  // ---------- panel 6: reveal Nilo ----------

  private panel6Reveal(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    // kitchen
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
    // ambient blue mist
    g.fillStyle(0x6fb5e8, 0.12).fillRect(80, 80, 1120, 380);
    c.add(g);

    // broken clock on counter being repaired
    const brokenClock = this.add.graphics();
    brokenClock.fillStyle(Palette.parchment, 0.85).fillCircle(890, 360, 32);
    brokenClock.lineStyle(3, Palette.parchmentDark, 1).strokeCircle(890, 360, 32);
    brokenClock.lineStyle(2, 0x1a1410, 1);
    brokenClock.lineBetween(890, 360, 890, 340); // 12 hand stuck
    brokenClock.lineBetween(890, 360, 906, 360);
    // crack lines
    brokenClock.lineStyle(2, 0x6a4030, 0.7);
    brokenClock.lineBetween(870, 348, 884, 366);
    brokenClock.lineBetween(890, 392, 902, 376);
    c.add(brokenClock);

    // Nilo (alien) tending to it
    const nilo = drawAlienNilo(this, 760, 290, 1.0);
    c.add(nilo);

    // Bram peeking at far left
    const peek = this.add.container(180, 380);
    const pg = this.add.graphics();
    pg.fillStyle(0xf2d2a8, 1).fillCircle(0, 0, 16);
    pg.fillStyle(0x1a1410, 1).fillCircle(5, 0, 1.8);
    pg.fillStyle(0x5b3a1a, 1);
    pg.fillEllipse(0, -12, 32, 14);
    peek.add(pg);
    c.add(peek);

    // speech bubbles
    this.addSpeechBubble(c, 700, 170, 'Nilo', 'This world is coming apart.', { width: 300, height: 70, tail: 'down-right' });
    this.addSpeechBubble(c, 340, 200, 'Bram', 'I can fix one thing.', { width: 260, height: 70, tail: 'down-left' });
  }

  // ---------- panel 7: gentle wave ----------

  private panel7GentleWave(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    g.fillStyle(0x3a2818, 1).fillRoundedRect(120, 360, 1040, 110, 8);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(120, 350, 1040, 18, 4);
    c.add(g);

    // Nilo turning toward Bram
    const nilo = drawAlienNilo(this, 820, 290, 1.1);
    c.add(nilo);

    // wave of blue energy spreading left
    const wave = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      const cx = 720 - i * 90;
      const r = 60 + i * 26;
      wave.lineStyle(3, 0x9cd0f0, 0.6 - i * 0.12);
      wave.beginPath();
      wave.arc(cx, 320, r, Math.PI * 0.7, Math.PI * 1.3, false);
      wave.strokePath();
    }
    wave.fillStyle(0x6fb5e8, 0.18);
    wave.fillEllipse(560, 320, 280, 140);
    c.add(wave);

    // Bram standing (visible now, no longer peeking)
    const bram = drawHumanBram(this, 320, 420, 1.3);
    c.add(bram);

    this.addCaption(c, 'A gentle wave.');
  }

  // ---------- panel 8: giving himself ----------

  private panel8GivingHimself(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    c.add(g);

    // blue radiance behind Bram
    const halo = this.add.graphics();
    halo.fillStyle(0x6fb5e8, 0.25).fillCircle(640, 320, 220);
    halo.fillStyle(0x9cd0f0, 0.18).fillCircle(640, 320, 300);
    halo.fillStyle(0xeaf6ff, 0.5).fillCircle(640, 320, 90);
    c.add(halo);
    this.tweens.add({ targets: halo, alpha: 0.7, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });

    // Bram in center
    const bram = drawHumanBram(this, 640, 420, 1.5);
    c.add(bram);

    // Life Sparks lifting with labels
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

    this.addCaption(c, 'He gives himself to the world.');
  }

  // ---------- panel 9: skeleton ----------

  private panel9Skeleton(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    c.add(g);

    // residual soft glow
    const halo = this.add.graphics();
    halo.fillStyle(Palette.glow, 0.18).fillCircle(640, 340, 200);
    c.add(halo);

    // Bram skeleton (reuse Bram class)
    const skel = new Bram(this, 640, 400, { scale: 1.7 });
    c.add(skel);

    // floating dust sparks
    for (let i = 0; i < 8; i++) {
      const sx = 480 + i * 40;
      const sy = 200 + Math.sin(i) * 30;
      const s = this.add.text(sx, sy, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#ffdf7a'
      }).setOrigin(0.5);
      c.add(s);
      this.tweens.add({ targets: s, y: sy - 14, yoyo: true, repeat: -1, duration: 1200 + i * 100 });
    }

    this.addSpeechBubble(c, 880, 200, 'Bram', 'I think I helped too hard.', { width: 280, height: 70, tail: 'down-left' });
  }

  // ---------- panel 10: Nilo becomes human ----------

  private panel10NiloHuman(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    c.add(g);

    // soft radiance
    const halo = this.add.graphics();
    halo.fillStyle(0x6fb5e8, 0.22).fillCircle(640, 320, 220);
    c.add(halo);

    // fading alien echo
    const echo = drawAlienNilo(this, 460, 320, 0.85);
    echo.setAlpha(0.35);
    c.add(echo);

    // arrow of transformation
    const arrow = this.add.graphics();
    arrow.lineStyle(4, Palette.gold, 0.85);
    arrow.lineBetween(560, 320, 720, 320);
    arrow.fillStyle(Palette.gold, 0.85);
    arrow.fillTriangle(710, 308, 730, 320, 710, 332);
    c.add(arrow);

    // new human Nilo, taller and grounded
    const human = drawHumanNilo(this, 880, 400, 1.5);
    c.add(human);

    this.addCaption(c, 'Nilo becomes something new.');
  }

  // ---------- panel 11: both in changed kitchen ----------

  private panel11BothInKitchen(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1a2638, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // counter
    g.fillStyle(0x3a2818, 1).fillRoundedRect(120, 380, 1040, 90, 8);
    g.fillStyle(0x5a3a22, 1).fillRoundedRect(120, 370, 1040, 16, 4);
    // cabinets above (slightly faded)
    g.fillStyle(0x2a1a12, 0.7).fillRoundedRect(160, 130, 880, 130, 8);
    c.add(g);

    // floating broken-world icons
    const floats: Array<{ kind: 'num' | 'clock' | 'coin' | 'bridge'; x: number; y: number; v?: string }> = [
      { kind: 'num', x: 240, y: 200, v: '7' },
      { kind: 'num', x: 1020, y: 180, v: '12' },
      { kind: 'num', x: 380, y: 260, v: '5' },
      { kind: 'clock', x: 1100, y: 260 },
      { kind: 'clock', x: 200, y: 320 },
      { kind: 'coin', x: 980, y: 320, v: '5¢' },
      { kind: 'coin', x: 480, y: 180, v: '10¢' },
      { kind: 'bridge', x: 640, y: 220 }
    ];
    floats.forEach((f, i) => {
      const obj = this.makeFloatingIcon(f);
      c.add(obj);
      this.tweens.add({ targets: obj, y: f.y - 10, yoyo: true, repeat: -1, duration: 1400 + i * 90, ease: 'Sine.easeInOut' });
    });

    // Bram skeleton on left
    const skel = new Bram(this, 360, 460, { scale: 1.3 });
    c.add(skel);
    // Human Nilo on right
    const nilo = drawHumanNilo(this, 880, 460, 1.3);
    c.add(nilo);

    this.addCaption(c, 'Two boys. One broken world.');
  }

  private makeFloatingIcon(f: { kind: 'num' | 'clock' | 'coin' | 'bridge'; x: number; y: number; v?: string }): Phaser.GameObjects.Container {
    const cn = this.add.container(f.x, f.y);
    const g = this.add.graphics();
    if (f.kind === 'num') {
      g.fillStyle(Palette.glow, 0.85).fillCircle(0, 0, 18);
      g.lineStyle(2, Palette.parchmentDark, 1).strokeCircle(0, 0, 18);
      const t = this.add.text(0, 0, f.v ?? '?', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#3b2b16', fontStyle: 'bold' }).setOrigin(0.5);
      cn.add([g, t]);
    } else if (f.kind === 'clock') {
      g.fillStyle(Palette.parchment, 0.92).fillCircle(0, 0, 22);
      g.lineStyle(2, Palette.parchmentDark, 1).strokeCircle(0, 0, 22);
      g.lineStyle(2, 0x1a1410, 1);
      g.lineBetween(0, 0, 0, -12);
      g.lineBetween(0, 0, 10, 4);
      cn.add(g);
    } else if (f.kind === 'coin') {
      g.fillStyle(Palette.gold, 0.95).fillCircle(0, 0, 18);
      g.lineStyle(2, Palette.parchmentDark, 1).strokeCircle(0, 0, 18);
      const t = this.add.text(0, 0, f.v ?? '1¢', { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#3b2b16', fontStyle: 'bold' }).setOrigin(0.5);
      cn.add([g, t]);
    } else {
      // bridge fragment
      g.fillStyle(Palette.bark, 1).fillRoundedRect(-30, -6, 60, 12, 4);
      g.lineStyle(2, Palette.parchmentDark, 1).strokeRoundedRect(-30, -6, 60, 12, 4);
      g.fillStyle(Palette.bark, 0.6).fillRoundedRect(20, -2, 30, 8, 3);
      cn.add(g);
    }
    return cn;
  }

  // ---------- panel 12: owl arrives ----------

  private panel12OwlArrives(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    g.fillStyle(0x1c1a2a, 1).fillRect(80, 80, 1120, 380);
    g.fillStyle(0x2a1f15, 1).fillRect(80, 460, 1120, 70);
    // big window facing the night
    g.fillStyle(0x162033, 1).fillRoundedRect(380, 110, 520, 320, 12);
    g.lineStyle(5, 0x3a2c1c, 1).strokeRoundedRect(380, 110, 520, 320, 12);
    g.lineBetween(640, 110, 640, 430);
    g.lineBetween(380, 270, 900, 270);
    // moon outside
    g.fillStyle(0xfff5d8, 0.22).fillCircle(540, 200, 56);
    g.fillStyle(0xfff5d8, 1).fillCircle(540, 200, 34);
    g.fillStyle(0x16223a, 1).fillCircle(534, 192, 28);
    // stars
    for (let i = 0; i < 30; i++) {
      g.fillStyle(0xfff5d8, Phaser.Math.FloatBetween(0.25, 0.8));
      g.fillCircle(390 + Math.random() * 500, 120 + Math.random() * 300, Phaser.Math.FloatBetween(0.5, 1.6));
    }
    // window sill
    g.fillStyle(0x3a2818, 1).fillRoundedRect(370, 430, 540, 18, 6);
    c.add(g);

    // Owl perched on sill
    const owl = drawOwl(this, 770, 380, 1.05);
    c.add(owl);
    this.tweens.add({ targets: owl, y: 372, yoyo: true, repeat: -1, duration: 1700, ease: 'Sine.easeInOut' });

    // Bram skeleton standing inside the room
    const skel = new Bram(this, 220, 430, { scale: 1.0 });
    c.add(skel);

    this.addSpeechBubble(c, 1010, 220, 'Owl', 'Easy there, little rattler. You’re just… misplaced.', { width: 320, height: 110, tail: 'down-left' });
  }

  // ---------- panel 13: together ----------

  private panel13Together(c: Phaser.GameObjects.Container) {
    const g = this.add.graphics();
    // gradient-ish night-into-dawn
    g.fillStyle(0x1a2030, 1).fillRect(80, 80, 1120, 360);
    g.fillStyle(0x3a4860, 1).fillRect(80, 80, 1120, 80);
    g.fillStyle(0x6b8b9d, 0.32).fillRect(80, 80, 1120, 40);
    // ground
    g.fillStyle(0x2a1f15, 1).fillRect(80, 440, 1120, 90);
    // distant Almost World silhouette on right
    g.fillStyle(0x2c3a4a, 1);
    g.fillTriangle(700, 440, 820, 240, 940, 440);
    g.fillTriangle(820, 440, 940, 280, 1060, 440);
    g.fillTriangle(940, 440, 1080, 220, 1190, 440);
    g.fillStyle(0x4a5868, 0.7);
    g.fillRoundedRect(840, 320, 80, 120, 8);
    g.fillStyle(Palette.warmWindow, 0.85).fillCircle(880, 360, 8);
    g.fillCircle(870, 400, 6);
    // floating sparks toward the world
    for (let i = 0; i < 14; i++) {
      const sx = 700 + i * 28;
      const sy = 200 + Math.sin(i * 0.6) * 24;
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.4, 0.9));
      g.fillCircle(sx, sy, Phaser.Math.FloatBetween(1.5, 3.2));
    }
    // hill / foreground
    g.fillStyle(0x1a1410, 1);
    g.fillEllipse(420, 470, 700, 100);
    c.add(g);

    // Three silhouettes in foreground looking right
    const skel = new Bram(this, 280, 430, { scale: 1.05 });
    c.add(skel);
    const owl = drawOwl(this, 400, 405, 0.7);
    c.add(owl);
    const nilo = drawHumanNilo(this, 540, 430, 1.05);
    c.add(nilo);

    this.addCaption(c, 'Together, they’ll mend what matters.');
    this.addFooter(c, 'Fix one thing at a time.');
  }
}
