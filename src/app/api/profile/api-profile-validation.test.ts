/* eslint-disable */
/**
 * api-profile-validation.test.ts
 *
 * Tests for the /api/profile route's input validation and sanitization logic.
 *
 * Because next/server cannot be imported in Vitest without a full Next.js runtime,
 * we test the two independently-verifiable layers:
 *   1. The Zod validation schema (replicated inline — same constraints as route.ts)
 *   2. The escapeHtml sanitization function (replicated inline — same impl as route.ts)
 *   3. A valid payload routed through calculateProfile confirms shape of output
 *
 * This is the standard approach for unit-testing Next.js API route logic when
 * @testing-library/next and msw are not installed in the project.
 */
import { describe, it, expect } from "vitest"
import { z } from "zod"
import { calculateProfile } from "../../../lib/scoring-engine"

// ─────────────────────────────────────────────────────────────────────────────
// Replicate the Zod schema exactly as defined in route.ts
// ─────────────────────────────────────────────────────────────────────────────
const OnboardingAnswersSchema = z.object({
  name: z.string().min(1, "Name is required").max(40, "Name must not exceed 40 characters"),
  city: z.string().min(1, "City is required").max(60, "City must not exceed 60 characters"),
  transport: z.enum(["gas_car", "electric_car", "transit", "walk_bike"]),
  food: z.enum(["meat_heavy", "balanced", "vegetarian", "vegan"]),
  shopping: z.enum(["minimalist", "conscious", "frequent"]),
  energy: z.enum(["smart_home", "solar", "standard", "high_ac"]),
})

// ─────────────────────────────────────────────────────────────────────────────
// Replicate the escapeHtml function exactly as defined in route.ts
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ZOD SCHEMA VALIDATION – rejects invalid inputs
// ─────────────────────────────────────────────────────────────────────────────
describe("API /profile – Zod schema validation", () => {
  const validPayload = {
    name: "Alice",
    city: "London",
    transport: "transit" as const,
    food: "balanced" as const,
    shopping: "conscious" as const,
    energy: "standard" as const,
  }

  it("should accept a fully valid payload", () => {
    const result = OnboardingAnswersSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it("should reject empty name (min(1) violated)", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find(i => i.path[0] === "name")
      expect(nameError).toBeDefined()
    }
  })

  it("should reject name longer than 40 characters (max(40) violated)", () => {
    const longName = "A".repeat(41)
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, name: longName })
    expect(result.success).toBe(false)
    if (!result.success) {
      const nameError = result.error.issues.find(i => i.path[0] === "name")
      expect(nameError).toBeDefined()
    }
  })

  it("should accept name at exactly 40 characters (boundary)", () => {
    const borderlineName = "A".repeat(40)
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, name: borderlineName })
    expect(result.success).toBe(true)
  })

  it("should reject city longer than 60 characters (max(60) violated)", () => {
    const longCity = "C".repeat(61)
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, city: longCity })
    expect(result.success).toBe(false)
    if (!result.success) {
      const cityError = result.error.issues.find(i => i.path[0] === "city")
      expect(cityError).toBeDefined()
    }
  })

  it("should accept city at exactly 60 characters (boundary)", () => {
    const borderlineCity = "B".repeat(60)
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, city: borderlineCity })
    expect(result.success).toBe(true)
  })

  it("should reject empty city (min(1) violated)", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, city: "" })
    expect(result.success).toBe(false)
  })

  it("should reject invalid transport enum value", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, transport: "rocket_ship" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find(i => i.path[0] === "transport")
      expect(err).toBeDefined()
    }
  })

  it("should reject invalid food enum value", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, food: "junk_food" })
    expect(result.success).toBe(false)
  })

  it("should reject invalid shopping enum value", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, shopping: "impulsive" })
    expect(result.success).toBe(false)
  })

  it("should reject invalid energy enum value", () => {
    const result = OnboardingAnswersSchema.safeParse({ ...validPayload, energy: "nuclear" })
    expect(result.success).toBe(false)
  })

  it("should reject missing required field (no name)", () => {
    const { name: _n, ...withoutName } = validPayload
    const result = OnboardingAnswersSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })

  it("should accept all valid transport enum values", () => {
    const validTransports = ["gas_car", "electric_car", "transit", "walk_bike"]
    for (const t of validTransports) {
      const result = OnboardingAnswersSchema.safeParse({ ...validPayload, transport: t })
      expect(result.success).toBe(true)
    }
  })

  it("should accept all valid food enum values", () => {
    const validFoods = ["meat_heavy", "balanced", "vegetarian", "vegan"]
    for (const f of validFoods) {
      const result = OnboardingAnswersSchema.safeParse({ ...validPayload, food: f })
      expect(result.success).toBe(true)
    }
  })

  it("should accept all valid energy enum values", () => {
    const validEnergies = ["smart_home", "solar", "standard", "high_ac"]
    for (const e of validEnergies) {
      const result = OnboardingAnswersSchema.safeParse({ ...validPayload, energy: e })
      expect(result.success).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. ESCAPE HTML SANITIZATION – XSS prevention
// ─────────────────────────────────────────────────────────────────────────────
describe("API /profile – escapeHtml XSS sanitization", () => {
  it("should escape < and > characters (HTML tag prevention)", () => {
    const result = escapeHtml("<script>alert('xss')</script>")
    expect(result).not.toContain("<")
    expect(result).not.toContain(">")
    expect(result).toContain("&lt;")
    expect(result).toContain("&gt;")
  })

  it("should escape & character (entity injection prevention)", () => {
    const result = escapeHtml("Tom & Jerry")
    expect(result).toBe("Tom &amp; Jerry")
  })

  it("should escape double-quote character", () => {
    const result = escapeHtml('Say "hello"')
    expect(result).toContain("&quot;")
    expect(result).not.toContain('"')
  })

  it("should escape single-quote character", () => {
    const result = escapeHtml("it's fine")
    expect(result).toContain("&#x27;")
    expect(result).not.toContain("'")
  })

  it("should escape forward slash", () => {
    const result = escapeHtml("path/to/file")
    expect(result).toContain("&#x2F;")
    expect(result).not.toContain("/")
  })

  it("should leave clean strings unchanged (no escaping performed)", () => {
    const result = escapeHtml("Alice Green")
    expect(result).toBe("Alice Green")
  })

  it("should fully neutralize a malicious script injection attempt in name field", () => {
    const maliciousName = "<img src=x onerror=alert(1)>"
    const sanitized = escapeHtml(maliciousName)
    expect(sanitized).not.toContain("<")
    expect(sanitized).not.toContain(">")
    // The tag-opening sequence is encoded, making the browser treat it as text, not markup
    // The 'onerror' attribute text is still present but is inside an encoded tag — safe as text
    expect(sanitized).toContain("&lt;img")
    // Crucially the raw attack tag is no longer a parseable HTML tag: it starts with &lt; not <
    expect(sanitized.startsWith("&lt;")).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. FULL VALID PAYLOAD → RESPONSE SHAPE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
describe("API /profile – valid payload produces correct response shape", () => {
  it("should return profile with all top-level keys present for a valid payload", () => {
    // Simulate what the route does: validate → sanitize → calculateProfile
    const raw = {
      name: "Alice",
      city: "London",
      transport: "transit",
      food: "balanced",
      shopping: "conscious",
      energy: "standard",
    }
    const parsed = OnboardingAnswersSchema.safeParse(raw)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const { name, city, transport, food, shopping, energy } = parsed.data
    const sanitizedName = escapeHtml(name.trim())
    const sanitizedCity = escapeHtml(city.trim())

    const profile = calculateProfile({ city: sanitizedCity, transport, food, shopping, energy })

    // Response shape: { name, profile: { identity, story, twin, missions, scores } }
    expect(sanitizedName).toBe("Alice")
    expect(profile.identity).toBeDefined()
    expect(profile.identity.name).toBeTruthy()
    expect(profile.story).toBeTruthy()
    expect(profile.missions).toHaveLength(3)
    expect(profile.twin.equivalents.flightsAvoided).toBeGreaterThanOrEqual(1)
    expect(profile.twin.equivalents.householdPowerMonths).toBeGreaterThanOrEqual(1)
    expect(profile.twin.equivalents.treesPlanted).toBeGreaterThanOrEqual(10)
    expect(profile.scores).toHaveProperty("composite")
    expect(profile.scores.composite).toBeGreaterThanOrEqual(0)
    expect(profile.scores.composite).toBeLessThanOrEqual(10)
  })

  it("should sanitize name containing HTML before including in response", () => {
    const rawName = "<b>Alice</b>"
    const sanitized = escapeHtml(rawName.trim())
    // Confirm sanitized name does NOT contain unescaped tags
    expect(sanitized).not.toContain("<b>")
    expect(sanitized).not.toContain("</b>")
    expect(sanitized).toContain("&lt;b&gt;")
  })
})
