import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { LevelClearScene } from './scenes/LevelClearScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: CONFIG.SCREEN_WIDTH,
  height: CONFIG.SCREEN_HEIGHT,
  backgroundColor: '#111318',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainMenuScene, GameScene, HUDScene, GameOverScene, LevelClearScene],
});
