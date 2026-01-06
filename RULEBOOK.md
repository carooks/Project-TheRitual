# The Ritual - Player Rulebook

---

## 🌒 The Magic of the Circle

The Ritual is not a puzzle to solve.  
It is a storm to survive.

Some witches are loyal to the coven.  
Some harbor the Hollow in secret.  
And sometimes, the Hollow moves.

The Circle responds to every choice the coven makes — for good or for ruin.

---

### 🕯️ Ritual Outcomes

Each round, the coven gathers ingredients.  
Their magic mixes. The cauldron reacts.

Rituals may be:

#### ✨ Pure

The magic holds steady.

- The Performer survives
- The Circle grows a little safer
- The Hollow gains nothing

#### ☠️ Tainted

The spell twists.

- Something goes wrong
- Omen is blurred, truth unreliable
- The Hollow may gain a foothold…

#### 🔥 Backfired

The ritual collapses.

- The Performer may die
- The Circle suffers
- The Hollow rejoices

Sometimes, dark magic lashes outward and claims another witch entirely.

---

### 🌑 The Hollow Spreads

In the early nights, when the rituals go wrong, the Hollow may slip from one soul into another.

It happens quietly.

**The coven is not told.**

The witch still appears to be the same role — only their allegiance changes.

**Trust becomes dangerous.**

Watch behavior, not words.

---

### 🌕 The Purging Moon

Later in the game, the Moon may rise and judge the Circle.

Silver fire sweeps across the coven.

One witch may be scorched — marked by moonfire.

**This is not always proof of guilt.**

- Sometimes the Moon burns the innocent,
- sometimes it reveals the wicked,
- sometimes it marks those the Hollow touched.

The coven must decide what the mark means.

---

### 👁️ Visions & Divinations

Some rituals reveal secrets.

But:

- the Hollow lies
- moonfire distorts truth
- cleansing leaves scars
- infection flickers

**Visions are tools — not answers.**

Interpretation is the real magic.

---

### ⚰️ Death and Silence

When a witch dies:

- their role remains hidden
- their voice leaves the Circle
- the game tightens

The coven must manage risk, fear, and accusation carefully.

**Too many wrong deaths — and the Hollow wins.**

---

---

## 🎓 First-Game Onboarding Tutorial

*This runs as a guided walkthrough the first time a group plays.*  
*Think short cards the host advances.*

---

### Card 1 — Welcome

**Welcome to The Ritual.**  
You are witches of the Circle.  
Some of you are corrupted by the Hollow — and must be exposed.

---

### Card 2 — Your Phone is Your Grimoire

**Your phone is private.**  
It shows your role, your choices, and your secrets.  
Say whatever you want aloud — truth or lie.

---

### Card 3 — Each Round

Each round, you will:

1️⃣ **Discuss**  
2️⃣ **Choose a Performer**  
3️⃣ **Cast ingredients into the cauldron**  
4️⃣ **Watch what happens**  
5️⃣ **Decide who must burn**

---

### Card 4 — Ingredients Matter

**Ingredients change the ritual.**

- Some calm.
- Some protect.
- Some invite disaster.

**Choose wisely.**

---

### Card 5 — Hidden Teams

**Some of you belong to the coven.**  
**Some belong to the Hollow.**

No one will tell you who is who.

---

### Card 6 — If You Die

**Dead witches stay silent.**  
Watch. Learn.  
Your fate still shapes the Circle.

---

### Card 7 — IMPORTANT

**The game lies to you.**

- Signs can be misleading
- Marks may be wrong
- Power can backfire

**The Ritual is about reading people — not trusting the magic.**

---

*Then the tutorial releases them into play.*

---

---

## 📖 In-App Glossary

*Tap-to-explain definitions for mobile screens.*

---

### 🔥 Backfire

The ritual collapses violently — someone may die.

---

### ☠️ Tainted

Magic twists. Results may be unreliable.

---

### ✨ Pure

The ritual holds steady. The Circle is safe… for now.

---

### 🌑 Hollow

The corruption moving inside the Circle. It wants the coven destroyed.

---

### 🌕 Scorched

Marked by moonfire. Not always guilt — but never meaningless.

---

### 🧬 Infected

Someone changed inside. They still look the same.

**(Never visible to players — dev note only.)**

---

### 👁️ Divination

Visions reveal clues, not guarantees.

---

### ⚰️ Cleansed

The Hollow was removed from them — but scars remain.

---

---

## 📺 Event Narration Cards (TV Display)

*These fire dynamically when mechanics trigger.*  
*Multiple options provided for randomization.*

---

### 🧬 Infection Events (Subtle)

**Option A:**
```
A chill moves across the Circle.
Something unseen has changed.
```

**Option B:**
```
The shadows shift — just slightly.
```

**Option C:**
```
The cauldron quiets… but the air grows colder.
```

---

### 🌕 Purging Moon Events (Dramatic)

**Option A:**
```
🌕 The Moon rises — and judges.
Silver fire scours the Circle.
```

**Option B:**
```
The sky splits with holy light.
One witch bears the Moon's mark.
```

**Option C:**
```
Moonfire falls like rain.
Something inside the Circle is revealed — but not explained.
```

---

### 👁️ Divination Results

**Clean:**
```
The vision clears. The truth is close.
```

**Unstable:**
```
Smoke invades your sight. Something resists you.
```

**Corrupted:**
```
The Hollow laughs through your vision.
```

**Scorched:**
```
Moonfire crackles in your sight — painful, blinding.
```

---

### ⚰️ Death

**Performer Death:**
```
The ritual devours its own.
```

**Spite Victim:**
```
Magic lashes out beyond the cauldron.
```

**Double Death:**
```
The Circle staggers. Two fall.
```

---

### 🎭 Council Verdict

**Burn:**
```
The Circle has spoken.
Flame takes its answer.
```

**Spared:**
```
Doubt cools. For now, they live.
```

---

---

## 🎯 Implementation Notes

### Tutorial Flow
- Display tutorial cards as modal overlays on first game
- Host advances through cards at their own pace
- "Skip Tutorial" option for experienced players
- Store completion state in localStorage

### Glossary Integration
- Add small ❓ icon next to key terms in UI
- Tap to show glossary definition in modal
- Highlight first occurrence of terms in onboarding

### Event Narration Randomization
- Store multiple variants per event type
- Randomly select on trigger
- Avoid repeating same variant consecutively
- Track which variants have been shown

### Visual Treatment
- Tutorial: Clean, centered cards with large text
- Glossary: Small modal popups, quick-read format
- Events: Full-screen cinematic overlays on TV, 3-5 second duration

---

*This rulebook provides player-facing content that teaches mechanics without spoiling mystery.*
