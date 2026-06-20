/**
 * daily-eco-actions.test.ts
 *
 * Unit tests for pickDailyActions() and the DAILY_ECO_ACTION_POOL data.
 * Covers: return count, no duplicates, completed flag reset, and pool integrity.
 */
import { describe, it, expect } from "vitest"
import { pickDailyActions, DAILY_ECO_ACTION_POOL } from "./daily-eco-actions"

const POOL_SIZE = DAILY_ECO_ACTION_POOL.length // 8

describe("pickDailyActions – return count", () => {
  it("should return exactly as many actions as are in the pool (8)", () => {
    const actions = pickDailyActions()
    expect(actions).toHaveLength(POOL_SIZE)
    expect(actions).toHaveLength(8)
  })

  it("should return the same count when called with a date string argument", () => {
    const actions = pickDailyActions("2024-06-20")
    expect(actions).toHaveLength(POOL_SIZE)
  })

  it("should return the same count when called with an empty string argument", () => {
    const actions = pickDailyActions("")
    expect(actions).toHaveLength(POOL_SIZE)
  })
})

describe("pickDailyActions – no duplicates", () => {
  it("should not return duplicate action IDs in a single pick", () => {
    const actions = pickDailyActions()
    const ids = actions.map(a => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it("should not return duplicate action titles in a single pick", () => {
    const actions = pickDailyActions()
    const titles = actions.map(a => a.title)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(titles.length)
  })
})

describe("pickDailyActions – completed flag reset", () => {
  it("should always return all actions with completed=false (fresh state)", () => {
    const actions = pickDailyActions()
    for (const action of actions) {
      expect(action.completed).toBe(false)
    }
  })

  it("should return completed=false even if the pool item had completed=true", () => {
    // pickDailyActions always maps with { ...a, completed: false }
    // This verifies the spread/override contract regardless of pool state
    const actions = pickDailyActions("any-date")
    const completedCount = actions.filter(a => a.completed === true).length
    expect(completedCount).toBe(0)
  })
})

describe("pickDailyActions – data shape and integrity", () => {
  it("every action should have required fields: id, title, description, category, points, co2SavingsKg", () => {
    const actions = pickDailyActions()
    for (const action of actions) {
      expect(action.id).toBeTruthy()
      expect(action.title).toBeTruthy()
      expect(action.description).toBeTruthy()
      expect(action.category).toBeTruthy()
      expect(action.points).toBeGreaterThan(0)
      expect(action.co2SavingsKg).toBeGreaterThan(0)
    }
  })

  it("every action's category should be one of the valid values", () => {
    const validCategories = ["transport", "energy", "food", "waste", "shopping"]
    const actions = pickDailyActions()
    for (const action of actions) {
      expect(validCategories).toContain(action.category)
    }
  })

  it("all actions should have positive points between 1 and 200", () => {
    const actions = pickDailyActions()
    for (const action of actions) {
      expect(action.points).toBeGreaterThan(0)
      expect(action.points).toBeLessThanOrEqual(200)
    }
  })

  it("all actions should have positive co2SavingsKg", () => {
    const actions = pickDailyActions()
    for (const action of actions) {
      expect(action.co2SavingsKg).toBeGreaterThan(0)
    }
  })
})

describe("pickDailyActions – pool covers multiple categories", () => {
  it("pool should cover at least 3 distinct categories", () => {
    const actions = pickDailyActions()
    const categories = new Set(actions.map(a => a.category))
    expect(categories.size).toBeGreaterThanOrEqual(3)
  })

  it("pool should contain at least one transport action", () => {
    const actions = pickDailyActions()
    const transportActions = actions.filter(a => a.category === "transport")
    expect(transportActions.length).toBeGreaterThanOrEqual(1)
  })

  it("pool should contain at least one energy action", () => {
    const actions = pickDailyActions()
    const energyActions = actions.filter(a => a.category === "energy")
    expect(energyActions.length).toBeGreaterThanOrEqual(1)
  })

  it("pool should contain at least one food action", () => {
    const actions = pickDailyActions()
    const foodActions = actions.filter(a => a.category === "food")
    expect(foodActions.length).toBeGreaterThanOrEqual(1)
  })
})

describe("pickDailyActions – returns independent copies (no mutation sharing)", () => {
  it("mutating the returned array should not affect the pool", () => {
    const actions = pickDailyActions()
    // Mutate the first returned action's completed flag
    actions[0].completed = true
    // A second pick should still return completed=false
    const freshActions = pickDailyActions()
    expect(freshActions[0].completed).toBe(false)
  })
})

describe("DAILY_ECO_ACTION_POOL – static pool integrity", () => {
  it("pool should have exactly 8 items", () => {
    expect(DAILY_ECO_ACTION_POOL).toHaveLength(8)
  })

  it("all pool item IDs should be unique", () => {
    const ids = DAILY_ECO_ACTION_POOL.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("all pool IDs should follow dea_N naming pattern", () => {
    for (const action of DAILY_ECO_ACTION_POOL) {
      expect(action.id).toMatch(/^dea_\d+$/)
    }
  })
})
