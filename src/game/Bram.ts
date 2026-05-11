import Phaser from 'phaser';
import { Palette } from './palette';

export class Bram extends Phaser.GameObjects.Container {
  private bones: Phaser.GameObjects.Graphics;
  private board?: Phaser.GameObjects.Graphics;
  private humanGlow = false;

  constructor(scene: Phaser.Scene, x: number, y: number, options: { skateboard?: boolean; scale?: number } = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    this.bones = scene.add.graphics();
    this.add(this.bones);
    if (options.skateboard) {
      this.board = scene.add.graphics();
      this.add(this.board);
    }
    this.setScale(options.scale ?? 1);
    this.redraw();
  }

  setWarmGlow(enabled: boolean) {
    this.humanGlow = enabled;
    this.redraw();
  }

  redraw() {
    this.bones.clear();
    if (this.board) {
      this.board.clear();
      this.board.lineStyle(5, Palette.bark, 1);
      this.board.fillStyle(Palette.ink, 1);
      this.board.fillRoundedRect(-34, 31, 68, 10, 6);
      this.board.strokeRoundedRect(-34, 31, 68, 10, 6);
      this.board.fillStyle(0x111111, 1);
      this.board.fillCircle(-22, 44, 7);
      this.board.fillCircle(22, 44, 7);
    }
    const glow = this.humanGlow ? 0.35 : 0.08;
    this.bones.fillStyle(Palette.glow, glow);
    this.bones.fillCircle(0, -42, 38);
    this.bones.lineStyle(5, Palette.boneShadow, 1);
    this.bones.fillStyle(Palette.bone, 1);
    this.bones.fillCircle(0, -42, 28);
    this.bones.fillStyle(Palette.night, 1);
    this.bones.fillCircle(-10, -45, 8);
    this.bones.fillCircle(10, -45, 8);
    this.bones.fillRoundedRect(-7, -32, 14, 8, 3);
    this.bones.lineStyle(4, Palette.bone, 1);
    this.bones.lineBetween(0, -14, 0, 18);
    this.bones.lineBetween(-20, -5, 20, -5);
    this.bones.lineBetween(-18, 14, 18, 14);
    this.bones.lineBetween(-20, -5, -35, 15);
    this.bones.lineBetween(20, -5, 35, 12);
    this.bones.lineBetween(-12, 18, -24, 38);
    this.bones.lineBetween(12, 18, 26, 38);
    this.bones.fillStyle(Palette.bone, 1);
    this.bones.fillCircle(-35, 15, 5);
    this.bones.fillCircle(35, 12, 5);
    this.bones.fillCircle(-24, 38, 5);
    this.bones.fillCircle(26, 38, 5);
  }

  celebrate() {
    this.scene.tweens.add({ targets: this, y: this.y - 18, yoyo: true, duration: 180, ease: 'Sine.easeOut' });
    this.scene.tweens.add({ targets: this, rotation: 0.08, yoyo: true, duration: 120, repeat: 1 });
    this.setWarmGlow(true);
    this.scene.time.delayedCall(500, () => this.setWarmGlow(false));
  }

  fallApart() {
    this.visible = false;
    const pieces: Phaser.GameObjects.Shape[] = [];
    const offsets = [[0,-42],[-15,-4],[15,-4],[0,14],[-25,28],[25,28],[-35,5],[35,5]];
    for (const [ox, oy] of offsets) {
      const p = this.scene.add.circle(this.x + ox * this.scaleX, this.y + oy * this.scaleY, Phaser.Math.Between(5, 12), Palette.bone);
      pieces.push(p);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-90, 90),
        y: p.y + Phaser.Math.Between(-80, 50),
        rotation: Phaser.Math.FloatBetween(-2, 2),
        alpha: 0,
        duration: 650,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
    this.scene.time.delayedCall(700, () => { this.visible = true; this.celebrate(); });
  }
}
