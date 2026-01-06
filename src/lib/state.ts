import { Player, Ingredient, IngredientId, Phase } from './types'
import { getIngredientPoolForRole } from './roles'
import { INGREDIENTS } from './ingredients'
import { createRng } from './rng'

const OCCASIONAL_DRAW_CHANCE = 0.2

function drawIngredientFromPool(
  ingredientIds: IngredientId[],
  rng: () => number
): IngredientId {
  const index = Math.floor(rng() * ingredientIds.length)
  return ingredientIds[index]
}

export function buildRoundDeck(players: Player[], seed = 'deck-seed'): Ingredient[] {
  const rng = createRng(seed)

  return players.map((player) => {
    const pool = getIngredientPoolForRole(player.roleId)
    const useOccasional =
      pool.occasional && pool.occasional.length > 0 && rng() < OCCASIONAL_DRAW_CHANCE

    const sourceIds = useOccasional ? pool.occasional! : pool.core
    const ingredientId = drawIngredientFromPool(sourceIds, rng)

    return INGREDIENTS[ingredientId]
  })
}

export function nextPhase(current: Phase): Phase {
  switch (current) {
    case 'LOBBY':
      return 'CHOOSING'
    case 'CHOOSING':
      return 'OFFERING'
    case 'OFFERING':
      return 'REVEAL'
    case 'REVEAL':
      return 'OUTCOME'
    case 'OUTCOME':
      return 'COUNCIL'
    case 'COUNCIL':
      return 'CHOOSING'
    default:
      return 'LOBBY'
  }
}
