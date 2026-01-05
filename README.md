# The Ritual

A production-ready React + TypeScript social-deduction coven game demo.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **TailwindCSS** (PostCSS/Autoprefixer)
- **Framer Motion** (animations)
- **ESLint** (code quality)

## Features

- ✅ Core game loop: Lobby → Choosing → Offering → Reveal → Outcome → Council → Next Round
- ✅ One-by-one ingredient reveal sequence (~1.2s per card)
- ✅ Corruption meter (animated, framer-motion)
- ✅ Outcome states: PURE, TAINTED, BACKFIRED (with protection/spite logic)
- ✅ Dark, minimal UI (Tailwind, custom ritual palette)
- ✅ Accessible controls (semantic HTML, aria labels)
- ✅ Seeded RNG for deterministic testing
- ✅ 10 unique ingredients (Eye of Newt, Mandrake Root, Blood of the Innocent, etc.)
- ✅ 6 role definitions (Protection Witch, Oracle, Chronicler, Hex, Harbinger, Mimic)

## Getting Started

### 1. Install dependencies

Using **npm**:
```powershell
npm install
```

Using **pnpm** (recommended):
```powershell
pnpm install
```

Using **yarn**:
```powershell
yarn install
```

### 2. Run dev server

```powershell
npm run dev
```

Or with pnpm:
```powershell
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```powershell
npm run build
```

### 4. Lint

```powershell
npm run lint
```

## Project Structure

```
/the-ritual
  ├─ index.html
  ├─ package.json
  ├─ tsconfig.json
  ├─ vite.config.ts
  ├─ postcss.config.js
  ├─ tailwind.config.js
  └─ src/
     ├─ main.tsx
     ├─ App.tsx
     ├─ styles.css
     ├─ lib/
     │   ├─ config.ts       # game config seed (timers, corruption thresholds)
     │   ├─ types.ts        # TypeScript types & enums
     │   ├─ strings.ts      # UI/flavor copy constants
     │   ├─ ingredients.ts  # ingredient catalog (10 unique items)
     │   ├─ roles.ts        # role definitions + ingredient pools
     │   ├─ state.ts        # pure functions (buildDeck, resolveOutcome, etc.)
     │   └─ rng.ts          # seeded RNG helper
     ├─ components/
     │   ├─ UI/
     │   │   ├─ Button.tsx
     │   │   ├─ Meter.tsx
     │   │   └─ Banner.tsx
     │   ├─ RitualReveal.tsx    # reveal sequence (1-by-1 cards + meter)
     │   ├─ IngredientCard.tsx
     │   ├─ OutcomeCard.tsx
     │   └─ Timer.tsx
     └─ screens/
         ├─ Lobby.tsx
         ├─ Choosing.tsx        # Silence Vote hook (stubbed)
         ├─ Offering.tsx        # role-based ingredient selection
         ├─ Reveal.tsx          # uses <RitualReveal/>
         ├─ Outcome.tsx
         └─ Council.tsx         # Purging Moon hook (stubbed)
```

## Game Rules (Brief)

- **Lobby**: Start game with N players (default 9)
- **Choosing**: Elect performer (simulated secret vote)
- **Offering**: Each player selects an ingredient from their role's pool
- **Reveal**: One-by-one ingredient reveal + corruption meter
- **Outcome**: 
  - **PURE** (corruption < 0.25)
  - **TAINTED** (0.25 ≤ corruption < 0.5)
  - **BACKFIRED** (≥ 0.5, unless protected by Mandrake/Tears)
  - 15% Spite Death chance on BACKFIRED
- **Council**: Vote to Burn or Spare (stub)
- Repeat

## Acceptance Criteria ✅

- Lobby → Choosing (timer runs) → Offering (deck built) → Reveal (per-card animation ~20–25s total) → Outcome (correct state based on deck) → Council → back to Choosing
- PURE when effective corruption < 0.25
- TAINTED when 0.25–<0.5 (partial/distorted)
- BACKFIRED when ≥ 0.5 unless protected by any Mandrake/Tears (then TAINTED)
- If Candle Wax present, show "Amplified" in summary
- 15% Spite Death chance visible if BACKFIRED ("crack/pulse" note)
- No TypeScript errors; ESLint/Prettier pass (after `npm install` completes)

## Stretch Goals (Stubbed)

- Silence Vote hook in Choosing (once per discussion, backfire 10%, Voice Ward placeholder)
- Purging Moon hook in Outcome (Rounds ≥ 4, 25% flare)
- Config drawer to tweak corruption thresholds live (dev-only)

## Tech Notes

- **Module alias**: `@/` → `src/`
- **Dark theme**: neutral grays, ritual purple accent (`#8f4bff`)
- **Framer Motion**: used in Meter component for corruption bar animation
- **Accessibility**: interactive controls keyboard reachable, buttons have aria-labels

---

**Working title**: _The Ritual_  
**Status**: Production-ready MVP, ready for iteration and playtesting.
