# V2 Type System - Implementation Complete ✅

## Overview
The core type system has been refactored to use a cleaner, more streamlined approach with better naming conventions and separation of concerns.

## ✅ Completed Files

### 1. **types.ts** - Core Type Definitions
**Key Changes:**
- Used SCREAMING_SNAKE_CASE for enum-like constants
- Simplified type hierarchy
- Clear separation between player-facing and internal data

**Main Types:**
```typescript
Alignment = "COVEN" | "HOLLOW"
RoleId = "PROTECTION" | "ORACLE" | "CHRONICLER" | "EXORCIST" | "HEX" | "HARBINGER" | "MIMIC"
Phase = "LOBBY" | "CHOOSING" | "OFFERING" | "REVEAL" | "OUTCOME" | "COUNCIL" | "END"
OutcomeState = "PURE" | "TAINTED" | "BACKFIRED"

IngredientDomain = "DIVINATION" | "PROTECTION" | "CORRUPTION" | "MISDIRECTION" | "AMPLIFICATION"
IngredientEffectTag = Various effect tags for ritual resolution
```

**Game State Structure:**
```typescript
interface GameState {
  id: string
  players: Player[]
  config: GameConfig
  round: RoundState
  exorcistPlayerId?: string
  winnerAlignment?: Alignment
}
```

**Ritual Resolution:**
```typescript
interface ResolveRitualInput {
  players: Player[]
  performerId: string
  roundNumber: number
  ingredientPlays: IngredientPlay[]
  config: GameConfig
}

interface ResolveRitualResult {
  outcome: RoundOutcome
  deadPlayerIds: string[]
}
```

---

### 2. **ingredients.ts** - 10 Core Ingredients
All ingredients now defined with:
- Domain classification
- Effect tags (multiple per ingredient)
- Corruption values (-0.15 to 0.3)
- Short descriptions + flavor lines

**Ingredient Breakdown by Domain:**

**PROTECTION** (negative corruption):
- MANDRAKE_ROOT (-0.15)
- TEARS_OF_THE_MOON (-0.10)

**DIVINATION** (low positive corruption):
- EYE_OF_NEWT (+0.05)
- BONE_DUST (+0.12)
- SILVER_THREAD (+0.04)

**AMPLIFICATION** (moderate corruption):
- CANDLE_WAX (+0.06)

**MISDIRECTION** (moderate corruption):
- RAVEN_FEATHER (+0.08)

**CORRUPTION** (high corruption):
- IRON_THORN (+0.14)
- SHADOW_ASH (+0.18)
- BLOOD_OF_THE_INNOCENT (+0.30)

---

### 3. **roles.ts** - 7 Roles with Ingredient Pools

**COVEN Roles (4):**
1. **PROTECTION** (min 3 players)
   - Core: Mandrake Root, Tears of the Moon, Candle Wax
   - Occasional: Silver Thread

2. **ORACLE** (min 3 players)
   - Core: Eye of Newt, Bone Dust, Silver Thread
   - Occasional: Raven Feather

3. **CHRONICLER** (min 4 players)
   - Core: Raven Feather, Bone Dust, Silver Thread
   - Occasional: Candle Wax

4. **EXORCIST** (min 7 players)
   - Core: Mandrake Root, Tears of the Moon, Eye of Newt
   - Occasional: Bone Dust
   - Special: Once-per-game Rite of Cleansing

**HOLLOW Roles (3):**
1. **HEX** (min 3 players)
   - Core: Blood of the Innocent, Shadow Ash, Bone Dust
   - Occasional: Raven Feather, Iron Thorn

2. **HARBINGER** (min 4 players)
   - Core: Candle Wax, Shadow Ash, Iron Thorn
   - Occasional: Blood of the Innocent

3. **MIMIC** (min 6 players)
   - Core: Mandrake Root, Tears of the Moon, Silver Thread (LOOKS pure)
   - Occasional: Raven Feather

---

## Role Distribution by Player Count

| Players | Roles |
|---------|-------|
| 3 | Protection, Hex, Oracle |
| 4 | +Chronicler |
| 5 | +Harbinger |
| 6 | +Mimic |
| 7 | 2× Protection |
| 8 | 2× Protection, 2× Hex |
| 9 | 2× Protection, 2× Hex, +Exorcist |

---

## Key Functions Implemented

### `getIngredientPoolForRole(roleId: RoleId)`
Returns the ingredient pool definition for a role.

### `drawRandomIngredientForRole(roleId: RoleId)`
Randomly selects an ingredient from a role's pool:
- 80% chance: core pool
- 20% chance: occasional pool (if defined)

### `assignRandomRoles(playerCount: number, seed: string)`
Uses Fisher-Yates shuffle with deterministic seeding to assign roles.

---

## Next Steps

### ✅ Already Complete:
- Core type system
- Ingredient definitions with domains
- Role definitions with pools
- Role distribution logic

### 🔲 Still TODO:
1. **Implement `resolveRitual()` function**
   - Use the new type signatures
   - Implement domain-based logic
   - Calculate corruption thresholds
   - Generate narrative notes

2. **Update game state machine**
   - Use new GameState structure
   - Implement phase transitions
   - Handle performer voting
   - Integrate ritual resolution

3. **Update UI components**
   - Use new ingredient IDs (SCREAMING_SNAKE_CASE)
   - Display domains and effect tags
   - Show flavor lines in UI
   - Update role displays

4. **Exorcist ability implementation**
   - Track exorcistPlayerId in GameState
   - Implement cleansing logic
   - Add UI for ability activation

5. **Supabase schema updates**
   - Update column names to match new types
   - Add ingredient_plays table
   - Add config storage

---

## Design Philosophy

This refined implementation follows these principles:

**1. Player-facing vs Internal**
- Players see: Domains, flavor text, narrative outcomes
- Players don't see: Corruption values, exact thresholds

**2. Scalable Complexity**
- Core/occasional pools allow future expansion
- Effect tags enable complex interactions
- Config object makes tuning easy

**3. Type Safety**
- Strict typing for all game entities
- Clear interfaces for function signatures
- Compile-time checks prevent bugs

**4. Narrative Focus**
- Flavor lines instead of mechanics text
- Domain names are thematic
- Outcome states are narrative (PURE/TAINTED/BACKFIRED)

---

## File Status

| File | Status | Notes |
|------|--------|-------|
| types.ts | ✅ Complete | Clean type definitions |
| ingredients.ts | ✅ Complete | All 10 ingredients with flavor |
| roles.ts | ✅ Complete | All 7 roles with pools |
| ritualResolver.ts | ⚠️ Needs update | Use new type signatures |
| gameStateMachine.ts | ⚠️ Needs update | Use new GameState structure |
| App.tsx | ⚠️ Needs update | Use new types |
| Components | ⚠️ Needs update | Use new ingredient IDs |

---

**The foundation is solid. Ready to implement the ritual resolution logic with the new clean type system.**
