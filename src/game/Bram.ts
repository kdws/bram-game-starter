import Phaser from 'phaser';
import { Palette } from './palette';
import {
  BRAM_SKELETON_ATLAS,
  BRAM_SKELETON_META,
  BRAM_SKELETON_IDLE_FRAME,
  bramSkeletonReady
} from './sprites/bramSkeletonAtlas';
import { AudioManager } from './audio/AudioManager';
import { AudioKeys } from './audio/AudioKeys';

// The procedural Bram was drawn at ~80px tall at scale 1.0. The v0.2 atlas
// sprite is 192×192 with ~120-150px of visible character. Multiplying by this
// base scale keeps existing scene layouts (tuned against the procedural size)
// roughly correct without touching every call site.
const SPRITE_BASE_SCALE = 0.7;

// Container-local y at which the procedural Bram's feet sat. We place the
// sprite's bottom-center pivot here so the new art stands on the same line
// the procedural drawing stood on.
const FEET_OFFSET_Y = 38;

// Dev-only: toggle this with H to see frame bounds, hitbox, and feet pivot.
const DEV_BUILD = import.meta.env.DEV;

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

  // Dev-only debug overlay (toggled with H)
  private debugGraphic?: Phaser.GameObjects.Graphics;
  private debugVisible = false;
  private debugHandler?: () => void;

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

    if (DEV_BUILD) this.bindDevDebugKey();
  }

  // ---------- dev debug overlay ----------

  private bindDevDebugKey() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    this.debugHandler = () => this.toggleDebugOverlay();
    kb.on('keydown-H', this.debugHandler);
    const cleanup = () => {
      if (this.debugHandler) kb.off('keydown-H', this.debugHandler);
      this.debugHandler = undefined;
    };
    this.scene.events.once('shutdown', cleanup);
    this.scene.events.once('destroy', cleanup);
  }

  private toggleDebugOverlay() {
    this.debugVisible = !this.debugVisible;
    this.updateDebugOverlay();
  }

  private updateDebugOverlay() {
    if (!this.debugGraphic) {
      this.debugGraphic = this.scene.add.graphics();
      this.add(this.debugGraphic);
    }
    const g = this.debugGraphic;
    g.clear();
    if (!this.debugVisible) return;

    const s = this.sprite ? SPRITE_BASE_SCALE : 1;
    const meta = BRAM_SKELETON_META;

    if (this.sprite) {
      // 192x192 sprite frame bounds (pre-container-scale, in local space)
      const frameW = meta.frameWidth * s;
      const frameH = meta.frameHeight * s;
      const frameLeft = -(meta.origin.x * frameW);
      const frameTop  = -(meta.origin.y * frameH) + FEET_OFFSET_Y;
      g.lineStyle(1, 0xff66ff, 0.6);
      g.strokeRect(frameLeft, frameTop, frameW, frameH);

      // suggested hitbox at native coords, scaled
      const hb = meta.hitbox;
      g.lineStyle(2, 0x00ff66, 0.95);
      g.strokeRect(
        frameLeft + hb.x * s,
        frameTop  + hb.y * s,
        hb.w * s,
        hb.h * s
      );
    }

    // feet pivot crosshair (container-local)
    g.lineStyle(2, 0xffff66, 1);
    g.lineBetween(-12, FEET_OFFSET_Y, 12, FEET_OFFSET_Y);
    g.lineBetween(0, FEET_OFFSET_Y - 12, 0, FEET_OFFSET_Y + 12);

    // container origin marker
    g.lineStyle(1, 0xff3366, 0.85);
    g.lineBetween(-6, 0, 6, 0);
    g.lineBetween(0, -6, 0, 6);
  }

  // ---------- sprite mode ----------

  private initSpriteMode() {
    const glow = this.scene.add.graphics();
    this.add(glow);
    this.spriteGlow = glow;

    const sprite = this.scene.add.sprite(0, FEET_OFFSET_Y, BRAM_SKELETON_ATLAS, BRAM_SKELETON_IDLE_FRAME);
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

  /**
   * Flip the side-view sprite horizontally. `up`/`down` are accepted for
   * call-site convenience but do not change facing on a side sprite.
   * Procedural fallback does not flip in v0.1 — it's drawn right-facing.
   */
  setFacing(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.sprite) return;
    if (direction === 'left') this.sprite.setFlipX(true);
    else if (direction === 'right') this.sprite.setFlipX(false);
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

  /**
   * Quick "stoop and stand" wobble used when Bram picks up a stone or
   * places one into a socket. Tween-based so it works for both the sprite
   * and procedural modes without needing a dedicated animation key. Safe
   * to call mid-movement — uses scaleY/scaleX deltas off the current value.
   */
  pickupBob() {
    const baseScaleY = this.scaleY;
    const baseScaleX = this.scaleX;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleY: baseScaleY * 0.86,
      scaleX: baseScaleX * 1.08,
      duration: 110,
      ease: 'Quad.easeOut',
      yoyo: true,
      onYoyo: () => { this.scaleY = baseScaleY; this.scaleX = baseScaleX; },
      onComplete: () => { this.scaleY = baseScaleY; this.scaleX = baseScaleX; }
    });
    // Tiny gold flash to make the moment feel deliberate.
    this.setWarmGlow(true);
    this.scene.time.delayedCall(180, () => this.setWarmGlow(false));
  }

  fallApart() {
    AudioManager.play(AudioKeys.BRAM_FALL_APART);
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
        AudioManager.play(AudioKeys.BRAM_REASSEMBLE);
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
    this.scene.time.delayedCall(700, () => {
      this.visible = true;
      AudioManager.play(AudioKeys.BRAM_REASSEMBLE);
      this.celebrate();
    });
  }
}
