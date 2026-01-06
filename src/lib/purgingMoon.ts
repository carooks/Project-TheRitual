// lib/purgingMoon.ts
import { GameState } from "./types";

export interface PurgingResult {
  nextState: GameState;
  triggered: boolean;
  scorchedPlayerId?: string;
}

/**
 * Possibly trigger the Purging Moon:
 * - Only from purgingStartRound onwards (e.g., Round 4+)
 * - Chance per round as per config
 * - Picks a Hollow-aligned player (prefers infected) and marks scorched = true
 * 
 * The Purging Moon is a late-game event that spotlights one corrupted witch.
 * It gives partial information without hard-confirming "this person is evil."
 * 
 * Creates a big atmospheric moment and helps balance late-game Hollow advantage.
 */
export function applyPurgingMoon(state: GameState): PurgingResult {
  const { config, round, players } = state;
  const { roundNumber } = round;

  if (roundNumber < config.purgingStartRound) {
    return { nextState: state, triggered: false };
  }

  if (Math.random() > config.purgingChancePerRound) {
    return { nextState: state, triggered: false };
  }

  // Prefer infected Hollow players first
  const infectedHollow = players.filter(
    (p) => p.alive && p.alignment === "HOLLOW" && p.infected
  );
  const plainHollow = players.filter(
    (p) => p.alive && p.alignment === "HOLLOW" && !p.infected
  );

  const candidates =
    infectedHollow.length > 0 ? infectedHollow : plainHollow;

  if (candidates.length === 0) {
    // No Hollow to mark
    return { nextState: state, triggered: false };
  }

  const idx = Math.floor(Math.random() * candidates.length);
  const chosen = candidates[idx];

  const updatedPlayers = players.map((p) =>
    p.id === chosen.id
      ? {
          ...p,
          scorched: true,
        }
      : p
  );

  return {
    nextState: {
      ...state,
      players: updatedPlayers,
    },
    triggered: true,
    scorchedPlayerId: chosen.id,
  };
}
