# GreenPath AI 🌱

An interactive, AI-driven personal climate companion that turns carbon footprint audits into an engaging, gamified diorama experience. Designed for a 3-5 minute live hackathon demonstration, the platform enables users to visual-level their carbon garden from a small sprout (Level 0) to a thriving ecosystem (Level 5) in a single session.

---

## ═══ HACKATHON EVALUATION MATRIX ═══

### 1. Challenge Vertical & Persona
- **Hackathon Vertical:** Interactive Sustainability & Ecological Gamification.
- **Core Persona: Clover (AI Carbon Coach):** Clover is a supportive, encouraging, and optimistic personal climate advisor. Clover engages in a dynamic conversational interview, analyzes the user's micro-habits, and translates dry data into a personalized story, relatable equivalents, and tailored carbon-saving missions.

### 2. Decision Logic & Architecture
The system uses a unified carbon-scoring engine (`scoring-engine.ts`) on the server backend that executes dynamic generation:
```mermaid
graph TD
    A[User Onboarding Inputs] --> B[Unified Carbon Scoring Engine]
    B --> C[Quantitative Carbon Model & Grid Intensity Analysis]
    C --> D[Create Dynamic Climate Identity Card]
    C --> E[Create Future Climate Twin Projection]
    C --> F[Create 3 Targeted AI Signature Missions]
    D & E & F --> G[Interactive 3D Diorama Garden Hub]
```

#### Scientific Scoring Formulas & Weights:
- **Grid Intensity Multiplier:** Dynamically calculated based on the user's city name (e.g., high coal-load grids like Delhi/Mumbai/Beijing scale energy impact by 1.35x, whereas hydro/wind-heavy regions like Oslo/Seattle/Vancouver scale it down to 0.35x).
- **Emissions Formulas:** Calculates annual CO₂ baseline outputs (in tonnes) based on Transport ($\text{Gas Car} = 4.6$, $\text{EV} = 1.8$), Food ($\text{Meat Heavy} = 2.9$, $\text{Vegan} = 0.5$), Energy ($\text{AC Heavy} = 3.5$, $\text{Solar} = 0.2$), and Shopping ($\text{Frequent} = 2.2$, $\text{Minimalist} = 0.3$).
- **Dynamic Equivalents:** Baseline scores convert directly into real-world equivalents: avoided flights across India, months of grid power saved, and mature trees nourished.

### 3. Practical Real-World Usability
- **Immediate Micro-feedback:** Logging a mission fires custom particle bursts and immediately updates the sticky garden preview diorama.
- **Flawless Demo Pacing:** High-value actions allow judges to reach the peak state (Level 5) within 7–8 clicks (~1.5 minutes) rather than forcing multi-day wait limits.
- **Zero-Bypass Routing:** Direct deep-link route guards check onboarding state, instantly redirecting un-onboarded visitors to Clover.

---

## Data & State Persistence

GreenPath AI is a single-session demo prototype. User state — including onboarding profile, AI-generated identity, points, completed missions, and Carbon Garden level — is held entirely in client-side state (React Context) for the duration of the browser session.

This was a deliberate scope decision for the hackathon timeline:
- **Zero-Friction Review:** No login/signup is required, allowing reviewers to experience the onboarding, dynamic profile generation, and garden growth immediately.
- **Observable Lifecycle:** The full carbon-scoring, target mission generation, and garden-level progression are observable within a single browser session.
- **Production Path:** A production deployment would extend this with persistent accounts (e.g., Supabase Auth + database-backed profiles) to retain progress across devices.

To experience the full loop: complete onboarding, then visit `/missions` and log a few actions — you'll see points update in the nav and the Carbon Garden level change in real time.

## Quick Demo Path (for reviewers)
1. Visit `/onboarding` and complete the 6 questions (~1 min).
2. View your AI-generated Climate Identity + Carbon Story reveal.
3. Click "Start My Journey" → lands on Carbon Garden (Level 1).
4. Visit `/missions` and log 3-4 actions to see points and garden level update live.
5. Visit `/analysis` to see the Climate Twin slider simulator respond in real time.
6. Visit `/identity` for the full AI-generated profile summary.

---

## 🛠️ TECH STACK & SYSTEM REQUIREMENTS

- **Framework:** Next.js (TypeScript, App Router, Client-Side State)
- **3D Graphics:** React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Three.js
- **Animations:** Framer Motion
- **AI Core:** Rule-based dynamic scoring & personalized storytelling engine
- **Icons:** Lucide React

---

## 📂 PROJECT STRUCTURE & ARCHITECTURE

The repository follows a clean, component-oriented structure where responsibilities are separated between rendering components, data models, state storage, and the math engine:

```
├── public/                 # Static public assets (compressed nature backgrounds)
├── src/
│   ├── app/                # Next.js App Router routes & pages
│   │   ├── analysis/       # /analysis page & Climate Twin simulator
│   │   ├── api/            # API Route handlers (Zod profile validation)
│   │   ├── garden/         # /garden page (3D Carbon Garden scene wrapper)
│   │   ├── identity/       # /identity page (detailed profile card summary)
│   │   ├── missions/       # /missions page (Signature & Daily missions logging)
│   │   └── onboarding/     # /onboarding page (Conversational chat onboarding)
│   ├── components/         # Reusable React components
│   │   ├── climate/        # Custom progress bars, badges, and dials
│   │   ├── garden/         # Three.js / React Three Fiber low-poly diorama
│   │   ├── shared/         # Common navigation, reset actions, and overlays
│   │   ├── storytelling/   # Dynamic background globe rotation map
│   │   └── ui/             # Generic primitive UI elements (cards, buttons, sliders)
│   ├── data/               # Static mock data, enums, and daily action pools
│   ├── hooks/              # Custom React hooks (device sizing, dimensions)
│   ├── lib/                # Mathematical engine & core logic helpers
│   │   ├── ai-engine.ts    # AI Carbon Coach types & contracts
│   │   ├── constants.ts    # Central levels and threshold constants
│   │   └── scoring-engine.ts # Carbon scoring & Grid intensity compiler logic
│   ├── store/              # Client-side React Context state
│   │   └── AppContext.tsx  # Central AppProvider with localStorage caching
│   └── styles/             # Modular Tailwind/CSS specific configurations
├── vitest.config.ts        # Test runner & JSDOM environment config
└── package.json            # Scripts, dependencies, and testing configurations
```

---

## 🚀 GETTING STARTED & LOCAL RUN

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to walk through the onboarding.

---

## 🧪 MANUAL DEMO CHECKLIST FOR HACKATHON GRADERS

1. **Conversational Onboarding:**
   - Go to `/onboarding`. Answer Clover's questions (e.g., try entering "Delhi" for a coal grid, or "Oslo" for a renewable grid).
   - Complete the chat to receive a `Starting Bonus (+50 pts)`.
2. **Climate Identity Card & Story:**
   - Discover your customized climate profile name, strength, opportunity, and baseline carbon story.
3. **Missions Hub:**
   - Log AI Signature Missions and Daily Eco-Actions. Observe points accumulating and the inline diorama level rising.
4. **Cinematic 3D Garden:**
   - Navigate to `/garden` to experience the intro camera dolly-in and low-poly 3D floating diorama scaling up.
5. **Reset Walkthrough:**
   - Click the floating `Reset Demo` button at the bottom-right of any page to reset the workspace state instantly and start a new walkthrough.

---

## 🧪 TESTING GUIDE & AUTOMATED VERIFICATION

We have a comprehensive automated unit testing suite utilizing **Vitest** — **97 tests across 7 test files** — covering the mathematical accuracy, input validation, XSS sanitization, data integrity, and state logic of GreenPath AI.

### Run Automated Tests

```bash
npm run test
```

### Test Coverage Report

GreenPath AI maintains high testing coverage across core scoring logic, data transformations, API schemas, and React state:
- **Statement Coverage**: **78.54%**
- **Branch Coverage**: **65.62%**
- **Function Coverage**: **77.27%**
- **Line Coverage**: **82.89%**

### Test Coverage Summary

| Test File | Tests | What It Covers |
|---|---|---|
| `src/lib/scoring-engine.test.ts` | 5 | Core composite math, grid multipliers, mission targeting |
| `src/lib/scoring-engine-extended.test.ts` | 21 | Edge cases (empty/min/max), narrative determinism, climate twin projection math |
| `src/app/api/profile/api-profile-validation.test.ts` | 24 | Zod schema validation (all enums, boundary lengths), XSS escaping, response shape |
| `src/data/daily-eco-actions.test.ts` | 19 | Pool size, no duplicates, completed flag reset, data shape, category coverage, mutation safety |
| `src/store/app-state-logic.test.ts` | 22 | Garden level thresholds (all 6 levels), point accumulation, CO₂ floating-point rounding, mission idempotency |
| `src/store/AppContext.test.tsx` | 5 | Pure garden level thresholds, React Testing Library `renderHook` state changes, points/streak rewards |
| `src/app/identity/identity.test.tsx` | 1 | React Testing Library snapshot test for `/identity` dashboard view |

### Key Verification Areas

1. **Weighted composite calculations** — verified for high, low, and zero-value input profiles.
2. **Bounds / title overrides** — `composite ≤ 1.8` → "Green Earth Champion"; `composite ≥ 8.5` → "Green Path Beginner".
3. **Grid intensity modifiers** — Delhi/Sydney (1.35×), Oslo/Seattle (0.35×), London (1.0×) all verified.
4. **Narrative determinism** — same city always produces the same story variant (hash-stable `selectIndex`).
5. **Climate Twin projections** — flights, power months, and trees computed from 35% of baseline emissions.
6. **Zod API validation** — all enum fields, name/city length boundaries, missing-field rejection.
7. **XSS sanitization** — `escapeHtml` neutralizes `<`, `>`, `&`, `"`, `'`, `/` injection vectors.
8. **Daily eco-actions pool** — 8 items, unique IDs, all `completed: false` on every pick, covers ≥3 categories.
9. **Garden level math** — all 6 threshold transitions (0, 50, 120, 200, 300, 450 pts) verified precisely.
10. **Mission idempotency** — completing the same mission twice does not award double points.

