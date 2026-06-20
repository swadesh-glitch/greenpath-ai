import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import ClimateIdentityDashboard from "./page"
import { AppProvider } from "@/store/AppContext"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/identity",
}))

// Mock next/image to render as standard img tag for snapshot simplicity
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} src={props.src} />
  },
}))

// Mock PageBackground component
vi.mock("@/components/shared/PageBackground", () => ({
  PageBackground: () => <div data-testid="page-background" />,
}))

// Mock framer-motion to render elements instantly without animations during test
vi.mock("framer-motion", () => {
  const React = require("react")
  const motionProxy = new Proxy({}, {
    get: (_target, prop) => {
      const Tag = prop as string
      const MockComponent = React.forwardRef(({ children, whileHover, whileTap, transition, variants, initial, animate, exit, ...props }: any, ref: any) => {
        return React.createElement(Tag, { ref, ...props }, children)
      })
      MockComponent.displayName = `motion.${Tag}`
      return MockComponent
    }
  })
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  }
})

describe("ClimateIdentityDashboard Snapshot Test", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders correctly and matches snapshot when user is onboarded", () => {
    // Populate localStorage with valid state so the component loads past early exit mount checks
    const state = {
      isOnboarded: true,
      profileName: "Green Voyager",
      profileClimateIdentity: "Conscious Commuter",
      totalPoints: 120,
      co2SavedKg: 15.5,
      missions: [],
      dailyActions: [],
      weeklyChallenge: null,
      lastRefreshedDate: null,
      hasSeenGardenIntro: true,
      currentStreak: 2,
      lastActiveDate: null,
      hasRerolledToday: false,
      onboardingAnswers: {
        transit: "walk_bike",
        diet: "mostly_plant",
        shopping: "frequent_packages",
        energy: "moderate_heat_ac"
      },
      generatedIdentity: {
        name: "Conscious Commuter",
        summary: "You prefer green commuting and low carbon routes.",
        perk: "+20% CO2 savings",
        trait: "Active and energetic traveler",
        strength: "Consistently walk and bike",
        opportunity: "Carpool or take direct lines when possible",
        weeklyMissionIdea: "Ride bike to work 3 days a week"
      },
      carbonStory: "A wonderful green journey starting from sustainable commutes.",
      climateTwin: {
        transitMultiplier: 1.5,
        dietMultiplier: 1.0,
        energyMultiplier: 1.0,
        shoppingMultiplier: 1.0,
        equivalents: {
          flightsAvoided: 2,
          householdPowerMonths: 3,
          treesPlanted: 10
        }
      }
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    const { container } = render(
      <AppProvider>
        <ClimateIdentityDashboard />
      </AppProvider>
    )

    // Render snapshot check
    expect(container.firstChild).toMatchSnapshot()
  })
})
