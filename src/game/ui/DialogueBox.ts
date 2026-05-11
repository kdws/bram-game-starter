import Phaser from 'phaser';
import { Palette } from '../palette';

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface DialogueOptions {
  onComplete?: () => void;
  onAdvance?: (index: number) => void;
}

export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private clickZone: Phaser.GameObjects.Zone;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;
  private lines: DialogueLine[] = [];
  private index = 0;
  private onComplete?: () => void;
  private onAdvance?: (index: number) => void;
  private active = false;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
    this.scene = scene;

    const g = scene.add.graphics();
    g.fillStyle(Palette.parchment, 0.96);
    g.lineStyle(4, Palette.parchmentDark, 1);
    g.fillRoundedRect(0, 0, w, h, 22);
    g.strokeRoundedRect(0, 0, w, h, 22);
    g.lineStyle(2, Palette.gold, 0.65);
    g.strokeRoundedRect(10, 10, w - 20, h - 20, 16);

    this.nameText = scene.add.text(28, 18, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#7a4a18',
      fontStyle: 'bold'
    });

    this.bodyText = scene.add.text(28, 58, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#2a1f12',
      wordWrap: { width: w - 56 }
    });

    this.hintText = scene.add.text(w - 24, h - 18, '▶ space / click', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#7a5e2c'
    }).setOrigin(1, 1);

    this.container = scene.add.container(x, y, [g, this.nameText, this.bodyText, this.hintText]);
    this.container.setDepth(1000);
    this.container.setVisible(false);

    this.clickZone = scene.add.zone(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setDepth(1001);
    this.clickZone.on('pointerdown', () => this.advance());
    this.clickZone.setActive(false).setVisible(false);

    if (scene.input.keyboard) {
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    scene.events.on('update', this.handleKeys, this);
    scene.events.once('shutdown', () => this.destroy());
    scene.events.once('destroy', () => this.destroy());
  }

  play(lines: DialogueLine[], opts: DialogueOptions = {}): void {
    this.lines = lines;
    this.index = 0;
    this.onComplete = opts.onComplete;
    this.onAdvance = opts.onAdvance;
    this.active = true;
    this.container.setVisible(true);
    this.clickZone.setActive(true).setVisible(true);
    this.render();
  }

  hide(): void {
    this.active = false;
    this.container.setVisible(false);
    this.clickZone.setActive(false).setVisible(false);
  }

  destroy(): void {
    this.active = false;
    this.scene.events.off('update', this.handleKeys, this);
    this.container.destroy();
    this.clickZone.destroy();
  }

  private handleKeys(): void {
    if (!this.active) return;
    if ((this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
        (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey))) {
      this.advance();
    }
  }

  private advance(): void {
    if (!this.active) return;
    this.onAdvance?.(this.index);
    this.index += 1;
    if (this.index >= this.lines.length) {
      this.hide();
      const cb = this.onComplete;
      this.onComplete = undefined;
      cb?.();
    } else {
      this.render();
    }
  }

  private render(): void {
    const line = this.lines[this.index];
    this.nameText.setText(line.speaker);
    this.bodyText.setText(line.text);
    const remaining = this.lines.length - this.index - 1;
    this.hintText.setText(remaining > 0 ? `▶ space / click  (${remaining} more)` : '▶ space / click');
  }
}
