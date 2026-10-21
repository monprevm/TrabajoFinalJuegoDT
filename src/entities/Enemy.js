import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    scene.add.existing(scene.physics.add.existing(this));
    this.setCollideWorldBounds(true);

    this.enemyConfig = config;
    this.health = config.health;
    this.speed = config.speed;
    this.sightDistance = config.sightDistance;
    this.wanderIntervalMs = config.wanderIntervalMs;
    this.wanderDirection = { x: 0, y: 0 };
    this.nextWanderAt = 0;
  }

  takeDamage(amount) {
    this.health -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => {
      if (this.active) this.clearTint();
    });
    if (this.health <= 0) {
      this.emit('died', this);
      this.destroy();
      return true;
    }
    return false;
  }

  update(time, player, maze) {
    if (!this.active || !player.alive) {
      this.setVelocity(0, 0);
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const seesPlayer =
      distance <= this.sightDistance &&
      maze.hasLineOfSight(this.x, this.y, player.x, player.y, maze.tileSize);

    if (seesPlayer) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
      return;
    }

    if (time >= this.nextWanderAt) {
      this.#pickWanderDirection(time);
    }
    this.setVelocity(this.wanderDirection.x * this.speed * 0.6, this.wanderDirection.y * this.speed * 0.6);
  }

  #pickWanderDirection(time) {
    this.nextWanderAt = time + this.wanderIntervalMs;
    const options = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    this.wanderDirection = options[Math.floor(Math.random() * options.length)];
  }
}
