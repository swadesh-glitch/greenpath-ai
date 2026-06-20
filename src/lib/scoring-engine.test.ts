import { describe, it, expect } from "vitest"
import { calculateProfile } from "./scoring-engine"

describe("Scoring Engine - calculateProfile", () => {
  it("should calculate composite score correctly for a high-emission profile in Delhi", () => {
    const profile = calculateProfile({
      city: "Delhi",
      transport: "gas_car", // score 10.0
      food: "meat_heavy", // score 10.0
      energy: "high_ac", // base 10.0 * 1.35 (Delhi) -> maxed at 10.0
      shopping: "frequent", // score 10.0
    })

    expect(profile.scores.transport).toBe(10.0)
    expect(profile.scores.food).toBe(10.0)
    expect(profile.scores.energy).toBe(10.0)
    expect(profile.scores.shopping).toBe(10.0)
    expect(profile.scores.composite).toBe(10.0)
    expect(profile.identity.name).toBe("Green Path Beginner")
    expect(profile.identity.description).toContain("Delhi")
  })

  it("should calculate composite score and yield Thriving Green Sanctuary Citizen for low emissions in Seattle", () => {
    const profile = calculateProfile({
      city: "Seattle",
      transport: "walk_bike", // score 0.0
      food: "vegan", // score 1.7
      energy: "solar", // base 0.6 * 0.35 (Seattle) = 0.21
      shopping: "minimalist", // score 1.4
    })

    // composite calculation:
    // (0.0 * 0.35) + (1.7 * 0.3) + (0.21 * 0.2) + (1.4 * 0.15) = 0 + 0.51 + 0.042 + 0.21 = 0.762 -> 0.76
    expect(profile.scores.composite).toBe(0.76)
    expect(profile.identity.name).toBe("Green Earth Champion")
    expect(profile.identity.description).toContain("Seattle")
  })

  it("should apply grid modifiers correctly for standard cities", () => {
    const profileStandard = calculateProfile({
      city: "London", // standard grid (1.0x)
      transport: "transit", // 2.0
      food: "balanced", // 5.9
      energy: "standard", // base 5.4 * 1.0 = 5.4
      shopping: "conscious", // 4.5
    })

    expect(profileStandard.scores.energy).toBe(5.4)
  })

  it("should apply grid modifiers correctly for low-intensity grid cities (e.g. Oslo)", () => {
    const profileOslo = calculateProfile({
      city: "Oslo", // low grid (0.35x)
      transport: "transit",
      food: "balanced",
      energy: "standard", // base 5.4 * 0.35 = 1.89
      shopping: "conscious",
    })

    expect(profileOslo.scores.energy).toBe(1.89)
  })

  it("should assign dynamic signature missions correctly based on strengths and opportunities", () => {
    const profile = calculateProfile({
      city: "Sydney", // high grid (1.35x)
      transport: "walk_bike", // best (score 0.0) -> strength is transport
      food: "balanced", // score 5.9
      energy: "standard", // 5.4 * 1.35 = 7.29
      shopping: "frequent", // worst (score 10.0) -> opportunity is shopping
    })

    // Opportunity: shopping. Strength: transport.
    // Recommended hard & medium missions should target shopping
    // Recommended easy mission should target transport
    expect(profile.missions).toHaveLength(3)

    const hardMission = profile.missions.find((m) => m.difficulty === "hard")
    const mediumMission = profile.missions.find((m) => m.difficulty === "medium")
    const easyMission = profile.missions.find((m) => m.difficulty === "easy")

    expect(hardMission?.category).toBe("shopping")
    expect(mediumMission?.category).toBe("shopping")
    expect(easyMission?.category).toBe("transport")

    expect(hardMission?.reasoning).toContain("targets your highest energy-use area")
    expect(easyMission?.reasoning).toContain("Built to keep up your awesome habits")
  })
})
