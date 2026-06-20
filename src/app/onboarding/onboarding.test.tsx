/* eslint-disable */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, fireEvent, screen, waitFor } from "@testing-library/react"
import { axe } from "vitest-axe"
import OnboardingPage from "./page"
import { AppProvider } from "@/store/AppContext"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/onboarding",
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

describe("Onboarding Page Component", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders Clover Carbon Coach chatbot onboarding interface", async () => {
    render(
      <AppProvider>
        <OnboardingPage />
      </AppProvider>
    )

    // Clover greeting should render
    expect(screen.getAllByText(/CLOVER/i).length).toBeGreaterThan(0)
    expect(await screen.findByPlaceholderText(/enter your name.../i, {}, { timeout: 3000 })).toBeDefined()
  })

  it("handles user typing name and clicking continue", async () => {
    render(
      <AppProvider>
        <OnboardingPage />
      </AppProvider>
    )

    const input = await screen.findByPlaceholderText(/enter your name.../i, {}, { timeout: 3000 })
    fireEvent.change(input, { target: { value: "Eco Traveler" } })
    await waitFor(() => {
      const currentInput = screen.getByPlaceholderText(/enter your name.../i) as HTMLInputElement
      expect(currentInput.value).toBe("Eco Traveler")
    })

    const btn = screen.getByRole("button", { name: /continue/i })
    fireEvent.click(btn)

    // Wait for the name to commit and transition to the next step
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/enter your name.../i)).toBeNull()
    })
  })

  it("passes accessibility compliance checks", async () => {
    const { container } = render(
      <AppProvider>
        <OnboardingPage />
      </AppProvider>
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
