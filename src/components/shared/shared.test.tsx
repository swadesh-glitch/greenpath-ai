/* eslint-disable */
import React, { act } from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, fireEvent, screen } from "@testing-library/react"
import { axe } from "vitest-axe"
import { AppProvider } from "@/store/AppContext"
import { Navigation } from "./Navigation"
import { LockedScreenPreview } from "./LockedScreenPreview"
import { Counter } from "./Counter"
import { ResetDemoButton } from "./ResetDemoButton"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
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

describe("Navigation Component", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders non-onboarded navigation links", () => {
    let container: HTMLElement
    act(() => {
      const rendered = render(
        <AppProvider>
          <Navigation />
        </AppProvider>
      )
      container = rendered.container
    })

    expect(screen.getByText("GreenPath")).toBeDefined()
    expect(screen.getByText("How It Works")).toBeDefined()
    expect(screen.getByText("Start Journey")).toBeDefined()
  })

  it("renders onboarded navigation items with garden level", () => {
    const state = {
      isOnboarded: true,
      profileName: "Eco Hero",
      totalPoints: 150,
      gardenLevel: 2,
    }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    act(() => {
      render(
        <AppProvider>
          <Navigation />
        </AppProvider>
      )
    })

    expect(screen.getByText("Climate Identity")).toBeDefined()
    expect(screen.getByText("Carbon Story")).toBeDefined()
    expect(screen.getByText("Climate Twin")).toBeDefined()
    expect(screen.getByText("Carbon Garden")).toBeDefined()
    expect(screen.getByText("Lv.2")).toBeDefined()
  })

  it("passes accessibility compliance checks", async () => {
    let container: HTMLElement
    act(() => {
      const rendered = render(
        <AppProvider>
          <Navigation />
        </AppProvider>
      )
      container = rendered.container
    })
    const results = await axe(container!)
    expect(results.violations).toEqual([])
  })
})

describe("LockedScreenPreview Component", () => {
  it("renders LockedScreenPreview correctly with title and description", () => {
    render(<LockedScreenPreview route="garden" />)
    expect(screen.getByText("Your Garden is Waiting")).toBeDefined()
    expect(screen.getByText("Grow My Garden")).toBeDefined()
  })

  it("passes accessibility compliance checks", async () => {
    const { container } = render(<LockedScreenPreview route="garden" />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})

describe("Counter Component", () => {
  it("renders numeric value correctly", () => {
    act(() => {
      render(<Counter value={100} />)
    })
    expect(screen.getByText("100")).toBeDefined()
  })

  it("passes accessibility compliance checks", async () => {
    let container: HTMLElement
    act(() => {
      const rendered = render(<Counter value={100} />)
      container = rendered.container
    })
    const results = await axe(container!)
    expect(results.violations).toEqual([])
  })
})

describe("ResetDemoButton Component", () => {
  it("renders Reset Demo button and handles reset on click", () => {
    const state = { isOnboarded: true }
    localStorage.setItem("greenpath_app_state", JSON.stringify(state))

    act(() => {
      render(
        <AppProvider>
          <ResetDemoButton />
        </AppProvider>
      )
    })

    const btn = screen.getByRole("button")
    expect(btn).toBeDefined()
    
    act(() => {
      fireEvent.click(btn)
    })
    
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("passes accessibility compliance checks", async () => {
    let container: HTMLElement
    act(() => {
      const rendered = render(
        <AppProvider>
          <ResetDemoButton />
        </AppProvider>
      )
      container = rendered.container
    })
    const results = await axe(container!)
    expect(results.violations).toEqual([])
  })
})
