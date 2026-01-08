import { Alignment, GameConfig, IngredientId, Phase, RoleId, RoundOutcome } from './types'

export interface PlayerStatus {
  id: string
  name: string
  roleId: RoleId
  alignment: Alignment
  isAlive: boolean
  isHost?: boolean
  disconnected?: boolean
  eliminatedRound?: number
  wasInfected?: boolean
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  roundNumber: number
  type: 'text' | 'reaction' | 'system'
}

export interface ChatReaction {
  playerId: string
  playerName: string
  emoji: string
  timestamp: number
}

export interface VoteRevealEntry {
  targetId: string
  voteNumber: number
}

export interface AlignmentInsight {
  targetId: string
  alignment: Alignment | null
  accurate: boolean
  recordedAt: number
}

export type PowerType = 
  | 'ALIGNMENT_REVEAL'  // Chronicler: See someone's alignment
  | 'INGREDIENT_REVEAL' // Oracle: See what ingredient someone played this round
  | 'PROTECT_PLAYER'    // Protection: Shield a player from next death
  | 'DOUBLE_VOTE'       // Exorcist: Your next council vote counts twice
  | 'CHAOS_SPREAD'      // Hex/Hollow: Cause confusion or corrupt next ritual
  | 'AMPLIFY_CHAOS'     // Harbinger: Force next ritual to extreme outcome
  | 'STEAL_VISION'      // Mimic: Copy someone else's power or see their insights

export interface PendingPowerState {
  type: PowerType
  performerId: string
  availableTargets: string[]
  expiresAt: number
  used?: boolean
  targetId?: string
  revealedAlignment?: Alignment | null
  revealedIngredient?: IngredientId | null
  accurate?: boolean
  // For non-targeted powers
  applied?: boolean
}

export interface MultiplayerPhaseDurations {
  discussionMs: number
  nominationVoteMs: number
  revealMs: number
  ingredientChoiceMs: number
  performerPowerMs: number
  councilVoteMs: number
}

export interface OptionalRulesets {
  enableInfection: boolean      // Hidden player conversion mechanic
  enableCorruption: boolean      // Ingredient degradation mechanic
}

export interface MultiplayerGameMeta {
  schemaVersion: number
  config: GameConfig
  phaseDurations: MultiplayerPhaseDurations
  rulesets: OptionalRulesets
}

export interface MultiplayerSharedState {
  meta: MultiplayerGameMeta
  phase: Phase
  roundNumber: number
  hostPlayerId: string | null
  players: Record<string, PlayerStatus>
  currentPerformerId: string | null
  nominationVotes: Record<string, string>
  nominationRevealOrder: VoteRevealEntry[]
  ingredientSelections: Record<string, IngredientId>
  ritualOutcome?: RoundOutcome
  pendingPower?: PendingPowerState | null
  protectionBlessing?: string | null
  councilVotes: Record<string, string>
  alignmentInsights: Record<string, AlignmentInsight[]>
  ingredientInsights: Record<string, Array<{ targetId: string; ingredientId: IngredientId; roundNumber: number }>>
  lastUsedIngredients: Record<string, IngredientId>  // Track last ingredient each player used for cooldown
  corruptedIngredients: IngredientId[]  // Ingredients corrupted by TAINTED rituals (unavailable next round)
  infectedPlayers: string[]  // Players secretly converted to Hollow (infection ruleset)
  chatMessages: ChatMessage[]  // Discussion phase chat history
  roundHistory: Array<{ roundNumber: number; outcome?: RoundOutcome; eliminated?: string }>  // Game history for summary
  winnerAlignment?: Alignment
  winnerReason?: string
  tutorialComplete: boolean
  phaseExpiresAt: number | null
}

export const SHARED_STATE_SCHEMA_VERSION = 2

export const DEFAULT_PHASE_DURATIONS: MultiplayerPhaseDurations = {
  discussionMs: 300_000,  // 5 minutes for discussion
  nominationVoteMs: 60_000,
  revealMs: 15_000,
  ingredientChoiceMs: 60_000,
  performerPowerMs: 30_000,
  councilVoteMs: 60_000,
}

export const DEFAULT_RULESETS: OptionalRulesets = {
  enableInfection: false,    // Disabled by default - can enable for advanced play
  enableCorruption: false,   // Disabled by default - can enable for added challenge
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  maxRounds: 9,
  pureThreshold: 0.25,
  backfireThreshold: 0.55,
  spiteChance: 0.15,
  exorcistMinRound: 3,
  infectionStartRound: 4,
  infectionEndRound: 6,
  maxInfectedExtra: 1,
  infectionChanceTainted: 0.15,
  infectionChanceBackfired: 0.35,
  purgingStartRound: 5,
  purgingChancePerRound: 0.2,
  discussionSecondsByPlayerCount: {
    '3-4': 60,
    '5-6': 75,
    '7-9': 90,
  },
}
