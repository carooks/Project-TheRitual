// lib/exorcist.ts
import { GameState, Alignment } from "./types";

export interface ExorcistRiteResult {
  nextState: GameState;
  success: boolean; // true = target was corrupted and cleansed
  targetId: string;
  exorcistDied: boolean; // true if Exorcist died from failed rite
}

/**
 * Apply the Exorcist's Rite of Cleansing.
 * 
 * Rules:
 * - Can only be used once per game
 * - Must be after Round 2 (config.exorcistMinRound)
 * - If target is HOLLOW → cleansed and flipped to COVEN
 * - If target is NOT HOLLOW → Exorcist dies immediately
 * 
 * @throws Error if conditions are not met (no Exorcist, already used, too early, etc.)
 */
export function applyExorcistRite(
  state: GameState,
  targetPlayerId: string
): ExorcistRiteResult {
  const { players, exorcistPlayerId, round, config } = state;

  if (!exorcistPlayerId) {
    throw new Error("No Exorcist in this game.");
  }

  const exorcist = players.find((p) => p.id === exorcistPlayerId);
  if (!exorcist || !exorcist.alive) {
    throw new Error("Exorcist is not alive.");
  }

  if (round.roundNumber < config.exorcistMinRound) {
    throw new Error("Exorcist cannot act before the minimum round.");
  }

  if (round.exorcistUsed) {
    throw new Error("Exorcist has already used their Rite.");
  }

  const target = players.find((p) => p.id === targetPlayerId);
  if (!target) {
    throw new Error("Target not found.");
  }

  if (!target.alive) {
    throw new Error("Cannot target a dead player.");
  }

  // Success: target is HOLLOW → cleanse and flip to Coven
  if (target.alignment === "HOLLOW") {
    const updatedPlayers = players.map((p) =>
      p.id === targetPlayerId
        ? {
            ...p,
            alignment: "COVEN" as Alignment,
            cleansed: true,
          }
        : p
    );

    return {
      nextState: {
        ...state,
        players: updatedPlayers,
        round: {
          ...round,
          exorcistUsed: true,
        },
      },
      success: true,
      targetId: targetPlayerId,
      exorcistDied: false,
    };
  }

  // Failure: target is not corrupted → Exorcist dies immediately
  const updatedPlayers = players.map((p) =>
    p.id === exorcistPlayerId ? { ...p, alive: false } : p
  );

  return {
    nextState: {
      ...state,
      players: updatedPlayers,
      round: {
        ...round,
        exorcistUsed: true,
      },
    },
    success: false,
    targetId: targetPlayerId,
    exorcistDied: true,
  };
}
