import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
  }

  create() {
    this.hearts = [];
    const heartY = 22;
    for (let i = 0; i < 5; i += 1) {
      const heart = this.add.image(24 + i * 26, heartY, 'heart-empty').setScrollFactor(0);
      this.hearts.push(heart);
    }

    this.ammoText = this.add
      .text(24, 40, '', { fontFamily: 'monospace', fontSize: '16px', color: '#8ecbff' })
      .setScrollFactor(0);
    this.appleText = this.add
      .text(24, 60, '', { fontFamily: 'monospace', fontSize: '16px', color: '#8bd450' })
      .setScrollFactor(0);
    this.keysText = this.add
      .text(this.scale.width - 24, 22, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffd83d',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.scoreText = this.add
      .text(this.scale.width - 24, 46, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.helpText = this.add
      .text(this.scale.width / 2, this.scale.height - 14, 'WASD: mover | Click derecho: disparar | C: comer', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0);

    const centerX = this.scale.width / 2;
    this.hintIcon = this.add
      .image(centerX - 32, 92, 'hada')
      .setDisplaySize(22, 22)
      .setScrollFactor(0)
      .setDepth(24)
      .setVisible(false);
    this.hintArrow = this.add
      .image(centerX + 2, 92, 'hint-arrow')
      .setScrollFactor(0)
      .setDepth(24)
      .setVisible(false);
    this.hintText = this.add
      .text(centerX, 116, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c9b8ff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(24)
      .setVisible(false);
    this.hintTimer = null;

    this.game.events.on('hud-update', this.render, this);
    this.game.events.on('hud-hint', this.showHint, this);
    const initialStats = this.registry.get('stats');
    if (initialStats) this.render(initialStats);
    this.events.once('shutdown', () => {
      this.game.events.off('hud-update', this.render, this);
      this.game.events.off('hud-hint', this.showHint, this);
      if (this.hintTimer) this.hintTimer.remove(false);
    });
  }

  showHint({ angle, label, durationMs = 5000 }) {
    if (this.hintTimer) this.hintTimer.remove(false);
    if (this.hintIcon) this.hintIcon.setVisible(true);
    if (this.hintArrow) this.hintArrow.setVisible(true).setRotation(angle);
    if (this.hintText) {
      this.hintText.setText(label).setVisible(true);
    }
    this.hintTimer = this.time.delayedCall(durationMs, () => this.hideHint());
  }

  hideHint() {
    if (this.hintIcon) this.hintIcon.setVisible(false);
    if (this.hintArrow) this.hintArrow.setVisible(false);
    if (this.hintText) this.hintText.setVisible(false);
    this.hintTimer = null;
  }

  render(stats) {
    this.hearts.forEach((heart, index) => {
      heart.setTexture(index < stats.health ? 'heart-full' : 'heart-empty');
      heart.setVisible(index < stats.maxHealth);
    });
    this.ammoText.setText(`Flechas: ${stats.ammo}/${stats.maxAmmo}`);
    this.appleText.setText(`Comida: ${stats.apples} (C para comer)`);
    this.keysText.setText(`Llaves: ${stats.keys}/3`);
    this.scoreText.setText(`Puntos: ${stats.score}`);
  }
}
