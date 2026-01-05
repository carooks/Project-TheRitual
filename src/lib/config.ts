import { GameConfig } from './types'

export const DEFAULT_CONFIG: GameConfig = {
  discussionTimers: {
    '6-7': 120,
    '8-9': 180,
    '10-12': 240
  },
  silenceBackfireChance: 0.1,
  purgingMoonStart: 4,
  purgingMoonTrigger: 0.25,
  oneDeathPerRound: true
}

export default DEFAULT_CONFIG
