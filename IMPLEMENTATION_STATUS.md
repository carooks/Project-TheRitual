# The Ritual V2 - Implementation Status

## ✅ COMPLETED - Core Game Logic

### 1. Data Model (types.ts) ✅
- **Alignment**: `COVEN | HOLLOW`
- **RoleId**: Updated with new roles:
  - COVEN: `GUARDIAN`, `SEER`, `CHRONICLER`, `EXORCIST`
  - HOLLOW: `HOLLOW_SERVANT`, `HARBINGER`, `DECEIVER`
- **Phase**: Added `END` phase to enum
- **Player**: Now includes `isAlive`, `alignment`, `originalAlignment`
- **Domain**: `DIVINATION`, `PROTECTION`, `CORRUPTION`, `MISDIRECTION`, `AMPLIFICATION`, `SUPPRESSION`
- **EffectTag**: Ingredient effect tags for ritual resolution
- **RoundState**: Completely redesigned with:
  - `performerId` - The witch in the 13th Chair
  - `ingredientsThisRound` - Ingredient plays from all players
  - `outcome: OutcomeResult` - Full ritual result
  - `infectionLevel` - Tracks corruption spread
  - `performerVotes` & `councilVotes` - Vote tracking
- **OutcomeResult**: Rich outcome object with:
  - Dominant domain & ingredient
  - Corruption index (hidden)
  - Lethality flags (performer death, spite death)
  - Divination results
  - Narrative notes

---

### 2. Ingredient System (ingredients_v2.ts) ✅
**Domain-based ingredients with alchemical properties:**

#### Protection Domain (-15% to -8%)
- Mandrake Root, Tears of the Moon, Silver Thread
- **Effect**: Shield performer, reduce corruption

#### Divination Domain (-5% to +5%)
- Moonstone Dust, Crystal Salt, Eye of Newt, Raven Feather
- **Effect**: Reveal alignment clues

#### Suppression Domain (+8% to +14%)
- Ink of Secrets, Bone Dust, Iron Thorn
- **Effect**: Dampen outcomes, prevent extremes

#### Amplification Domain (+10% to +15%)
- Candle Wax, Serpent Scale
- **Effect**: Push outcomes to extremes (PURE or BACKFIRED)

#### Misdirection Domain (+6% to +9%)
- Whispering Moss, Mirror Glass, Fool's Gold
- **Effect**: Scramble/invert Divination results

#### Corruption Domain (+22% to +30%)
- Shadow Ash, Void Essence, Blood of the Innocent
- **Effect**: High chance of BACKFIRED, spite deaths

**Helper Functions:**
- `getDominantDomain()` - Counts ingredients, resolves ties
- `calculateCorruptionIndex()` - Normalizes corruption to 0-1 scale

---

### 3. Role System (roles_v2.ts) ✅
**New role definitions with ingredient pools:**

#### COVEN Roles:
- **GUARDIAN**: Protection ingredients (Mandrake, Tears, Silver)
- **SEER**: Divination ingredients (Eye, Crystal, Moonstone, Raven)
- **CHRONICLER**: Mixed (Raven, Bone Dust, Ink)
- **EXORCIST**: Protection/Divination mix + once-per-game cleansing ability

#### HOLLOW Roles:
- **HOLLOW_SERVANT**: Corruption ingredients (Blood, Shadow, Void) + see other HOLLOW selections
- **HARBINGER**: Amplification ingredients (Iron, Candle, Serpent) + extreme outcomes
- **DECEIVER**: Misdirection ingredients (Mirror, Fool's Gold, Moss) + scramble visions

**Role Distribution:**
- 3 players: Guardian, Hollow Servant, Seer
- 4 players: +Chronicler
- 5 players: +Harbinger
- 6 players: +Deceiver
- 7 players: 2× Guardian
- 8 players: 2× Guardian, 2× Hollow Servant
- 9 players: 2× Guardian, 2× Hollow Servant, +Exorcist

---

### 4. Ritual Resolution (ritualResolver.ts) ✅
**The alchemical heart of the game:**

#### `resolveRitual()` Function Flow:
1. Calculate corruption index (0.0 to 1.0)
2. Determine dominant domain (what happens)
3. Count special effect ingredients
4. Determine base outcome state:
   - `< 0.25` = PURE
   - `0.25-0.5` = TAINTED
   - `≥ 0.5` = BACKFIRED candidate
5. Apply Amplification (push to extremes)
6. Apply Suppression (dampen extremes)
7. Apply Protection (can prevent backfire death)
8. Calculate spite death chance (if backfired + corruption dominant)
9. Generate narrative notes
10. Resolve domain effects (Divination, etc.)

#### Domain-Specific Effects:
- **DIVINATION**: Reveals alignment (accurate if PURE, unclear if TAINTED, false if BACKFIRED)
  - Can be scrambled by Misdirection ingredients
- **PROTECTION**: Can downgrade BACKFIRED → TAINTED if enough shields present
- **CORRUPTION**: Increases spite death chance up to 50%
- **AMPLIFICATION**: 30% chance per ingredient to push TAINTED → extreme
- **SUPPRESSION**: 25% chance per ingredient to dampen PURE/BACKFIRED → TAINTED
- **MISDIRECTION**: 30% chance per ingredient to invert Divination results

#### Spite Death Mechanic:
- Base 15% chance when ritual backfires with Corruption dominant
- +35% bonus based on corruption index (max 50% total)
- Kills random living player (not the performer)
- Narrative: "The hunger spreads beyond the 13th Chair"

---

### 5. Game State Machine (gameStateMachine.ts) ✅
**Round progression and state management:**

#### GameState Structure:
```typescript
{
  players: Player[]           // All players with alive/alignment status
  currentRound: RoundState    // Active round
  history: RoundState[]       // Past rounds
  exorcistState: {            // Exorcist ability tracking
    used: boolean
    alive: boolean
    targetHistory: string[]
  }
}
```

#### Phase Progression:
```
LOBBY → CHOOSING → OFFERING → REVEAL → OUTCOME → COUNCIL → next round or END
```

#### Key Functions:

**`advancePhase()`** - State machine controller:
- CHOOSING → OFFERING: After performer selected
- OFFERING → REVEAL: After all ingredients submitted
- REVEAL → OUTCOME: Calls `resolveRitual()`, applies deaths, updates infection
- OUTCOME → COUNCIL: Only if performer survived
- COUNCIL → next round: After vote finalized

**`voteForPerformer()`** - Vote submission during CHOOSING
**`finalizePerformerSelection()`** - Count votes, set performerId

**`selectIngredient()`** - Submit ingredient during OFFERING
**`voteInCouncil()`** - Vote during COUNCIL
**`finalizeCouncilVote()`** - Count votes, eliminate player

**`checkWinConditions()`** - Returns winner or null:
- HOLLOW wins if: parity reached OR 3 backfires
- COVEN wins if: all HOLLOW dead OR 5 PURE rituals
- DRAW if: everyone dead

**`useExorcistAbility()`** - Rite of Cleansing:
- Can only be used after Round 2
- Can only be used once
- If target is HOLLOW → flip alignment to COVEN, reveal cleansing
- If target is COVEN → Exorcist dies immediately

---

## 📋 NEXT STEPS - UI Integration

### 4. Update Existing UI Components
Need to modify these files to use the new V2 system:

#### Update App.tsx:
- Import V2 types, ingredients, roles, game state machine
- Replace old state with `GameState` from V2
- Wire up `advancePhase()` instead of manual phase transitions
- Call `resolveRitual()` during REVEAL → OUTCOME transition
- Handle performer selection votes
- Handle Exorcist ability UI

#### Update Components:

**PlayerGameScreen.tsx:**
- Show ingredient pool based on role (from `getIngredientPoolForRole()`)
- During CHOOSING: Vote for performer (new phase)
- During OFFERING: Select from role's ingredient pool
- Display "13th Chair" indicator if player is performer
- Show Exorcist ability button (if role is EXORCIST, round ≥ 3, not used)

**TVDisplay.tsx:**
- CHOOSING phase: Show "Vote for the Ritual Performer"
- REVEAL phase: Show ingredients one by one
- OUTCOME phase: Display narrative notes (not numbers)
- Show dominant domain icon/description
- Show alignment reveals from Divination (if present)

**Create new RitualReveal.tsx component:**
- Animated ingredient reveal sequence
- Corruption meter visual (hidden numbers, just visual "darkness" indicator)
- Dominant domain display
- Narrative outcome text from `outcome.notes`

**GameSummary.tsx:**
- Update to show COVEN vs HOLLOW winner
- Show ritual statistics (PURE/TAINTED/BACKFIRED counts)
- Show if Exorcist ability was used

---

### 5. Supabase Schema Updates
Need to update database schema for V2:

```sql
-- Update players table
ALTER TABLE players ADD COLUMN is_alive BOOLEAN DEFAULT TRUE;
ALTER TABLE players ADD COLUMN alignment TEXT CHECK (alignment IN ('COVEN', 'HOLLOW'));
ALTER TABLE players ADD COLUMN original_alignment TEXT CHECK (original_alignment IN ('COVEN', 'HOLLOW'));

-- Update game_states table
ALTER TABLE game_states ADD COLUMN performer_id TEXT;
ALTER TABLE game_states ADD COLUMN infection_level INTEGER DEFAULT 0;
ALTER TABLE game_states ADD COLUMN exorcist_used BOOLEAN DEFAULT FALSE;
ALTER TABLE game_states ADD COLUMN exorcist_alive BOOLEAN DEFAULT TRUE;

-- Create ingredient_plays table
CREATE TABLE ingredient_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  voter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('performer', 'council')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. Testing Checklist

#### Unit Tests:
- ✅ `calculateCorruptionIndex()` with various ingredient mixes
- ✅ `getDominantDomain()` with ties
- ✅ `resolveRitual()` with all domain combinations
- ✅ Amplification/Suppression mechanics
- ✅ Spite death probability
- ✅ Divination accuracy based on outcome state
- ✅ Exorcist ability (cleanse vs death)
- ✅ Win condition detection

#### Integration Tests:
- Full round flow: CHOOSING → OFFERING → REVEAL → OUTCOME → COUNCIL
- Multi-round infection accumulation
- Role-specific ingredient pools
- Performer selection via voting
- Council elimination

#### Playtesting Scenarios:
- 3-player game (minimal)
- 5-player game (balanced)
- 9-player game (includes Exorcist)
- All-corruption ritual (should backfire)
- All-protection ritual (should be pure)
- Mixed ritual with Amplification
- Divination ritual with Misdirection
- Exorcist targets HOLLOW (success)
- Exorcist targets COVEN (death)

---

## 🎯 Current Status

**DONE:**
- ✅ Core data model completely redesigned
- ✅ Ingredient system with domains and alchemical logic
- ✅ Role system with new roles and pools
- ✅ Ritual resolution algorithm (the heart of the game)
- ✅ Game state machine with phase progression
- ✅ Win condition logic
- ✅ Exorcist ability implementation

**TODO:**
- 🔲 UI component updates to use V2 system
- 🔲 Supabase real-time sync for V2 schema
- 🔲 Ritual reveal animation component
- 🔲 Corruption meter visual (narrative, not numeric)
- 🔲 Performer voting UI
- 🔲 Exorcist ability button/modal
- 🔲 Testing and balancing

---

## 📖 How to Use the V2 System

### Example: Start a Game
```typescript
import { initializeGame } from './lib/gameStateMachine'
import { assignRandomRolesV2, getAlignmentForRole } from './lib/roles_v2'

// Create players with roles
const playerNames = ['Alice', 'Bob', 'Carol', 'Diana', 'Eve']
const roles = assignRandomRolesV2(5, 'game-seed-123')

const players: Player[] = playerNames.map((name, i) => ({
  id: `player-${i}`,
  name,
  roleId: roles[i],
  isAlive: true,
  alignment: getAlignmentForRole(roles[i]),
  originalAlignment: getAlignmentForRole(roles[i])
}))

const gameState = initializeGame(players)
```

### Example: Run a Round
```typescript
import { advancePhase, voteForPerformer, selectIngredient } from './lib/gameStateMachine'
import { INGREDIENTS_V2 } from './lib/ingredients_v2'

// Advance to CHOOSING phase
let state = advancePhase(gameState)  // LOBBY → CHOOSING

// Players vote for performer
state = voteForPerformer(state, 'player-0', 'player-2')  // Alice votes for Carol
state = voteForPerformer(state, 'player-1', 'player-2')  // Bob votes for Carol
// ... etc

state = finalizePerformerSelection(state)  // Carol is performer
state = advancePhase(state)  // CHOOSING → OFFERING

// Players select ingredients
state = selectIngredient(state, 'player-0', INGREDIENTS_V2.mandrake_root)
state = selectIngredient(state, 'player-1', INGREDIENTS_V2.blood_of_the_innocent)
// ... etc

state = advancePhase(state)  // OFFERING → REVEAL
state = advancePhase(state)  // REVEAL → OUTCOME (calls resolveRitual)

// Check outcome
console.log(state.currentRound.outcome)
// {
//   state: 'TAINTED',
//   dominantDomain: 'PROTECTION',
//   isLethal: false,
//   notes: ['The cauldron flickers...', 'The shields hold, but barely.']
// }
```

---

**The core game logic is complete and ready for UI integration.**
