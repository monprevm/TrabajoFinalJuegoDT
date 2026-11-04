import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { Arrow } from './Arrow.js';

// Spritesheet JUGADOR.png (200x40, frames de 40x40):
// 0, 1, 2 = caminata a la izquierda; 1 = reposo mirando a la izquierda;
// 3 = abajo; 4 = arriba. La derecha reutiliza los frames 0-2 espejados.
const DIRECTIONS = {
  up: { x: 0, y: -1, angle: -90, idleFrame: 4 },
  down: { x: 0, y: 1, angle: 90, idleFrame: 3 },
  left: { x: -1, y: 0, angle: 180, idleFrame: 1 },
  right: { x: 1, y: 0, angle: 0, idleFrame: 1 },
};

// La secuencia 0 -> 1 -> 2 -> 1 se repite, como pidió el diseño del spritesheet.
const WALK_ANIM_KEY = 'player-walk-side';
const WALK_FRAME_SEQUENCE = [0, 1, 2, 1];

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    Player.ensureAnimations(scene);
    scene.add.existing(scene.physics.add.existing(this));
    this.setCollideWorldBounds(true);

    const cfg = CONFIG.PLAYER;
    this.speed = cfg.speed;
    this.maxHealthCap = cfg.maxHealthCap;
    this.maxHealth = cfg.startHealth;
    this.health = cfg.startHealth;
    this.maxAmmo = cfg.maxAmmo;
    this.ammo = cfg.startAmmo;
    this.apples = 0;
    this.keys = 0;
    this.score = 0;
    this.shotCooldownMs = cfg.shotCooldownMs;
    this.invulnerabilityMs = cfg.invulnerabilityMs;
    this.appleBagMax = cfg.appleBagMax;
    this.lastShotAt = 0;
    this.invulnerableUntil = 0;
    this.lastDirection = DIRECTIONS.right;
    this.alive = true;
    this.isWallJumping = false;
    this.#updateDirectionVisual(false);

    this.arrows = scene.physics.add.group({
      classType: Arrow,
      runChildUpdate: true,
    });
  }

  static ensureAnimations(scene) {
    if (scene.anims.exists(WALK_ANIM_KEY)) return;
    scene.anims.create({
      key: WALK_ANIM_KEY,
      frames: scene.anims.generateFrameNumbers('player', { frames: WALK_FRAME_SEQUENCE }),
      frameRate: CONFIG.PLAYER.walkFrameRate,
      repeat: -1,
    });
  }

  handleInput(cursors, keys, time) {
    if (!this.alive || this.isWallJumping) {
      if (this.isWallJumping) {
        this.setVelocity(0, 0);
        this.#updateDirectionVisual(false);
      }
      return;
    }

    let vx = 0;
    let vy = 0;
    if (keys.left.isDown || cursors.left.isDown) {
      vx = -1;
      this.lastDirection = DIRECTIONS.left;
    } else if (keys.right.isDown || cursors.right.isDown) {
      vx = 1;
      this.lastDirection = DIRECTIONS.right;
    }
    if (keys.up.isDown || cursors.up.isDown) {
      vy = -1;
      this.lastDirection = DIRECTIONS.up;
    } else if (keys.down.isDown || cursors.down.isDown) {
      vy = 1;
      this.lastDirection = DIRECTIONS.down;
    }

    const magnitude = Math.hypot(vx, vy);
    this.#updateDirectionVisual(magnitude > 0);

    if (magnitude > 0) {
      this.setVelocity((vx / magnitude) * this.speed, (vy / magnitude) * this.speed);
    } else {
      this.setVelocity(0, 0);
    }

    if (Phaser.Input.Keyboard.JustDown(keys.eat)) {
      this.eatApple();
    }
  }

  #updateDirectionVisual(isMoving) {
    const direction = this.lastDirection;
    const isSide = direction === DIRECTIONS.left || direction === DIRECTIONS.right;
    this.setFlipX(direction === DIRECTIONS.right);

    if (isSide && isMoving) {
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== WALK_ANIM_KEY) {
        this.anims.play(WALK_ANIM_KEY, true);
      }
      return;
    }

    if (this.anims.isPlaying) this.anims.stop();
    const { idleFrame } = direction;
    if (this.frame.name !== String(idleFrame)) this.setFrame(idleFrame);
  }

  tryShoot(time, pointer) {
    if (!this.alive || this.isWallJumping) return false;
    if (!pointer.rightButtonDown()) return false;
    if (this.ammo <= 0) return false;
    if (time - this.lastShotAt < this.shotCooldownMs) return false;

    this.lastShotAt = time;
    this.ammo -= 1;
    const direction = this.lastDirection;
    const arrow = this.arrows.get(this.x, this.y, 'arrow');
    if (!arrow) return false;
    arrow.fire(this.x, this.y, direction);
    this.emitStatsChanged();
    return true;
  }

  wallJumpTo(targetX, targetY, durationMs) {
    if (!this.alive || this.isWallJumping) return false;
    this.isWallJumping = true;
    this.setVelocity(0, 0);
    if (this.body) this.body.enable = false;

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: durationMs,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (!this.active) return;
        if (this.body) {
          this.body.enable = true;
          this.body.reset(targetX, targetY);
        }
        this.isWallJumping = false;
        this.emit('wall-jump-finished');
      },
    });
    return true;
  }

  eatApple() {
    if (this.apples <= 0 || this.health >= this.maxHealth) return false;
    this.apples -= 1;
    this.health = Math.min(this.maxHealth, this.health + 1);
    this.emitStatsChanged();
    return true;
  }

  addApple() {
    if (this.apples >= this.appleBagMax) return false;
    this.apples += 1;
    this.emitStatsChanged();
    return true;
  }

  addMaxHeart() {
    if (this.maxHealth >= this.maxHealthCap) return false;
    this.maxHealth += 1;
    this.health = Math.min(this.maxHealth, this.health + 1);
    this.emitStatsChanged();
    return true;
  }

  addAmmo(amount) {
    const added = Math.min(amount, this.maxAmmo - this.ammo);
    this.ammo += added;
    this.emitStatsChanged();
    return added;
  }

  addScore(points) {
    this.score += points;
    this.emitStatsChanged();
  }

  addKey() {
    this.keys += 1;
    this.emitStatsChanged();
    return this.keys;
  }

  takeDamage(amount, time) {
    if (!this.alive || time < this.invulnerableUntil) return false;
    this.health -= amount;
    this.invulnerableUntil = time + this.invulnerabilityMs;
    this.setTintFill(0xff4444);
    this.scene.time.delayedCall(120, () => {
      if (this.active) this.clearTint();
    });
    this.emitStatsChanged();
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    return true;
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.anims.stop();
    this.setVelocity(0, 0);
    this.setTint(0x888888);
    this.emitStatsChanged();
    this.emit('died');
  }

  emitStatsChanged() {
    this.emit('stats-changed', this.getStats());
  }

  getStats() {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      maxHealthCap: this.maxHealthCap,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      apples: this.apples,
      keys: this.keys,
      score: this.score,
    };
  }
}
