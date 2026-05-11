import Phaser from 'phaser';
import { Bram } from '../game/Bram';
import { Palette } from '../game/palette';
import { addPanel, addSmallText, addTitle } from '../game/ui';
import { ClockWidget } from '../game/ui/ClockWidget';
import { DialogueBox, DialogueLine } from '../game/ui/DialogueBox';
import { recordAttempt } from '../learning/mastery';
import type { SkillId } from '../learning/skills';

type Hand = 'hour' | 'minute' | 'both';
type RoundType = 'set-time' | 'read-time';

interface RoundDef {
  type: RoundType;
  prompt: string;
  skillId: SkillId;
  start: { hour: number; minute: number };
  target: { hour: number; minute: number };
  successMicro: string;
  hintVerbal: string;
  hintHand: Hand;
  choices?: string[];
}

const ROUNDS: RoundDef[] = [
  {
    type: 'set-time',
    prompt: 'Set the clock to 3:00.',
    skillId: 'time-oclock',
    start: { hour: 12, minute: 0 },
    target: { hour: 3, minute: 0 },
    successMicro: 'O’clock! The long hand rests at 12.',
    hintVerbal: 'The long hand should point straight up to 12.',
    hintHand: 'minute'
  },
  {
    type: 'set-time',
    prompt: 'Set the clock to 7:30.',
    skillId: 'time-half-hour',
    start: { hour: 12, minute: 0 },
    target: { hour: 7, minute: 30 },
    successMicro: 'Half past! The long hand points to 6.',
    hintVerbal: 'Half past means 30 minutes. The long hand points to 6.',
    hintHand: 'minute'
  },
  {
    type: 'set-time',
    prompt: 'Set the clock to half past 5.',
    skillId: 'time-words-half-past',
    start: { hour: 12, minute: 0 },
    target: { hour: 5, minute: 30 },
    successMicro: 'Half past five means 5:30.',
    hintVerbal: '“Half past five” means the hour is 5 and the minute hand is on the 6.',
    hintHand: 'both'
  },
  {
    type: 'read-time',
    prompt: 'Read the clock. What time is shown?',
    skillId: 'time-analog-to-digital-oclock',
    start: { hour: 9, minute: 0 },
    target: { hour: 9, minute: 0 },
    successMicro: '9 o’clock! The short hand is on 9, the long hand on 12.',
    hintVerbal: 'Look at the short hand first. Which hour has it passed?',
    hintHand: 'hour',
    choices: ['8:00', '9:00', '9:30']
  },
  {
    type: 'set-time',
    prompt: 'Optional challenge: set the clock to 11:15.',
    skillId: 'time-quarter-hour',
    start: { hour: 12, minute: 0 },
    target: { hour: 11, minute: 15 },
    successMicro: 'Quarter past! Fifteen minutes have passed the hour.',
    hintVerbal: 'Quarter past means 15 minutes. The long hand points to 3.',
    hintHand: 'minute'
  }
];

interface ButtonHandle {
  destroy(): void;
  setVisible(visible: boolean): void;
}

export class ClockTowerScene extends Phaser.Scene {
  private bram!: Bram;
  private owl!: Phaser.GameObjects.Container;
  private clock!: ClockWidget;
  private promptText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private successText!: Phaser.GameObjects.Text;
  private roundLabel!: Phaser.GameObjects.Text;
  private dialogue!: DialogueBox;

  private actionButtons: ButtonHandle[] = [];
  private currentRoundIndex = -1;
  private attempts = 0;
  private busy = false;

  constructor() { super('ClockTowerScene'); }

  create() {
    this.cameras.main.setBackgroundColor(0x121a1a);
    this.drawMarshBackground();

    addTitle(this, 'Clocktower Marsh', 40, 24, 30);
    addSmallText(this, 'Lanterns sway. A great clock face hums in the mist.', 40, 64, 18);

    addPanel(this, 40, 96, 1200, 78, 0.86);
    this.promptText = this.add.text(60, 116, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#ffe9ad',
      wordWrap: { width: 1160 }
    });
    this.roundLabel = this.add.text(1220, 116, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#f0dcae'
    }).setOrigin(1, 0);

    this.hintText = this.add.text(60, 178, '', {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontSize: '18px',
      color: '#ffdf7a',
      wordWrap: { width: 1160 }
    });
    this.successText = this.add.text(60, 210, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#a5d68c',
      fontStyle: 'bold',
      wordWrap: { width: 1160 }
    });

    this.clock = new ClockWidget(this, 640, 380, { radius: 190 });

    this.bram = new Bram(this, 160, 600, { scale: 0.95 });
    this.owl = this.makeOwl(1110, 480);

    this.dialogue = new DialogueBox(this, 60, 540, 1160, 150);
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));
    addSmallText(this, 'M for menu.', 40, 692, 14);

    this.startIntro();
  }

  // ---------- flow ----------

  private startIntro() {
    this.clock.setEnabled(false);
    this.clock.setTime(12, 0);
    this.promptText.setText('Welcome to the Clocktower.');

    const lines: DialogueLine[] = [
      { speaker: 'Owl', text: 'Clocks have two hands, little rattler.' },
      { speaker: 'Bram', text: 'I have zero hands. So I’m already impressed.' },
      { speaker: 'Owl', text: 'The short hand tells the hour. The long hand tells the minutes.' },
      { speaker: 'Owl', text: 'Move the hands, watch the little digital clock, then ring the bell.' }
    ];
    this.dialogue.play(lines, { onComplete: () => this.startFreeExplore() });
  }

  private startFreeExplore() {
    this.clearActionButtons();
    this.clock.setEnabled(true);
    this.clock.setTime(10, 10);
    this.promptText.setText('Try moving the clock hands. Watch the digital mirror change.');
    this.hintText.setText('');
    this.successText.setText('');
    this.roundLabel.setText('');
    this.actionButtons.push(
      this.makeButton('Start Bell Trial', 480, 660, 320, 50, () => this.startRound(0))
    );
  }

  private startRound(index: number) {
    this.clearActionButtons();
    this.clock.clearHighlights();
    this.clock.showGhostHands(false);
    this.clock.setMinuteLabelsVisible(false);
    this.successText.setText('');
    this.hintText.setText('');
    this.busy = false;
    this.currentRoundIndex = index;
    this.attempts = 0;
    const round = ROUNDS[index];
    this.clock.setTime(round.start.hour, round.start.minute);
    this.clock.setTargetTime(round.target.hour, round.target.minute);
    this.promptText.setText(round.prompt);
    this.roundLabel.setText(`Round ${index + 1} of ${ROUNDS.length}`);

    if (round.type === 'set-time') {
      this.clock.setEnabled(true);
      this.actionButtons.push(
        this.makeButton('Ring the Bell', 520, 660, 240, 50, () => this.submitSetTime())
      );
    } else {
      this.clock.setEnabled(false);
      const w = 160;
      const total = (round.choices?.length ?? 0) * w + ((round.choices?.length ?? 1) - 1) * 24;
      const startX = (1280 - total) / 2;
      round.choices?.forEach((label, i) => {
        const bx = startX + i * (w + 24);
        this.actionButtons.push(
          this.makeButton(label, bx, 658, w, 50, () => this.submitChoice(label))
        );
      });
    }
  }

  private submitSetTime() {
    if (this.busy) return;
    const round = ROUNDS[this.currentRoundIndex];
    const t = this.clock.getTime();
    const correct = t.hour === round.target.hour && t.minute === round.target.minute;
    if (correct) this.handleCorrect(); else this.handleWrong();
  }

  private submitChoice(choice: string) {
    if (this.busy) return;
    const round = ROUNDS[this.currentRoundIndex];
    const expected = this.formatTime(round.target.hour, round.target.minute);
    if (choice === expected) this.handleCorrect(); else this.handleWrong();
  }

  private handleCorrect() {
    const round = ROUNDS[this.currentRoundIndex];
    recordAttempt(round.skillId, true);
    this.busy = true;
    this.bram.celebrate();
    this.hintText.setText('');
    this.successText.setText(round.successMicro);
    this.clock.clearHighlights();
    this.clock.showGhostHands(false);
    this.clearActionButtons();
    this.time.delayedCall(1500, () => {
      if (this.currentRoundIndex >= ROUNDS.length - 1) {
        this.completeAll();
      } else {
        this.startRound(this.currentRoundIndex + 1);
      }
    });
  }

  private handleWrong() {
    const round = ROUNDS[this.currentRoundIndex];
    recordAttempt(round.skillId, false);
    this.attempts += 1;
    this.bram.fallApart();
    this.applyHintEscalation(round);
  }

  private applyHintEscalation(round: RoundDef) {
    if (this.attempts === 1) {
      this.hintText.setText(`Hint: ${round.hintVerbal}`);
    } else if (this.attempts === 2) {
      this.hintText.setText(`Hint: ${round.hintVerbal}`);
      this.applyHandHighlight(round.hintHand);
    } else {
      this.hintText.setText(`Hint: ${round.hintVerbal}  (look at the ghost hands)`);
      this.applyHandHighlight(round.hintHand);
      this.clock.showGhostHands(true);
      this.clock.setMinuteLabelsVisible(true);
    }
  }

  private applyHandHighlight(hand: Hand) {
    this.clock.clearHighlights();
    if (hand === 'hour' || hand === 'both') this.clock.highlightHourHand();
    if (hand === 'minute' || hand === 'both') this.clock.highlightMinuteHand();
  }

  private completeAll() {
    this.busy = true;
    this.clearActionButtons();
    this.clock.clearHighlights();
    this.clock.showGhostHands(false);
    this.clock.setEnabled(false);
    this.successText.setText('Bell Spark found!');
    this.spawnBellSpark();
    this.bram.celebrate();

    const lines: DialogueLine[] = [
      { speaker: 'Owl', text: 'Well rung. The clock remembered one more piece of the world.' }
    ];
    this.time.delayedCall(900, () => {
      this.dialogue.play(lines, {
        onComplete: () => {
          this.actionButtons.push(
            this.makeButton('Return to menu', 460, 640, 360, 56, () => this.scene.start('MenuScene'))
          );
        }
      });
    });
  }

  // ---------- visuals ----------

  private drawMarshBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x121a1a, 1).fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 60; i++) {
      g.fillStyle(Palette.glow, Phaser.Math.FloatBetween(0.04, 0.18));
      g.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 420), Phaser.Math.Between(2, 4));
    }
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x1c2826, 0.7 - i * 0.12);
      g.fillCircle(180 + i * 260, 470 - i * 30, 240 - i * 18);
    }
    g.fillStyle(0x2a3530, 1);
    g.fillRect(0, 560, 1280, 160);
    g.fillStyle(0x1f2a26, 1);
    for (let x = 60; x < 1280; x += 90) {
      const w = Phaser.Math.Between(40, 70);
      const h = Phaser.Math.Between(14, 28);
      g.fillRoundedRect(x, 560 - h / 2, w, h, 8);
    }
    g.fillStyle(0x1a1410, 0.92);
    g.fillRoundedRect(420, 60, 440, 180, 14);
    g.fillStyle(0x2a1f15, 1);
    g.fillRoundedRect(540, 30, 200, 80, 18);
    g.fillStyle(Palette.warmWindow, 0.85);
    g.fillCircle(640, 90, 16);
    for (let i = 0; i < 8; i++) {
      const x = 100 + i * 160;
      const y = 250 + (i % 2 === 0 ? 0 : 20);
      g.fillStyle(0x4a3a26, 1);
      g.fillRect(x - 2, y, 4, 60);
      g.fillStyle(Palette.warmWindow, 0.92);
      g.fillCircle(x, y + 70, 9);
      g.fillStyle(Palette.glow, 0.18);
      g.fillCircle(x, y + 70, 20);
    }
    for (let i = 0; i < 5; i++) {
      const sx = 120 + i * 240;
      g.fillStyle(Palette.moss, 1);
      g.fillCircle(sx, 540, 22);
      g.fillStyle(0x4a5a36, 1);
      g.fillCircle(sx + 12, 538, 16);
    }
  }

  private makeOwl(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(0x5a4a32, 1);
    body.fillEllipse(0, 8, 100, 120);
    body.fillStyle(0x6f5b3d, 1);
    body.fillEllipse(0, 0, 84, 90);
    body.fillStyle(0x3a2c1c, 1);
    body.fillTriangle(-38, -50, -16, -24, -24, -18);
    body.fillTriangle(38, -50, 16, -24, 24, -18);
    body.fillStyle(Palette.bone, 1);
    body.fillCircle(-20, -14, 16);
    body.fillCircle(20, -14, 16);
    body.fillStyle(Palette.ink, 1);
    body.fillCircle(-20, -14, 8);
    body.fillCircle(20, -14, 8);
    body.fillStyle(Palette.glow, 1);
    body.fillCircle(-17, -17, 3);
    body.fillCircle(23, -17, 3);
    body.fillStyle(Palette.gold, 1);
    body.fillTriangle(-6, 2, 6, 2, 0, 14);
    const stone = this.add.graphics();
    stone.fillStyle(0x4a4538, 1);
    stone.fillEllipse(0, 78, 160, 28);
    c.add([stone, body]);
    this.tweens.add({ targets: c, y: y - 8, yoyo: true, repeat: -1, duration: 1700, ease: 'Sine.easeInOut' });
    return c;
  }

  private spawnBellSpark() {
    const cx = 640;
    const cy = 380;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const r = Phaser.Math.FloatBetween(120, 230);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const s = this.add.text(x, y, '✦', {
        fontFamily: 'Georgia, serif',
        fontSize: `${Phaser.Math.Between(22, 38)}px`,
        color: '#ffdf7a'
      }).setOrigin(0.5).setAlpha(0).setDepth(2000);
      this.tweens.add({
        targets: s,
        alpha: 1,
        y: y - 50,
        duration: 1000,
        delay: i * 50,
        ease: 'Quad.easeOut'
      });
      this.tweens.add({
        targets: s,
        alpha: 0,
        delay: 1000 + i * 50,
        duration: 700,
        onComplete: () => s.destroy()
      });
    }
  }

  // ---------- helpers ----------

  private makeButton(label: string, x: number, y: number, w: number, h: number, onClick: () => void): ButtonHandle {
    const bg = this.add.graphics();
    bg.fillStyle(Palette.bark, 0.95);
    bg.lineStyle(3, Palette.gold, 0.9);
    bg.fillRoundedRect(x, y, w, h, 14);
    bg.strokeRoundedRect(x, y, w, h, 14);
    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#ffe9ad'
    }).setOrigin(0.5);
    const hit = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => text.setScale(1.04));
    hit.on('pointerout', () => text.setScale(1));
    hit.on('pointerdown', onClick);
    return {
      destroy() { bg.destroy(); text.destroy(); hit.destroy(); },
      setVisible(v: boolean) { bg.setVisible(v); text.setVisible(v); hit.setActive(v).setVisible(v); }
    };
  }

  private clearActionButtons() {
    for (const b of this.actionButtons) b.destroy();
    this.actionButtons = [];
  }

  private formatTime(hour: number, minute: number): string {
    const h = hour === 0 ? 12 : hour;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
