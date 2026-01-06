// lib/infection.ts
import { GameState } from "./types";

export interface InfectionResult {
  nextState: GameState;
  infectedPlayerId?: string;
}

/**
 * Try to infect one new Coven-aligned player, if:
 * - roundNumber is within infection window (e.g., Rounds 1–3)
 * - outcome was TAINTED or BACKFIRED
 * - we have not hit maxExtra infections
 * 
 * Infection secretly flips a Coven witch to Hollow alignment.
 * They keep their role card but now win with Hollow.
 * They are marked internally as infected: true.
 * 
 * This creates a creeping sense of doom as the Hollow spreads.
 */
export function applyInfection(state: GameState): InfectionResult {
  const { config, round, players, extraInfectionsSoFar = 0 } = state;
  const { roundNumber, outcome } = round;

  if (!outcome) return { nextState: state };

  // Check round window
  if (
    roundNumber < config.infectionStartRound ||
    roundNumber > config.infectionEndRound
  ) {
    return { nextState: state };
  }

  // Only TAINTED or BACKFIRED can infect
  if (outcome.state === "PURE") return { nextState: state };

  // Cap check
  const maxExtra = config.maxInfectedExtra;
  if (extraInfectionsSoFar >= maxExtra) return { nextState: state };

  // Determine chance based on state
  const rollChance =
    outcome.state === "BACKFIRED"
      ? config.infectionChanceBackfired
      : config.infectionChanceTainted;

  if (Math.random() > rollChance) {
    // No infection this round
    return { nextState: state };
  }

  // Candidate pool: alive Coven who are not already infected/cleansed
  const candidates = players.filter(
    (p) =>
      p.alive &&
      p.alignment === "COVEN" &&
      !p.infected &&
      !p.cleansed
  );

  if (candidates.length === 0) return { nextState: state };

  const idx = Math.floor(Math.random() * candidates.length);
  const chosen = candidates[idx];

  const updatedPlayers = players.map((p) =>
    p.id === chosen.id
      ? {
          ...p,
          alignment: "HOLLOW",
          infected: true,
        }
      : p
  );

  return {
    nextState: {
      ...state,
      players: updatedPlayers,
      extraInfectionsSoFar: extraInfectionsSoFar + 1,
    },
    infectedPlayerId: chosen.id,
  };
}
