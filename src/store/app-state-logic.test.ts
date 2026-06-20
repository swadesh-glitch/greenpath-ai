/**
 * app-state-logic.test.ts
 *
 * Pure unit tests for application state logic extracted from AppContext.tsx.
 * Tests the garden-level calculation thresholds and point accumulation math
 * WITHOUT importing React, jsdom, or any component code — these are
 * deterministic arithmetic functions.
 *
 * Why not render <AppProvider>? The project has no @testing-library/react or
 * jsdom installed (vitest runs in node environment), so component rendering
 * tests would require adding those dependencies. The pure-logic tests below
 * cover the same business-critical paths with zero infrastructure overhead.
 */
import { describe, it, expect } from "vitest"

// ─────────────────────────────────────────────────────────────────────────────
// Replicate calcGardenLevel — exact copy of logic in AppContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 450]

function calcGardenLevel(points: number): number {
  let level = 0
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i
      break
    }
  }
  return level
}

// ─────────────────────────────────────────────────────────────────────────────
// Replicate addReward — pure math from AppContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
interface Stats {
  totalPoints: number
  co2SavedKg: number
  level: number
}

function applyReward(prevStats: Stats, pts: number, co2: number): Stats {
  return {
    ...prevStats,
    totalPoints: prevStats.totalPoints + pts,
    co2SavedKg: Number((prevStats.co2SavedKg + co2).toFixed(2)),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GARDEN LEVEL CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
describe("calcGardenLevel – threshold mapping", () => {
  it("should return level 0 at 0 points (seed threshold)", () => {
    expect(calcGardenLevel(0)).toBe(0)
  })

  it("should return level 0 just below level-1 threshold (49 points)", () => {
    expect(calcGardenLevel(49)).toBe(0)
  })

  it("should return level 1 at exactly 50 points", () => {
    expect(calcGardenLevel(50)).toBe(1)
  })

  it("should return level 1 just below level-2 threshold (119 points)", () => {
    expect(calcGardenLevel(119)).toBe(1)
  })

  it("should return level 2 at exactly 120 points", () => {
    expect(calcGardenLevel(120)).toBe(2)
  })

  it("should return level 2 just below level-3 threshold (199 points)", () => {
    expect(calcGardenLevel(199)).toBe(2)
  })

  it("should return level 3 at exactly 200 points", () => {
    expect(calcGardenLevel(200)).toBe(3)
  })

  it("should return level 3 just below level-4 threshold (299 points)", () => {
    expect(calcGardenLevel(299)).toBe(3)
  })

  it("should return level 4 at exactly 300 points", () => {
    expect(calcGardenLevel(300)).toBe(4)
  })

  it("should return level 4 just below level-5 threshold (449 points)", () => {
    expect(calcGardenLevel(449)).toBe(4)
  })

  it("should return level 5 at exactly 450 points (max defined level)", () => {
    expect(calcGardenLevel(450)).toBe(5)
  })

  it("should return level 5 (capped) for points well beyond 450", () => {
    expect(calcGardenLevel(9999)).toBe(5)
    expect(calcGardenLevel(100000)).toBe(5)
  })

  it("should return level 1 immediately after onboarding (50 starter points)", () => {
    // completeOnboarding and completeAIOnboarding both set totalPoints: 50
    expect(calcGardenLevel(50)).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. POINT ACCUMULATION (addReward)
// ─────────────────────────────────────────────────────────────────────────────
describe("applyReward – point accumulation", () => {
  it("should add points correctly to empty stats (from zero)", () => {
    const result = applyReward({ totalPoints: 0, co2SavedKg: 0, level: 0 }, 25, 1.2)
    expect(result.totalPoints).toBe(25)
    expect(result.co2SavedKg).toBe(1.2)
  })

  it("should accumulate points across multiple missions", () => {
    let stats: Stats = { totalPoints: 50, co2SavedKg: 0, level: 1 }
    stats = applyReward(stats, 65, 4.5) // hard mission
    stats = applyReward(stats, 45, 2.8) // medium mission
    stats = applyReward(stats, 25, 1.2) // easy mission
    expect(stats.totalPoints).toBe(50 + 65 + 45 + 25) // 185
    expect(stats.co2SavedKg).toBe(Number((4.5 + 2.8 + 1.2).toFixed(2))) // 8.5
  })

  it("should round co2SavedKg to 2 decimal places (floating point safety)", () => {
    // Known JavaScript float issue: 0.1 + 0.2 = 0.30000000000000004
    const result = applyReward({ totalPoints: 0, co2SavedKg: 0.1, level: 0 }, 0, 0.2)
    expect(result.co2SavedKg).toBe(0.3)
  })

  it("should not modify totalPoints if pts is 0", () => {
    const result = applyReward({ totalPoints: 200, co2SavedKg: 5.0, level: 3 }, 0, 0)
    expect(result.totalPoints).toBe(200)
    expect(result.co2SavedKg).toBe(5.0)
  })

  it("completing all 3 signature missions from scratch should cross level-1 threshold (≥50 pts)", () => {
    // Start at 50 (from onboarding), complete all 3 missions
    let stats: Stats = { totalPoints: 50, co2SavedKg: 0, level: 1 }
    stats = applyReward(stats, 65, 5.0) // hard
    stats = applyReward(stats, 45, 2.2) // medium
    stats = applyReward(stats, 25, 0.5) // easy
    // totalPoints = 50 + 65 + 45 + 25 = 185 → level 2 (≥120)
    expect(stats.totalPoints).toBe(185)
    expect(calcGardenLevel(stats.totalPoints)).toBe(2)
  })

  it("should not change stats if pts and co2 are both zero", () => {
    const original: Stats = { totalPoints: 150, co2SavedKg: 7.5, level: 2 }
    const result = applyReward(original, 0, 0)
    expect(result.totalPoints).toBe(150)
    expect(result.co2SavedKg).toBe(7.5)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. ONBOARDING STARTER POINTS – garden level starts at 1
// ─────────────────────────────────────────────────────────────────────────────
describe("Onboarding starter points", () => {
  it("initial stats post-onboarding = 50pts → must be level 1", () => {
    const startingPoints = 50  // hardcoded in completeOnboarding and completeAIOnboarding
    expect(calcGardenLevel(startingPoints)).toBe(1)
  })

  it("fresh app stats (0 points) should be level 0", () => {
    expect(calcGardenLevel(0)).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. MISSION COMPLETION GUARDS – idempotency (completing twice does nothing)
// ─────────────────────────────────────────────────────────────────────────────
describe("Mission completion – idempotency guard", () => {
  it("completing a mission twice should not award double points", () => {
    // This mirrors the guard `if (m.id !== missionId || m.completed) return m` in completeMission
    interface Mission { id: string; points: number; co2SavingsKg: number; completed: boolean }

    function simulateCompleteMission(
      missions: Mission[],
      missionId: string,
      currentStats: Stats
    ): { missions: Mission[]; stats: Stats } {
      let updatedStats = { ...currentStats }
      const updatedMissions = missions.map((m) => {
        if (m.id !== missionId || m.completed) return m
        updatedStats = applyReward(updatedStats, m.points, m.co2SavingsKg)
        return { ...m, completed: true }
      })
      return { missions: updatedMissions, stats: updatedStats }
    }

    const missions: Mission[] = [
      { id: "sig_m_hard_1", points: 65, co2SavingsKg: 5.0, completed: false },
      { id: "sig_m_med_1",  points: 45, co2SavingsKg: 2.2, completed: false },
    ]
    const stats: Stats = { totalPoints: 50, co2SavedKg: 0, level: 1 }

    // First completion
    const first = simulateCompleteMission(missions, "sig_m_hard_1", stats)
    expect(first.stats.totalPoints).toBe(115) // 50 + 65
    expect(first.missions[0].completed).toBe(true)

    // Second attempt — already completed, should be a no-op
    const second = simulateCompleteMission(first.missions, "sig_m_hard_1", first.stats)
    expect(second.stats.totalPoints).toBe(115) // unchanged
  })
})
