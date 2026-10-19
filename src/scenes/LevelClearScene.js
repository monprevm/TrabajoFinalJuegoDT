import Phaser from 'phaser';

export class LevelClearScene extends Phaser.Scene {
  constructor() {
    super('LevelClearScene');
  }

  create(data) {
    const score = data?.score ?? 0;
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.72).setOrigin(0);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 50, '¡NIVEL 1 SUPERADO!', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: '#66ff99',
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
      .text(this.scale.width / 2, this.scale.height / 2 + 55, 'Presioná ENTER o click para jugar de nuevo', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const restart = () => {
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
