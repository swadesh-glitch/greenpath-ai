/* eslint-disable */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, fireEvent, screen } from "@testing-library/react"
import { axe } from "vitest-axe"
import ClimateAnalysis from "./page"
import { AppProvider } from "@/store/AppContext"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/analysis",
}))

// Mock PageBackground
vi.mock("@/components/shared/PageBackground", () => ({
  PageBackground: () => <div data-testid="page-background" />,
}))

// Mock framer-motion proxy
vi.mock("framer-motion", () => {
  const ReactMod = require("react")
  const motionProxy = new Proxy({}, {
    get: (_target, prop) => {
      const Tag = prop as string
      const MockComponent = ReactMod.forwardRef(({ children, whileHover, whileTap, transition, variants, initial, animate, exit, ...props }: any, ref: any) => {
        return ReactMod.createElement(Tag, { ref, ...props }, children)
      })
      MockComponent.displayName = `motion.${Tag}`
      return MockComponent
    }
  })
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: any) => ReactMod.createElement(ReactMod.Fragment, null, children),
  }
})

describe("ClimateAnalysis Page Component", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders Climate Story page correctly when onboarded", () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Champion",
      totalPoints: 200,
      onboardingAnswers: {
        transit: "walk_bike",
        diet: "vegetarian",
        shopping: "frequent_packages",
        energy: "moderate_heat_ac"
      },
      generatedIdentity: {
        name: "Eco Champion",
        summary: "You are consistent in reducing carbon foot print.",
        perk: "Green points boosted by 1.2x",
        trait: "Energetic traveler",
        strength: "Use bike regularly",
        opportunity: "Unplug idle appliances",
        weeklyMissionIdea: "Unplug home AC for a day"
      }
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    render(
      <AppProvider>
        <ClimateAnalysis />
      </AppProvider>
    )

    expect(screen.getByText("Your Climate Story")).toBeDefined()
    expect(screen.getByText("Transportation")).toBeDefined()
    expect(screen.getByText("Food Intake")).toBeDefined()
    expect(screen.getByText("Home Energy")).toBeDefined()
    expect(screen.getByText("Shopping & Waste")).toBeDefined()
  })

  it("switches to Climate Twin tab on tab click", () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Champion",
      totalPoints: 200,
      onboardingAnswers: {
        transit: "walk_bike",
        diet: "vegetarian",
        shopping: "frequent_packages",
        energy: "moderate_heat_ac"
      },
      generatedIdentity: {
        name: "Eco Champion",
        summary: "You are consistent in reducing carbon foot print.",
        perk: "Green points boosted by 1.2x",
        trait: "Energetic traveler",
        strength: "Use bike regularly",
        opportunity: "Unplug idle appliances",
        weeklyMissionIdea: "Unplug home AC for a day"
      }
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    render(
      <AppProvider>
        <ClimateAnalysis />
      </AppProvider>
    )

    const twinTab = screen.getByRole("tab", { name: /climate twin/i })
    fireEvent.click(twinTab)

    expect(screen.getByText("Meet Your Climate Twin")).toBeDefined()
    expect(screen.getByText("Climate Impact Controls")).toBeDefined()
  })

  it("passes accessibility compliance checks", async () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Champion",
      totalPoints: 200,
      onboardingAnswers: {
        transit: "walk_bike",
        diet: "vegetarian",
        shopping: "frequent_packages",
        energy: "moderate_heat_ac"
      },
      generatedIdentity: {
        name: "Eco Champion",
        summary: "You are consistent in reducing carbon foot print.",
        perk: "Green points boosted by 1.2x",
        trait: "Energetic traveler",
        strength: "Use bike regularly",
        opportunity: "Unplug idle appliances",
        weeklyMissionIdea: "Unplug home AC for a day"
      }
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    const { container } = render(
      <AppProvider>
        <ClimateAnalysis />
      </AppProvider>
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
