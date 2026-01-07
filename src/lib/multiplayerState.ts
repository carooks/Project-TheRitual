import { Alignment, GameConfig, IngredientId, Phase, RoleId, RoundOutcome } from './types'

export interface PlayerStatus {
  id: string
  name: string
  roleId: RoleId
  alignment: Alignment
  alive: boolean
  isHost?: boolean
  disconnected?: boolean
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

export interface PendingPowerState {
  type: 'ALIGNMENT_REVEAL'
  performerId: string
  availableTargets: string[]
  expiresAt: number
  used?: boolean
  targetId?: string
  revealedAlignment?: Alignment | null
  accurate?: boolean
}

export interface MultiplayerPhaseDurations {
  discussionMs: number
  nominationVoteMs: number
  revealMs: number
  ingredientChoiceMs: number
  performerPowerMs: number
  councilVoteMs: number
}

export interface MultiplayerGameMeta {
  schemaVersion: number
  config: GameConfig
  phaseDurations: MultiplayerPhaseDurations
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
