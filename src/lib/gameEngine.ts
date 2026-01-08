import { Alignment, IngredientId, IngredientPlay, Phase, Player, RoleId } from './types'
import { assignRandomRoles, ROLES } from './roles'
import { resolveRitual } from './ritual'
import {
  AlignmentInsight,
  DEFAULT_GAME_CONFIG,
  DEFAULT_PHASE_DURATIONS,
  DEFAULT_RULESETS,
  MultiplayerGameMeta,
  MultiplayerSharedState,
  PlayerStatus,
  SHARED_STATE_SCHEMA_VERSION,
} from './multiplayerState'

export interface EnginePlayerSeed {
  id: string
  name: string
  isHost?: boolean
}

export interface EngineContext {
  now: number
  random?: () => number
}

export type GameIntent =
  | { type: 'START_GAME'; players: EnginePlayerSeed[]; seed: string }
  | { type: 'ADVANCE_FROM_DISCUSSION' }
  | { type: 'SUBMIT_NOMINATION_VOTE'; playerId: string; targetId: string }
  | { type: 'COMPLETE_NOMINATION_REVEAL' }
  | { type: 'SUBMIT_INGREDIENT'; playerId: string; ingredientId: IngredientId }
  | { type: 'SUBMIT_POWER_TARGET'; playerId: string; targetId: string }
  | { type: 'SUBMIT_COUNCIL_VOTE'; playerId: string; targetId: string }
  | { type: 'MARK_TUTORIAL_COMPLETE' }
  | { type: 'PHASE_TIMEOUT' }

const DEFAULT_CONTEXT: EngineContext = {
  now: Date.now(),
  random: () => Math.random(),
}

export function applyIntent(
  state: MultiplayerSharedState | null,
  intent: GameIntent,
  context: EngineContext = DEFAULT_CONTEXT
): MultiplayerSharedState {
  const ctx = {
    now: context.now ?? Date.now(),
    random: context.random ?? (() => Math.random()),
  }

  if (intent.type === 'START_GAME') {
    return startNewGame(intent.players, intent.seed, ctx)
  }

  if (!state) {
    throw new Error('Game state not initialized; call START_GAME first')
  }

  let next = cloneState(state)

  switch (intent.type) {
    case 'MARK_TUTORIAL_COMPLETE': {
      next.tutorialComplete = true
      return next
    }
    case 'ADVANCE_FROM_DISCUSSION': {
      if (next.phase === Phase.NOMINATION_DISCUSSION) {
        beginNominationVote(next, ctx)
      }
      return next
    }
    case 'SUBMIT_NOMINATION_VOTE': {
      if (next.phase !== Phase.NOMINATION_VOTE) return next
      handleNominationVote(next, intent.playerId, intent.targetId, ctx)
      return next
    }
    case 'COMPLETE_NOMINATION_REVEAL': {
      if (next.phase === Phase.NOMINATION_REVEAL) {
        moveToIngredientChoice(next, ctx)
      }
      return next
    }
    case 'SUBMIT_INGREDIENT': {
      if (next.phase !== Phase.INGREDIENT_CHOICE) return next
      handleIngredientChoice(next, intent.playerId, intent.ingredientId)
      maybeResolveRitual(next, ctx)
      return next
    }
    case 'SUBMIT_POWER_TARGET': {
      if (next.phase !== Phase.PERFORMER_POWER || !next.pendingPower) return next
      handlePerformerPower(next, intent.playerId, intent.targetId, ctx)
      return next
    }
    case 'SUBMIT_COUNCIL_VOTE': {
      if (next.phase !== Phase.COUNCIL_VOTE) return next
      handleCouncilVote(next, intent.playerId, intent.targetId, ctx)
      return next
    }
    case 'PHASE_TIMEOUT': {
      handlePhaseTimeout(next, ctx)
      return next
    }
    default:
      return next
  }
}

function startNewGame(players: EnginePlayerSeed[], seed: string, ctx: EngineContext): MultiplayerSharedState {
  if (players.length < 3) {
    throw new Error('Need at least three players to start')
  }

  const assignedRoles = assignRandomRoles(players.length, seed)
  const playerStatuses: Record<string, PlayerStatus> = {}

  players.forEach((player, index) => {
    const roleId = assignedRoles[index]
    const roleDef = ROLES[roleId]
    playerStatuses[player.id] = {
      id: player.id,
      name: player.name,
      roleId,
      alignment: roleDef.alignment,
      alive: true,
      isHost: player.isHost,
    }
  })

  const hostPlayer = players.find((p) => p.isHost) ?? players[0]

  const meta: MultiplayerGameMeta = {
    schemaVersion: SHARED_STATE_SCHEMA_VERSION,
    config: DEFAULT_GAME_CONFIG,
    phaseDurations: DEFAULT_PHASE_DURATIONS,
    rulesets: DEFAULT_RULESETS,  // Initialize optional rulesets
  }

  const next: MultiplayerSharedState = {
    meta,
    phase: Phase.NOMINATION_DISCUSSION,
    roundNumber: 1,
    hostPlayerId: hostPlayer.id,
    players: playerStatuses,
    currentPerformerId: null,
    nominationVotes: {},
    nominationRevealOrder: [],
    ingredientSelections: {},
    ritualOutcome: undefined,
    pendingPower: null,
    protectionBlessing: null,
    councilVotes: {},
    alignmentInsights: {},
    ingredientInsights: {},
    lastUsedIngredients: {},
    corruptedIngredients: [],  // Initialize corruption tracking
    infectedPlayers: [],  // Initialize infection tracking
    winnerAlignment: undefined,
    winnerReason: undefined,
    tutorialComplete: false,
    phaseExpiresAt: null, // Will be set after tutorial completes
  }

  return next
}

function beginNominationVote(state: MultiplayerSharedState, ctx: EngineContext) {
  state.phase = Phase.NOMINATION_VOTE
  state.nominationVotes = {}
  state.nominationRevealOrder = []
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.nominationVoteMs
}

function handleNominationVote(
  state: MultiplayerSharedState,
  playerId: string,
  targetId: string,
  ctx: EngineContext
) {
  if (!isPlayerAlive(state, playerId)) return
  if (!isPlayerAlive(state, targetId)) return
  if (playerId === targetId) return

  const previousVote = state.nominationVotes[playerId]
  state.nominationVotes[playerId] = targetId

  if (!previousVote) {
    const voteCount =
      Object.values(state.nominationVotes).filter((vote) => vote === targetId).length || 1
    state.nominationRevealOrder = [
      ...state.nominationRevealOrder,
      { targetId, voteNumber: voteCount },
    ]
  }

  const alive = alivePlayerIds(state)
  if (alive.every((id) => state.nominationVotes[id])) {
    finalizePerformer(state, ctx)
  }
}

function finalizePerformer(state: MultiplayerSharedState, ctx: EngineContext) {
  const tally: Record<string, number> = {}
  Object.values(state.nominationVotes).forEach((targetId) => {
    tally[targetId] = (tally[targetId] || 0) + 1
  })

  const alive = alivePlayerIds(state)
  if (alive.length === 0) {
    state.currentPerformerId = null
    return
  }

  const fallbackTarget = alive[Math.floor(ctx.random!() * alive.length)]
  let performerId = fallbackTarget
  let highest = 0

  Object.entries(tally).forEach(([targetId, count]) => {
    if (count > highest) {
      performerId = targetId
      highest = count
    } else if (count === highest && ctx.random!() < 0.5) {
      performerId = targetId
    }
  })

  state.currentPerformerId = performerId
  state.phase = Phase.NOMINATION_REVEAL
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.revealMs
}

function moveToIngredientChoice(state: MultiplayerSharedState, ctx: EngineContext) {
  state.phase = Phase.INGREDIENT_CHOICE
  state.ingredientSelections = {}
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.ingredientChoiceMs
}

function handleIngredientChoice(
  state: MultiplayerSharedState,
  playerId: string,
  ingredientId: IngredientId
) {
  if (!isPlayerAlive(state, playerId)) return
  
  // COOLDOWN: Can't use the same ingredient twice in a row
  const lastUsed = state.lastUsedIngredients[playerId]
  if (lastUsed === ingredientId) {
    // Silently reject - ingredient still on cooldown
    return
  }
  
  // CORRUPTION: Can't use corrupted ingredients
  if (state.corruptedIngredients.includes(ingredientId)) {
    // Silently reject - ingredient is corrupted and unusable
    return
  }
  
  state.ingredientSelections[playerId] = ingredientId
  // Track this ingredient for next round's cooldown
  state.lastUsedIngredients[playerId] = ingredientId

  // CRYSTAL BALL: Oracle-exclusive ingredient that grants instant vision
  if (ingredientId === 'CRYSTAL_BALL') {
    const player = state.players[playerId]
    if (player && player.roleId === 'ORACLE') {
      // Immediately reveal a random alive player's INGREDIENT CHOICE to the Oracle
      const targets = alivePlayerIds(state).filter((id) => id !== playerId)
      if (targets.length > 0) {
        const randomTarget = targets[Math.floor(Math.random() * targets.length)]
        const targetIngredient = state.ingredientSelections[randomTarget]
        
        // Only reveal if target has already selected (otherwise wait)
        if (targetIngredient) {
          const entry = {
            targetId: randomTarget,
            ingredientId: targetIngredient,
            roundNumber: state.roundNumber,
          }
          const existing = state.ingredientInsights[playerId] ?? []
          state.ingredientInsights[playerId] = [...existing, entry]
        }
      }
    }
  }
}

function maybeResolveRitual(state: MultiplayerSharedState, ctx: EngineContext) {
  if (state.phase !== Phase.INGREDIENT_CHOICE) return
  const alive = alivePlayerIds(state)
  const everyoneLocked = alive.every((id) => state.ingredientSelections[id])

  if (!everyoneLocked) return

  resolveCurrentRitual(state, ctx)
}

function resolveCurrentRitual(state: MultiplayerSharedState, ctx: EngineContext) {
  if (!state.currentPerformerId) return
  const ingredientPlays: IngredientPlay[] = Object.entries(state.ingredientSelections).map(
    ([playerId, ingredientId]) => ({ playerId, ingredientId })
  )

  const playersForResolver: Player[] = Object.values(state.players).map((p) => ({
    id: p.id,
    name: p.name,
    roleId: p.roleId,
    alignment: p.alignment,
    alive: p.alive,
  }))

  const { outcome, deadPlayerIds } = resolveRitual({
    players: playersForResolver,
    performerId: state.currentPerformerId,
    roundNumber: state.roundNumber,
    ingredientPlays,
    config: state.meta.config,
  })

  if (outcome.state === 'BACKFIRED' && !outcome.performerDies) {
    outcome.performerDies = true
    if (!deadPlayerIds.includes(state.currentPerformerId)) {
      deadPlayerIds.push(state.currentPerformerId)
    }
  }

  deadPlayerIds.forEach((id) => {
    const status = state.players[id]
    if (status) {
      status.alive = false
    }
  })

  state.ritualOutcome = outcome
  state.phase = Phase.RITUAL_RESOLUTION
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.revealMs

  // Apply optional rulesets based on ritual outcome
  const rulesets = state.meta.rulesets

  // CORRUPTION: Degrade ingredients after tainted rituals
  if (rulesets.enableCorruption && outcome.state === 'TAINTED') {
    applyIngredientCorruption(state, ingredientPlays, ctx)
  }

  // INFECTION: Convert Coven to Hollow after failed rituals (early game only)
  if (rulesets.enableInfection && (outcome.state === 'TAINTED' || outcome.state === 'BACKFIRED')) {
    applyInfectionMechanic(state, ctx)
  }

  const performerRole = state.players[state.currentPerformerId]?.roleId

  // Grant powers based on successful rituals (PURE only)
  if (outcome.state === 'PURE' && performerRole) {
    grantRolePower(state, state.currentPerformerId, performerRole, ctx)
  } else if (
    performerRole === 'ORACLE' &&
    outcome.state === 'TAINTED'
  ) {
    // Oracle still gets reduced power on TAINTED (legacy behavior)
    const targets = alivePlayerIds(state).filter((id) => id !== state.currentPerformerId)
    if (targets.length > 0) {
      state.pendingPower = {
        type: 'INGREDIENT_REVEAL',
        performerId: state.currentPerformerId,
        availableTargets: targets,
        expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
      }
    }
  } else {
    state.pendingPower = null
    state.protectionBlessing = null
  }
}

// Grant role-specific powers when a performer completes a PURE ritual
function grantRolePower(
  state: MultiplayerSharedState,
  performerId: string,
  roleId: RoleId,
  ctx: EngineContext
) {
  const targets = alivePlayerIds(state).filter((id) => id !== performerId)

  switch (roleId) {
    case 'ORACLE':
      // Oracle: See what ingredient someone played this round
      if (targets.length > 0) {
        state.pendingPower = {
          type: 'INGREDIENT_REVEAL',
          performerId,
          availableTargets: targets,
          expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        }
      }
      break

    case 'PROTECTION':
      // Protection: Gets passive blessing (legacy behavior preserved)
      state.protectionBlessing = performerId
      // Additionally, allow protecting another player
      if (targets.length > 0) {
        state.pendingPower = {
          type: 'PROTECT_PLAYER',
          performerId,
          availableTargets: targets,
          expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        }
      }
      break

    case 'CHRONICLER':
      // Chronicler: See someone's alignment (similar to Oracle)
      if (targets.length > 0) {
        state.pendingPower = {
          type: 'ALIGNMENT_REVEAL',
          performerId,
          availableTargets: targets,
          expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        }
      }
      break

    case 'EXORCIST':
      // Exorcist: Double vote power in next council
      state.pendingPower = {
        type: 'DOUBLE_VOTE',
        performerId,
        availableTargets: [],
        expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        applied: true, // Auto-apply, no target needed
      }
      break

    case 'HEX':
      // Hex/Hollow Servant: Corrupt the next ritual or spread chaos
      state.pendingPower = {
        type: 'CHAOS_SPREAD',
        performerId,
        availableTargets: [],
        expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        applied: true,
      }
      break

    case 'HARBINGER':
      // Harbinger: Force next ritual to be more extreme
      state.pendingPower = {
        type: 'AMPLIFY_CHAOS',
        performerId,
        availableTargets: [],
        expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        applied: true,
      }
      break

    case 'MIMIC':
      // Mimic: Steal/copy insights from another player
      if (targets.length > 0) {
        state.pendingPower = {
          type: 'STEAL_VISION',
          performerId,
          availableTargets: targets,
          expiresAt: ctx.now + state.meta.phaseDurations.performerPowerMs,
        }
      }
      break

    default:
      state.pendingPower = null
      state.protectionBlessing = null
  }
}

// CORRUPTION MECHANIC: Degrade ingredients after tainted rituals
function applyIngredientCorruption(
  state: MultiplayerSharedState,
  ingredientPlays: IngredientPlay[],
  ctx: EngineContext
) {
  // Clear previous round's corruption
  state.corruptedIngredients = []

  // Corrupt 1-2 random ingredients that were used in the tainted ritual
  const usedIngredients = ingredientPlays.map(p => p.ingredientId)
  const uniqueIngredients = [...new Set(usedIngredients)]
  
  // Randomly select 1-2 ingredients to corrupt
  const corruptCount = ctx.random() < 0.5 ? 1 : 2
  const shuffled = uniqueIngredients.sort(() => ctx.random() - 0.5)
  const corrupted = shuffled.slice(0, Math.min(corruptCount, uniqueIngredients.length))
  
  state.corruptedIngredients = corrupted
}

// INFECTION MECHANIC: Convert Coven to Hollow after failed rituals
function applyInfectionMechanic(
  state: MultiplayerSharedState,
  ctx: EngineContext
) {
  // Only apply infection in early game (rounds 1-3)
  if (state.roundNumber > 3) return

  // Limit total infections to 2 per game
  if (state.infectedPlayers.length >= 2) return

  // Calculate infection chance based on ritual outcome (balanced rates)
  const outcome = state.ritualOutcome
  let infectionChance = 0
  if (outcome?.state === 'TAINTED') infectionChance = 0.08  // 8% (balanced)
  if (outcome?.state === 'BACKFIRED') infectionChance = 0.25  // 25% (balanced)

  // Roll for infection
  if (ctx.random() > infectionChance) return

  // Find eligible Coven players (alive, not already infected)
  const eligiblePlayers = Object.values(state.players).filter(p => 
    p.alive && 
    p.alignment === 'COVEN' && 
    !state.infectedPlayers.includes(p.id)
  )

  if (eligiblePlayers.length === 0) return

  // Randomly select a player to infect
  const targetIndex = Math.floor(ctx.random() * eligiblePlayers.length)
  const target = eligiblePlayers[targetIndex]

  // Convert player to Hollow
  target.alignment = 'HOLLOW'
  state.infectedPlayers.push(target.id)
  
  // Note: Infection is hidden from players - they maintain their Coven role appearance
}

function handlePerformerPower(
  state: MultiplayerSharedState,
  playerId: string,
  targetId: string,
  ctx: EngineContext
) {
  const pending = state.pendingPower
  if (!pending) return
  if (pending.performerId !== playerId) return

  pending.used = true

  switch (pending.type) {
    case 'INGREDIENT_REVEAL': {
      if (!pending.availableTargets.includes(targetId)) return
      const targetIngredient = state.ingredientSelections[targetId]
      if (!targetIngredient) return

      pending.targetId = targetId
      pending.revealedIngredient = targetIngredient
      pending.accurate = true

      const entry = {
        targetId,
        ingredientId: targetIngredient,
        roundNumber: state.roundNumber,
      }

      const existing = state.ingredientInsights[playerId] ?? []
      state.ingredientInsights[playerId] = [...existing, entry]
      break
    }

    case 'ALIGNMENT_REVEAL': {
      if (!pending.availableTargets.includes(targetId)) return
      const target = state.players[targetId]
      if (!target) return

      pending.targetId = targetId
      pending.revealedAlignment = target.alignment
      pending.accurate = true

      const entry: AlignmentInsight = {
        targetId,
        alignment: target.alignment,
        accurate: true,
        recordedAt: ctx.now,
      }

      const existing = state.alignmentInsights[playerId] ?? []
      state.alignmentInsights[playerId] = [...existing, entry]
      break
    }

    case 'PROTECT_PLAYER': {
      if (!pending.availableTargets.includes(targetId)) return
      pending.targetId = targetId
      // Mark this player as protected (we'll check this in next ritual resolution)
      // For now, store in protectionBlessing
      state.protectionBlessing = targetId
      break
    }

    case 'STEAL_VISION': {
      if (!pending.availableTargets.includes(targetId)) return
      const target = state.players[targetId]
      if (!target) return

      pending.targetId = targetId
      // Copy all insights from target player to performer
      const targetInsights = state.alignmentInsights[targetId] ?? []
      const performerInsights = state.alignmentInsights[playerId] ?? []
      state.alignmentInsights[playerId] = [...performerInsights, ...targetInsights]
      break
    }

    case 'DOUBLE_VOTE':
    case 'CHAOS_SPREAD':
    case 'AMPLIFY_CHAOS':
      // These are passive/auto-applied powers, no target needed
      pending.applied = true
      break
  }

  moveToCouncilVote(state, ctx)
}

function handleCouncilVote(
  state: MultiplayerSharedState,
  playerId: string,
  targetId: string,
  ctx: EngineContext
) {
  if (!isPlayerAlive(state, playerId)) return
  // Allow SKIP or valid alive targets
  if (targetId !== 'SKIP' && !isPlayerAlive(state, targetId)) return
  if (playerId === targetId) return

  state.councilVotes[playerId] = targetId

  const alive = alivePlayerIds(state)
  if (alive.every((id) => state.councilVotes[id])) {
    finalizeCouncilVote(state, ctx)
  }
}

function finalizeCouncilVote(state: MultiplayerSharedState, ctx: EngineContext) {
  const tally: Record<string, number> = {}
  let skipCount = 0
  
  Object.values(state.councilVotes).forEach((targetId) => {
    if (targetId === 'SKIP') {
      skipCount++
    } else {
      tally[targetId] = (tally[targetId] || 0) + 1
    }
  })

  const alive = alivePlayerIds(state)
  if (alive.length === 0) {
    concludeRound(state, ctx)
    return
  }

  const totalVotes = Object.keys(state.councilVotes).length
  const majorityThreshold = Math.floor(totalVotes / 2) + 1
  
  let eliminatedId: string | null = null
  let highest = 0

  // Find player with most votes
  Object.entries(tally).forEach(([targetId, count]) => {
    if (count > highest) {
      highest = count
      eliminatedId = targetId
    } else if (count === highest && ctx.random!() < 0.5) {
      eliminatedId = targetId
    }
  })

  // Only eliminate if they have a majority
  if (eliminatedId && highest >= majorityThreshold) {
    if (state.protectionBlessing && eliminatedId === state.protectionBlessing) {
      // Blessing prevents burn this round
      state.protectionBlessing = null
    } else {
      const target = state.players[eliminatedId]
      if (target) {
        target.alive = false
      }
      state.protectionBlessing = null
    }
  } else {
    // No majority reached - no one is eliminated
    state.protectionBlessing = null
  }

  concludeRound(state, ctx)
}

function handlePhaseTimeout(state: MultiplayerSharedState, ctx: EngineContext) {
  switch (state.phase) {
    case Phase.NOMINATION_DISCUSSION:
      beginNominationVote(state, ctx)
      break
    case Phase.NOMINATION_VOTE:
      finalizePerformer(state, ctx)
      break
    case Phase.NOMINATION_REVEAL:
      moveToIngredientChoice(state, ctx)
      break
    case Phase.INGREDIENT_CHOICE:
      resolveCurrentRitual(state, ctx)
      break
    case Phase.RITUAL_RESOLUTION:
      if (state.pendingPower) {
        moveToPerformerPower(state, ctx)
      } else {
        moveToCouncilVote(state, ctx)
      }
      break
    case Phase.PERFORMER_POWER:
      moveToCouncilVote(state, ctx)
      break
    case Phase.COUNCIL_VOTE:
      finalizeCouncilVote(state, ctx)
      break
    default:
      break
  }
}

function moveToPerformerPower(state: MultiplayerSharedState, ctx: EngineContext) {
  if (!state.pendingPower) {
    moveToCouncilVote(state, ctx)
    return
  }
  state.phase = Phase.PERFORMER_POWER
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.performerPowerMs
}

function moveToCouncilVote(state: MultiplayerSharedState, ctx: EngineContext) {
  state.phase = Phase.COUNCIL_VOTE
  state.councilVotes = {}
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.councilVoteMs
  state.pendingPower = null
}

function concludeRound(state: MultiplayerSharedState, ctx: EngineContext) {
  const winner = checkWinner(state)
  if (winner) {
    state.winnerAlignment = winner.alignment
    state.winnerReason = winner.reason
    state.phase = Phase.GAME_OVER
    state.phaseExpiresAt = null
    return
  }

  state.roundNumber += 1
  state.phase = Phase.NOMINATION_DISCUSSION
  state.currentPerformerId = null
  state.nominationVotes = {}
  state.nominationRevealOrder = []
  state.ingredientSelections = {}
  state.ritualOutcome = undefined
  state.pendingPower = null
  state.protectionBlessing = null
  state.councilVotes = {}
  state.phaseExpiresAt = ctx.now + state.meta.phaseDurations.discussionMs
}

function checkWinner(
  state: MultiplayerSharedState
): { alignment: Alignment; reason: string } | null {
  const alive = Object.values(state.players).filter((p) => p.alive)
  const coven = alive.filter((p) => p.alignment === 'COVEN').length
  const hollow = alive.filter((p) => p.alignment === 'HOLLOW').length

  if (hollow === 0 && coven > 0) {
    return { alignment: 'COVEN', reason: 'All Hollow witches have been eliminated.' }
  }

  if (hollow >= coven && hollow > 0) {
    return { alignment: 'HOLLOW', reason: 'Hollow equal or outnumber the Coven.' }
  }

  if (state.roundNumber >= state.meta.config.maxRounds) {
    return { alignment: 'COVEN', reason: 'The Coven endures through the final round.' }
  }

  return null
}

function alivePlayerIds(state: MultiplayerSharedState): string[] {
  return Object.values(state.players)
    .filter((p) => p.alive)
    .map((p) => p.id)
}

function isPlayerAlive(state: MultiplayerSharedState, playerId: string): boolean {
  return Boolean(state.players[playerId]?.alive)
}

function cloneState<T>(value: T): T {
  const structured = (globalThis as typeof globalThis & { structuredClone?: (val: unknown) => unknown })
    .structuredClone
  if (structured) {
    return structured(value) as T
  }
  return JSON.parse(JSON.stringify(value)) as T
}
