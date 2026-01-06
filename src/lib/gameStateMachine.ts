import { 
  Player, 
  RoundState, 
  Phase, 
  IngredientPlay,
  OutcomeResult,
  Ingredient,
  Alignment
} from './types'
import { resolveRitual } from './ritualResolver'

/**
 * GAME STATE MACHINE - V2
 * 
 * Manages round progression through phases:
 * LOBBY → CHOOSING → OFFERING → REVEAL → OUTCOME → COUNCIL → (next round or END)
 */

export type GameState = {
  players: Player[]
  currentRound: RoundState
  history: RoundState[]
  exorcistState: {
    used: boolean
    alive: boolean
    targetHistory: string[]
  }
}

/**
 * Initialize new game state
 */
export function initializeGame(players: Player[]): GameState {
  return {
    players: players.map(p => ({ ...p, isAlive: true })),
    currentRound: {
      roundNumber: 1,
      phase: Phase.LOBBY,
      performerId: null,
      ingredientsThisRound: [],
      outcome: null,
      infectionLevel: 0,
      performerVotes: {},
      councilVotes: {}
    },
    history: [],
    exorcistState: {
      used: false,
      alive: true,
      targetHistory: []
    }
  }
}

/**
 * Advance to next phase in the round
 */
export function advancePhase(gameState: GameState): GameState {
  const { currentRound } = gameState
  
  switch (currentRound.phase) {
    case Phase.LOBBY:
      return { ...gameState, currentRound: { ...currentRound, phase: Phase.CHOOSING } }
    
    case Phase.CHOOSING:
      // After choosing, should have a performer selected
      return { ...gameState, currentRound: { ...currentRound, phase: Phase.OFFERING } }
    
    case Phase.OFFERING:
      // After offering, reveal ingredients
      return { ...gameState, currentRound: { ...currentRound, phase: Phase.REVEAL } }
    
    case Phase.REVEAL:
      // After reveal, calculate outcome
      return calculateOutcome(gameState)
    
    case Phase.OUTCOME:
      // After outcome, either go to council (if performer survived) or next round
      if (currentRound.outcome?.isLethal) {
        return startNextRound(gameState)
      }
      return { ...gameState, currentRound: { ...currentRound, phase: Phase.COUNCIL } }
    
    case Phase.COUNCIL:
      // After council, next round
      return startNextRound(gameState)
    
    case Phase.END:
      return gameState  // Game over
    
    default:
      return gameState
  }
}

/**
 * Vote for ritual performer (during CHOOSING phase)
 */
export function voteForPerformer(
  gameState: GameState, 
  voterId: string, 
  targetId: string
): GameState {
  if (gameState.currentRound.phase !== Phase.CHOOSING) {
    console.warn('Can only vote for performer during CHOOSING phase')
    return gameState
  }
  
  const newVotes = { 
    ...gameState.currentRound.performerVotes, 
    [voterId]: targetId 
  }
  
  return {
    ...gameState,
    currentRound: {
      ...gameState.currentRound,
      performerVotes: newVotes
    }
  }
}

/**
 * Finalize performer selection (count votes)
 */
export function finalizePerformerSelection(gameState: GameState): GameState {
  const { performerVotes } = gameState.currentRound
  
  // Count votes
  const voteCounts: Record<string, number> = {}
  Object.values(performerVotes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })
  
  // Find player with most votes
  let maxVotes = 0
  let performerId = gameState.players.find(p => p.isAlive)?.id || null
  
  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count
      performerId = playerId
    }
  })
  
  return {
    ...gameState,
    currentRound: {
      ...gameState.currentRound,
      performerId
    }
  }
}

/**
 * Submit ingredient selection (during OFFERING phase)
 */
export function selectIngredient(
  gameState: GameState,
  playerId: string,
  ingredient: Ingredient
): GameState {
  if (gameState.currentRound.phase !== Phase.OFFERING) {
    console.warn('Can only select ingredients during OFFERING phase')
    return gameState
  }
  
  // Check if player already selected
  const existing = gameState.currentRound.ingredientsThisRound.find(
    play => play.playerId === playerId
  )
  
  if (existing) {
    console.warn('Player already selected an ingredient this round')
    return gameState
  }
  
  const newPlay: IngredientPlay = { playerId, ingredient }
  
  return {
    ...gameState,
    currentRound: {
      ...gameState.currentRound,
      ingredientsThisRound: [...gameState.currentRound.ingredientsThisRound, newPlay]
    }
  }
}

/**
 * Calculate ritual outcome (transition from REVEAL to OUTCOME)
 */
function calculateOutcome(gameState: GameState): GameState {
  const { currentRound, players } = gameState
  
  if (!currentRound.performerId) {
    console.warn('No performer selected')
    return gameState
  }
  
  const performer = players.find(p => p.id === currentRound.performerId)
  if (!performer) {
    console.warn('Performer not found')
    return gameState
  }
  
  const ingredients = currentRound.ingredientsThisRound.map(play => play.ingredient)
  
  // Resolve ritual using the alchemical logic
  const outcome = resolveRitual(
    ingredients,
    performer,
    players,
    currentRound.roundNumber
  )
  
  // Apply deaths
  let updatedPlayers = [...players]
  
  if (outcome.isLethal) {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === performer.id ? { ...p, isAlive: false } : p
    )
  }
  
  if (outcome.isSpiteDeath && outcome.spiteVictimId) {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === outcome.spiteVictimId ? { ...p, isAlive: false } : p
    )
  }
  
  // Increase infection if tainted or backfired
  let newInfection = currentRound.infectionLevel
  if (outcome.state === 'TAINTED') {
    newInfection += 1
  } else if (outcome.state === 'BACKFIRED') {
    newInfection += 2
  }
  
  return {
    ...gameState,
    players: updatedPlayers,
    currentRound: {
      ...currentRound,
      phase: Phase.OUTCOME,
      outcome,
      infectionLevel: newInfection
    }
  }
}

/**
 * Vote in council (during COUNCIL phase)
 */
export function voteInCouncil(
  gameState: GameState,
  voterId: string,
  targetId: string
): GameState {
  if (gameState.currentRound.phase !== Phase.COUNCIL) {
    console.warn('Can only vote in council during COUNCIL phase')
    return gameState
  }
  
  const newVotes = {
    ...gameState.currentRound.councilVotes,
    [voterId]: targetId
  }
  
  return {
    ...gameState,
    currentRound: {
      ...gameState.currentRound,
      councilVotes: newVotes
    }
  }
}

/**
 * Finalize council vote (eliminate one player)
 */
export function finalizeCouncilVote(gameState: GameState): GameState {
  const { councilVotes } = gameState.currentRound
  
  // Count votes
  const voteCounts: Record<string, number> = {}
  Object.values(councilVotes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })
  
  // Find player with most votes
  let maxVotes = 0
  let eliminatedId: string | null = null
  
  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > maxVotes) {
      maxVotes = count
      eliminatedId = playerId
    }
  })
  
  // Eliminate that player
  const updatedPlayers = gameState.players.map(p =>
    p.id === eliminatedId ? { ...p, isAlive: false } : p
  )
  
  return {
    ...gameState,
    players: updatedPlayers
  }
}

/**
 * Start next round
 */
function startNextRound(gameState: GameState): GameState {
  // Check win conditions
  const winState = checkWinConditions(gameState)
  if (winState) {
    return {
      ...gameState,
      currentRound: { ...gameState.currentRound, phase: Phase.END }
    }
  }
  
  // Archive current round
  const history = [...gameState.history, gameState.currentRound]
  
  // Create new round
  const newRound: RoundState = {
    roundNumber: gameState.currentRound.roundNumber + 1,
    phase: Phase.CHOOSING,
    performerId: null,
    ingredientsThisRound: [],
    outcome: null,
    infectionLevel: gameState.currentRound.infectionLevel,
    performerVotes: {},
    councilVotes: {}
  }
  
  return {
    ...gameState,
    currentRound: newRound,
    history
  }
}

/**
 * Check win conditions
 * Returns winner alignment or null if game continues
 */
export function checkWinConditions(gameState: GameState): Alignment | 'DRAW' | null {
  const { players, history, currentRound } = gameState
  
  const alivePlayers = players.filter(p => p.isAlive)
  const covenCount = alivePlayers.filter(p => p.alignment === 'COVEN').length
  const hollowCount = alivePlayers.filter(p => p.alignment === 'HOLLOW').length
  
  // HOLLOW wins if they equal or outnumber COVEN
  if (hollowCount >= covenCount && covenCount > 0) {
    return 'HOLLOW'
  }
  
  // COVEN wins if all HOLLOW are dead
  if (hollowCount === 0 && covenCount > 0) {
    return 'COVEN'
  }
  
  // Count pure rituals
  const pureRituals = [...history, currentRound]
    .filter(round => round.outcome?.state === 'PURE')
    .length
  
  // COVEN wins with 5 pure rituals
  if (pureRituals >= 5) {
    return 'COVEN'
  }
  
  // Count backfires
  const backfires = [...history, currentRound]
    .filter(round => round.outcome?.state === 'BACKFIRED')
    .length
  
  // HOLLOW wins with 3 backfires
  if (backfires >= 3) {
    return 'HOLLOW'
  }
  
  // Everyone dead = draw (rare)
  if (alivePlayers.length === 0) {
    return 'DRAW'
  }
  
  return null
}

/**
 * Exorcist uses Rite of Cleansing
 */
export function useExorcistAbility(
  gameState: GameState,
  exorcistId: string,
  targetId: string
): GameState {
  const { exorcistState, players, currentRound } = gameState
  
  // Validate
  if (exorcistState.used) {
    console.warn('Exorcist ability already used')
    return gameState
  }
  
  if (!exorcistState.alive) {
    console.warn('Exorcist is dead')
    return gameState
  }
  
  if (currentRound.roundNumber < 3) {
    console.warn('Exorcist ability cannot be used before Round 3')
    return gameState
  }
  
  const exorcist = players.find(p => p.id === exorcistId)
  const target = players.find(p => p.id === targetId)
  
  if (!exorcist || !target || !exorcist.isAlive || !target.isAlive) {
    console.warn('Invalid exorcist or target')
    return gameState
  }
  
  let updatedPlayers = [...players]
  let updatedExorcistState = {
    ...exorcistState,
    used: true,
    targetHistory: [...exorcistState.targetHistory, targetId]
  }
  
  // If target is HOLLOW: cleanse them (flip to COVEN)
  if (target.alignment === 'HOLLOW') {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === targetId ? { ...p, alignment: 'COVEN' } : p
    )
    // Target is revealed as cleansed (handled in UI)
  }
  // If target is COVEN: Exorcist dies
  else {
    updatedPlayers = updatedPlayers.map(p =>
      p.id === exorcistId ? { ...p, isAlive: false } : p
    )
    updatedExorcistState.alive = false
  }
  
  return {
    ...gameState,
    players: updatedPlayers,
    exorcistState: updatedExorcistState
  }
}
