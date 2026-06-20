import { NextRequest, NextResponse } from "next/server"
import { calculateProfile } from "@/lib/scoring-engine"
import { z } from "zod"

// ─────────────────────────────────────────────
// Input Validation Schema with Zod
// ─────────────────────────────────────────────
const OnboardingAnswersSchema = z.object({
  name: z.string().min(1, "Name is required").max(40, "Name must not exceed 40 characters"),
  city: z.string().min(1, "City is required").max(60, "City must not exceed 60 characters"),
  transport: z.enum(["gas_car", "electric_car", "transit", "walk_bike"]),
  food: z.enum(["meat_heavy", "balanced", "vegetarian", "vegan"]),
  shopping: z.enum(["minimalist", "conscious", "frequent"]),
  energy: z.enum(["smart_home", "solar", "standard", "high_ac"]),
})

// Simple HTML escaping helper to prevent XSS injection
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

export async function POST(request: NextRequest) {
  try {
    // 1. Cap request body length to prevent heavy buffer overload attacks
    const contentLength = Number(request.headers.get("content-length") || "0")
    if (contentLength > 5000) {
      return NextResponse.json({ error: "Request payload too large" }, { status: 413 })
    }

    const body = await request.json()

    // 2. Schema structure validation using Zod
    const result = OnboardingAnswersSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid onboarding answers structure", details: result.error.issues },
        { status: 400 }
      )
    }

    const { name, city, transport, food, shopping, energy } = result.data

    // 3. Trim and Escape user input fields to prevent XSS / script injections
    const sanitizedName = escapeHtml(name.trim())
    const sanitizedCity = escapeHtml(city.trim())

    // 4. Execute calculations in our rule-based scoring engine
    const profile = calculateProfile({
      city: sanitizedCity,
      transport,
      food,
      shopping,
      energy,
    })

    return NextResponse.json({
      name: sanitizedName,
      profile,
    })
  } catch {
    return NextResponse.json({ error: "Server error processing climate profile" }, { status: 500 })
  }
}
