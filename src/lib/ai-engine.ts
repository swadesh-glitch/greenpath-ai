export interface OnboardingAnswers {
  city: string
  transport: string
  food: string
  shopping: string
  energy: string
  name?: string
}

export interface GeneratedIdentity {
  name: string
  description: string
  strength: string
  opportunity: string
}

export interface ClimateTwinData {
  currentProjection: string
  improvedProjection: string
  equivalents: {
    flightsAvoided: number
    householdPowerMonths: number
    treesPlanted: number
  }
}

export interface AIMission {
  id: string
  title: string
  description: string
  category: "transport" | "energy" | "food" | "waste" | "shopping"
  points: number
  co2SavingsKg: number
  difficulty: "easy" | "medium" | "hard"
  frequency: "daily" | "weekly" | "one-time"
  completed?: boolean
  reasoning?: string
}

export async function generateClimateProfile(answers: OnboardingAnswers): Promise<{
  identity: GeneratedIdentity
  story: string
  twin: ClimateTwinData
  missions: AIMission[]
}> {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: answers.name || "Eco Warrior",
      city: answers.city,
      transport: answers.transport,
      food: answers.food,
      shopping: answers.shopping,
      energy: answers.energy,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate climate profile from server")
  }

  const result = await response.json()
  return result.profile
}
