// lib/ritual.ts

import {
  GameConfig,
  IngredientPlay,
  Player,
  ResolveRitualFn,
  ResolveRitualInput,
  ResolveRitualResult,
  RoundOutcome,
} from "./types";
import { INGREDIENTS } from "./ingredients";

// Simple clamp helper
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Compute a corruption index (0..1) from ingredient plays.
 * - Positive corruptionValue adds corruption
 * - Negative corruptionValue reduces effective corruption
 * - Values are normalized based on max possible corruption per ingredient
 */
function computeCorruptionIndex(plays: IngredientPlay[]): number {
  if (plays.length === 0) return 0;

  let totalPos = 0;
  let totalNeg = 0;

  for (const p of plays) {
    const ing = INGREDIENTS[p.ingredientId];
    const v = ing.corruptionValue;
    if (v > 0) totalPos += v;
    else totalNeg += v; // negative
  }

  // Protective ingredients cancel some corruption
  const effective = Math.max(0, totalPos + totalNeg); // totalNeg is <= 0

  // Assume max single positive ≈ 0.3 (Blood of the Innocent).
  // This keeps index in roughly 0..1 when everyone slams corruption.
  const maxPerCard = 0.3;
  const denom = plays.length * maxPerCard || 1;
  return clamp01(effective / denom);
}

/**
 * Determine dominant ingredient:
 * - highest frequency
 * - tie-breaker: higher corruptionValue
 */
function getDominantIngredientId(plays: IngredientPlay[]): IngredientPlay["ingredientId"] {
  if (plays.length === 0) {
    // Fallback: just pick something deterministic
    return "EYE_OF_NEWT";
  }

  const freq = new Map<string, { id: IngredientPlay["ingredientId"]; count: number; weight: number }>();

  for (const p of plays) {
    const ing = INGREDIENTS[p.ingredientId];
    const key = p.ingredientId;
    const existing = freq.get(key);
    if (!existing) {
      freq.set(key, { id: p.ingredientId, count: 1, weight: ing.corruptionValue });
    } else {
      existing.count += 1;
      existing.weight += ing.corruptionValue;
    }
  }

  let best = null as { id: IngredientPlay["ingredientId"]; count: number; weight: number } | null;

  for (const value of freq.values()) {
    if (!best) {
      best = value;
      continue;
    }
    if (value.count > best.count) {
      best = value;
    } else if (value.count === best.count && value.weight > best.weight) {
      best = value;
    }
  }

  return best!.id;
}

/**
 * Check whether there are any protection-domain ingredients in the ritual.
 * Used to potentially soften a BACKFIRED result to TAINTED.
 */
function hasProtectionPresent(plays: IngredientPlay[]): boolean {
  return plays.some((p) => INGREDIENTS[p.ingredientId].domain === "PROTECTION");
}

/**
 * Choose a spite victim (if any) from the participants excluding the Performer.
 */
function chooseSpiteVictim(
  plays: IngredientPlay[],
  performerId: string,
  players: Player[],
): string | undefined {
  const contributorIds = new Set(plays.map((p) => p.playerId));
  contributorIds.delete(performerId);

  const candidates = players.filter((pl) => pl.alive && contributorIds.has(pl.id));
  if (candidates.length === 0) return undefined;

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].id;
}

/**
 * Primary ritual resolution function.
 * - Computes corruption index
 * - Determines PURE / TAINTED / BACKFIRED
 * - Applies protection softening
 * - Handles optional spite death
 */
export const resolveRitual: ResolveRitualFn = ({
  players,
  performerId,
  roundNumber,
  ingredientPlays,
  config,
}: ResolveRitualInput): ResolveRitualResult => {
  const plays = ingredientPlays;
  const performer = players.find((p) => p.id === performerId);

  if (!performer) {
    throw new Error(`resolveRitual: performer ${performerId} not found`);
  }

  const corruptionIndex = computeCorruptionIndex(plays);
  const dominantIngredientId = getDominantIngredientId(plays);
  const dominant = INGREDIENTS[dominantIngredientId];

  // Base state from thresholds
  let state: RoundOutcome["state"];
  if (corruptionIndex < config.pureThreshold) {
    state = "PURE";
  } else if (corruptionIndex < config.backfireThreshold) {
    state = "TAINTED";
  } else {
    state = "BACKFIRED";
  }

  const notes: string[] = [];

  // Softening: if ritual would backfire but protection is present,
  // downgrade to TAINTED and save performer for this round.
  const protectionsPresent = hasProtectionPresent(plays);
  let performerDiesFromRitual = false;
  let spiteVictimId: string | undefined;

  if (state === "BACKFIRED") {
    if (protectionsPresent) {
      state = "TAINTED";
      notes.push("Protection ingredients softened a lethal backfire.");
      performerDiesFromRitual = false;
    } else {
      performerDiesFromRitual = true;
      notes.push("The ritual collapses inward and devours the Performer.");

      // Spite death: small chance (e.g. 15%) to kill an additional contributor
      if (Math.random() < config.spiteChance) {
        const v = chooseSpiteVictim(plays, performerId, players);
        if (v) {
          spiteVictimId = v;
          notes.push("The backlash lashes out and claims another witch.");
        }
      }
    }
  } else if (state === "PURE") {
    notes.push("The cauldron's light is clear and steady.");
  } else if (state === "TAINTED") {
    notes.push("Smoke darkens the rim—the omen twists but holds.");
  }

  // Narrative hook based on dominant domain
  switch (dominant.domain) {
    case "DIVINATION":
      notes.push("Divination dominates the ritual; truths (or lies) surface.");
      break;
    case "PROTECTION":
      notes.push("Protective magic wraps around the Circle.");
      break;
    case "CORRUPTION":
      notes.push("The Hollow's touch creeps along the edge of the cauldron.");
      break;
    case "MISDIRECTION":
      notes.push("Whispers scatter; what is seen may not be what is true.");
      break;
    case "AMPLIFICATION":
      notes.push("Power surges—the ritual's effect is amplified.");
      break;
  }

  const outcome: RoundOutcome = {
    roundNumber,
    state,
    dominantIngredientId,
    dominantDomain: dominant.domain,
    corruptionIndex,
    performerDies: performerDiesFromRitual,
    spiteVictimId,
    notes,
  };

  const deadPlayerIds: string[] = [];
  if (performerDiesFromRitual) {
    deadPlayerIds.push(performerId);
  }
  if (spiteVictimId) {
    deadPlayerIds.push(spiteVictimId);
  }

  return {
    outcome,
    deadPlayerIds,
  };
};
