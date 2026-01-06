# The Ritual - Gameplay Flow

## 🎮 How It Works

### **Setup**
1. **Host** creates game room (gets room code)
2. **Players** join via QR code or manual room code entry
3. **Players** can generate witchy names (with optional NSFW mode 🔞)
4. **Host** starts game when everyone's ready

---

## 📱 Player Experience

### **Phase 1: The Choosing** (60 seconds)
- Players see 10 ingredients on their phones
- Each player secretly selects ONE ingredient
- Timer counts down (turns red at <10 seconds)
- Can view secret role anytime (tap to reveal/hide)
- Once selected, shows "Waiting for other players..."

### **Phase 2: The Offering**
- Players see "The Ritual Begins" screen
- Told to watch the TV for outcome
- Waiting state while host progresses

### **Phase 3: The Revelation**
- Players see "The Revelation" screen
- Watch TV to see ritual results
- Host sees full ingredient reveal on TV

### **Phase 4: The Consequences**
- Players see "The Consequences" screen
- Watch TV to see outcome (Pure/Tainted/Backfired)
- Deaths and corruption revealed

### **Phase 5: The Council** (2 minutes)
- Players vote to eliminate ONE coven member
- Can discuss who to eliminate (timer shows on phones & TV)
- Tap a player's name to vote
- Once voted, shows "Vote Cast - Waiting for other players..."
- Cannot vote for yourself

### **Next Round**
- Round increments
- Back to Phase 1 with remaining players
- Timers reset

---

## 🖥️ TV Display (Host's Screen)

### **Always Shows:**
- 🔮 Current phase title with icon
- 🔢 Large room code (top right)
- 🧙 List of all coven members (numbered)
- 🎯 Current round number
- ⏱️ Timer (when active)

### **Dynamic Info:**
- Highlights current active player (if applicable)
- Shows nominated/on-trial players in red boxes
- Phase-specific instructions at bottom
- Timer pulses red when <10 seconds

### **Phase Tips on TV:**
- **Choosing**: "📱 Players: Look at your phones and select an ingredient"
- **Offering**: "🕯️ The ingredients are being offered..."
- **Reveal**: "✨ Witness the outcome of the ritual"
- **Outcome**: "💀 The ritual has concluded"
- **Council**: "⚖️ Discuss and vote on who to eliminate"

---

## 🎯 Secret Roles

Each player gets a secret role based on player count (3-9 players):
- **Protection** - Wants the ritual to succeed
- **Hex** - Wants the ritual to fail
- **Oracle** - Can see outcomes
- **Chronicler** - Records events
- **Harbinger** - Brings chaos
- **Mimic** - Copies others

Roles are **secret** - players can view on their phones but shouldn't share!

---

## ⏱️ Timers

- **Choosing Phase**: 60 seconds
- **Council Phase**: 120 seconds (2 minutes)
- **Other Phases**: No timer (host controls progression)

Timers auto-start when phase begins and show on both phones and TV.

---

## 🔮 Witchy Name Generator

- Players type their real name
- Can generate 4 witchy variations (deterministic, always same for same name)
- Optional 🔞 Spicy Mode for NSFW names
- Examples:
  - Catherine → "Catherine the Slutty"
  - John → "Big Dick John"
  - Alex → "Thicc Ass Alex mommy"
- Can also choose to keep original name
- Over 500,000 possible combinations!

---

## 🎨 Visual Style

### Colors
- **Golden**: `#d4af37` (primary accent)
- **Purple**: `#4c1d95` (backgrounds)
- **Teal**: `#14b8a6` (room codes, timers)
- **Red**: `#dc2626` (warnings, low timer, nominated)
- **Dark**: `rgba(5, 8, 20, 0.95)` (overlays)

### Effects
- Mystical background image from title screen
- Glowing text shadows on important info
- Pulsing animation on urgent timers
- Smooth transitions between states
- Gothic aesthetic throughout

---

## 📊 Current Status

### ✅ Implemented
- Witchy name generator with NSFW mode
- TV display for host
- Interactive player screens
- Phase-based timer system
- Secret role assignment
- Real-time room/player management

### 🚧 TODO (Marked in Code)
- Sync ingredient selection to Supabase
- Sync votes to Supabase
- Auto-progress phases when all players ready
- Display vote results on TV
- Elimination animation
- Sound effects (optional)
