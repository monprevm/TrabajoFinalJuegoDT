import Phaser from 'phaser';

export const DOOR_STATES = {
  LOCKED: 'locked',
  OPEN: 'open',
};

export class Door extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'door');
    scene.add.existing(scene.physics.add.existing(this));
    this.body.setImmovable(true);
    this.state = DOOR_STATES.LOCKED;
  }

  updateState(playerKeyCount, requiredKeys) {
    if (this.state === DOOR_STATES.OPEN) return;
    if (playerKeyCount >= requiredKeys) {
      this.state = DOOR_STATES.OPEN;
      this.setTint(0x66ff99);
    }
  }
}
