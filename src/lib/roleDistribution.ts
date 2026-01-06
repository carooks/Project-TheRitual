// lib/roleDistribution.ts

import { RoleId } from "./types";

/**
 * Recommended role sets by player count.
 * This returns an ordered array of RoleIds you can then
 * shuffle and assign to joined players.
 *
 * NOTE: This assumes 3–9 players. Outside that range, we throw.
 */
export function getRolesForPlayerCount(playerCount: number): RoleId[] {
  if (playerCount < 3 || playerCount > 9) {
    throw new Error(`Unsupported player count: ${playerCount}. Expected 3–9.`);
  }

  switch (playerCount) {
    case 3:
      // 2 Coven, 1 Hollow
      return ["PROTECTION", "ORACLE", "HEX"];
    case 4:
      // 2 Coven, 2 Hollow
      return ["PROTECTION", "ORACLE", "HEX", "HARBINGER"];
    case 5:
      // 3 Coven, 2 Hollow
      return ["PROTECTION", "ORACLE", "CHRONICLER", "HEX", "HARBINGER"];
    case 6:
      // 3 Coven, 3 Hollow
      return ["PROTECTION", "ORACLE", "CHRONICLER", "HEX", "HARBINGER", "MIMIC"];
    case 7:
      // 4 Coven (incl. Exorcist), 3 Hollow
      return [
        "PROTECTION",
        "ORACLE",
        "CHRONICLER",
        "EXORCIST",
        "HEX",
        "HARBINGER",
        "MIMIC",
      ];
    case 8:
      // 5 Coven (2 Protection + Exorcist), 3 Hollow
      return [
        "PROTECTION",
        "PROTECTION",
        "ORACLE",
        "CHRONICLER",
        "EXORCIST",
        "HEX",
        "HARBINGER",
        "MIMIC",
      ];
    case 9:
      // 5 Coven, 4 Hollow
      return [
        "PROTECTION",
        "PROTECTION",
        "ORACLE",
        "CHRONICLER",
        "EXORCIST",
        "HEX",
        "HEX",
        "HARBINGER",
        "MIMIC",
      ];
    default:
      // TypeScript exhaustiveness guard
      throw new Error(`Unhandled player count: ${playerCount}`);
  }
}

/**
 * Simple utility to shuffle roles before assignment.
 */
export function shuffleRoles<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Assign roles to players by player IDs.
 * Returns a map of playerId -> RoleId.
 */
export function assignRolesToPlayers(playerIds: string[]): { [playerId: string]: RoleId } {
  const roles = shuffleRoles(getRolesForPlayerCount(playerIds.length));
  const assignment: { [id: string]: RoleId } = {};
  playerIds.forEach((id, idx) => {
    assignment[id] = roles[idx];
  });
  return assignment;
}
