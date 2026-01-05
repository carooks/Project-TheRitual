export enum Phase {
  LOBBY = 'LOBBY',
  CHOOSING = 'CHOOSING',
  OFFERING = 'OFFERING',
  REVEAL = 'REVEAL',
  OUTCOME = 'OUTCOME',
  COUNCIL = 'COUNCIL'
}

export enum OutcomeState {
  PURE = 'PURE',
  TAINTED = 'TAINTED',
  BACKFIRED = 'BACKFIRED'
}

export type Player = {
  id: string
  name: string
  roleId: RoleId
}

export type RoleId =
  | 'protection'
  | 'oracle'
  | 'chronicler'
  | 'hex'
  | 'harbinger'
  | 'mimic'

export type IngredientId =
  | 'eye_of_newt'
  | 'mandrake_root'
  | 'tears_of_the_moon'
  | 'raven_feather'
  | 'bone_dust'
  | 'candle_wax'
  | 'blood_of_the_innocent'
  | 'shadow_ash'
  | 'iron_thorn'
  | 'silver_thread'

export type Ingredient = {
  id: IngredientId
  name: string
  icon: string
  flavor: string
  corruptionValue: number
  effect?: string
}

export type GameConfig = {
  discussionTimers: Record<string, number>
  silenceBackfireChance: number
  purgingMoonStart: number
  purgingMoonTrigger: number
  oneDeathPerRound: boolean
}

export type RoundState = {
  id: number
  players: Player[]
  deck: Ingredient[]
  phase: Phase
  outcome?: OutcomeSummary
}

export type OutcomeSummary = {
  state: OutcomeState
  corruption: number // 0..1
  deaths: number
  amplified: boolean
  spite: boolean
  dominant?: Ingredient
}
