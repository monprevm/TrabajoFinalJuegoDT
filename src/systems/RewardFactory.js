import { CONFIG } from '../config.js';

export const REWARD_TYPES = {
  TREASURE: 'treasure',
  APPLE: 'apple',
  AMMO: 'ammo',
};

export class RewardFactory {
  constructor(random) {
    this.random = random;
  }

  roll() {
    const roll = this.random.float();
    if (roll < 0.5) return { type: REWARD_TYPES.TREASURE };
    if (roll < 0.8) return { type: REWARD_TYPES.APPLE };
    return { type: REWARD_TYPES.AMMO };
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
    return { type: reward.type, label: 'Manzana (+1 comida)' };
  }
}
