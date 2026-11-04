import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import playerUrl from '../../assets/JUGADOR.png';
import elfUrl from '../../assets/ENEMIGO1 ELFO.png';
import zombieUrl from '../../assets/ENEMIGO2 ZOMBIE.png';
import ogreUrl from '../../assets/ENEMIGO3 OGRO.png';
import arrowUrl from '../../assets/FLECHA.png';
import chestUrl from '../../assets/COFRE.png';
import appleUrl from '../../assets/MANZANA.png';
import hadaUrl from '../../assets/HADA.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('player', playerUrl, { frameWidth: 40, frameHeight: 40 });
    this.load.image('elf', elfUrl);
    this.load.image('zombie', zombieUrl);
    this.load.image('ogre', ogreUrl);
    this.load.image('arrow', arrowUrl);
    this.load.image('chest', chestUrl);
    this.load.image('apple', appleUrl);
    this.load.image('hada', hadaUrl);
  }

  create() {
    this.#generateMockups();
    if (!this.registry.has('level')) this.registry.set('level', 1);
    if (!this.registry.has('score')) this.registry.set('score', 0);
    this.scene.start('MainMenuScene');
  }

  #generateMockups() {
    const tile = CONFIG.TILE_SIZE;
    const g = this.make.graphics({ add: false });

    g.fillStyle(0x5c5c66);
    g.fillRect(0, 0, tile, tile);
    g.lineStyle(2, 0x33333b);
    g.strokeRect(1, 1, tile - 2, tile - 2);
    g.lineStyle(1, 0x6e6e78);
    g.lineBetween(2, tile / 2, tile - 2, tile / 2);
    g.generateTexture('wall', tile, tile);
    g.clear();

    g.fillStyle(0x2b2b33);
    g.fillRect(0, 0, tile, tile);
    g.generateTexture('floor', tile, tile);
    g.clear();

    g.fillStyle(0xffd83d);
    g.fillCircle(10, 12, 6);
    g.fillStyle(0xc9a227);
    g.fillRect(12, 10, 10, 4);
    g.fillRect(18, 10, 3, 7);
    g.fillRect(15, 10, 3, 6);
    g.generateTexture('key', 24, 22);
    g.clear();

    g.fillStyle(0x3d8b4f);
    g.fillRect(0, 0, 22, 30);
    g.lineStyle(2, 0x1f4d2a);
    g.strokeRect(1, 1, 20, 28);
    g.fillStyle(0xffd83d);
    g.fillCircle(16, 16, 2);
    g.generateTexture('door', 22, 30);
    g.clear();

    g.fillStyle(0xff3b3b);
    g.fillCircle(8, 7, 6);
    g.fillCircle(14, 7, 6);
    g.fillTriangle(4, 9, 18, 9, 11, 18);
    g.generateTexture('heart-full', 22, 20);
    g.clear();

    g.lineStyle(2, 0x666666);
    g.strokeCircle(8, 7, 5);
    g.strokeCircle(14, 7, 5);
    g.lineBetween(4, 9, 11, 17);
    g.lineBetween(18, 9, 11, 17);
    g.generateTexture('heart-empty', 22, 20);
    g.clear();

    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 6, 6);
    g.generateTexture('pixel', 6, 6);
    g.clear();

    g.fillStyle(0xffd83d);
    g.fillTriangle(0, 0, 0, 18, 24, 9);
    g.generateTexture('hint-arrow', 24, 18);
    g.clear();

    g.fillStyle(0x8b4a2b);
    g.fillRect(8, 13, 8, 9);
    g.fillStyle(0xd94b4b);
    g.fillEllipse(12, 10, 22, 14);
    g.fillStyle(0xffffff);
    g.fillCircle(7, 8, 2);
    g.fillCircle(15, 7, 2);
    g.fillCircle(11, 12, 2);
    g.generateTexture('mushroom', 24, 24);
    g.destroy();
  }
}
