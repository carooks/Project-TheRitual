import { 
  Ingredient, 
  OutcomeResult, 
  OutcomeState, 
  Domain, 
  EffectTag,
  Player,
  Alignment 
} from './types'
import { 
  getDominantDomain, 
  calculateCorruptionIndex 
} from './ingredients_v2'

/**
 * RITUAL RESOLUTION LOGIC - V2
 * 
 * This is the core alchemical system that determines ritual outcomes.
 * 
 * Rules:
 * 1. Dominant domain determines WHAT happens (divination, protection, corruption, etc.)
 * 2. Corruption index determines HOW CLEANLY it happens (pure, tainted, backfired)
 * 3. Protection ingredients can soften or prevent lethal backfires
 * 4. Amplification makes outcomes more extreme
 * 5. Suppression dampens outcomes
 * 6. Misdirection scrambles/inverts effects
 */

export function resolveRitual(
  ingredients: Ingredient[],
  performer: Player,
  allPlayers: Player[],
  roundNumber: number
): OutcomeResult {
  
  if (ingredients.length === 0) {
    return createEmptyOutcome()
  }

  // Step 1: Calculate corruption index (hidden from players)
  const corruptionIndex = calculateCorruptionIndex(ingredients)
  
  // Step 2: Determine dominant domain
  const dominantDomain = getDominantDomain(ingredients)
  const dominantIngredient = ingredients.find(ing => ing.domain === dominantDomain) || ingredients[0]
  
  // Step 3: Count special effect ingredients
  const protectionCount = ingredients.filter(ing => ing.domain === Domain.PROTECTION).length
  const amplificationCount = ingredients.filter(ing => ing.domain === Domain.AMPLIFICATION).length
  const suppressionCount = ingredients.filter(ing => ing.domain === Domain.SUPPRESSION).length
  const misdirectionCount = ingredients.filter(ing => ing.domain === Domain.MISDIRECTION).length
  
  // Step 4: Determine base outcome state (before modifiers)
  let baseState = determineOutcomeState(corruptionIndex)
  
  // Step 5: Apply Amplification (push toward extremes)
  if (amplificationCount > 0) {
    baseState = amplifyOutcome(baseState, amplificationCount)
  }
  
  // Step 6: Apply Suppression (dampen extremes)
  if (suppressionCount > 0) {
    baseState = suppressOutcome(baseState, suppressionCount)
  }
  
  // Step 7: Apply Protection (can prevent backfire)
  let isLethal = baseState === OutcomeState.BACKFIRED
  if (isLethal && protectionCount > 0) {
    // Strong protection can prevent death
    if (protectionCount >= 2 || (protectionCount === 1 && Math.random() < 0.5)) {
      isLethal = false
      baseState = OutcomeState.TAINTED  // Downgraded from backfire
    }
  }
  
  // Step 8: Spite death (if backfired and very corrupted)
  let isSpiteDeath = false
  let spiteVictimId: string | null = null
  
  if (isLethal && dominantDomain === Domain.CORRUPTION) {
    // 15% base chance, increases with corruption
    const spiteChance = 0.15 + (corruptionIndex * 0.35)  // Up to 50% at max corruption
    
    if (Math.random() < spiteChance) {
      isSpiteDeath = true
      // Pick random living player who isn't the performer
      const candidates = allPlayers.filter(p => p.isAlive && p.id !== performer.id)
      if (candidates.length > 0) {
        spiteVictimId = candidates[Math.floor(Math.random() * candidates.length)].id
      }
    }
  }
  
  // Step 9: Generate narrative notes
  const notes = generateNarrativeNotes(
    baseState,
    dominantDomain,
    isLethal,
    isSpiteDeath,
    amplificationCount,
    suppressionCount,
    protectionCount
  )
  
  // Step 10: Handle domain-specific effects
  let divination = undefined
  
  if (dominantDomain === Domain.DIVINATION && !isLethal) {
    divination = resolveDivination(
      baseState,
      allPlayers,
      performer,
      misdirectionCount
    )
  }
  
  return {
    state: baseState,
    dominantDomain,
    dominantIngredient,
    corruptionIndex,
    isLethal,
    isSpiteDeath,
    spiteVictimId,
    notes,
    divination
  }
}

/**
 * Determine outcome state based on corruption index
 */
function determineOutcomeState(corruptionIndex: number): OutcomeState {
  if (corruptionIndex < 0.25) {
    return OutcomeState.PURE
  } else if (corruptionIndex < 0.5) {
    return OutcomeState.TAINTED
  } else {
    return OutcomeState.BACKFIRED
  }
}

/**
 * Amplification pushes outcomes toward extremes
 */
function amplifyOutcome(state: OutcomeState, count: number): OutcomeState {
  if (count === 0) return state
  
  // Each amplification ingredient increases chance of extreme outcome
  const amplifyChance = Math.min(0.9, count * 0.3)
  
  if (Math.random() < amplifyChance) {
    if (state === OutcomeState.TAINTED) {
      // Could go either direction
      return Math.random() < 0.7 ? OutcomeState.BACKFIRED : OutcomeState.PURE
    }
    // PURE stays pure, BACKFIRED stays backfired (already extreme)
  }
  
  return state
}

/**
 * Suppression dampens extreme outcomes
 */
function suppressOutcome(state: OutcomeState, count: number): OutcomeState {
  if (count === 0) return state
  
  const suppressChance = Math.min(0.8, count * 0.25)
  
  if (Math.random() < suppressChance) {
    if (state === OutcomeState.BACKFIRED) {
      return OutcomeState.TAINTED
    } else if (state === OutcomeState.PURE) {
      return OutcomeState.TAINTED
    }
  }
  
  return state
}

/**
 * Resolve Divination effects (alignment reveals)
 */
function resolveDivination(
  state: OutcomeState,
  allPlayers: Player[],
  performer: Player,
  misdirectionCount: number
): OutcomeResult['divination'] {
  
  // Pick a random target (not the performer)
  const candidates = allPlayers.filter(p => p.isAlive && p.id !== performer.id)
  if (candidates.length === 0) return undefined
  
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  
  let revealedAlignment: Alignment | null = target.alignment
  let isAccurate = true
  
  // PURE: accurate reveal
  if (state === OutcomeState.PURE) {
    // Misdirection can still scramble it
    if (misdirectionCount > 0 && Math.random() < (misdirectionCount * 0.3)) {
      revealedAlignment = revealedAlignment === 'COVEN' ? 'HOLLOW' : 'COVEN'
      isAccurate = false
    }
  }
  
  // TAINTED: unclear or partial
  else if (state === OutcomeState.TAINTED) {
    if (Math.random() < 0.5 + (misdirectionCount * 0.2)) {
      revealedAlignment = null  // Vision is too unclear
      isAccurate = false
    }
  }
  
  // BACKFIRED: false info (inverted)
  else if (state === OutcomeState.BACKFIRED) {
    revealedAlignment = revealedAlignment === 'COVEN' ? 'HOLLOW' : 'COVEN'
    isAccurate = false
  }
  
  return {
    targetPlayerId: target.id,
    revealedAlignment,
    isAccurate
  }
}

/**
 * Generate narrative descriptions for the outcome
 */
function generateNarrativeNotes(
  state: OutcomeState,
  domain: Domain,
  isLethal: boolean,
  isSpiteDeath: boolean,
  amplificationCount: number,
  suppressionCount: number,
  protectionCount: number
): string[] {
  const notes: string[] = []
  
  // Opening based on state
  if (state === OutcomeState.PURE) {
    notes.push('The cauldron glows with clear light.')
    notes.push('The ritual unfolds cleanly.')
  } else if (state === OutcomeState.TAINTED) {
    notes.push('The cauldron flickers uncertainly.')
    notes.push('The magic wavers between light and shadow.')
  } else {
    notes.push('The cauldron turns black.')
    notes.push('The ritual collapses inward.')
  }
  
  // Domain-specific flavor
  switch (domain) {
    case Domain.DIVINATION:
      if (state === OutcomeState.PURE) {
        notes.push('Visions form clearly in the smoke.')
      } else if (state === OutcomeState.TAINTED) {
        notes.push('Images flicker... incomplete... distorted.')
      } else {
        notes.push('The vision shatters into lies.')
      }
      break
      
    case Domain.PROTECTION:
      if (state === OutcomeState.PURE) {
        notes.push('Wards of light surround the circle.')
      } else if (state === OutcomeState.TAINTED) {
        notes.push('The shields hold, but barely.')
      } else {
        notes.push('The wards collapse under the weight.')
      }
      break
      
    case Domain.CORRUPTION:
      if (state === OutcomeState.TAINTED) {
        notes.push('The Hollow whispers at the edges.')
      } else if (state === OutcomeState.BACKFIRED) {
        notes.push('The Hollow devours.')
        notes.push('Darkness spreads like ink in water.')
      }
      break
      
    case Domain.MISDIRECTION:
      notes.push('Reality shifts. What is true?')
      break
      
    case Domain.AMPLIFICATION:
      if (amplificationCount > 0) {
        notes.push('Power surges beyond control.')
      }
      break
      
    case Domain.SUPPRESSION:
      if (suppressionCount > 0) {
        notes.push('The magic is dampened, muffled.')
      }
      break
  }
  
  // Death descriptions
  if (isLethal) {
    notes.push('The Performer screams.')
    notes.push('Their form crumbles to ash.')
    
    if (isSpiteDeath) {
      notes.push('The hunger spreads beyond the 13th Chair.')
      notes.push('Another falls.')
    }
  } else if (protectionCount > 0 && state === OutcomeState.TAINTED) {
    notes.push('The protective wards saved the Performer from certain death.')
  }
  
  return notes
}

/**
 * Create empty outcome for edge cases
 */
function createEmptyOutcome(): OutcomeResult {
  return {
    state: OutcomeState.PURE,
    dominantDomain: Domain.DIVINATION,
    dominantIngredient: null as any,
    corruptionIndex: 0,
    isLethal: false,
    isSpiteDeath: false,
    spiteVictimId: null,
    notes: ['The cauldron sits empty. No ritual was performed.']
  }
}
