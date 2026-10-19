import Phaser from 'phaser';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, reward) {
    super(scene, x, y, 'chest');
    scene.add.existing(scene.physics.add.existing(this));
    this.body.setImmovable(true);
    this.reward = reward;
    this.opened = false;
  }

  open() {
    if (this.opened) return null;
    this.opened = true;
    this.setTint(0x999999);
    return this.reward;
  }
}
