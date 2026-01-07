// ============================================
// CORE TYPES - REFINED V2
// ============================================

// === ALIGNMENT & ROLES =====================================

export type Alignment = "COVEN" | "HOLLOW";

export type RoleId =
  | "PROTECTION"
  | "ORACLE"
  | "CHRONICLER"
  | "EXORCIST"
  | "HEX"
  | "HARBINGER"
  | "MIMIC";

export interface RoleDefinition {
  id: RoleId;
  name: string;
  alignment: Alignment;
  shortDescription: string;
  // whether this role is included at all for a given player count
  minPlayers: number;
  // path to role artwork asset
  image: string;
}

// === INGREDIENTS ===========================================

export type IngredientId =
  | "MANDRAKE_ROOT"
  | "TEARS_OF_THE_MOON"
  | "EYE_OF_NEWT"
  | "CANDLE_WAX"
  | "RAVEN_FEATHER"
  | "BONE_DUST"
  | "IRON_THORN"
  | "SHADOW_ASH"
  | "BLOOD_OF_THE_INNOCENT"
  | "SILVER_THREAD";

export type IngredientDomain =
  | "DIVINATION"   // vision, reveals, insight
  | "PROTECTION"   // shields, purify, prevent death
  | "CORRUPTION"   // fuels backfire, lethal outcomes
  | "MISDIRECTION" // masking, scrambling/false info
  | "AMPLIFICATION"; // boost effect intensity

export type IngredientEffectTag =
  | "ALIGNMENT_REVEAL"
  | "SOFT_PROTECT"
  | "HARD_PROTECT"
  | "BOOST_CORRUPTION"
  | "DISTORT_VISION"
  | "BLOCK_PROTECTION"
  | "MARK_RITUAL"
  | "NOISE_ONLY"; // cosmetic / minor effect

export interface Ingredient {
  id: IngredientId;
  name: string;
  icon: string; // emoji or asset key
  domain: IngredientDomain;
  effectTags: IngredientEffectTag[];
  // Internal numeric weight. 0..1 where >0 means adds corruption,
  // <0 means reduces corruption. Never shown to players.
  corruptionValue: number;
  // For UI copy
  shortDescription: string;
  flavorLines: string[];
}

// === PLAYERS ===============================================

export interface Player {
  id: string;           // UUID from Supabase or local
  name: string;         // display name
  roleId: RoleId;
  alignment: Alignment; // derived from role, but denormalized for convenience
  alive: boolean;
  // whether this player has been cleansed by Exorcist
  cleansed?: boolean;
  // whether this player became Hollow mid-game via infection
  infected?: boolean;
  // whether this player has been marked by Purging Moon
  scorched?: boolean;
}

export type GameConfig = {
  discussionTimers: Record<string, number>
  silenceBackfireChance: number
  purgingMoonStart: number
  purgingMoonTrigger: number
  oneDeathPerRound: boolean
}

// === PHASE / ROUND STATE ===================================

export enum Phase {
  LOBBY = "LOBBY",
  NOMINATION_DISCUSSION = "NOMINATION_DISCUSSION",
  NOMINATION_VOTE = "NOMINATION_VOTE",
  NOMINATION_REVEAL = "NOMINATION_REVEAL",
  INGREDIENT_CHOICE = "INGREDIENT_CHOICE",
  RITUAL_RESOLUTION = "RITUAL_RESOLUTION",
  PERFORMER_POWER = "PERFORMER_POWER",
  COUNCIL_VOTE = "COUNCIL_VOTE",
  GAME_OVER = "GAME_OVER",
  // Legacy solo phases (kept for compatibility with prototype screens)
  CHOOSING = "CHOOSING",
  OFFERING = "OFFERING",
  REVEAL = "REVEAL",
  OUTCOME = "OUTCOME",
  COUNCIL = "COUNCIL",
  END = "END"
}

// Outcome for a ritual (what players see)
export enum OutcomeState {
  PURE = "PURE",
  TAINTED = "TAINTED",
  BACKFIRED = "BACKFIRED"
}

export interface IngredientPlay {
  playerId: string;
  ingredientId: IngredientId;
  // internal reference for debugging / analytics
  revealedOrder?: number;
}

export interface RoundOutcome {
  roundNumber: number;
  state: OutcomeState;
  dominantIngredientId: IngredientId;
  dominantDomain: IngredientDomain;
  // internal 0..1 for analytics / possible UI meter
  corruptionIndex: number;
  // performer dies from ritual backfire
  performerDies: boolean;
  // spite kill – optional secondary victim
  spiteVictimId?: string;
  // narrative notes / hooks for UI
  notes: string[];
}

// Global game config (tunable knobs)
export interface GameConfig {
  maxRounds: number;
  // thresholds 0..1
  pureThreshold: number;
  backfireThreshold: number;
  spiteChance: number;
  // Exorcist
  exorcistMinRound: number;
  // Infection system
  infectionStartRound: number;        // e.g. 1
  infectionEndRound: number;          // e.g. 3
  maxInfectedExtra: number;           // additional Hollow beyond starting count
  infectionChanceTainted: number;     // e.g. 0.15 (15%)
  infectionChanceBackfired: number;   // e.g. 0.4 (40%)
  // Purging Moon
  purgingStartRound: number;          // e.g. 4
  purgingChancePerRound: number;      // e.g. 0.25
  // numbers by player count ranges for future use
  discussionSecondsByPlayerCount: {
    "3-4": number;
    "5-6": number;
    "7-9": number;
  };
}

export interface RoundState {
  roundNumber: number;
  phase: Phase;
  performerId: string | null;
  ingredientsPlayed: IngredientPlay[];
  outcome: RoundOutcome | null;
  exorcistUsed: boolean;
}

// === FULL GAME STATE =======================================

export interface GameState {
  id: string; // room code / Supabase id
  players: Player[];
  config: GameConfig;
  round: RoundState;
  // which player is Exorcist (if present)
  exorcistPlayerId?: string;
  winnerAlignment?: Alignment; // set at END
  // infection bookkeeping
  startingHollowCount?: number;
  extraInfectionsSoFar?: number;
}

// === RITUAL RESOLUTION FUNCTION SIGNATURE ==================

export interface ResolveRitualInput {
  players: Player[];
  performerId: string;
  roundNumber: number;
  ingredientPlays: IngredientPlay[];
  config: GameConfig;
}

export interface ResolveRitualResult {
  outcome: RoundOutcome;
  // list of playerIds who die from ritual (performer + possible spite victim)
  deadPlayerIds: string[];
}

export type ResolveRitualFn = (
  input: ResolveRitualInput
) => ResolveRitualResult;
