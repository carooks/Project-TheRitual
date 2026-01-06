// lib/gameLogic.ts
import { GameState } from "./types";
import { resolveRitual } from "./ritual";

/**
 * Central function to advance from REVEAL phase to OUTCOME phase.
 * 
 * This function:
 * 1. Calls resolveRitual to compute the ritual outcome
 * 2. Updates round.outcome with the result
 * 3. Marks players who died (performer + spite victim if any)
 * 4. Transitions phase to "OUTCOME"
 * 
 * @throws Error if performer is not set or no ingredients were played
 */
export function advanceToOutcome(state: GameState): GameState {
  const { players, round, config } = state;

  if (!round.performerId) {
    throw new Error("No performer set for round");
  }

  if (round.ingredientsPlayed.length === 0) {
    throw new Error("No ingredients played this round");
  }

  // Call the ritual resolution logic
  const { outcome, deadPlayerIds } = resolveRitual({
    players,
    performerId: round.performerId,
    roundNumber: round.roundNumber,
    ingredientPlays: round.ingredientsPlayed,
    config,
  });

  // Mark dead players as no longer alive
  const updatedPlayers = players.map((p) =>
    deadPlayerIds.includes(p.id) ? { ...p, alive: false } : p
  );

  // Return updated game state
  return {
    ...state,
    players: updatedPlayers,
    round: {
      ...round,
      phase: "OUTCOME",
      outcome,
    },
  };
}

/**
 * Check if the Exorcist is allowed to use their Rite of Cleansing.
 * 
 * Returns true if:
 * - Exorcist exists and is alive
 * - Current round >= config.exorcistMinRound
 * - Rite has not already been used
 */
export function maybeOfferExorcist(state: GameState): boolean {
  const { exorcistPlayerId, round, players, config } = state;

  if (!exorcistPlayerId) return false;

  const exorcist = players.find((p) => p.id === exorcistPlayerId);
  if (!exorcist || !exorcist.alive) return false;

  if (round.roundNumber < config.exorcistMinRound) return false;

  if (round.exorcistUsed) return false;

  return true;
}

/**
 * Check win conditions after eliminations.
 * 
 * @returns "COVEN" if all Hollow players are dead/cleansed
 * @returns "HOLLOW" if Hollow players >= Coven players (among alive)
 * @returns null if game continues
 */
export function checkWinCondition(state: GameState): "COVEN" | "HOLLOW" | null {
  const { players } = state;

  const alivePlayers = players.filter((p) => p.alive);
  const aliveCoven = alivePlayers.filter((p) => p.alignment === "COVEN");
  const aliveHollow = alivePlayers.filter((p) => p.alignment === "HOLLOW");

  // Coven wins if all Hollow are eliminated
  if (aliveHollow.length === 0) {
    return "COVEN";
  }

  // Hollow wins if they equal or outnumber Coven
  if (aliveHollow.length >= aliveCoven.length) {
    return "HOLLOW";
  }

  return null;
}
