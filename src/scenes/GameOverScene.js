import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.72).setOrigin(0);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 40, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ff4d4d',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 20, 'Presioná ENTER o click para volver a intentar', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const restart = () => {
      this.registry.set('level', 1);
      this.registry.set('score', 0);
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
