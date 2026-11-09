import Phaser from 'phaser';
import { KEYS } from '../enums/keys.js';
import { getPhrase } from '../services/translations.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const score = data?.score ?? 0;
    const level = data?.level ?? 1;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0);

    this.add
      .text(width / 2, height / 2 - 110, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ff4d4d',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 30, `${getPhrase(KEYS.PUNTAJE)} ${score}`, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffd83d',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, `${getPhrase(KEYS.NIVEL_ALCANZADO)}: ${level}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height / 2 + 75,
        getPhrase(
          KEYS.ENTER_O_CLICK_REINTENTAR_DESDE_EL_NIVEL_1_ESC_VOLVER_AL_MENU_PRINCIPAL,
        ).replace(' ESC: ', '\nESC: '),
        {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    const resetRun = () => {
      this.registry.set('level', 1);
      this.registry.set('score', 0);
    };

    const retry = () => {
      resetRun();
      this.scene.start('GameScene');
    };
    const toMenu = () => {
      resetRun();
      this.scene.start('MainMenuScene');
    };

    this.input.keyboard.once('keydown-ENTER', retry);
    this.input.keyboard.once('keydown-ESC', toMenu);
    this.input.once('pointerdown', retry);
  }
}
