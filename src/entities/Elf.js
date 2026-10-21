import { Enemy } from './Enemy.js';
import { CONFIG } from '../config.js';

export class Elf extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'elf', CONFIG.ELF);
  }
}
