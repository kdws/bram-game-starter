import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addPanel } from '../game/ui';
import { makeProblem, MathProblem } from '../learning/problemGenerator';
import { recordAttempt } from '../learning/mastery';
import { GameProgress } from '../game/progress/GameProgress';
import { showLifeSparkToast } from '../game/ui/sparkToast';

type SceneMode = 'demo' | 'slice';

interface PlatformSceneData {
  mode?: SceneMode;
}

export class PlatformScene extends Phaser.Scene {
  private bram!: Bram;
  private body!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private problem!: MathProblem;
  private prompt!: Phaser.GameObjects.Text;
  private answerButtons: Phaser.GameObjects.Container[] = [];
  private bridge!: Phaser.GameObjects.Rectangle;
  private solved = false;
  private mode: SceneMode = 'demo';
  private sliceCompleted = false;

  constructor() { super('PlatformScene'); }

  init(data: PlatformSceneData) {
    this.mode = data?.mode ?? 'demo';
    this.solved = false;
    this.sliceCompleted = false;
    this.answerButtons = [];
  }

  create() {
    this.physics.world.gravity.y = 1200;
    this.cameras.main.setBackgroundColor(0x243032);
    this.drawBackground();
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));

    this.bram = new Bram(this, 150, 480, { scale: 1.05 });
    this.physics.add.existing(this.bram);
    this.body = this.bram.body as Phaser.Physics.Arcade.Body;
    // Body bottom = container y +38 = Bram's feet line (see Bram.FEET_OFFSET_Y).
    // This keeps the new v0.1-runtime atlas standing on platforms cleanly
    // instead of sinking 24px into them; procedural fallback feet also sit at +38.
    this.body.setSize(58, 90).setOffset(-29, -52).setCollideWorldBounds(true);

    const platforms = this.physics.add.staticGroup();
    this.makePlatform(platforms, 0, 620, 420, 80);
    this.makePlatform(platforms, 520, 500, 250, 60);
    this.makePlatform(platforms, 890, 405, 340, 60);
    this.physics.add.collider(this.bram, platforms);

    this.bridge = this.add.rectangle(770, 478, 160, 30, Palette.gold, 0.35);
    this.bridge.visible = false;
    const bridgeBody = this.physics.add.existing(this.bridge, true).body as Phaser.Physics.Arcade.Body;
    bridgeBody.enable = false;
    this.physics.add.collider(this.bram, this.bridge);

    addPanel(this, 40, 34, 560, 84, 0.84);
    this.prompt = this.add.text(66, 55, '', { fontFamily: 'Georgia, serif', fontSize: '34px', color: '#ffe9ad' });
    this.add.text(40, 666, '← → move    ↑/space jump    solve to reveal bridge    M menu', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0dcae' });
    this.newPuzzle();
  }

  update() {
    const speed = 310;
    if (this.cursors.left.isDown) this.body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.body.setVelocityX(speed);
    else this.body.setVelocityX(0);

    if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.body.blocked.down) {
      this.body.setVelocityY(-620);
    }
  }

  private drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x253c3f, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0x56715f, 0.23);
      g.fillCircle(200 + i * 220, 390 - i * 24, 170);
    }
    g.fillStyle(Palette.warmWindow, 0.9).fillCircle(1060, 170, 22);
    g.lineStyle(5, Palette.parchmentDark, 0.7).strokeCircle(1060, 170, 86);
  }

  private makePlatform(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, w: number, h: number) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h, Palette.bark, 1);
    rect.setStrokeStyle(4, Palette.parchmentDark, 0.55);
    group.add(rect);
  }

  private newPuzzle() {
    this.problem = makeProblem('subtract-within-20');
    this.prompt.setText(`Move the bridge: ${this.problem.prompt}`);
    this.answerButtons.forEach(b => b.destroy());
    this.answerButtons = [];
    this.problem.choices.forEach((choice, index) => {
      const x = 685 + index * 110;
      const y = 158;
      const c = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 86, 58, Palette.ink, 0.93).setStrokeStyle(4, Palette.gold, 0.8);
      const text = this.add.text(0, 0, String(choice), { fontFamily: 'Georgia, serif', fontSize: '31px', color: '#ffefb8' }).setOrigin(0.5);
      c.add([bg, text]);
      c.setInteractive(new Phaser.Geom.Rectangle(-43, -29, 86, 58), Phaser.Geom.Rectangle.Contains);
      c.on('pointerdown', () => this.answer(choice));
      this.answerButtons.push(c);
    });
  }

  private answer(choice: number | string) {
    if (this.solved) return;
    const correct = String(choice) === String(this.problem.answer);
    recordAttempt(this.problem.skillId, correct);
    if (correct) {
      this.solved = true;
      this.bridge.visible = true;
      const b = this.bridge.body as Phaser.Physics.Arcade.Body;
      b.enable = true;
      this.prompt.setText('Bridge remembered. Cross to the heart spark!');
      this.bram.celebrate();
      const spark = this.add.text(1040, 320, '♥', { fontFamily: 'Georgia, serif', fontSize: '58px', color: '#ffdf7a' }).setOrigin(0.5);
      this.tweens.add({ targets: spark, scale: 1.15, yoyo: true, repeat: -1, duration: 700 });
      if (this.mode === 'slice' && !this.sliceCompleted) {
        this.sliceCompleted = true;
        this.awardSparkAndAdvance();
      }
    } else {
      this.prompt.setText(`Try again. Hint: ${this.problem.hint}`);
      this.bram.fallApart();
    }
  }

  private awardSparkAndAdvance() {
    const total = GameProgress.addLifeSpark();
    showLifeSparkToast(this, { sparkCount: total });
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(450, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TopDownScene', { mode: 'slice' });
      });
    });
  }
}
