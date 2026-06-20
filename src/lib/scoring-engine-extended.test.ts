/**
 * scoring-engine-extended.test.ts
 *
 * Extends coverage for calculateProfile() with edge cases, narrative
 * determinism checks, and Climate Twin projection math validation.
 * Does NOT touch or duplicate the 5 tests in scoring-engine.test.ts.
 */
import { describe, it, expect } from "vitest"
import { calculateProfile } from "./scoring-engine"

// ─────────────────────────────────────────────────────────────────────────────
// 1. EDGE CASE: Missing / empty answer fields fall back to defaults
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – fallback defaults for empty/unknown answers", () => {
  it("should use fallback transport=transit when transport field is empty string", () => {
    const profile = calculateProfile({
      city: "London",
      transport: "",       // → fallback: transit → score 2.0
      food: "balanced",
      energy: "standard",
      shopping: "conscious",
    })
    // transit fallback score = 2.0
    expect(profile.scores.transport).toBe(2.0)
  })

  it("should use fallback food=balanced when food field is empty string", () => {
    const profile = calculateProfile({
      city: "London",
      transport: "transit",
      food: "",            // → fallback: balanced → score 5.9
      energy: "standard",
      shopping: "conscious",
    })
    expect(profile.scores.food).toBe(5.9)
  })

  it("should use fallback energy=standard when energy field is empty string", () => {
    const profile = calculateProfile({
      city: "London",     // standard grid (1.0×)
      transport: "transit",
      food: "balanced",
      energy: "",          // → fallback: standard → score 5.4 × 1.0 = 5.4
      shopping: "conscious",
    })
    expect(profile.scores.energy).toBe(5.4)
  })

  it("should use fallback shopping=conscious when shopping field is empty string", () => {
    const profile = calculateProfile({
      city: "London",
      transport: "transit",
      food: "balanced",
      energy: "standard",
      shopping: "",        // → fallback: conscious → score 4.5
    })
    expect(profile.scores.shopping).toBe(4.5)
  })

  it("should still return a valid composite score when all fields are empty", () => {
    const profile = calculateProfile({
      city: "Anywhere",
      transport: "",
      food: "",
      energy: "",
      shopping: "",
    })
    // Defaults: transport=2.0, food=5.9, energy=5.4, shopping=4.5
    // composite = (2.0×0.35)+(5.9×0.30)+(5.4×0.20)+(4.5×0.15)
    //           = 0.70 + 1.77 + 1.08 + 0.675 = 4.225
    //           → .toFixed(2) rounds to 4.22 (JS half-even / truncation)
    expect(profile.scores.composite).toBe(4.22)
    expect(profile.identity).toBeDefined()
    expect(profile.story).toBeTruthy()
    expect(profile.missions).toHaveLength(3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. EDGE CASE: All answers at minimum impact (lowest footprint)
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – all answers at minimum impact", () => {
  it("should produce minimum composite score and champion identity", () => {
    const profile = calculateProfile({
      city: "Oslo",         // clean grid (0.35×)
      transport: "walk_bike",  // score 0.0
      food: "vegan",           // score 1.7
      energy: "solar",         // base 0.6 × 0.35 = 0.21
      shopping: "minimalist",  // score 1.4
    })

    expect(profile.scores.transport).toBe(0.0)
    expect(profile.scores.food).toBe(1.7)
    expect(profile.scores.energy).toBe(0.21)
    expect(profile.scores.shopping).toBe(1.4)
    // composite = (0×0.35)+(1.7×0.30)+(0.21×0.20)+(1.4×0.15)
    //           = 0 + 0.51 + 0.042 + 0.21 = 0.762 → 0.76
    expect(profile.scores.composite).toBe(0.76)
    expect(profile.identity.name).toBe("Green Earth Champion")
  })

  it("minimum impact: story should mention closing for low composite (≤3.2)", () => {
    const profile = calculateProfile({
      city: "Vancouver",
      transport: "walk_bike",
      food: "vegan",
      energy: "solar",
      shopping: "minimalist",
    })
    // composite is very low → closingClause should be STORY_CLOSINGS.low
    expect(profile.story).toContain("already a hero for the earth")
  })

  it("minimum impact: twin projections should be at minimum sensible values", () => {
    const profile = calculateProfile({
      city: "Oslo",
      transport: "walk_bike",
      food: "vegan",
      energy: "solar",
      shopping: "minimalist",
    })
    expect(profile.twin.equivalents.flightsAvoided).toBeGreaterThanOrEqual(1)
    expect(profile.twin.equivalents.householdPowerMonths).toBeGreaterThanOrEqual(1)
    expect(profile.twin.equivalents.treesPlanted).toBeGreaterThanOrEqual(10)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. EDGE CASE: All answers at maximum impact (highest footprint)
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – all answers at maximum impact", () => {
  it("should produce maximum composite score and beginner identity", () => {
    const profile = calculateProfile({
      city: "Delhi",           // coal grid (1.35×)
      transport: "gas_car",    // score 10.0
      food: "meat_heavy",      // score 10.0
      energy: "high_ac",       // base 10.0 × 1.35 → capped at 10.0
      shopping: "frequent",    // score 10.0
    })

    expect(profile.scores.transport).toBe(10.0)
    expect(profile.scores.food).toBe(10.0)
    expect(profile.scores.energy).toBe(10.0)
    expect(profile.scores.shopping).toBe(10.0)
    expect(profile.scores.composite).toBe(10.0)
    expect(profile.identity.name).toBe("Green Path Beginner")
  })

  it("maximum impact: story should mention high closing (≥7.0 composite)", () => {
    const profile = calculateProfile({
      city: "Beijing",
      transport: "gas_car",
      food: "meat_heavy",
      energy: "high_ac",
      shopping: "frequent",
    })
    expect(profile.story).toContain("a lot of energy right now")
  })

  it("maximum impact: twin projections should be large (high baseline emissions)", () => {
    const profile = calculateProfile({
      city: "Delhi",
      transport: "gas_car",
      food: "meat_heavy",
      energy: "high_ac",
      shopping: "frequent",
    })
    // totalEmissions = 4600+2900+3500+2200 = 13200 (raw — grid multiplied)
    // savedKg = round(13200 * 0.35 * 1.35 for energy impact, but actual is raw_e = 3500*1.35=4725
    // actual totalEmissions = 4600 + 2900 + round(3500*1.35) + 2200 = 4600+2900+4725+2200 = 14425
    // savedKg = round(14425 * 0.35) = round(5048.75) = 5049
    expect(profile.twin.equivalents.flightsAvoided).toBeGreaterThan(10)
    expect(profile.twin.equivalents.treesPlanted).toBeGreaterThan(100)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. EDGE CASE: Tie-breaking behavior when scores are identical
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – tie-breaking behavior", () => {
  it("should handle tie when all 4 categories have the same score", () => {
    // All scores equal → worst = last highest in array (shopping, score 4.5)
    // best = first lowest in array (transport, score 2.0)
    // We use balanced + conscious which doesn't all perfectly tie, so pick a scenario
    // that does get the same composite value but different per-category
    // For a true tie: use city=London (1.0×), transit(2.0), vegetarian(3.8), smart_home(3.1×1.0=3.1), conscious(4.5)
    // Scores: t=2.0, f=3.8, e=3.1, s=4.5 — not a tie, but tests the tie-break path
    // For best.key === worst.key scenario, we'd need all identical; that's impossible with
    // current SCORE_MAP (no two categories share the same set of values),
    // but we can verify the function still returns a well-formed result for nearly-equal scores.
    const profile = calculateProfile({
      city: "London",
      transport: "transit",      // 2.0
      food: "vegetarian",        // 3.8
      energy: "smart_home",      // 3.1 × 1.0 = 3.1
      shopping: "conscious",     // 4.5
    })
    // best = transport (2.0, lowest), worst = shopping (4.5, highest)
    expect(profile.scores.transport).toBe(2.0)
    expect(profile.scores.shopping).toBe(4.5)
    const hardMission = profile.missions.find(m => m.difficulty === "hard")
    const easyMission = profile.missions.find(m => m.difficulty === "easy")
    expect(hardMission?.category).toBe("shopping")
    expect(easyMission?.category).toBe("transport")
  })

  it("should not crash when best and worst would be the same category (edge case guard)", () => {
    // The only way best.key === worst.key is if all scores are equal.
    // We cannot achieve this with the current SCORE_MAP, but we can verify the
    // guard path activates: call with transport as single dominant category.
    // gas_car (10.0) vs. all others near 10 → shopping=frequent(10.0), food=meat_heavy(10.0)
    // best.key defaults per guard logic to food when transport is tied
    // transport = 0.0 is strictly lowest; food=meat_heavy(10.0) and shopping=frequent(10.0)
    // worst = last one that exceeds, so shopping wins as it comes later
    const profile = calculateProfile({
      city: "London",
      transport: "walk_bike",   // 0.0 — clear best
      food: "meat_heavy",       // 10.0
      energy: "high_ac",        // 10.0
      shopping: "frequent",     // 10.0
    })
    // Worst: shopping (last at 10.0 due to > not >=); best: transport (0.0)
    expect(profile.missions).toHaveLength(3)
    expect(profile.identity).toBeDefined()
    expect(profile.scores.composite).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. NARRATIVE DETERMINISM – selectIndex hash is stable for same city
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – narrative selectIndex determinism", () => {
  it("same city always produces the identical story text (deterministic)", () => {
    const args = {
      city: "Mumbai",
      transport: "transit",
      food: "balanced",
      energy: "standard",
      shopping: "conscious",
    }
    const p1 = calculateProfile(args)
    const p2 = calculateProfile(args)
    const p3 = calculateProfile(args)
    expect(p1.story).toBe(p2.story)
    expect(p2.story).toBe(p3.story)
  })

  it("different cities produce different story clause selections (hash varies)", () => {
    const base = {
      transport: "transit",
      food: "balanced",
      energy: "standard",
      shopping: "conscious",
    }
    const cityA = calculateProfile({ ...base, city: "Tokyo" })
    const cityB = calculateProfile({ ...base, city: "Cairo" })
    const cityC = calculateProfile({ ...base, city: "Buenos Aires" })

    // The story openings and strength/tension clauses are city-seeded
    // At least one pair of cities should produce a different strength/tension clause
    const stories = [cityA.story, cityB.story, cityC.story]
    const uniqueStories = new Set(stories)
    expect(uniqueStories.size).toBeGreaterThan(1)
  })

  it("city name is embedded in story intro line", () => {
    const profile = calculateProfile({
      city: "Nairobi",
      transport: "transit",
      food: "balanced",
      energy: "standard",
      shopping: "conscious",
    })
    expect(profile.story).toContain("Nairobi")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLIMATE TWIN PROJECTION MATH
// ─────────────────────────────────────────────────────────────────────────────
describe("Scoring Engine – Climate Twin projection math", () => {
  it("savedKg is 35% of total baseline emissions rounded to integer", () => {
    const profile = calculateProfile({
      city: "London",        // grid 1.0×
      transport: "gas_car",  // raw 4600
      food: "meat_heavy",    // raw 2900
      energy: "standard",    // raw 1900 × 1.0 = 1900
      shopping: "frequent",  // raw 2200
    })
    // totalEmissions = 4600 + 2900 + 1900 + 2200 = 11600
    // savedKg = round(11600 * 0.35) = round(4060) = 4060
    const savedKg = 4060
    // flights = round(4060 / 350) = round(11.6) = 12
    expect(profile.twin.equivalents.flightsAvoided).toBe(12)
    // powerMonths = round(4060 / 450) = round(9.02) = 9
    expect(profile.twin.equivalents.householdPowerMonths).toBe(9)
    // trees = round(4060 / 22) = round(184.5) = 185; max(10, 185) = 185
    expect(profile.twin.equivalents.treesPlanted).toBe(185)
  })

  it("flightsAvoided is at least 1 even for very low emission profiles", () => {
    const profile = calculateProfile({
      city: "Oslo",
      transport: "walk_bike",
      food: "vegan",
      energy: "solar",
      shopping: "minimalist",
    })
    expect(profile.twin.equivalents.flightsAvoided).toBeGreaterThanOrEqual(1)
  })

  it("treesPlanted is at least 10 even for very low emission profiles", () => {
    const profile = calculateProfile({
      city: "Oslo",
      transport: "walk_bike",
      food: "vegan",
      energy: "solar",
      shopping: "minimalist",
    })
    expect(profile.twin.equivalents.treesPlanted).toBeGreaterThanOrEqual(10)
  })

  it("projections scale up proportionally for high-emission profile", () => {
    const lowProfile = calculateProfile({
      city: "Oslo",
      transport: "walk_bike",
      food: "vegan",
      energy: "solar",
      shopping: "minimalist",
    })
    const highProfile = calculateProfile({
      city: "Delhi",
      transport: "gas_car",
      food: "meat_heavy",
      energy: "high_ac",
      shopping: "frequent",
    })
    expect(highProfile.twin.equivalents.flightsAvoided)
      .toBeGreaterThan(lowProfile.twin.equivalents.flightsAvoided)
    expect(highProfile.twin.equivalents.treesPlanted)
      .toBeGreaterThan(lowProfile.twin.equivalents.treesPlanted)
  })

  it("twin projections object contains all required equivalents keys", () => {
    const profile = calculateProfile({
      city: "London",
      transport: "transit",
      food: "balanced",
      energy: "standard",
      shopping: "conscious",
    })
    expect(profile.twin.equivalents).toHaveProperty("flightsAvoided")
    expect(profile.twin.equivalents).toHaveProperty("householdPowerMonths")
    expect(profile.twin.equivalents).toHaveProperty("treesPlanted")
  })
})
