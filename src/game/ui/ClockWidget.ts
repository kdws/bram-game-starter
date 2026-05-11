import Phaser from 'phaser';
import { Palette } from '../palette';

export interface ClockTime {
  hour: number;   // 1..12 (12 represented as 12, never 0)
  minute: number; // 0..59
}

export interface ClockWidgetOptions {
  radius?: number;
  showDigital?: boolean;
}

export class ClockWidget extends Phaser.GameObjects.Container {
  private radius: number;
  private hourHandLength: number;
  private minuteHandLength: number;

  private faceGraphic: Phaser.GameObjects.Graphics;
  private ticksGraphic: Phaser.GameObjects.Graphics;
  private numbersContainer: Phaser.GameObjects.Container;
  private minuteLabelsContainer: Phaser.GameObjects.Container;
  private ghostHourHand: Phaser.GameObjects.Graphics;
  private ghostMinuteHand: Phaser.GameObjects.Graphics;
  private hourHand: Phaser.GameObjects.Graphics;
  private minuteHand: Phaser.GameObjects.Graphics;
  private centerBoss: Phaser.GameObjects.Graphics;
  private digitalText?: Phaser.GameObjects.Text;

  private hour = 12;
  private minute = 0;
  private targetHour = 12;
  private targetMinute = 0;
  private ghostVisible = false;
  private dragging: 'hour' | 'minute' | null = null;
  private enabled = true;

  private hourHighlightTween?: Phaser.Tweens.Tween;
  private minuteHighlightTween?: Phaser.Tweens.Tween;

  private pointerDownHandler: (p: Phaser.Input.Pointer) => void;
  private pointerMoveHandler: (p: Phaser.Input.Pointer) => void;
  private pointerUpHandler: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: ClockWidgetOptions = {}) {
    super(scene, x, y);
    this.radius = opts.radius ?? 200;
    this.hourHandLength = this.radius * 0.46;
    this.minuteHandLength = this.radius * 0.74;
    scene.add.existing(this);

    this.faceGraphic = scene.add.graphics();
    this.ticksGraphic = scene.add.graphics();
    this.numbersContainer = scene.add.container(0, 0);
    this.minuteLabelsContainer = scene.add.container(0, 0).setVisible(false);
    this.ghostHourHand = scene.add.graphics();
    this.ghostMinuteHand = scene.add.graphics();
    this.hourHand = scene.add.graphics();
    this.minuteHand = scene.add.graphics();
    this.centerBoss = scene.add.graphics();

    this.add([
      this.faceGraphic,
      this.ticksGraphic,
      this.numbersContainer,
      this.minuteLabelsContainer,
      this.ghostHourHand,
      this.ghostMinuteHand,
      this.hourHand,
      this.minuteHand,
      this.centerBoss
    ]);

    if (opts.showDigital !== false) {
      this.digitalText = scene.add.text(0, this.radius + 48, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '44px',
        color: '#ffe9ad',
        backgroundColor: '#272018',
        padding: { left: 20, right: 20, top: 6, bottom: 6 }
      }).setOrigin(0.5);
      this.add(this.digitalText);
    }

    this.drawFace();
    this.drawTicks();
    this.drawNumbers();
    this.drawMinuteLabels();
    this.drawHand(this.hourHand, this.hourHandLength, 12, Palette.bark, Palette.parchmentDark);
    this.drawHand(this.minuteHand, this.minuteHandLength, 6, Palette.ink, Palette.gold);
    this.drawHand(this.ghostHourHand, this.hourHandLength, 12, Palette.glow, Palette.gold);
    this.drawHand(this.ghostMinuteHand, this.minuteHandLength, 6, Palette.glow, Palette.gold);
    this.ghostHourHand.setAlpha(0).setVisible(false);
    this.ghostMinuteHand.setAlpha(0).setVisible(false);
    this.drawCenterBoss();

    this.pointerDownHandler = (p) => this.onPointerDown(p);
    this.pointerMoveHandler = (p) => this.onPointerMove(p);
    this.pointerUpHandler = () => this.onPointerUp();
    scene.input.on('pointerdown', this.pointerDownHandler);
    scene.input.on('pointermove', this.pointerMoveHandler);
    scene.input.on('pointerup', this.pointerUpHandler);
    scene.input.on('pointerupoutside', this.pointerUpHandler);
    scene.events.once('shutdown', () => this.cleanup());
    scene.events.once('destroy', () => this.cleanup());

    this.render();
  }

  // ---------- public API ----------

  setTime(hour: number, minute: number): void {
    const normalized = this.normalizeTime(hour, minute);
    this.hour = normalized.hour;
    this.minute = normalized.minute;
    this.render();
  }

  getTime(): ClockTime {
    return { hour: this.hour, minute: this.minute };
  }

  setTargetTime(hour: number, minute: number): void {
    const normalized = this.normalizeTime(hour, minute);
    this.targetHour = normalized.hour;
    this.targetMinute = normalized.minute;
    this.renderGhostHands();
  }

  showGhostHands(visible: boolean): void {
    this.ghostVisible = visible;
    this.ghostHourHand.setVisible(visible);
    this.ghostMinuteHand.setVisible(visible);
    if (visible) {
      this.scene.tweens.add({
        targets: [this.ghostHourHand, this.ghostMinuteHand],
        alpha: 0.55,
        duration: 380,
        ease: 'Sine.easeOut'
      });
      this.renderGhostHands();
    } else {
      this.ghostHourHand.setAlpha(0);
      this.ghostMinuteHand.setAlpha(0);
    }
  }

  highlightHourHand(): void {
    this.stopHourHighlight();
    this.hourHighlightTween = this.scene.tweens.add({
      targets: this.hourHand,
      alpha: 0.45,
      yoyo: true,
      repeat: -1,
      duration: 460,
      ease: 'Sine.easeInOut'
    });
  }

  highlightMinuteHand(): void {
    this.stopMinuteHighlight();
    this.minuteHighlightTween = this.scene.tweens.add({
      targets: this.minuteHand,
      alpha: 0.45,
      yoyo: true,
      repeat: -1,
      duration: 460,
      ease: 'Sine.easeInOut'
    });
  }

  clearHighlights(): void {
    this.stopHourHighlight();
    this.stopMinuteHighlight();
    this.hourHand.setAlpha(1);
    this.minuteHand.setAlpha(1);
  }

  setMinuteLabelsVisible(visible: boolean): void {
    this.minuteLabelsContainer.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.dragging = null;
  }

  // ---------- drawing ----------

  private drawFace() {
    const g = this.faceGraphic;
    g.clear();
    g.fillStyle(Palette.parchment, 1);
    g.fillCircle(0, 0, this.radius);
    g.lineStyle(8, Palette.parchmentDark, 1);
    g.strokeCircle(0, 0, this.radius);
    g.lineStyle(3, Palette.gold, 0.7);
    g.strokeCircle(0, 0, this.radius - 12);
    g.fillStyle(Palette.bone, 0.35);
    g.fillCircle(0, 0, this.radius - 16);
  }

  private drawTicks() {
    const g = this.ticksGraphic;
    g.clear();
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * Math.PI / 180;
      const isHour = i % 5 === 0;
      const inner = this.radius - (isHour ? 30 : 20);
      const outer = this.radius - 14;
      const x1 = Math.cos(angle) * inner;
      const y1 = Math.sin(angle) * inner;
      const x2 = Math.cos(angle) * outer;
      const y2 = Math.sin(angle) * outer;
      g.lineStyle(isHour ? 4 : 2, isHour ? Palette.ink : Palette.boneShadow, isHour ? 1 : 0.85);
      g.lineBetween(x1, y1, x2, y2);
    }
  }

  private drawNumbers() {
    this.numbersContainer.removeAll(true);
    const r = this.radius - 46;
    const fontSize = Math.floor(this.radius * 0.18);
    for (let n = 1; n <= 12; n++) {
      const angle = (n * 30 - 90) * Math.PI / 180;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const t = this.scene.add.text(x, y, String(n), {
        fontFamily: 'Georgia, serif',
        fontSize: `${fontSize}px`,
        color: '#3b2b16',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.numbersContainer.add(t);
    }
  }

  private drawMinuteLabels() {
    this.minuteLabelsContainer.removeAll(true);
    const r = this.radius + 22;
    const fontSize = Math.floor(this.radius * 0.1);
    for (let i = 1; i <= 12; i++) {
      const minute = (i * 5) % 60;
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const t = this.scene.add.text(x, y, String(minute), {
        fontFamily: 'Georgia, serif',
        fontSize: `${fontSize}px`,
        color: '#ffdf7a'
      }).setOrigin(0.5);
      this.minuteLabelsContainer.add(t);
    }
  }

  private drawHand(g: Phaser.GameObjects.Graphics, length: number, width: number, fill: number, stroke: number) {
    g.clear();
    g.fillStyle(fill, 1);
    g.lineStyle(2, stroke, 1);
    g.fillRoundedRect(-width / 2, -length, width, length + width, width / 2);
    g.strokeRoundedRect(-width / 2, -length, width, length + width, width / 2);
    g.fillStyle(stroke, 1);
    g.fillTriangle(-width / 2 - 2, -length + 6, width / 2 + 2, -length + 6, 0, -length - 10);
  }

  private drawCenterBoss() {
    const g = this.centerBoss;
    g.clear();
    g.fillStyle(Palette.gold, 1);
    g.fillCircle(0, 0, 9);
    g.lineStyle(2, Palette.parchmentDark, 1);
    g.strokeCircle(0, 0, 9);
    g.fillStyle(Palette.ink, 1);
    g.fillCircle(0, 0, 3);
  }

  // ---------- rendering state ----------

  private render() {
    this.hourHand.setRotation(this.handAngleRadians('hour'));
    this.minuteHand.setRotation(this.handAngleRadians('minute'));
    if (this.digitalText) this.digitalText.setText(this.formatDigital());
    this.renderGhostHands();
  }

  private renderGhostHands() {
    if (!this.ghostVisible) return;
    this.ghostHourHand.setRotation(this.targetHandAngleRadians('hour'));
    this.ghostMinuteHand.setRotation(this.targetHandAngleRadians('minute'));
  }

  private handAngleRadians(hand: 'hour' | 'minute'): number {
    if (hand === 'minute') return this.toRad(this.minute * 6);
    const h12 = this.hour % 12;
    return this.toRad((h12 + this.minute / 60) * 30);
  }

  private targetHandAngleRadians(hand: 'hour' | 'minute'): number {
    if (hand === 'minute') return this.toRad(this.targetMinute * 6);
    const h12 = this.targetHour % 12;
    return this.toRad((h12 + this.targetMinute / 60) * 30);
  }

  private formatDigital(): string {
    const h = this.hour === 0 ? 12 : this.hour;
    const m = this.minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // ---------- input ----------

  private onPointerDown(p: Phaser.Input.Pointer) {
    if (!this.enabled) return;
    const local = this.localPointer(p);
    if (!local) return;
    if (local.r > this.radius * 0.96 || local.r < 14) return;
    const pAngle = local.angleDeg;
    const hAngle = ((this.hour % 12) + this.minute / 60) * 30;
    const mAngle = this.minute * 6;
    if (local.r > this.hourHandLength + 12) {
      this.dragging = 'minute';
    } else {
      const dh = this.angleDelta(pAngle, hAngle);
      const dm = this.angleDelta(pAngle, mAngle);
      this.dragging = dh <= dm ? 'hour' : 'minute';
    }
  }

  private onPointerMove(p: Phaser.Input.Pointer) {
    if (!this.dragging) return;
    const local = this.localPointer(p);
    if (!local) return;
    const angle = local.angleDeg;
    if (this.dragging === 'minute') {
      const rawMinute = Math.round(angle / 6 / 5) * 5;
      this.minute = ((rawMinute % 60) + 60) % 60;
    } else {
      const rawHour = Math.round(angle / 30);
      const newHour = ((rawHour % 12) + 12) % 12;
      this.hour = newHour === 0 ? 12 : newHour;
    }
    this.render();
  }

  private onPointerUp() {
    this.dragging = null;
  }

  // ---------- helpers ----------

  private localPointer(p: Phaser.Input.Pointer): { x: number; y: number; r: number; angleDeg: number } | null {
    const m = this.getWorldTransformMatrix();
    const lx = p.worldX - m.tx;
    const ly = p.worldY - m.ty;
    const r = Math.sqrt(lx * lx + ly * ly);
    const angleDeg = ((Math.atan2(lx, -ly) * 180 / Math.PI) + 360) % 360;
    return { x: lx, y: ly, r, angleDeg };
  }

  private angleDelta(a: number, b: number): number {
    const d = Math.abs(((a - b + 540) % 360) - 180);
    return d;
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }

  private normalizeTime(hour: number, minute: number): ClockTime {
    let m = ((minute % 60) + 60) % 60;
    let h = hour;
    if (h <= 0) h = ((h % 12) + 12) % 12 || 12;
    if (h > 12) h = ((h - 1) % 12) + 1;
    return { hour: h, minute: m };
  }

  private stopHourHighlight() {
    if (this.hourHighlightTween) {
      this.hourHighlightTween.stop();
      this.hourHighlightTween.remove();
      this.hourHighlightTween = undefined;
    }
    this.hourHand.setAlpha(1);
  }

  private stopMinuteHighlight() {
    if (this.minuteHighlightTween) {
      this.minuteHighlightTween.stop();
      this.minuteHighlightTween.remove();
      this.minuteHighlightTween = undefined;
    }
    this.minuteHand.setAlpha(1);
  }

  private cleanup() {
    this.scene.input.off('pointerdown', this.pointerDownHandler);
    this.scene.input.off('pointermove', this.pointerMoveHandler);
    this.scene.input.off('pointerup', this.pointerUpHandler);
    this.scene.input.off('pointerupoutside', this.pointerUpHandler);
    this.stopHourHighlight();
    this.stopMinuteHighlight();
  }
}
