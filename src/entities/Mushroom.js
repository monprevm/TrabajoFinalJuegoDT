import Phaser from 'phaser';

export class Mushroom extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'mushroom');
    scene.add.existing(scene.physics.add.existing(this, true));
    this.body.setImmovable(true);
    this.pair = null;
  }

  setPair(pair) {
    this.pair = pair;
    return this;
  }
}
