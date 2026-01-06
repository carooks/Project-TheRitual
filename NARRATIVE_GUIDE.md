# The Ritual - Narrative Guide & UI Copy

## 📖 In-App Tooltips (Player-Safe)

These should live in help overlays, tiny ❓ buttons, and onboarding snippets.  
**Intentionally vague** — no numbers, no mechanics spoilers.

---

### 🌑 "The Hollow Spreads"

> Sometimes corruption moves on its own.  
> When rituals twist, the Hollow may slip into a new soul — quietly, without warning.

---

### 🌕 "Purging Moon"

> The Moon judges.  
> When it rises, one witch may be touched by silver fire — marked, but not always condemned.

---

### ✨ "Scorched"

> Marked by moonfire.  
> Something clings to them — truth, guilt, or simple misfortune. Interpret carefully.

---

### 🧬 "Infected"

> **⚠️ Never shown to players — dev only**  
> Their heart changed. Their card did not.

---

### 👁️ "Divinations"

> Visions reveal things — but the Hollow lies, the Moon burns, and truth can warp.

---

## 👁️ Oracle / Divination Vision Rules

When the ritual result is divinatory, visions interact with player states:

### Target States & Vision Results

| Player State | Vision Shown | Interpretation |
|--------------|--------------|----------------|
| **HOLLOW** (original) | Dark/corrupted aura | Standard corruption detection |
| **INFECTED** (became Hollow later) | Flickering/unstable: *"You see two shadows overlapping."* | Doubt, not certainty |
| **CLEANSED** (Exorcist removed Hollow) | *"The hollow was here… but is gone."* | Suspicious, but not evil |
| **SCORCHED** by Purging Moon | *"Light burns around them. Something clings."* | Marked ≠ guilty, but creates suspicion |

### 🎭 Edge Cases (Emergent Moments)

**Infected + Scorched:**
> *"Moonfire burns over a writhing shadow."*

Feels very guilty — but not technically a confirmation.

**Innocent + Scorched:**
> *"Moonfire burns, but finds nothing to devour."*

Creates debate: "Moon punished them — but why?"

**Key Design Principle:** *Interpretation over certainty.*

---

## 📺 Narration Text (TV & Phones)

### 🧬 Infection Events (Never Explicit)

**TV (subtle, one line):**
- *"The cauldron cools… but the air feels wrong."*
- *"Something unseen slides between the Circle."*

**Phones (optional):**
- *"A chill brushes your thoughts… and then it's gone."*

**❗ Important:** No one is told who changed.

---

### 🌕 Purging Moon Event (Big Cinematic Moment)

**TV Header:**
```
🌕 The Purging Moon Rises
```

**TV Body:**
```
Silver fire sweeps across the Circle.
The Moon searches for the Hollow — and leaves a mark behind.
```

**Optional Hint (if revealing marking):**
```
One witch bears the scorch of judgment.
```

**Note:** Do NOT automatically highlight the player unless intentionally creating a "harder" version.

---

### 👁️ Divination Results (Reusable Lines)

**Pure Divination:**
```
The vision clears.
Truth stands unguarded.
```

**Tainted Divination:**
```
Smoke coils through the vision.
Something important is missing.
```

**Corrupted Divination:**
```
The sight twists.
The Hollow laughs through someone else's mouth.
```

---

### 💀 Backfire Narration

**Performer Dies:**
```
The ritual collapses inward.
The Performer is devoured by the magic they summoned.
```

**Spite Kill:**
```
The backlash lashes outward — another witch falls.
```

---

## 🎨 Visual & Icon Direction

### 🌑 Infection (Hidden Effect)

**Visual Treatment:**
- **No icon on UI**
- **Subtle global effects:**
  - Slight red/black vignette on TV for one beat
  - Brief rumble
  - Maybe a faint whisper sound effect

**Design Goal:** Infection should feel *felt, not seen*.

---

### 🌕 Purging Moon Icon

**Icon Design:**
- Circular sigil with:
  - Crescent moon
  - Radial lines like scorching cracks
  - Pale silver/blue glow (#cbd5f5 / #a7b7ff)

**Animation Suggestion:**
- Screen tint shifts blue-white
- Thin beam sweeps across player names
- Spark particles arc down
- Soft burn glow lingers around edge of UI for ~2s

**Important:** Avoid heavy flames — this is **holy, cold fire**, not hellfire.

---

### ✨ Scorched Players (Subtle Hint)

**If you choose to mark them visually:**
- Tiny silver ember ring around portrait
- Faint shimmering overlay
- Thin cracked texture behind nameplate

**Design Principle:** Should look **mystical, not accusatory**.
- ❌ No "skull" icons
- ❌ No red flashing danger arrows
- ✅ Ambiguous, beautiful, mysterious

---

### 👁️ Divination UI

**When Oracle sees visions:**
- Use distortion + blur
- Circular ripples
- Soft echo text
- Occasional glitch flicker if Hollow is involved

**Color Language:**

| State | Color | Vibe |
|-------|-------|------|
| **Pure** | Gold / Warm White | Clarity |
| **Tainted** | Purple / Smoke | Unstable |
| **Corrupted** | Sick Green / Deep Red | Wrongness |
| **Scorched** | Silver / Blue Fire | Judgment |

---

## 🎯 Implementation Checklist

### ✅ Tooltips
- [ ] Add tooltip component to UI
- [ ] Wire up ❓ help buttons
- [ ] Add onboarding flow with tooltips

### ✅ Vision Mechanics
- [ ] Implement vision logic in ritual resolution
- [ ] Add vision result text generation
- [ ] Handle infected/scorched states in divination

### ✅ Narration
- [ ] Add infection event narration to TV
- [ ] Add Purging Moon cinematic event
- [ ] Add divination result text to ritual reveal
- [ ] Add backfire narration variants

### ✅ Visuals
- [ ] Design Purging Moon icon/animation
- [ ] Create scorched player overlay effect
- [ ] Add divination vision distortion effects
- [ ] Add infection rumble/vignette effect

---

## 🔑 Key Design Principles

1. **Mystery > Clarity** — Never give hard confirmations
2. **Interpretation > Mechanics** — Players deduce, not calculate
3. **Narrative > Numbers** — Flavor text, not percentages
4. **Ambiguity Creates Stories** — Edge cases make memorable moments
5. **Felt, Not Seen** — Infection is atmospheric, not UI-heavy

---

*This guide provides enough direction to teach players without over-explaining, support emergent storytelling, and keep mechanical mystery intact.*
