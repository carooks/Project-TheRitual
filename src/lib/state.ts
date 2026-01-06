import { Player, Ingredient, OutcomeState, Phase } from './types'
import { ROLES } from './roles'
import { INGREDIENTS } from './ingredients'
import { createRng } from './rng'

export function buildRoundDeck(players: Player[], seed = 'deck-seed'): Ingredient[] {
  const rng = createRng(seed)
  const deck: Ingredient[] = players.map((p) => {
    const role = ROLES[p.roleId]
    const pool = role.pool
    const choice = pool[Math.floor(rng() * pool.length)]
    return INGREDIENTS[choice]
  })
  return deck
}

export function dominantIngredient(cards: Ingredient[]) {
  if (cards.length === 0) return undefined
  // dominant by highest corruptionValue
  return cards.reduce((a, b) => (a.corruptionValue >= b.corruptionValue ? a : b))
}

export function corruptionIndex(cards: Ingredient[]) {
  if (!cards.length) return 0
  // sum corruption values but account for reducers
  let sum = 0
  for (const c of cards) {
    sum += c.corruptionValue
  }
  // Candle Wax slightly amplifies: add 0.05 per wax
  const waxes = cards.filter((c) => c.id === 'candle_wax').length
  sum += waxes * 0.05

  // Normalize: clamp to 0..1 using heuristic max
  const maxPossible = cards.length * 0.3 // if all blood
  const normalized = Math.max(0, Math.min(1, sum / Math.max(0.0001, maxPossible)))
  return normalized
}

export function resolveOutcome(cards: Ingredient[], seed = 'resolve') {
  const rng = createRng(seed)
  const corr = corruptionIndex(cards)
  const dominant = dominantIngredient(cards)
  const hasProtector = cards.some((c) => c.id === 'mandrake_root' || c.id === 'tears_of_the_moon')
  const hasWax = cards.some((c) => c.id === 'candle_wax')

  let state: OutcomeState = OutcomeState.PURE
  if (corr < 0.25) state = OutcomeState.PURE
  else if (corr < 0.5) state = OutcomeState.TAINTED
  else state = OutcomeState.BACKFIRED

  // Protectors reduce BACKFIRED to TAINTED
  if (state === OutcomeState.BACKFIRED && hasProtector) {
    state = OutcomeState.TAINTED
  }

  // Spite hook
  const spite = state === OutcomeState.BACKFIRED && rng() < 0.15

  // deaths: if backfired (and not protected) lethal 1, else 0
  const deaths = state === OutcomeState.BACKFIRED && !hasProtector ? 1 : 0

  return {
    state,
    corruption: corr,
    deaths,
    amplified: hasWax,
    spite,
    dominant
  }
}

export function nextPhase(current: Phase, action: { type: 'NEXT' | 'SET'; phase?: Phase }) {
  if (action.type === 'SET' && action.phase) return action.phase
  switch (current) {
    case Phase.LOBBY:
      return Phase.CHOOSING
    case Phase.CHOOSING:
      return Phase.OFFERING
    case Phase.OFFERING:
      return Phase.REVEAL
    case Phase.REVEAL:
      return Phase.OUTCOME
    case Phase.OUTCOME:
      return Phase.COUNCIL
    case Phase.COUNCIL:
      return Phase.CHOOSING
    default:
      return Phase.LOBBY
  }
}
