import Phaser from 'phaser';
import { KEYS } from '../enums/keys.js';
import { getPhrase } from '../services/translations.js';

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
    this.appleIcon = this.add
      .image(26, 68, 'apple')
      .setDisplaySize(20, 15)
      .setScrollFactor(0)
      .setAlpha(0.35);
    this.appleText = this.add
      .text(44, 60, '', { fontFamily: 'monospace', fontSize: '16px', color: '#8bd450' })
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
      .text(this.scale.width / 2, this.scale.height - 14, `${getPhrase(KEYS.WASD_MOVER)} | ${getPhrase(KEYS.CLICK_DERECHO_DISPARAR)} | ${getPhrase(KEYS.C_COMER)}`, {
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
    this.bossBars = new Map();

    this.game.events.on('hud-update', this.render, this);
    this.game.events.on('hud-hint', this.showHint, this);
    this.game.events.on('boss-health-changed', this.updateBossBar, this);
    this.game.events.on('boss-died', this.removeBossBar, this);
    const initialStats = this.registry.get('stats');
    if (initialStats) this.render(initialStats);
    this.events.once('shutdown', () => {
      this.game.events.off('hud-update', this.render, this);
      this.game.events.off('hud-hint', this.showHint, this);
      this.game.events.off('boss-health-changed', this.updateBossBar, this);
      this.game.events.off('boss-died', this.removeBossBar, this);
      if (this.hintTimer) this.hintTimer.remove(false);
      this.bossBars.clear();
    });
  }

  updateBossBar({ id, label, health, maxHealth }) {
    let bar = this.bossBars.get(id);
    if (!bar) {
      const width = 220;
      const height = 12;
      const background = this.add
        .rectangle(0, 0, width, height, 0x000000, 0.75)
        .setOrigin(0.5);
      const fill = this.add
        .rectangle(-width / 2 + 2, 0, width - 4, height - 4, 0xff4d4d)
        .setOrigin(0, 0.5);
      const name = this.add
        .text(0, -13, label, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffb3b3',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      const container = this.add
        .container(this.scale.width / 2, 0, [background, fill, name])
        .setScrollFactor(0)
        .setDepth(30);
      bar = { container, fill, width };
      this.bossBars.set(id, bar);
      this.#reflowBossBars();
    }

    const ratio = maxHealth > 0 ? Phaser.Math.Clamp(health / maxHealth, 0, 1) : 0;
    bar.fill.scaleX = ratio;
  }

  removeBossBar({ id }) {
    const bar = this.bossBars.get(id);
    if (!bar) return;
    bar.container.destroy();
    this.bossBars.delete(id);
    this.#reflowBossBars();
  }

  #reflowBossBars() {
    let index = 0;
    for (const bar of this.bossBars.values()) {
      bar.container.setPosition(this.scale.width / 2, 28 + index * 34);
      index += 1;
    }
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
    this.ammoText.setText(`${getPhrase(KEYS.FLECHAS)} ${stats.ammo}/${stats.maxAmmo}`);
    this.appleIcon.setAlpha(stats.apples > 0 ? 1 : 0.35);
    this.appleText.setText(`${getPhrase(KEYS.COMIDA_C_PARA_COMER)} ${stats.apples}`);
    this.keysText.setText(`${getPhrase(KEYS.LLAVES)}: ${stats.keys}/3`);
    this.scoreText.setText(`${getPhrase(KEYS.PUNTOS_2)}: ${stats.score}`);
  }
}
