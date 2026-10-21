import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    this.input.mouse.disableContextMenu();

    this.add.tileSprite(0, 0, width, height, 'floor').setOrigin(0, 0);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0);

    this.add
      .text(width / 2, height / 2 - 140, 'EL LABERINTO MALDITO', {
        fontFamily: 'monospace',
        fontSize: '46px',
        color: '#ffd83d',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height / 2 + 20,
        'CONTROLES\n\nWASD: mover\nClick derecho: disparar\nC: comer',
        {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 90, 'Presioná ENTER o click para empezar', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#66ff99',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const start = () => {
      this.registry.set('level', 1);
      this.registry.set('score', 0);
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.once('pointerdown', start);
  }
}
