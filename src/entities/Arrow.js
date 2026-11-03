import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Arrow extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'arrow');
    scene.add.existing(scene.physics.add.existing(this));
    this.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    this.damage = CONFIG.ARROW.damage;
    this.lifespanMs = CONFIG.ARROW.lifespanMs;
    this.dead = false;
  }

  fire(x, y, direction, options = {}) {
    const speed = options.speed ?? CONFIG.ARROW.speed;
    this.damage = options.damage ?? CONFIG.ARROW.damage;
    this.dead = false;
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setAngle(direction.angle);
    this.setVelocity(direction.x * speed, direction.y * speed);
    this.lifespanUntil = this.scene.time.now + this.lifespanMs;
  }

  update(time) {
    if (this.dead || time >= this.lifespanUntil) {
      this.kill();
    }
  }

  kill() {
    if (this.dead) return;
    this.dead = true;
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.body.reset(this.x, this.y);
  }
}
