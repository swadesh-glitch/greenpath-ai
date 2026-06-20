import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { AppProvider, useAppContext, calcGardenLevel } from "./AppContext"

// Mock next/navigation to prevent errors during context rendering
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/identity",
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe("Carbon Garden Level-Threshold Logic", () => {
  it("correctly maps points to garden levels based on thresholds", () => {
    // Threshold points: 0, 50, 120, 200, 300, 450
    expect(calcGardenLevel(0)).toBe(0)
    expect(calcGardenLevel(25)).toBe(0)
    expect(calcGardenLevel(49)).toBe(0)
    
    expect(calcGardenLevel(50)).toBe(1)
    expect(calcGardenLevel(100)).toBe(1)
    expect(calcGardenLevel(119)).toBe(1)
    
    expect(calcGardenLevel(120)).toBe(2)
    expect(calcGardenLevel(150)).toBe(2)
    expect(calcGardenLevel(199)).toBe(2)
    
    expect(calcGardenLevel(200)).toBe(3)
    expect(calcGardenLevel(250)).toBe(3)
    expect(calcGardenLevel(299)).toBe(3)
    
    expect(calcGardenLevel(300)).toBe(4)
    expect(calcGardenLevel(400)).toBe(4)
    expect(calcGardenLevel(449)).toBe(4)
    
    expect(calcGardenLevel(450)).toBe(5)
    expect(calcGardenLevel(999)).toBe(5)
  })
})

describe("AppContext State Updates & Recalculation via renderHook", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("initializes with non-onboarded defaults", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper })
    
    expect(result.current.isOnboarded).toBe(false)
    expect(result.current.points).toBe(320)
    expect(result.current.gardenLevel).toBe(4)
  })

  it("transitions to onboarded state with completeOnboarding and sets level 1", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper })
    
    act(() => {
      result.current.completeOnboarding("identity_commuter", "Conscious Commuter")
    })
    
    expect(result.current.isOnboarded).toBe(true)
    expect(result.current.profile.name).toBe("Conscious Commuter")
    expect(result.current.points).toBe(50)
    expect(result.current.gardenLevel).toBe(1)
  })

  it("accumulates points and recalculates garden level upon completing signature missions", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper })
    
    // Complete onboarding first to get 50 starting points (Level 1)
    act(() => {
      result.current.completeOnboarding("identity_commuter", "Conscious Commuter")
    })
    
    expect(result.current.points).toBe(50)
    expect(result.current.gardenLevel).toBe(1)
    
    // Find the first mission
    const firstMission = result.current.missions[0]
    expect(firstMission).toBeDefined()
    const pointsToAward = firstMission.points
    
    // Complete the mission
    act(() => {
      result.current.completeMission(firstMission.id)
    })
    
    // Total points should be: 50 + pointsToAward
    const expectedPoints = 50 + pointsToAward
    expect(result.current.points).toBe(expectedPoints)
    expect(result.current.missions[0].completed).toBe(true)
    
    // Garden level should be updated dynamically based on points
    const expectedLevel = calcGardenLevel(expectedPoints)
    expect(result.current.gardenLevel).toBe(expectedLevel)
  })

  it("updates state correctly upon completing daily action and weekly challenge", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper })
    
    act(() => {
      result.current.completeOnboarding("identity_commuter", "Conscious Commuter")
    })
    
    // Daily Action Complete
    const initialPoints = result.current.points // 50
    const dailyAction = result.current.dailyActions[0]
    expect(dailyAction).toBeDefined()
    
    act(() => {
      result.current.completeDailyAction(dailyAction.id)
    })
    
    expect(result.current.points).toBe(initialPoints + dailyAction.points)
    expect(result.current.dailyActions[0].completed).toBe(true)
    
    // Weekly Challenge Complete
    const currentPoints = result.current.points
    const weekly = result.current.weeklyChallenge
    expect(weekly).toBeDefined()
    
    act(() => {
      result.current.completeWeeklyChallenge()
    })
    
    expect(result.current.points).toBe(currentPoints + (weekly?.points || 0))
    expect(result.current.weeklyChallenge?.completed).toBe(true)
  })
})
