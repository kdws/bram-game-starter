import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addPanel } from '../game/ui';
import { makeProblem, MathProblem } from '../learning/problemGenerator';
import { recordAttempt } from '../learning/mastery';
import { GameProgress } from '../game/progress/GameProgress';
import { showLifeSparkToast } from '../game/ui/sparkToast';

type SceneMode = 'demo' | 'slice';

interface TopDownSceneData {
  mode?: SceneMode;
}

interface Coin { value: number; obj: Phaser.GameObjects.Container; collected: boolean; }

export class TopDownScene extends Phaser.Scene {
  private bram!: Bram;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private problem!: MathProblem;
  private coins: Coin[] = [];
  private total = 0;
  private prompt!: Phaser.GameObjects.Text;
  private gate!: Phaser.GameObjects.Rectangle;
  private mode: SceneMode = 'demo';
  private sliceCompleted = false;

  constructor() { super('TopDownScene'); }

  init(data: TopDownSceneData) {
    this.mode = data?.mode ?? 'demo';
    this.total = 0;
    this.coins = [];
    this.sliceCompleted = false;
  }

  create() {
    this.physics.world.gravity.y = 0;
    this.cameras.main.setBackgroundColor(0x1e241d);
    this.drawMap();
    this.bram = new Bram(this, 180, 550, { scale: 0.82 });
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,M') as Record<string, Phaser.Input.Keyboard.Key>;
    this.keys.M.on('down', () => this.scene.start('MenuScene'));
    addPanel(this, 34, 28, 620, 88, 0.84);
    this.prompt = this.add.text(62, 51, '', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ffe9ad' });
    this.add.text(40, 666, 'WASD/arrows move    collect exact coins    M menu', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0dcae' });
    this.gate = this.add.rectangle(1030, 140, 170, 46, Palette.wrong, 0.8).setStrokeStyle(4, Palette.parchmentDark, 0.8);
    this.add.text(1030, 140, 'LOCKED', { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff0c9' }).setOrigin(0.5);
    this.newCoinPuzzle();
  }

  update() {
    const speed = 4.2;
    let dx = 0, dy = 0;
    if (this.keys.A.isDown || this.keys.LEFT.isDown) dx -= speed;
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx += speed;
    if (this.keys.W.isDown || this.keys.UP.isDown) dy -= speed;
    if (this.keys.S.isDown || this.keys.DOWN.isDown) dy += speed;
    this.bram.x = Phaser.Math.Clamp(this.bram.x + dx, 70, 1210);
    this.bram.y = Phaser.Math.Clamp(this.bram.y + dy, 130, 620);
    this.checkCoins();
  }

  private drawMap() {
    const g = this.add.graphics();
    g.fillStyle(0x273326, 1).fillRect(0, 0, 1280, 720);
    g.fillStyle(0x3b4635, 1).fillRoundedRect(60, 130, 1160, 500, 18);
    g.lineStyle(4, Palette.parchmentDark, 0.6).strokeRoundedRect(60, 130, 1160, 500, 18);
    for (let x = 100; x < 1200; x += 80) {
      for (let y = 160; y < 610; y += 80) {
        g.fillStyle(0x2d382c, 0.55).fillRect(x, y, 64, 64);
      }
    }
    g.fillStyle(Palette.bark, 1).fillRoundedRect(760, 225, 230, 170, 12);
    g.fillStyle(Palette.moss, 1).fillRoundedRect(350, 220, 120, 260, 12);
    g.fillStyle(0x223d47, 1).fillRoundedRect(96, 190, 210, 180, 16);
    g.fillStyle(Palette.warmWindow, 0.9).fillCircle(205, 280, 30);
  }

  private newCoinPuzzle() {
    this.problem = makeProblem('coins-exact-amount');
    this.total = 0;
    this.prompt.setText(`${this.problem.prompt}     Current: 0¢`);
    const coinValues = [25, 10, 5, 1, 25, 10, 5, 1, 50];
    const positions = [[580,250],[660,250],[580,330],[660,330],[520,435],[740,435],[850,500],[930,500],[1030,500]];
    coinValues.forEach((value, i) => this.coins.push({ value, obj: this.makeCoin(positions[i][0], positions[i][1], value), collected: false }));
  }

  private makeCoin(x: number, y: number, value: number) {
    const c = this.add.container(x, y);
    const bg = this.add.circle(0, 0, 30, Palette.gold, 0.92).setStrokeStyle(4, Palette.parchmentDark, 1);
    const t = this.add.text(0, 0, `${value}¢`, { fontFamily: 'Georgia, serif', fontSize: '21px', color: '#3b2b16' }).setOrigin(0.5);
    c.add([bg, t]);
    this.tweens.add({ targets: c, y: y - 5, yoyo: true, repeat: -1, duration: 900 + Math.random() * 400 });
    return c;
  }

  private checkCoins() {
    for (const coin of this.coins) {
      if (coin.collected) continue;
      if (Phaser.Math.Distance.Between(this.bram.x, this.bram.y, coin.obj.x, coin.obj.y) < 54) {
        coin.collected = true;
        coin.obj.visible = false;
        this.total += coin.value;
        this.prompt.setText(`${this.problem.prompt}     Current: ${this.total}¢`);
        this.evaluateTotal();
      }
    }
  }

  private evaluateTotal() {
    if (this.total === Number(this.problem.answer)) {
      recordAttempt(this.problem.skillId, true);
      this.prompt.setText(`Exact change! The garden gate remembers you.`);
      this.gate.setFillStyle(Palette.correct, 0.8);
      this.bram.celebrate();
      if (this.mode === 'slice' && !this.sliceCompleted) {
        this.sliceCompleted = true;
        this.awardSparkAndAdvance();
      }
    } else if (this.total > Number(this.problem.answer)) {
      recordAttempt(this.problem.skillId, false);
      this.prompt.setText(`Too many coins. Hint: ${this.problem.hint}`);
      this.bram.fallApart();
      this.time.delayedCall(900, () => {
        this.coins.forEach(c => { c.collected = false; c.obj.visible = true; });
        this.total = 0;
        this.prompt.setText(`${this.problem.prompt}     Current: 0¢`);
      });
    }
  }

  private awardSparkAndAdvance() {
    const total = GameProgress.addLifeSpark();
    showLifeSparkToast(this, { sparkCount: total });
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RestorationScene', { stage: GameProgress.currentStage() });
      });
    });
  }
}
