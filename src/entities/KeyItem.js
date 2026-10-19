import Phaser from 'phaser';

export class KeyItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'key');
    scene.add.existing(scene.physics.add.existing(this));
    this.body.setImmovable(true);
    scene.tweens.add({
      targets: this,
      y: this.y - 4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
