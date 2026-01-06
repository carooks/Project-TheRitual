// lib/endOfRound.ts
import { GameState } from "./types";
import { applyInfection } from "./infection";
import { applyPurgingMoon } from "./purgingMoon";

export interface EndOfRoundResult {
  nextState: GameState;
  infection?: { infectedPlayerId: string };
  purging?: { scorchedPlayerId: string };
}

/**
 * Apply all end-of-round effects in sequence:
 * 1. Infection (Rounds 1-3): May flip a Coven witch to Hollow
 * 2. Purging Moon (Rounds 4+): May mark a Hollow player as scorched
 * 
 * Call this after Council and Exorcist resolution, but before
 * incrementing to the next round.
 * 
 * Returns information about what happened for TV event display:
 * - infection: subtle line like "The air tastes wrong. Something has changed."
 * - purging: big cinematic event like "Silver fire rakes across the Circle."
 */
export function applyEndOfRoundEffects(state: GameState): EndOfRoundResult {
  let s = state;
  const info: EndOfRoundResult = { nextState: state };

  // Infection first (Rounds 1–3)
  const infectionResult = applyInfection(s);
  s = infectionResult.nextState;
  if (infectionResult.infectedPlayerId) {
    info.infection = { infectedPlayerId: infectionResult.infectedPlayerId };
  }

  // Purging Moon (Rounds 4+)
  const purgingResult = applyPurgingMoon(s);
  s = purgingResult.nextState;
  if (purgingResult.triggered && purgingResult.scorchedPlayerId) {
    info.purging = { scorchedPlayerId: purgingResult.scorchedPlayerId };
  }

  info.nextState = s;
  return info;
}
