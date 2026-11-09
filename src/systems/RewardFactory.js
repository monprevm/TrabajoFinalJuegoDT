import { CONFIG } from '../config.js';
import { KEYS } from '../enums/keys.js';
import { getPhrase } from '../services/translations.js';

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
      return { type: reward.type, points, label: `+${points} ${getPhrase(KEYS.PUNTOS)}` };
    }
    if (reward.type === REWARD_TYPES.AMMO) {
      const amount = this.random.int(CONFIG.AMMO_PICKUP.min, CONFIG.AMMO_PICKUP.max);
      return {
        type: reward.type,
        amount,
        label: `+${amount} ${getPhrase(KEYS.FLECHAS).replace(':', '')}`,
      };
    }
    if (reward.type === REWARD_TYPES.APPLE) {
      return { type: reward.type, label: getPhrase(KEYS.MANZANA_1_COMIDA) };
    }
    if (reward.type === REWARD_TYPES.HADA) {
      return { type: reward.type, label: getPhrase(KEYS.HADA_REVELA_EL_CAMINO) };
    }
    if (reward.type === REWARD_TYPES.HEART_FRAME) {
      return { type: reward.type, label: getPhrase(KEYS.MARCO_DE_CORAZON_1_VIDA_MAXIMA) };
    }
    return { type: reward.type, label: getPhrase(KEYS.RECOMPENSA) };
  }
}
