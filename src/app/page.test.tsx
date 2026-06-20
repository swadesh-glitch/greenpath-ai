/* eslint-disable */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { axe } from "vitest-axe"
import LandingPage from "./page"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
}))

// Mock dynamic import Globe component
vi.mock("@/components/storytelling/Globe", () => ({
  Globe: () => <div data-testid="mocked-globe" />,
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
    useScroll: () => ({ scrollYProgress: { onChange: vi.fn() } }),
    useMotionValueEvent: vi.fn(),
  }
})

describe("LandingPage Component", () => {
  it("renders Landing Page sections successfully", () => {
    render(<LandingPage />)
    expect(screen.getByText(/The Planet Doesn't Need/i)).toBeDefined()
    expect(screen.getByText(/Start My Climate Journey/i)).toBeDefined()
    expect(screen.getByText(/Every Choice Leaves A Footprint/i)).toBeDefined()
    expect(screen.getByText(/A Better Future Is Possible/i)).toBeDefined()
    expect(screen.getByText(/Meet GreenPath AI/i)).toBeDefined()
  })

  it("passes accessibility compliance checks", async () => {
    const { container } = render(<LandingPage />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
