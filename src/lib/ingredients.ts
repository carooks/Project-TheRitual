import { Ingredient } from './types'
import { FLAVOR } from './strings'

export const INGREDIENTS: Record<string, Ingredient> = {
  eye_of_newt: {
    id: 'eye_of_newt',
    name: 'Eye of Newt',
    icon: '👁️',
    flavor: FLAVOR.eye_of_newt,
    corruptionValue: 0.05,
    effect: 'Glimpse the hidden.'
  },
  mandrake_root: {
    id: 'mandrake_root',
    name: 'Mandrake Root',
    icon: '🌱',
    flavor: FLAVOR.mandrake_root,
    corruptionValue: -0.15,
    effect: 'Protects; reduces corruption.'
  },
  tears_of_the_moon: {
    id: 'tears_of_the_moon',
    name: 'Tears of the Moon',
    icon: '🌙',
    flavor: FLAVOR.tears_of_the_moon,
    corruptionValue: -0.10,
    effect: 'Soothes the tide; reduces corruption.'
  },
  raven_feather: {
    id: 'raven_feather',
    name: 'Raven Feather',
    icon: '🪶',
    flavor: FLAVOR.raven_feather,
    corruptionValue: 0.08,
    effect: 'Whispers secrets.'
  },
  bone_dust: {
    id: 'bone_dust',
    name: 'Bone Dust',
    icon: '💀',
    flavor: FLAVOR.bone_dust,
    corruptionValue: 0.12,
    effect: 'Echoes of the dead.'
  },
  candle_wax: {
    id: 'candle_wax',
    name: 'Candle Wax',
    icon: '🕯️',
    flavor: FLAVOR.candle_wax,
    corruptionValue: 0.06,
    effect: 'Amplifies intent slightly.'
  },
  blood_of_the_innocent: {
    id: 'blood_of_the_innocent',
    name: 'Blood of the Innocent',
    icon: '🩸',
    flavor: FLAVOR.blood_of_the_innocent,
    corruptionValue: 0.3,
    effect: 'Powerful and dangerous.'
  },
  shadow_ash: {
    id: 'shadow_ash',
    name: 'Shadow Ash',
    icon: '🌫️',
    flavor: FLAVOR.shadow_ash,
    corruptionValue: 0.18,
    effect: 'Darkens intent.'
  },
  iron_thorn: {
    id: 'iron_thorn',
    name: 'Iron Thorn',
    icon: '🗡️',
    flavor: FLAVOR.iron_thorn,
    corruptionValue: 0.14,
    effect: 'Cuts a stubborn line.'
  },
  silver_thread: {
    id: 'silver_thread',
    name: 'Silver Thread',
    icon: '🧵',
    flavor: FLAVOR.silver_thread,
    corruptionValue: 0.04,
    effect: 'Binds fate together.'
  }
}

export const INGREDIENT_LIST = Object.values(INGREDIENTS)
