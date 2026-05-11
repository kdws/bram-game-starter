import Phaser from 'phaser';
import { Palette } from './palette';
import {
  BRAM_SKELETON_ATLAS,
  BRAM_SKELETON_META,
  bramSkeletonReady
} from './sprites/bramSkeletonAtlas';

// The procedural Bram was drawn at ~80px tall at scale 1.0. The atlas sprite
// is 192×192 with ~120px of visible character. Multiplying by this base scale
// keeps existing scene layouts (which were tuned against the procedural size)
// roughly correct without touching every call site.
const SPRITE_BASE_SCALE = 0.7;

// Container-local y at which the procedural Bram's feet sat. We place the
// sprite's bottom-center pivot here so the new art stands on the same line
// the procedural drawing stood on.
const FEET_OFFSET_Y = 38;

interface BramOptions {
  skateboard?: boolean;
  scale?: number;
}

export class Bram extends Phaser.GameObjects.Container {
  // Sprite mode
  private sprite?: Phaser.GameObjects.Sprite;
  private spriteGlow?: Phaser.GameObjects.Graphics;
  private idleKey: 'bram_skeleton_idle' | 'bram_skeleton_skate_ride';

  // Procedural fallback mode (kept for v0.1 safety; remove once atlas is locked)
  private bones?: Phaser.GameObjects.Graphics;
  private board?: Phaser.GameObjects.Graphics;

  private humanGlow = false;
  private hasSkateboard: boolean;
  private busyAnim = false;

  constructor(scene: Phaser.Scene, x: number, y: number, options: BramOptions = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    this.hasSkateboard = !!options.skateboard;
    this.idleKey = this.hasSkateboard ? 'bram_skeleton_skate_ride' : 'bram_skeleton_idle';

    if (bramSkeletonReady(scene)) {
      this.initSpriteMode();
    } else {
      this.initProceduralMode();
    }

    this.setScale(options.scale ?? 1);
  }

  // ---------- sprite mode ----------

  private initSpriteMode() {
    const glow = this.scene.add.graphics();
    this.add(glow);
    this.spriteGlow = glow;

    const sprite = this.scene.add.sprite(0, FEET_OFFSET_Y, BRAM_SKELETON_ATLAS, 'idle_0001');
    sprite.setOrigin(BRAM_SKELETON_META.origin.x, BRAM_SKELETON_META.origin.y);
    sprite.setScale(SPRITE_BASE_SCALE);
    sprite.play(this.idleKey);
    this.add(sprite);
    this.sprite = sprite;
  }

  private updateSpriteGlow() {
    if (!this.spriteGlow) return;
    this.spriteGlow.clear();
    if (!this.humanGlow) return;
    this.spriteGlow.fillStyle(Palette.glow, 0.32);
    this.spriteGlow.fillCircle(0, -18, 64);
    this.spriteGlow.fillStyle(Palette.glow, 0.16);
    this.spriteGlow.fillCircle(0, -18, 92);
  }

  // ---------- procedural fallback ----------

  private initProceduralMode() {
    this.bones = this.scene.add.graphics();
    this.add(this.bones);
    if (this.hasSkateboard) {
      this.board = this.scene.add.graphics();
      this.add(this.board);
    }
    this.redrawProcedural();
  }

  private redrawProcedural() {
    if (!this.bones) return;
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

  // ---------- public API (preserved across modes) ----------

  setWarmGlow(enabled: boolean) {
    this.humanGlow = enabled;
    if (this.sprite) {
      this.updateSpriteGlow();
    } else {
      this.redrawProcedural();
    }
  }

  redraw() {
    if (this.sprite) {
      this.updateSpriteGlow();
    } else {
      this.redrawProcedural();
    }
  }

  celebrate() {
    if (this.sprite) {
      this.playOnce('bram_skeleton_celebrate');
    }
    this.scene.tweens.add({ targets: this, y: this.y - 18, yoyo: true, duration: 180, ease: 'Sine.easeOut' });
    this.scene.tweens.add({ targets: this, rotation: 0.08, yoyo: true, duration: 120, repeat: 1 });
    this.setWarmGlow(true);
    this.scene.time.delayedCall(500, () => this.setWarmGlow(false));
  }

  fallApart() {
    if (this.sprite) {
      this.playFallApartChain();
      return;
    }
    this.fallApartProcedural();
  }

  private playOnce(animKey: string) {
    if (!this.sprite || this.busyAnim) return;
    if (!this.scene.anims.exists(animKey)) return;
    this.busyAnim = true;
    this.sprite.play(animKey);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.busyAnim = false;
      this.sprite?.play(this.idleKey);
    });
  }

  private playFallApartChain() {
    if (!this.sprite || this.busyAnim) return;
    if (!this.scene.anims.exists('bram_skeleton_fall_apart')) return;
    this.busyAnim = true;
    const sprite = this.sprite;
    sprite.play('bram_skeleton_fall_apart');
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.scene.anims.exists('bram_skeleton_reassemble')) {
        sprite.play('bram_skeleton_reassemble');
        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.busyAnim = false;
          sprite.play(this.idleKey);
        });
      } else {
        this.busyAnim = false;
        sprite.play(this.idleKey);
      }
    });
  }

  private fallApartProcedural() {
    this.visible = false;
    const offsets = [[0,-42],[-15,-4],[15,-4],[0,14],[-25,28],[25,28],[-35,5],[35,5]];
    for (const [ox, oy] of offsets) {
      const p = this.scene.add.circle(this.x + ox * this.scaleX, this.y + oy * this.scaleY, Phaser.Math.Between(5, 12), Palette.bone);
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
