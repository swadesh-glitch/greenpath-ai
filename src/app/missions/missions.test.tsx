/* eslint-disable */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, fireEvent, screen } from "@testing-library/react"
import { axe } from "vitest-axe"
import ClimateMissions from "./page"
import { AppProvider } from "@/store/AppContext"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/missions",
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

describe("Missions Page Component", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders Missions Hub correctly when onboarded", () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Ambassador",
      totalPoints: 100,
      missions: [
        { id: "sig_m_1", title: "Signature Mission 1", points: 50, co2SavingsKg: 10.0, completed: false, category: "transport", difficulty: "medium" }
      ],
      dailyActions: [
        { id: "daily_1", title: "Daily Eco action 1", points: 15, co2SavingsKg: 2.0, completed: false, category: "food", difficulty: "easy" }
      ]
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    render(
      <AppProvider>
        <ClimateMissions />
      </AppProvider>
    )

    expect(screen.getByText("Signature AI Missions")).toBeDefined()
    expect(screen.getByText("Standard Eco Actions")).toBeDefined()
    expect(screen.getByText("Signature Mission 1")).toBeDefined()
    expect(screen.getByText("Daily Eco action 1")).toBeDefined()
  })

  it("handles completing a daily action and signature mission successfully on user click paths", () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Ambassador",
      totalPoints: 100,
      missions: [
        { id: "sig_m_1", title: "Signature Mission 1", points: 50, co2SavingsKg: 10.0, completed: false, category: "transport", difficulty: "medium" }
      ],
      dailyActions: [
        { id: "daily_1", title: "Daily Eco action 1", points: 15, co2SavingsKg: 2.0, completed: false, category: "food", difficulty: "easy" }
      ]
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    render(
      <AppProvider>
        <ClimateMissions />
      </AppProvider>
    )

    const logDailyBtn = screen.getByRole("button", { name: /log completion of action: daily eco action 1/i })
    fireEvent.click(logDailyBtn)

    const logSignatureBtn = screen.getByRole("button", { name: /log action for signature mission: signature mission 1/i })
    fireEvent.click(logSignatureBtn)

    // Elements should now render completed checkmark
    expect(screen.queryAllByRole("button", { name: /log/i }).length).toBe(0)
  })

  it("passes accessibility compliance checks", async () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Ambassador",
      totalPoints: 100,
      missions: [
        { id: "sig_m_1", title: "Signature Mission 1", points: 50, co2SavingsKg: 10.0, completed: false, category: "transport", difficulty: "medium" }
      ],
      dailyActions: [
        { id: "daily_1", title: "Daily Eco action 1", points: 15, co2SavingsKg: 2.0, completed: false, category: "food", difficulty: "easy" }
      ]
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    const { container } = render(
      <AppProvider>
        <ClimateMissions />
      </AppProvider>
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
