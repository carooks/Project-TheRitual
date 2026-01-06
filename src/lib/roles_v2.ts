import { RoleId, Alignment, Ingredient } from './types'
import { INGREDIENTS_V2 } from './ingredients_v2'

/**
 * V2 ROLE SYSTEM
 * Roles are either COVEN or HOLLOW aligned
 * Each role has a specific ingredient pool based on their domain focus
 */

export type RoleDefinition = {
  id: RoleId
  name: string
  alignment: Alignment
  ingredientPool: string[]  // Ingredient IDs
  description: string
  specialAbility?: string
}

export const ROLES_V2: Record<RoleId, RoleDefinition> = {
  // ========================================
  // COVEN TEAM (Good)
  // ========================================
  GUARDIAN: {
    id: 'GUARDIAN',
    name: 'Guardian',
    alignment: 'COVEN',
    ingredientPool: ['mandrake_root', 'tears_of_the_moon', 'silver_thread'],
    description: 'You shield the coven from harm through ancient protective wards. Use Protection ingredients to ensure PURE outcomes and protect Performers from backfires.',
    specialAbility: 'Protection ingredients reduce corruption and can prevent lethal backfires'
  },
  
  SEER: {
    id: 'SEER',
    name: 'Seer',
    alignment: 'COVEN',
    ingredientPool: ['eye_of_newt', 'crystal_salt', 'moonstone_dust', 'raven_feather'],
    description: 'You peer through the veil to glimpse hidden truths. Use Divination ingredients to reveal alignment clues during ritual outcomes.',
    specialAbility: 'Divination rituals can reveal player alignments (if PURE or TAINTED)'
  },
  
  CHRONICLER: {
    id: 'CHRONICLER',
    name: 'Chronicler',
    alignment: 'COVEN',
    ingredientPool: ['raven_feather', 'bone_dust', 'ink_of_secrets'],
    description: 'You record the coven\'s deeds and interpret patterns of corruption. Balance between revealing truth and protecting identities.',
    specialAbility: 'Can use Suppression to dampen extreme outcomes'
  },
  
  EXORCIST: {
    id: 'EXORCIST',
    name: 'Exorcist',
    alignment: 'COVEN',
    ingredientPool: ['mandrake_root', 'crystal_salt', 'silver_thread'],
    description: '⭐ You possess the Rite of Cleansing - a once-per-game ability to purge the Hollow from a witch. If you target a Hollow-aligned player after Round 2, they are revealed and cleansed (join Coven). But if you target a Coven witch, you die immediately.',
    specialAbility: 'Once per game (after Round 2): Target a player. If HOLLOW → cleansed to COVEN. If COVEN → you die.'
  },

  // ========================================
  // HOLLOW TEAM (Evil)
  // ========================================
  HOLLOW_SERVANT: {
    id: 'HOLLOW_SERVANT',
    name: 'Hollow Servant',
    alignment: 'HOLLOW',
    ingredientPool: ['blood_of_the_innocent', 'shadow_ash', 'void_essence'],
    description: '⚠️ You channel the Hollow\'s hunger. Feed it through corrupted rituals. After selecting your ingredient, you can see what other Hollow Servants selected to coordinate sabotage.',
    specialAbility: 'See other HOLLOW players\' ingredient selections. High corruption ingredients (>15%) signal sabotage intent.'
  },
  
  HARBINGER: {
    id: 'HARBINGER',
    name: 'Harbinger',
    alignment: 'HOLLOW',
    ingredientPool: ['iron_thorn', 'candle_wax', 'serpent_scale'],
    description: '⚠️ You amplify chaos and accelerate the Hollow\'s spread. Your Amplification ingredients make outcomes more extreme - either spectacularly PURE or catastrophically BACKFIRED.',
    specialAbility: 'Amplification ingredients push outcomes to extremes (no middle ground)'
  },
  
  DECEIVER: {
    id: 'DECEIVER',
    name: 'Deceiver',
    alignment: 'HOLLOW',
    ingredientPool: ['mirror_glass', 'fools_gold', 'whispering_moss'],
    description: '⚠️ You twist perception and sow false visions. Your Misdirection ingredients scramble Divination results, showing false alignment clues to confuse the coven.',
    specialAbility: 'Misdirection ingredients can invert or scramble Divination results'
  }
}

/**
 * Role distribution based on player count
 * Simplified for new role set
 */
export const ROLE_DISTRIBUTION_V2: Record<number, RoleId[]> = {
  3: ['GUARDIAN', 'HOLLOW_SERVANT', 'SEER'],
  4: ['GUARDIAN', 'HOLLOW_SERVANT', 'SEER', 'CHRONICLER'],
  5: ['GUARDIAN', 'HOLLOW_SERVANT', 'SEER', 'CHRONICLER', 'HARBINGER'],
  6: ['GUARDIAN', 'HOLLOW_SERVANT', 'SEER', 'CHRONICLER', 'HARBINGER', 'DECEIVER'],
  7: ['GUARDIAN', 'GUARDIAN', 'HOLLOW_SERVANT', 'SEER', 'CHRONICLER', 'HARBINGER', 'DECEIVER'],
  8: ['GUARDIAN', 'GUARDIAN', 'HOLLOW_SERVANT', 'HOLLOW_SERVANT', 'SEER', 'CHRONICLER', 'HARBINGER', 'DECEIVER'],
  9: ['GUARDIAN', 'GUARDIAN', 'HOLLOW_SERVANT', 'HOLLOW_SERVANT', 'SEER', 'EXORCIST', 'CHRONICLER', 'HARBINGER', 'DECEIVER']
}

/**
 * Get ingredients available to a role
 */
export function getIngredientPoolForRole(roleId: RoleId): Ingredient[] {
  const role = ROLES_V2[roleId]
  if (!role) return []
  
  return role.ingredientPool
    .map(id => INGREDIENTS_V2[id])
    .filter(Boolean)
}

/**
 * Assign random secret roles to players based on player count
 */
export function assignRandomRolesV2(playerCount: number, seed: string): RoleId[] {
  const distribution = ROLE_DISTRIBUTION_V2[playerCount]
  if (!distribution) {
    // Fallback for unsupported counts
    console.warn(`No role distribution for ${playerCount} players`)
    return []
  }
  
  return shuffleArray([...distribution], seed)
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleArray<T>(array: T[], seed: string): T[] {
  const arr = [...array]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280
    return hash / 233280
  }
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  
  return arr
}

/**
 * Get initial alignment for a role
 */
export function getAlignmentForRole(roleId: RoleId): Alignment {
  const role = ROLES_V2[roleId]
  return role ? role.alignment : 'COVEN'
}
