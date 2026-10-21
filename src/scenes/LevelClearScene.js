import Phaser from 'phaser';

export class LevelClearScene extends Phaser.Scene {
  constructor() {
    super('LevelClearScene');
  }

  create(data) {
    const score = data?.score ?? 0;
    const level = data?.level ?? 1;
    const isFinal = data?.isFinal ?? false;

    const title = isFinal ? '¡JUEGO COMPLETADO!' : `¡NIVEL ${level} SUPERADO!`;
    const titleColor = isFinal ? '#ffd83d' : '#66ff99';
    const prompt = isFinal
      ? 'Presioná ENTER o click para jugar de nuevo'
      : `Presioná ENTER o click para jugar el nivel ${level + 1}`;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.72).setOrigin(0);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 50, title, {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 10, `Puntos obtenidos: ${score}`, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffd83d',
      })
      .setOrigin(0.5);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 55, prompt, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const restart = () => {
      if (isFinal) {
        this.registry.set('level', 1);
        this.registry.set('score', 0);
      }
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
