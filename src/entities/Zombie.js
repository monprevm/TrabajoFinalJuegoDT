import { Enemy } from './Enemy.js';
import { CONFIG } from '../config.js';

export class Zombie extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'zombie', CONFIG.ZOMBIE);
  }
}
