import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addPanel, addSmallText } from '../game/ui';
import { makeProblem, MathProblem } from '../learning/problemGenerator';
import { pickSkillForPrototype, recordAttempt } from '../learning/mastery';
import { GameProgress } from '../game/progress/GameProgress';
import { showLifeSparkToast } from '../game/ui/sparkToast';

export type SceneMode = 'demo' | 'slice';

interface RattleRunSceneData {
  mode?: SceneMode;
}

export class RattleRunScene extends Phaser.Scene {
  private bram!: Bram;
  private problem!: MathProblem;
  private score = 0;
  private streak = 0;
  private promptText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private gates: Phaser.GameObjects.Container[] = [];
  private gateLocked = false;
  private mode: SceneMode = 'demo';
  private sliceCompleted = false;

  constructor() { super('RattleRunScene'); }

  init(data: RattleRunSceneData) {
    this.mode = data?.mode ?? 'demo';
    this.score = 0;
    this.streak = 0;
    this.gateLocked = false;
    this.sliceCompleted = false;
    this.gates = [];
  }

  create() {
    this.cameras.main.setBackgroundColor(0x1b1711);
    this.physics.world.gravity.y = 0;
    this.drawScene();
    this.bram = new Bram(this, 190, 505, { skateboard: true, scale: 1.15 });
    addPanel(this, 32, 28, 520, 92, 0.84);
    this.promptText = this.add.text(58, 47, '', { fontFamily: 'Georgia, serif', fontSize: '34px', color: '#ffe9ad' });
    this.feedbackText = this.add.text(740, 42, 'Solve. Land. Remember.', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#f0dcae' });
    const hint = this.mode === 'slice'
      ? '← / → choose a gate    one clean landing earns a Life Spark    M menu'
      : '← / → choose an answer path     M menu';
    this.add.text(40, 666, hint, { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0dcae' });
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));
    this.newProblem();
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys();
    if (!this.gateLocked && cursors) {
      if (Phaser.Input.Keyboard.JustDown(cursors.left)) this.chooseGate(0);
      if (Phaser.Input.Keyboard.JustDown(cursors.up)) this.chooseGate(1);
      if (Phaser.Input.Keyboard.JustDown(cursors.right)) this.chooseGate(2);
    }
  }

  private drawScene() {
    const g = this.add.graphics();
    g.fillStyle(0x253027, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x3d4a36, 0.55 - i * 0.07);
      g.fillCircle(170 + i * 260, 470 - i * 46, 190 - i * 12);
    }
    g.fillStyle(Palette.bark, 1);
    g.beginPath();
    g.moveTo(0, 570); g.lineTo(1280, 430); g.lineTo(1280, 720); g.lineTo(0, 720); g.closePath(); g.fillPath();
    g.lineStyle(6, Palette.parchmentDark, 0.55).lineBetween(0, 570, 1280, 430);
    for (let i = 0; i < 20; i++) {
      g.fillStyle(Palette.glow, 0.15);
      g.fillCircle(Phaser.Math.Between(50, 1240), Phaser.Math.Between(80, 560), Phaser.Math.Between(3, 7));
    }
    g.fillStyle(Palette.warmWindow, 0.8);
    g.fillRoundedRect(960, 180, 56, 74, 8);
    g.fillStyle(Palette.bark, 1).fillRect(938, 254, 100, 12);
  }

  private newProblem() {
    this.gates.forEach(g => g.destroy());
    this.gates = [];
    this.gateLocked = false;
    this.problem = makeProblem(pickSkillForPrototype());
    this.promptText.setText(this.problem.prompt);
    this.feedbackText.setText(`Score ${this.score}   Streak ${this.streak}`);
    const xs = [780, 940, 1100];
    this.problem.choices.slice(0, 3).forEach((choice, index) => {
      const gate = this.makeGate(xs[index], 462 - index * 8, String(choice), index);
      this.gates.push(gate);
    });
  }

  private makeGate(x: number, y: number, label: string, index: number) {
    const c = this.add.container(x, y);
    const ring = this.add.graphics();
    ring.fillStyle(Palette.ink, 0.88).fillCircle(0, 0, 52);
    ring.lineStyle(5, Palette.gold, 0.9).strokeCircle(0, 0, 52);
    const t = this.add.text(0, 0, label, { fontFamily: 'Georgia, serif', fontSize: '38px', color: '#ffefb8' }).setOrigin(0.5);
    const hint = this.add.text(0, 76, index === 0 ? '←' : index === 1 ? '↑' : '→', { fontFamily: 'Georgia, serif', fontSize: '26px', color: '#f0dcae' }).setOrigin(0.5);
    c.add([ring, t, hint]);
    c.setInteractive(new Phaser.Geom.Circle(0, 0, 58), Phaser.Geom.Circle.Contains);
    c.on('pointerdown', () => this.chooseGate(index));
    this.tweens.add({ targets: c, y: y - 8, duration: 900 + index * 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return c;
  }

  private chooseGate(index: number) {
    this.gateLocked = true;
    const chosen = this.problem.choices[index];
    const correct = String(chosen) === String(this.problem.answer);
    recordAttempt(this.problem.skillId, correct);
    const target = this.gates[index];
    this.tweens.add({ targets: this.bram, x: target.x - 72, y: target.y + 50, duration: 450, ease: 'Sine.easeInOut' });
    this.time.delayedCall(460, () => {
      if (correct) {
        this.score += 10; this.streak += 1;
        this.feedbackText.setText('Clean landing! ✦');
        this.bram.celebrate();
        this.spawnSpark(target.x, target.y);
        if (this.mode === 'slice' && !this.sliceCompleted) {
          this.sliceCompleted = true;
          this.awardSparkAndAdvance();
          return;
        }
      } else {
        this.streak = 0;
        this.feedbackText.setText(`Rattle crash! Hint: ${this.problem.hint}`);
        this.bram.fallApart();
      }
      this.time.delayedCall(correct ? 850 : 1400, () => {
        this.bram.setPosition(190, 505);
        this.newProblem();
      });
    });
  }

  private spawnSpark(x: number, y: number) {
    const s = this.add.text(x, y - 88, '✦', { fontFamily: 'Georgia, serif', fontSize: '62px', color: '#ffdf7a' }).setOrigin(0.5);
    this.tweens.add({ targets: s, y: s.y - 60, alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => s.destroy() });
  }

  private awardSparkAndAdvance() {
    const total = GameProgress.addLifeSpark();
    showLifeSparkToast(this, { sparkCount: total });
    this.time.delayedCall(1600, () => {
      this.cameras.main.fadeOut(450, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PlatformScene', { mode: 'slice' });
      });
    });
  }
}
