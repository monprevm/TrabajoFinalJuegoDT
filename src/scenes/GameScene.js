import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { MazeGenerator, WALL } from '../systems/MazeGenerator.js';
import { SeededRandom } from '../systems/Random.js';
import { LevelLayout } from '../systems/LevelLayout.js';
import { RewardFactory } from '../systems/RewardFactory.js';
import { Player } from '../entities/Player.js';
import { Elf } from '../entities/Elf.js';
import { Zombie } from '../entities/Zombie.js';
import { KeyItem } from '../entities/KeyItem.js';
import { Chest } from '../entities/Chest.js';
import { Door, DOOR_STATES } from '../entities/Door.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.gameOverTriggered = false;
    this.levelClearTriggered = false;
    this.lastDoorMessageAt = 0;

    const random = new SeededRandom(CONFIG.SEED);
    const maze = new MazeGenerator({
      cols: CONFIG.MAZE_COLS,
      rows: CONFIG.MAZE_ROWS,
      random,
    });
    maze.generate();
    maze.tileSize = CONFIG.TILE_SIZE;
    this.maze = maze;
    this.random = random;
    this.rewardFactory = new RewardFactory(random);

    this.#createWorld();
    this.#createPlayer();
    this.#createLayout();
    this.#createInput();
    this.#setupCollisions();
    this.#setupCamera();

    this.player.on('stats-changed', (stats) => {
      this.registry.set('stats', stats);
      this.game.events.emit('hud-update', stats);
    });
    this.player.on('died', () => this.#onPlayerDied());
    this.registry.set('stats', this.player.getStats());
    this.game.events.emit('hud-update', this.player.getStats());

    this.scene.launch('HUDScene');
    this.scene.bringToTop('HUDScene');
  }

  #createWorld() {
    const tile = CONFIG.TILE_SIZE;
    const worldWidth = this.maze.width() * tile;
    const worldHeight = this.maze.height() * tile;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.tileSprite(0, 0, worldWidth, worldHeight, 'floor').setOrigin(0, 0);

    this.walls = this.physics.add.staticGroup();
    for (let y = 0; y < this.maze.height(); y += 1) {
      for (let x = 0; x < this.maze.width(); x += 1) {
        if (this.maze.grid[y][x] === WALL) {
          this.walls.create(x * tile + tile / 2, y * tile + tile / 2, 'wall');
        }
      }
    }
  }

  #tileToWorld(tile) {
    const t = CONFIG.TILE_SIZE;
    return {
      x: tile.x * t + t / 2,
      y: tile.y * t + t / 2,
    };
  }

  #fitSprite(sprite, targetSize) {
    const scale = Math.min(targetSize / sprite.width, targetSize / sprite.height);
    sprite.setScale(scale);
    return sprite;
  }

  #createPlayer() {
    const spawn = this.#tileToWorld({ x: 1, y: 1 });
    this.player = new Player(this, spawn.x, spawn.y);
    this.#fitSprite(this.player, CONFIG.TILE_SIZE * 0.8);
  }

  #createLayout() {
    const layout = new LevelLayout(this.maze, this.random, CONFIG.LEVEL1).place();
    this.requiredKeys = CONFIG.LEVEL1.keyCount;

    this.keysGroup = this.physics.add.group();
    for (const tile of layout.keyTiles) {
      const pos = this.#tileToWorld(tile);
      this.keysGroup.add(new KeyItem(this, pos.x, pos.y));
    }

    this.chests = this.physics.add.group();
    for (const tile of layout.chestTiles) {
      const pos = this.#tileToWorld(tile);
      const reward = this.rewardFactory.describe(this.rewardFactory.roll());
      const chest = new Chest(this, pos.x, pos.y, reward);
      this.#fitSprite(chest, CONFIG.TILE_SIZE * 0.75);
      this.chests.add(chest);
    }

    const doorPos = this.#tileToWorld(layout.doorTile);
    this.door = new Door(this, doorPos.x, doorPos.y);
    this.#fitSprite(this.door, CONFIG.TILE_SIZE * 0.9);

    this.enemies = this.physics.add.group();
    for (const group of layout.elfGroups) {
      for (const tile of group) {
        const pos = this.#tileToWorld(tile);
        const elf = new Elf(this, pos.x, pos.y);
        this.#fitSprite(elf, CONFIG.TILE_SIZE * 0.8);
        this.enemies.add(elf);
      }
    }
    for (const group of layout.zombieGroups) {
      for (const tile of group) {
        const pos = this.#tileToWorld(tile);
        const zombie = new Zombie(this, pos.x, pos.y);
        this.#fitSprite(zombie, CONFIG.TILE_SIZE * 0.85);
        this.enemies.add(zombie);
      }
    }
  }

  #createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      eat: Phaser.Input.Keyboard.KeyCodes.C,
    });
    this.input.mouse.disableContextMenu();
    this.input.on('pointerdown', (pointer) => {
      this.player.tryShoot(this.time.now, pointer);
    });
  }

  #setupCollisions() {
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.player.arrows, this.walls, (arrow) => arrow.kill());

    this.physics.add.overlap(this.player.arrows, this.enemies, (arrow, enemy) => {
      if (arrow.dead || !enemy.active) return;
      arrow.kill();
      enemy.takeDamage(arrow.damage);
    });

    this.physics.add.overlap(this.player, this.keysGroup, (_player, key) => {
      if (!key.active) return;
      key.destroy();
      const count = this.player.addKey();
      this.door.updateState(this.player.keys, this.requiredKeys);
      this.#showFloatingText(this.player.x, this.player.y - 20, `Llave ${count}/${this.requiredKeys}`, '#ffd83d');
    });

    this.physics.add.overlap(this.player, this.chests, (_player, chest) => {
      if (!chest.active || chest.opened) return;
      const reward = chest.open();
      this.#applyReward(reward);
    });

    this.physics.add.overlap(this.player, this.enemies, () => {
      this.player.takeDamage(CONFIG.CONTACT_DAMAGE, this.time.now);
    });

    this.physics.add.overlap(this.player, this.door, () => this.#onDoorTouched());
  }

  #setupCamera() {
    const worldWidth = this.maze.width() * CONFIG.TILE_SIZE;
    const worldHeight = this.maze.height() * CONFIG.TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  #applyReward(reward) {
    if (reward.type === 'treasure') {
      this.player.addScore(reward.points);
      this.#showFloatingText(this.player.x, this.player.y - 20, reward.label, '#ffd83d');
      return;
    }
    if (reward.type === 'ammo') {
      const added = this.player.addAmmo(reward.amount);
      const label = added > 0 ? `+${added} flechas` : 'Munición llena';
      this.#showFloatingText(this.player.x, this.player.y - 20, label, '#8ecbff');
      return;
    }
    const stored = this.player.addApple();
    this.#showFloatingText(
      this.player.x,
      this.player.y - 20,
      stored ? reward.label : 'Bolsa de comida llena',
      stored ? '#8bd450' : '#aaaaaa',
    );
  }

  #onDoorTouched() {
    if (this.levelClearTriggered) return;
    if (this.door.state === DOOR_STATES.OPEN) {
      this.#onLevelClear();
      return;
    }
    if (this.time.now - this.lastDoorMessageAt < 2000) return;
    this.lastDoorMessageAt = this.time.now;
    this.#showFloatingText(
      this.door.x,
      this.door.y - 24,
      `Necesitás ${this.requiredKeys} llaves (${this.player.keys}/${this.requiredKeys})`,
      '#ff9a5c',
    );
  }

  #showFloatingText(x, y, message, color) {
    const text = this.add
      .text(x, y, message, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(10);
    this.tweens.add({
      targets: text,
      y: y - 28,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  #onPlayerDied() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this.time.delayedCall(700, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene');
    });
  }

  #onLevelClear() {
    if (this.levelClearTriggered) return;
    this.levelClearTriggered = true;
    this.player.setVelocity(0, 0);
    this.player.alive = false;
    this.time.delayedCall(400, () => {
      this.scene.stop('HUDScene');
      this.scene.start('LevelClearScene', { score: this.player.score });
    });
  }

  update(time) {
    if (!this.player || !this.player.alive) return;
    this.player.handleInput(this.cursors, this.keys, time);
    this.player.tryShoot(time, this.input.activePointer);
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) enemy.update(time, this.player, this.maze);
    });
  }
}
