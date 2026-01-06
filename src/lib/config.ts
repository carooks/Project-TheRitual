import { GameConfig } from './types'

export const DEFAULT_CONFIG: GameConfig = {
  maxRounds: 10,
  
  // Ritual outcome thresholds (0..1)
  pureThreshold: 0.2,      // Below this = PURE
  backfireThreshold: 0.5,  // Above this = BACKFIRED
  spiteChance: 0.15,       // 15% chance of spite kill on BACKFIRED
  
  // Exorcist
  exorcistMinRound: 3,     // Can use Rite of Cleansing from Round 3 onwards
  
  // Infection system (Rounds 1-3)
  infectionStartRound: 1,
  infectionEndRound: 3,
  maxInfectedExtra: 2,            // Max 2 additional Hollow beyond starting count
  infectionChanceTainted: 0.15,   // 15% chance on TAINTED ritual
  infectionChanceBackfired: 0.4,  // 40% chance on BACKFIRED ritual
  
  // Purging Moon (Rounds 4+)
  purgingStartRound: 4,
  purgingChancePerRound: 0.25,    // 25% chance per round after Round 4
  
  // Discussion timers by player count
  discussionSecondsByPlayerCount: {
    '3-4': 120,   // 2 minutes
    '5-6': 180,   // 3 minutes
    '7-9': 240,   // 4 minutes
  },
}

export default DEFAULT_CONFIG
