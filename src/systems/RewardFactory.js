import { CONFIG } from '../config.js';

export const REWARD_TYPES = {
  TREASURE: 'treasure',
  APPLE: 'apple',
  AMMO: 'ammo',
  HADA: 'hada',
  HEART_FRAME: 'marco',
};

export class RewardFactory {
  constructor(random, levelNumber = 1) {
    this.random = random;
    this.levelNumber = levelNumber;
  }

  roll() {
    const table =
      this.levelNumber >= CONFIG.REWARDS.advancedFromLevel
        ? CONFIG.REWARDS.advancedWeights
        : CONFIG.REWARDS.baseWeights;
    const entries = Object.entries(table);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.random.float() * total;

    for (const [type, weight] of entries) {
      if (roll < weight) return { type };
      roll -= weight;
    }
    return { type: REWARD_TYPES.TREASURE };
  }

  describe(reward) {
    if (reward.type === REWARD_TYPES.TREASURE) {
      const points = this.random.int(CONFIG.TREASURE.minPoints, CONFIG.TREASURE.maxPoints);
      return { type: reward.type, points, label: `+${points} puntos` };
    }
    if (reward.type === REWARD_TYPES.AMMO) {
      const amount = this.random.int(CONFIG.AMMO_PICKUP.min, CONFIG.AMMO_PICKUP.max);
      return { type: reward.type, amount, label: `+${amount} flechas` };
    }
    if (reward.type === REWARD_TYPES.APPLE) {
      return { type: reward.type, label: 'Manzana (+1 comida)' };
    }
    if (reward.type === REWARD_TYPES.HADA) {
      return { type: reward.type, label: 'Hada: revela el camino' };
    }
    if (reward.type === REWARD_TYPES.HEART_FRAME) {
      return { type: reward.type, label: 'Marco de corazón (+1 vida máxima)' };
    }
    return { type: reward.type, label: 'Recompensa' };
  }
}
