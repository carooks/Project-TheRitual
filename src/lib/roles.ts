// lib/roles.ts
import { Alignment, IngredientId, RoleDefinition, RoleId } from "./types";

export const ROLES: Record<RoleId, RoleDefinition> = {
  PROTECTION: {
    id: "PROTECTION",
    name: "Protection Witch",
    alignment: "COVEN",
    shortDescription:
      "Calms volatile magic and shields the Performer from lethal backfires.",
    minPlayers: 3,
    image: "/assets/roles/Protection Witch.png",
  },
  ORACLE: {
    id: "ORACLE",
    name: "Oracle Witch",
    alignment: "COVEN",
    shortDescription:
      "Bends rituals toward divination, revealing glimpses of hidden loyalties.",
    minPlayers: 3,
    image: "/assets/roles/Oracle Witch.png",
  },
  CHRONICLER: {
    id: "CHRONICLER",
    name: "Chronicler Witch",
    alignment: "COVEN",
    shortDescription:
      "Anchors ritual memory, making misdirection harder over time.",
    minPlayers: 4,
    image: "/assets/roles/Chronicler Witch.png",
  },
  EXORCIST: {
    id: "EXORCIST",
    name: "Exorcist",
    alignment: "COVEN",
    shortDescription:
      "Can attempt a one-time Rite of Cleansing to purge the Hollow—or die trying.",
    minPlayers: 7,
    image: "/assets/roles/Exorcist Witch.jpeg",
  },
  HEX: {
    id: "HEX",
    name: "Hex Witch",
    alignment: "HOLLOW",
    shortDescription:
      "Feeds corruption into the cauldron and twists what the Circle sees.",
    minPlayers: 3,
    image: "/assets/roles/Hex Witch.png",
  },
  HARBINGER: {
    id: "HARBINGER",
    name: "Harbinger Witch",
    alignment: "HOLLOW",
    shortDescription:
      "Accelerates chaos, amplifying whatever shape the ritual takes.",
    minPlayers: 4,
    image: "/assets/roles/Harbinger Witch.png",
  },
  MIMIC: {
    id: "MIMIC",
    name: "Mimic Witch",
    alignment: "HOLLOW",
    shortDescription:
      "Copies the signatures of pure magic while quietly poisoning them.",
    minPlayers: 6,
    image: "/assets/roles/Mimic Witch.png",
  },
};

export const ROLE_IDS = Object.keys(ROLES) as RoleId[];

// Ingredient pools per role (for now: simple arrays)
// Later you can expand this to weighted pools or per-round hands.
export interface RoleIngredientPool {
  roleId: RoleId;
  core: IngredientId[];     // main draw pool
  occasional?: IngredientId[]; // rare/tech ingredients
}

export const ROLE_INGREDIENT_POOLS: RoleIngredientPool[] = [
  {
    roleId: "PROTECTION",
    core: ["MANDRAKE_ROOT", "TEARS_OF_THE_MOON", "CANDLE_WAX"],
    occasional: ["SILVER_THREAD"],
  },
  {
    roleId: "ORACLE",
    core: ["EYE_OF_NEWT", "BONE_DUST", "SILVER_THREAD"],
    occasional: ["RAVEN_FEATHER"],
  },
  {
    roleId: "CHRONICLER",
    core: ["RAVEN_FEATHER", "BONE_DUST", "SILVER_THREAD"],
    occasional: ["CANDLE_WAX"],
  },
  {
    roleId: "EXORCIST",
    // Exorcist should lean slightly protective/divinatory but not too pure.
    core: ["MANDRAKE_ROOT", "TEARS_OF_THE_MOON", "EYE_OF_NEWT"],
    occasional: ["BONE_DUST"],
  },
  {
    roleId: "HEX",
    core: ["BLOOD_OF_THE_INNOCENT", "SHADOW_ASH", "BONE_DUST"],
    occasional: ["RAVEN_FEATHER", "IRON_THORN"],
  },
  {
    roleId: "HARBINGER",
    core: ["CANDLE_WAX", "SHADOW_ASH", "IRON_THORN"],
    occasional: ["BLOOD_OF_THE_INNOCENT"],
  },
  {
    roleId: "MIMIC",
    // Important: these LOOK like good ingredients to the table,
    // but you can treat them as slightly more corrupt internally if you want.
    core: ["MANDRAKE_ROOT", "TEARS_OF_THE_MOON", "SILVER_THREAD"],
    occasional: ["RAVEN_FEATHER"],
  },
];

// Helper to look up a pool by role
export function getIngredientPoolForRole(roleId: RoleId): RoleIngredientPool {
  const pool = ROLE_INGREDIENT_POOLS.find((p) => p.roleId === roleId);
  if (!pool) {
    throw new Error(`No ingredient pool defined for role ${roleId}`);
  }
  return pool;
}

/**
 * Draw a random ingredient for a role from their pool
 */
export function drawRandomIngredientForRole(roleId: RoleId): IngredientId {
  const pool = getIngredientPoolForRole(roleId);
  const source =
    pool.occasional && Math.random() < 0.2
      ? pool.occasional
      : pool.core;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Role distribution based on player count
 */
export const ROLE_DISTRIBUTION: Record<number, RoleId[]> = {
  3: ["PROTECTION", "HEX", "ORACLE"],
  4: ["PROTECTION", "HEX", "ORACLE", "CHRONICLER"],
  5: ["PROTECTION", "HEX", "ORACLE", "CHRONICLER", "HARBINGER"],
  6: ["PROTECTION", "HEX", "ORACLE", "CHRONICLER", "HARBINGER", "MIMIC"],
  7: ["PROTECTION", "PROTECTION", "HEX", "ORACLE", "CHRONICLER", "HARBINGER", "MIMIC"],
  8: ["PROTECTION", "PROTECTION", "HEX", "HEX", "ORACLE", "CHRONICLER", "HARBINGER", "MIMIC"],
  9: ["PROTECTION", "PROTECTION", "HEX", "HEX", "ORACLE", "EXORCIST", "CHRONICLER", "HARBINGER", "MIMIC"],
};

/**
 * Assign random secret roles to players based on player count
 */
export function assignRandomRoles(playerCount: number, seed: string): RoleId[] {
  const distribution = ROLE_DISTRIBUTION[playerCount];
  if (!distribution) {
    throw new Error(`No role distribution for ${playerCount} players`);
  }
  
  return shuffleArray([...distribution], seed);
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleArray<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}
