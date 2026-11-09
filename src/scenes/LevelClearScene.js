import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { KEYS } from '../enums/keys.js';
import { getPhrase } from '../services/translations.js';

export class LevelClearScene extends Phaser.Scene {
  constructor() {
    super('LevelClearScene');
  }

  create(data) {
    const score = data?.score ?? 0;
    const level = data?.level ?? 1;
    const isFinal = data?.isFinal ?? false;

    const title = isFinal
      ? getPhrase(KEYS.JUEGO_COMPLETADO)
      : getPhrase(KEYS.NIVEL_N_SUPERADO).replace('{n}', level);
    const titleColor = isFinal ? '#ffd83d' : '#66ff99';
    const prompt = isFinal
      ? getPhrase(KEYS.PRESIONA_ENTER_O_CLICK_PARA_VOLVER_AL_MENU_PRINCIPAL)
      : getPhrase(KEYS.PRESIONA_ENTER_O_CLICK_PARA_JUGAR_EL_NIVEL_N).replace('{n}', level + 1);
    const titleY = this.scale.height / 2 + (isFinal ? -75 : -50);
    const scoreY = this.scale.height / 2 + (isFinal ? -5 : 10);
    const promptY = this.scale.height / 2 + (isFinal ? 95 : 55);

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.72).setOrigin(0);
    this.add
      .text(this.scale.width / 2, titleY, title, {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(
        this.scale.width / 2,
        scoreY,
        isFinal
          ? `${getPhrase(KEYS.PUNTAJE_FINAL)} ${score}`
          : `${getPhrase(KEYS.PUNTOS_OBTENIDOS)} ${score}`,
        {
          fontFamily: 'monospace',
          fontSize: '22px',
          color: '#ffd83d',
        },
      )
      .setOrigin(0.5);
    if (isFinal) {
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2 + 40,
          `${getPhrase(KEYS.NIVELES_COMPLETADOS)} ${CONFIG.TOTAL_LEVELS}/${CONFIG.TOTAL_LEVELS}`,
          {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#66ff99',
          },
        )
        .setOrigin(0.5);
    }
    this.add
      .text(this.scale.width / 2, promptY, prompt, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const restart = () => {
      if (isFinal) {
        this.registry.set('level', 1);
        this.registry.set('score', 0);
        this.scene.start('MainMenuScene');
        return;
      }
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
