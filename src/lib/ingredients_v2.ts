import { Ingredient, Domain, EffectTag } from './types'

/**
 * V2 INGREDIENT SYSTEM
 * Ingredients now belong to domains that determine ritual effects
 * Corruption values are 0.0 to 1.0 (hidden from players)
 */

export const INGREDIENTS_V2: Record<string, Ingredient> = {
  // ========================================
  // PROTECTION DOMAIN (-15% to -5%)
  // ========================================
  mandrake_root: {
    id: 'mandrake_root',
    name: 'Mandrake Root',
    icon: '🌱',
    flavor: 'Ancient roots that ward against dark forces',
    domain: Domain.PROTECTION,
    corruptionValue: -0.15,
    effectTag: EffectTag.SHIELD_PERFORMER
  },
  tears_of_the_moon: {
    id: 'tears_of_the_moon',
    name: 'Tears of the Moon',
    icon: '🌙',
    flavor: 'Liquid light that soothes corruption',
    domain: Domain.PROTECTION,
    corruptionValue: -0.10,
    effectTag: EffectTag.SHIELD_PERFORMER
  },
  silver_thread: {
    id: 'silver_thread',
    name: 'Silver Thread',
    icon: '🧵',
    flavor: 'Binds the coven together in protection',
    domain: Domain.PROTECTION,
    corruptionValue: -0.08,
    effectTag: EffectTag.SHIELD_PERFORMER
  },

  // ========================================
  // DIVINATION DOMAIN (-5% to +8%)
  // ========================================
  moonstone_dust: {
    id: 'moonstone_dust',
    name: 'Moonstone Dust',
    icon: '💎',
    flavor: 'Crystal powder that reveals truth',
    domain: Domain.DIVINATION,
    corruptionValue: -0.05,
    effectTag: EffectTag.ALIGNMENT_REVEAL
  },
  crystal_salt: {
    id: 'crystal_salt',
    name: 'Crystal Salt',
    icon: '🧂',
    flavor: 'Pure crystals that cleanse and reveal',
    domain: Domain.DIVINATION,
    corruptionValue: 0.0,
    effectTag: EffectTag.ALIGNMENT_REVEAL
  },
  eye_of_newt: {
    id: 'eye_of_newt',
    name: 'Eye of Newt',
    icon: '👁️',
    flavor: 'A glimpse through the veil',
    domain: Domain.DIVINATION,
    corruptionValue: 0.02,
    effectTag: EffectTag.ALIGNMENT_REVEAL
  },
  raven_feather: {
    id: 'raven_feather',
    name: 'Raven Feather',
    icon: '🪶',
    flavor: 'The raven whispers secrets',
    domain: Domain.DIVINATION,
    corruptionValue: 0.05,
    effectTag: EffectTag.ALIGNMENT_REVEAL
  },

  // ========================================
  // SUPPRESSION DOMAIN (+8% to +14%)
  // ========================================
  ink_of_secrets: {
    id: 'ink_of_secrets',
    name: 'Ink of Secrets',
    icon: '🖋️',
    flavor: 'Obscures and dampens magical resonance',
    domain: Domain.SUPPRESSION,
    corruptionValue: 0.08,
    effectTag: EffectTag.DAMPEN_OUTCOME
  },
  bone_dust: {
    id: 'bone_dust',
    name: 'Bone Dust',
    icon: '💀',
    flavor: 'Echoes of death that suppress life',
    domain: Domain.SUPPRESSION,
    corruptionValue: 0.12,
    effectTag: EffectTag.DAMPEN_OUTCOME
  },
  iron_thorn: {
    id: 'iron_thorn',
    name: 'Iron Thorn',
    icon: '🗡️',
    flavor: 'Cuts through magic, leaving nothing',
    domain: Domain.SUPPRESSION,
    corruptionValue: 0.14,
    effectTag: EffectTag.DAMPEN_OUTCOME
  },

  // ========================================
  // AMPLIFICATION DOMAIN (+10% to +15%)
  // ========================================
  candle_wax: {
    id: 'candle_wax',
    name: 'Candle Wax',
    icon: '🕯️',
    flavor: 'Intensifies the flame of intent',
    domain: Domain.AMPLIFICATION,
    corruptionValue: 0.10,
    effectTag: EffectTag.AMPLIFY_OUTCOME
  },
  serpent_scale: {
    id: 'serpent_scale',
    name: 'Serpent Scale',
    icon: '🐍',
    flavor: 'Amplifies power to dangerous extremes',
    domain: Domain.AMPLIFICATION,
    corruptionValue: 0.15,
    effectTag: EffectTag.AMPLIFY_OUTCOME
  },

  // ========================================
  // MISDIRECTION DOMAIN (+6% to +9%)
  // ========================================
  whispering_moss: {
    id: 'whispering_moss',
    name: 'Whispering Moss',
    icon: '🌿',
    flavor: 'Soft lies that twist perception',
    domain: Domain.MISDIRECTION,
    corruptionValue: 0.06,
    effectTag: EffectTag.DISTORT_VISION
  },
  mirror_glass: {
    id: 'mirror_glass',
    name: 'Mirror Glass',
    icon: '🪞',
    flavor: 'Reflects falsehoods as truth',
    domain: Domain.MISDIRECTION,
    corruptionValue: 0.07,
    effectTag: EffectTag.DISTORT_VISION
  },
  fools_gold: {
    id: 'fools_gold',
    name: "Fool's Gold",
    icon: '✨',
    flavor: 'Glitters with deceptive promises',
    domain: Domain.MISDIRECTION,
    corruptionValue: 0.09,
    effectTag: EffectTag.DISTORT_VISION
  },

  // ========================================
  // CORRUPTION DOMAIN (+22% to +30%)
  // ========================================
  shadow_ash: {
    id: 'shadow_ash',
    name: 'Shadow Ash',
    icon: '🌫️',
    flavor: 'Remnants of consumed light',
    domain: Domain.CORRUPTION,
    corruptionValue: 0.22,
    effectTag: EffectTag.BOOST_CORRUPTION
  },
  void_essence: {
    id: 'void_essence',
    name: 'Void Essence',
    icon: '🕳️',
    flavor: 'The Hollow\'s hunger made manifest',
    domain: Domain.CORRUPTION,
    corruptionValue: 0.28,
    effectTag: EffectTag.BOOST_CORRUPTION
  },
  blood_of_the_innocent: {
    id: 'blood_of_the_innocent',
    name: 'Blood of the Innocent',
    icon: '🩸',
    flavor: 'The ultimate sacrifice to darkness',
    domain: Domain.CORRUPTION,
    corruptionValue: 0.30,
    effectTag: EffectTag.BOOST_CORRUPTION
  }
}

export const INGREDIENT_LIST_V2 = Object.values(INGREDIENTS_V2)

/**
 * Get ingredients available to a specific role
 */
export function getIngredientPoolForRole(roleId: string): Ingredient[] {
  // Will be defined in roles_v2.ts
  return []
}

/**
 * Calculate dominant domain from ingredient plays
 */
export function getDominantDomain(ingredients: Ingredient[]): Domain {
  const domainCounts = new Map<Domain, number>()
  
  ingredients.forEach(ing => {
    domainCounts.set(ing.domain, (domainCounts.get(ing.domain) || 0) + 1)
  })
  
  // Find domain with most ingredients
  let maxCount = 0
  let dominant = Domain.DIVINATION
  
  domainCounts.forEach((count, domain) => {
    if (count > maxCount) {
      maxCount = count
      dominant = domain
    }
  })
  
  // Tiebreaker priority: CORRUPTION > MISDIRECTION > DIVINATION > PROTECTION > AMPLIFICATION > SUPPRESSION
  if (maxCount > 0) {
    const tied = Array.from(domainCounts.entries())
      .filter(([_, count]) => count === maxCount)
      .map(([domain]) => domain)
    
    if (tied.length > 1) {
      const priority = [
        Domain.CORRUPTION,
        Domain.MISDIRECTION,
        Domain.DIVINATION,
        Domain.PROTECTION,
        Domain.AMPLIFICATION,
        Domain.SUPPRESSION
      ]
      
      for (const domain of priority) {
        if (tied.includes(domain)) {
          return domain
        }
      }
    }
  }
  
  return dominant
}

/**
 * Calculate corruption index (0.0 to 1.0)
 */
export function calculateCorruptionIndex(ingredients: Ingredient[]): number {
  if (ingredients.length === 0) return 0
  
  // Sum all corruption values
  const total = ingredients.reduce((sum, ing) => sum + ing.corruptionValue, 0)
  
  // Normalize to 0-1 range
  // Average ingredient count is ~5-7, max corruption is ~0.3, min is ~-0.15
  // Theoretical max: 7 × 0.3 = 2.1
  // Theoretical min: 7 × -0.15 = -1.05
  // Range: 3.15, center at 0
  
  // Shift to 0-1 range: (value + 1.05) / 3.15
  const normalized = (total + 1.05) / 3.15
  
  // Clamp to 0-1
  return Math.max(0, Math.min(1, normalized))
}
