# The Ritual - Complete Gameplay Summary

## 🎮 Game Overview

**The Ritual** is a multiplayer social deduction game (3-9 players) where players are witches in a coven performing magical rituals. Some witches are **corrupted** and want the rituals to fail while killing innocent members. Loyal witches must identify and eliminate the corrupted before it's too late.

**Platform**: Web-based (Vite + React + TypeScript + Supabase)
**Display**: Host's screen on TV/projector, players use phones
**Duration**: 15-30 minutes per game

---

## 👥 Setup

1. **Host** creates game room → gets 6-character room code
2. **Players** join via:
   - QR code scan (displayed on TV)
   - Manual room code entry
3. **Players** enter name → optional **Witchy Name Generator**:
   - Generates 4 mystical name variations based on input
   - Optional 🔞 **Spicy Mode** for NSFW names
   - Examples: "Catherine the Slutty", "Big Dick John", "Thicc Ass mommy"
   - 500,000+ possible combinations
4. **Host** starts game when all ready
5. **Secret roles** randomly assigned based on player count

---

## 🎭 Roles & Teams

### **Role Distribution by Player Count:**
- **3 players**: 1 Protection, 1 Hex, 1 Oracle
- **4 players**: 1 Protection, 1 Hex, 1 Oracle, 1 Chronicler
- **5 players**: +1 Harbinger
- **6 players**: +1 Mimic
- **7 players**: 2 Protection, 1 Hex, others
- **8 players**: 2 Protection, 2 Hex, others
- **9 players**: 2 Protection, 2 Hex, 2 Chronicler, others

### **Teams:**

#### **🛡️ Coven Team (Good)**
- **Protection Witch**: Loyal to coven, uses pure ingredients to keep rituals successful
- **Goal**: Keep rituals pure, eliminate corrupted witches

#### **🔴 Corrupted Team (Evil)**
- **Hex Witch**: Sabotages rituals and eliminates innocents
- **Special Ability**: Can see other Hex Witches' ingredient selections
- **Coordination**: High corruption ingredients (>15%) = kill vote signal
- **Goal**: Sabotage rituals and eliminate enough coven members to gain majority

#### **⚖️ Neutral Team**
- **Oracle Witch**: Seeks truth and balance
- **Chronicler Witch**: Records events, stays neutral
- **Harbinger Witch**: Brings chaos
- **Mimic Witch**: Adapts to situations
- **Goal**: Varies by role, generally survive

---

## 🎯 Gameplay Flow

### **Phase 1: The Choosing** ⏱️ *60 seconds*

**Players (on phones):**
- View 10 ingredients with icons and flavor text
- Each ingredient has hidden **corruption value**:
  - **Mandrake Root** (-15%): Pure, protective
  - **Tears of the Moon** (-10%): Soothing
  - **Eye of Newt** (+5%): Neutral
  - **Candle Wax** (+6%): Slight amplification
  - **Raven Feather** (+8%): Whispers
  - **Bone Dust** (+12%): Dark echoes
  - **Iron Thorn** (+14%): Stubborn
  - **Shadow Ash** (+18%): Darkening
  - **Blood of the Innocent** (+30%): Extremely corrupting
- **Select ONE ingredient** secretly
- Timer counts down (turns red at <10 seconds)

**Corrupted Witches Only:**
After selecting, see **🔴 Corrupted Witch Network** panel showing:
- What other Hex Witches selected
- Corruption values
- Kill signals:
  - **🗡️ KILL** = High corruption ingredient (>15%)
  - **💀 Save** = Low corruption ingredient (<15%)
- Use this to coordinate whether to kill nominated player during council

**Host (TV Display):**
- Shows all player names
- 60-second countdown timer
- Instructions: "📱 Players: Look at your phones and select an ingredient"

---

### **Phase 2: The Offering** ⏱️ *No timer*

**Players (on phones):**
- "The Ritual Begins" screen
- Told to watch TV

**Host (TV Display):**
- Shows "🕯️ The Offering" title
- Ingredients being offered animation (future implementation)
- Host manually advances when ready

---

### **Phase 3: The Revelation** ⏱️ *No timer*

**Players (on phones):**
- "✨ The Revelation" screen
- Watch TV for results

**Host (TV Display):**
- Reveals all selected ingredients one by one
- Shows total corruption percentage
- Displays ritual outcome

---

### **Phase 4: The Consequences** ⏱️ *No timer*

**Players (on phones):**
- "💀 The Consequences" screen
- Watch TV

**Host (TV Display):**
Shows ritual outcome:
- **PURE** (low corruption): Ritual succeeds, no deaths
- **TAINTED** (medium corruption): Partial success, possible death
- **BACKFIRED** (high corruption): Ritual fails, deaths occur

---

### **Phase 5: The Council** ⏱️ *120 seconds*

**Players (on phones):**
- List of all other players
- **Vote to eliminate ONE player**
- Cannot vote for themselves
- Shows "✓ Vote Cast" after voting
- **2-minute timer** for discussion

**Corrupted Witches Strategy:**
- If majority voted KILL (high corruption ingredients), push to eliminate innocent
- If majority voted SAVE (low corruption ingredients), deflect suspicion

**Host (TV Display):**
- Shows 2-minute countdown
- Vote results after all vote (future: show who's nominated in red)
- Player with most votes is **eliminated**

---

### **Next Round**
- Round counter increments
- Eliminated players cannot participate
- Back to **Phase 1: The Choosing**
- Selections reset, timer restarts

---

## 🏆 Win Conditions

### **Coven Team Wins:**
- Eliminate **ALL corrupted witches**

### **Corrupted Team Wins:**
- Equal or outnumber loyal witches
- OR sabotage enough rituals to doom the coven (future implementation)

---

## 🔮 Secret Role Information

**Players can view their role anytime:**
- Tap "👁️ View Secret Role" button on phone
- Shows role name and description
- **Hex Witches** see coordination instructions
- Role stays hidden from other players (except fellow Hex Witches through ingredient signals)

---

## 📊 Ingredient Corruption Values

| Ingredient | Icon | Corruption | Effect |
|------------|------|------------|--------|
| Mandrake Root | 🌱 | -15% | Pure protection |
| Tears of the Moon | 🌙 | -10% | Soothing |
| Silver Thread | 🧵 | +4% | Binding |
| Eye of Newt | 👁️ | +5% | Glimpse hidden |
| Candle Wax | 🕯️ | +6% | Amplifies |
| Raven Feather | 🪶 | +8% | Whispers |
| Bone Dust | 💀 | +12% | Death echoes |
| Iron Thorn | 🗡️ | +14% | Stubborn |
| Shadow Ash | 🌫️ | +18% | Darkening |
| Blood of the Innocent | 🩸 | +30% | Extreme corruption |

**Corrupted Witch Kill Signals:**
- **Blood of Innocent, Shadow Ash, Iron Thorn** = KILL vote (>15%)
- **All others** = SAVE vote

---

## 🖥️ TV Display Features

**Always Visible:**
- Current phase with mystical title
- Room code (large, glowing)
- All player names (numbered list)
- Current round number
- Phase instructions

**Dynamic:**
- Countdown timer (Choosing: 60s, Council: 120s)
- Timer turns red and pulses at <10 seconds
- Nominated players highlighted in red (future)
- Current active player highlighted (future)

---

## 📱 Mobile Player Screen Features

**Always Visible:**
- Player's witchy name
- Current round
- Timer (when active)
- "View Secret Role" button

**Phase-Specific:**
- **Choosing**: Grid of 10 ingredient cards
- **Council**: List of players to vote on
- **Other phases**: "Watch TV" screens

**Corrupted Witches Only:**
- 🔴 **Corrupted Witch Network** panel during Choosing phase
- Shows other Hex Witches' selections with kill/save indicators
- Only visible after selecting own ingredient

---

## 🎨 Visual Style

**Color Palette:**
- **Golden**: `#d4af37` (primary accent, mystical)
- **Purple**: `#4c1d95` (backgrounds, magic)
- **Teal**: `#14b8a6` (timers, room codes)
- **Red**: `#dc2626` (corrupted, warnings, urgency)
- **Dark**: `rgba(5, 8, 20, 0.95)` (overlays)

**Effects:**
- Mystical title screen background
- Glowing text shadows
- Pulse animations on urgent timers
- Smooth phase transitions
- Gothic/witchy aesthetic

---

## 🎯 Strategy Tips

### **For Loyal Witches:**
- Choose **low/negative corruption ingredients** to keep rituals pure
- Watch for players who consistently select high corruption items
- During Council, discuss ingredient choices
- Look for voting patterns

### **For Corrupted Witches:**
- **Coordinate kills** through ingredient selection:
  - High corruption = signal you want to kill
  - Low corruption = signal you want to save
- **Blend in** early game, sabotage later
- **Deflect suspicion** during Council
- **Protect fellow Hex Witches** in votes
- **Time sabotage** carefully - too obvious = caught

### **For All Players:**
- **Bluff** about your role (except Hex Witches know each other secretly)
- **Track patterns** in ingredient selection
- **Build alliances** during discussion
- **Remember**: Neutrals can swing either way

---

## 🚀 Technical Implementation

**Current State:**
- ✅ Witchy name generator (with NSFW mode)
- ✅ TV display for host
- ✅ Interactive player screens
- ✅ Phase-based timer system (60s choosing, 120s council)
- ✅ Secret role assignment (player-count-based)
- ✅ Corrupted witch coordination view
- ✅ Real-time room/player management via Supabase

**TODO (Marked in code):**
- Sync ingredient selection to Supabase
- Sync votes to Supabase
- Auto-progress phases when all players ready
- Display vote results on TV
- Show nominated player on TV during Council
- Elimination animation
- Ritual outcome calculation
- Sound effects (optional)
- Role-specific special abilities (future)

---

## 📝 Game Balance Notes

**Player Count Sweet Spots:**
- **3-4 players**: Quick games, simple deduction
- **5-6 players**: Balanced, optimal experience
- **7-9 players**: Complex, longer games, more chaos

**Corruption Threshold Recommendations:**
- **PURE**: <20% total corruption
- **TAINTED**: 20-50% corruption
- **BACKFIRED**: >50% corruption

**Timer Balance:**
- 60s for ingredient selection = forces quick decisions
- 120s for council = allows discussion but keeps pace

---

## 🎭 Example Game Flow (5 Players)

**Roles Assigned:**
- Alice = Protection Witch (coven)
- Bob = Hex Witch (corrupted)
- Carol = Oracle Witch (neutral)
- Diana = Chronicler Witch (neutral)
- Eve = Harbinger Witch (neutral)

**Round 1 - Choosing:**
- Alice selects Mandrake Root (-15%)
- Bob selects Blood of Innocent (+30%) → signals KILL
- Carol selects Eye of Newt (+5%)
- Diana selects Silver Thread (+4%)
- Eve selects Shadow Ash (+18%)

**Bob sees:** No other Hex Witches (he's alone), so his kill vote doesn't matter yet

**Offering → Revelation:**
Total corruption: -15 + 30 + 5 + 4 + 18 = **+42%** = **TAINTED**

**Council:**
- Players discuss who chose corrupting ingredients
- Bob deflects, suggests Eve (who chose Shadow Ash)
- Vote: Eve eliminated (she was neutral Harbinger)

**Round 2:**
- Now 4 players: Alice, Bob, Carol, Diana
- Bob continues sabotaging
- Eventually Alice or another player identifies Bob's pattern
- If Bob eliminated → Coven wins
- If Bob survives until 2v2 → Corrupted wins

---

This document describes the complete game as currently implemented, with notes on future features still in development.
