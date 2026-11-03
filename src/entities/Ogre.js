import Phaser from 'phaser';
import { Enemy } from './Enemy.js';
import { CONFIG } from '../config.js';

export const OGRE_STATES = {
  IDLE: 'idle',
  CHASE: 'chase',
  TELEGRAPH: 'telegraph',
};

export class Ogre extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'ogre', CONFIG.OGRE);
    this.isBoss = true;
    this.state = OGRE_STATES.IDLE;
    this.nextShotAt = 0;
    this.nextStompAt = 0;
    this.telegraphUntil = 0;
    this.stompMarker = null;
    this.stompTween = null;
  }

  update(time, player, maze) {
    if (!this.active || !player.alive) {
      this.setVelocity(0, 0);
      return;
    }

    if (this.state === OGRE_STATES.TELEGRAPH) {
      this.setVelocity(0, 0);
      if (time >= this.telegraphUntil) this.#executeStomp(time);
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const seesPlayer =
      distance <= this.sightDistance &&
      maze.hasLineOfSight(this.x, this.y, player.x, player.y, maze.tileSize);

    if (!seesPlayer) {
      this.state = OGRE_STATES.IDLE;
      super.update(time, player, maze);
      return;
    }

    if (distance <= this.enemyConfig.stompRange && time >= this.nextStompAt) {
      this.#startStomp(time);
      return;
    }

    this.state = OGRE_STATES.CHASE;
    if (time >= this.nextShotAt) {
      this.#shoot(time, player);
    }

    if (distance > this.enemyConfig.stompRange) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    } else {
      this.setVelocity(0, 0);
    }
  }

  #shoot(time, player) {
    this.nextShotAt = time + this.enemyConfig.shotCooldownMs;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.emit('shoot', {
      x: this.x,
      y: this.y,
      direction: {
        x: Math.cos(angle),
        y: Math.sin(angle),
        angle: Phaser.Math.RadToDeg(angle),
      },
    });
  }

  #startStomp(time) {
    this.state = OGRE_STATES.TELEGRAPH;
    this.telegraphUntil = time + this.enemyConfig.stompTelegraphMs;
    this.nextStompAt = time + this.enemyConfig.stompCooldownMs;
    this.setVelocity(0, 0);

    this.stompMarker = this.scene.add
      .circle(this.x, this.y, this.enemyConfig.stompRadius, 0xff3b3b, 0.28)
      .setStrokeStyle(3, 0xff6b6b, 0.9)
      .setDepth(5);

    this.stompTween = this.scene.tweens.add({
      targets: this.stompMarker,
      alpha: { from: 0.35, to: 0.8 },
      scale: { from: 1, to: 0.85 },
      duration: this.enemyConfig.stompTelegraphMs,
      ease: 'Sine.easeInOut',
    });

    this.emit('stomp-telegraph', {
      x: this.x,
      y: this.y,
      radius: this.enemyConfig.stompRadius,
    });
  }

  #executeStomp(time) {
    this.state = OGRE_STATES.CHASE;
    const markerX = this.stompMarker ? this.stompMarker.x : this.x;
    const markerY = this.stompMarker ? this.stompMarker.y : this.y;
    this.#clearStompMarker();
    this.nextStompAt = time + this.enemyConfig.stompCooldownMs;
    this.emit('stomp', { x: markerX, y: markerY, radius: this.enemyConfig.stompRadius });
  }

  #clearStompMarker() {
    if (this.stompTween) {
      this.stompTween.stop();
      this.stompTween = null;
    }
    if (this.stompMarker) {
      this.stompMarker.destroy();
      this.stompMarker = null;
    }
  }

  destroy(fromScene) {
    this.#clearStompMarker();
    super.destroy(fromScene);
  }
}
