# Contributing & Architecture Guide 🏗️

Welcome to GreenPath AI! This guide outlines our project architecture, folder structures, design conventions, state flow patterns, and testing standards.

## 📂 Project Structure

The codebase is organized into modular directories to separate concerns between routing pages, reusable components, mathematical logic, and React state:

```
├── public/                 # Static public assets (nature scene backdrops)
├── src/
│   ├── app/                # Next.js App Router routes & pages
│   │   ├── analysis/       # /analysis page & Climate Twin simulator panel
│   │   ├── api/            # API Route handlers (Zod schema checking)
│   │   ├── garden/         # /garden page (3D Carbon Garden WebGL canvas)
│   │   ├── identity/       # /identity page (personalized profile display)
│   │   ├── missions/       # /missions page (Signature & Daily missions logging)
│   │   └── onboarding/     # /onboarding page (Conversational chat onboarding flow)
│   ├── components/         # Reusable React components
│   │   ├── climate/        # Custom progress bars, badges, dials
│   │   ├── garden/         # Three.js / React Three Fiber low-poly diorama diorama
│   │   ├── shared/         # Common navigation, page backgrounds, and reset controls
│   │   ├── storytelling/   # Dynamic globe rotation canvas
│   │   └── ui/             # Generic primitive UI elements (cards, buttons, sliders)
│   ├── data/               # Static mock data, enums, daily actions, and challenges
│   ├── hooks/              # Custom React hooks (device viewport sizing, window dimensions)
│   ├── lib/                # Mathematical engine & core logic helpers
│   │   ├── ai-engine.ts    # AI Carbon Coach types & contracts
│   │   ├── constants.ts    # Central level thresholds & names
│   │   └── scoring-engine.ts # Carbon scoring & Grid intensity calculation rules
│   ├── store/              # Client-side React Context state
│   │   └── AppContext.tsx  # Central AppProvider with localStorage synchronization
│   └── styles/             # Modular Tailwind/CSS specific configurations
├── vitest.config.ts        # Test runner & JSDOM environment config
└── package.json            # Scripts, dependencies, and testing configurations
```

## 🔄 State & Data Flow

GreenPath AI follows a clean, single-session client-state cycle:
1. **Onboarding Questions**: User answers conversational questions posed by Clover.
2. **Scoring Compilation**: Answers are passed to `scoring-engine.ts` which runs type validations, calculates grid emission intensity multipliers, and returns carbon story blocks, equivalents, and 3 signature missions.
3. **Context Hydration**: Context states (`AppContext.tsx`) are populated with the compiled profile and cached in `localStorage`.
4. **Interactive updates**: Actions logged in the missions dashboard recalculate points and garden levels dynamically.

## 🧪 Testing Standards

We maintain strict coverage (>90%) across:
- **Unit Testing**: Math computations in `scoring-engine.ts`, validation checks in `/api/profile`, and action seed generation.
- **Hook Testing**: Reducer state transitions and level thresholds calculations inside `AppContext.tsx` using `renderHook`.
- **Accessibility Verification**: Automated WCAG audits (`vitest-axe`) running on all major UI components.
- **E2E Integration**: Automated Playwright E2E tests (`tests/demo-flow.spec.ts`) executing complete onboarding-to-diorama life cycles.
