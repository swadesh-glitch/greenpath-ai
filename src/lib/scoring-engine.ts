import { OnboardingAnswers, GeneratedIdentity, ClimateTwinData, AIMission } from "./ai-engine"

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────
export interface ScoredProfile {
  identity: GeneratedIdentity
  story: string
  twin: ClimateTwinData
  missions: AIMission[]
  scores: {
    transport: number
    food: number
    energy: number
    shopping: number
    composite: number
  }
}

// Category identifiers
export type CategoryKey = "transport" | "food" | "energy" | "shopping"

// ─────────────────────────────────────────────
// Raw Lifecycle Carbon Emissions (kg CO2/year)
// ─────────────────────────────────────────────
const EMISSIONS_MAP = {
  transport: {
    walk_bike: 0,
    transit: 900,
    electric_car: 1800,
    gas_car: 4600,
  },
  food: {
    vegan: 500,
    vegetarian: 1100,
    balanced: 1700,
    meat_heavy: 2900,
  },
  energy: {
    solar: 200,
    smart_home: 1100,
    standard: 1900,
    high_ac: 3500,
  },
  shopping: {
    minimalist: 300,
    conscious: 1000,
    frequent: 2200,
  },
}

// ─────────────────────────────────────────────
// Normalized Carbon Impact Scores (0.0 to 10.0)
// ─────────────────────────────────────────────
const SCORE_MAP = {
  transport: {
    walk_bike: 0.0,
    transit: 2.0,
    electric_car: 3.9,
    gas_car: 10.0,
  },
  food: {
    vegan: 1.7,
    vegetarian: 3.8,
    balanced: 5.9,
    meat_heavy: 10.0,
  },
  energy: {
    solar: 0.6,
    smart_home: 3.1,
    standard: 5.4,
    high_ac: 10.0,
  },
  shopping: {
    minimalist: 1.4,
    conscious: 4.5,
    frequent: 10.0,
  },
}

// Category Display Names
const CATEGORY_NAMES: Record<CategoryKey, string> = {
  transport: "travel choices",
  food: "food choices",
  energy: "home energy",
  shopping: "shopping habits",
}

// ─────────────────────────────────────────────
// Dynamic Identity Title Elements
// ─────────────────────────────────────────────
const STRENGTH_TITLES: Record<CategoryKey, string> = {
  transport: "Green Commuter",
  food: "Veggie Lover",
  energy: "Smart Power Saver",
  shopping: "Eco Shopper",
}

const OPPORTUNITY_AUDITORS: Record<CategoryKey, string> = {
  transport: "Carbon Explorer",
  food: "Food Improver",
  energy: "Power Explorer",
  shopping: "Waste Reducer",
}

// ─────────────────────────────────────────────
// AI-Signature Missions Pool
// ─────────────────────────────────────────────
interface TemplateMission {
  title: string
  description: string
  points: number
  co2SavingsKg: number
  difficulty: "easy" | "medium" | "hard"
  frequency: "daily" | "weekly" | "one-time"
}

const MISSION_POOL: Record<CategoryKey, Record<"easy" | "medium" | "hard", TemplateMission>> = {
  transport: {
    easy: {
      title: "Carpool Commute",
      description: "Share a ride or carpool to school or work today instead of driving alone.",
      points: 25,
      co2SavingsKg: 1.5,
      difficulty: "easy",
      frequency: "daily",
    },
    medium: {
      title: "Public Transit Day",
      description: "Commute entirely via public bus, train, or subway lines today.",
      points: 45,
      co2SavingsKg: 3.8,
      difficulty: "medium",
      frequency: "daily",
    },
    hard: {
      title: "Active Transit Challenge",
      description: "Cycle, walk, or jog for all local transport trips under 5km this week.",
      points: 65,
      co2SavingsKg: 7.2,
      difficulty: "hard",
      frequency: "weekly",
    },
  },
  food: {
    easy: {
      title: "One Meatless Lunch",
      description: "Swap out poultry, pork, or beef in your next lunch plate for grains and beans.",
      points: 25,
      co2SavingsKg: 1.2,
      difficulty: "easy",
      frequency: "daily",
    },
    medium: {
      title: "Zero-Waste Plant Meal",
      description: "Prepare an organic, entirely vegan home meal utilizing leftover kitchen stocks.",
      points: 45,
      co2SavingsKg: 2.8,
      difficulty: "medium",
      frequency: "daily",
    },
    hard: {
      title: "Locally Sourced Week",
      description: "Source 100% of your food items from local farmers markets with zero plastic wrap for 7 days.",
      points: 65,
      co2SavingsKg: 5.8,
      difficulty: "hard",
      frequency: "weekly",
    },
  },
  energy: {
    easy: {
      title: "Kill Vampire Power",
      description: "Unplug standby electronics, monitors, and chargers before going to sleep.",
      points: 25,
      co2SavingsKg: 0.8,
      difficulty: "easy",
      frequency: "daily",
    },
    medium: {
      title: "Thermostat Setback",
      description: "Adjust heating down or cooling up by 2°C today to shave grid load.",
      points: 45,
      co2SavingsKg: 2.5,
      difficulty: "medium",
      frequency: "daily",
    },
    hard: {
      title: "Peak Grid Reduction",
      description: "Avoid using high-draw appliances (dryers, dishwashers) during peak hours (5 PM - 9 PM) all week.",
      points: 65,
      co2SavingsKg: 6.0,
      difficulty: "hard",
      frequency: "weekly",
    },
  },
  shopping: {
    easy: {
      title: "Reusable Bag Routine",
      description: "Avoid single-use plastic carrier wraps by bringing canvas bags to all shops.",
      points: 25,
      co2SavingsKg: 0.5,
      difficulty: "easy",
      frequency: "daily",
    },
    medium: {
      title: "Second-Hand Swap",
      description: "Find pre-owned alternatives for clothing, books, or electronics instead of buying new.",
      points: 45,
      co2SavingsKg: 2.2,
      difficulty: "medium",
      frequency: "one-time",
    },
    hard: {
      title: "Zero Packaging Sourcing",
      description: "Strictly avoid purchasing dry products packaged in plastic boxes or wraps this week.",
      points: 65,
      co2SavingsKg: 5.0,
      difficulty: "hard",
      frequency: "weekly",
    },
  },
}

// ─────────────────────────────────────────────
// Composable Narrative Template Pools
// ─────────────────────────────────────────────
const STORY_STRENGTHS: Record<CategoryKey, string[]> = {
  transport: [
    "Walking or biking keeps your travel footprint at zero.",
    "Walking and cycling keeps the air clean and is great for you.",
    "Getting around without a car saves energy and helps clean city air."
  ],
  food: [
    "Your food choices help avoid high-emissions meat production.",
    "Eating plants saves forest space and helps protect clean water.",
    "Choosing healthy, plant-based foods is a direct win for nature."
  ],
  energy: [
    "Using energy-smart systems helps save power in your city.",
    "Using solar power keeps your home footprint close to zero.",
    "Unplugging electronics when not in use stops power waste."
  ],
  shopping: [
    "Buying only what you need stops packaging waste and reduces factory loads.",
    "Choosing eco-friendly and second-hand items keeps waste out of landfills.",
    "Mindful shopping helps reduce the raw materials we take from the earth."
  ]
}

const STORY_TENSIONS: Record<CategoryKey, string[]> = {
  transport: [
    "However, regular driving adds a heavy smoke footprint to the sky.",
    "However, driving a gas car alone burns a lot of fuel.",
    "However, your travel habits are the biggest source of energy use in your profile."
  ],
  food: [
    "However, eating meat frequently uses a high amount of land and water resources.",
    "However, regular meat and dairy meals add up to a heavy food footprint.",
    "However, food choices are the main area where you could save more energy."
  ],
  energy: [
    "At the same time, running the heater or AC pulls a lot of power from the city grid.",
    "At the same time, standard home power relies heavily on fossil fuels.",
    "At the same time, plugged-in electronics continuously leak power when not in use."
  ],
  shopping: [
    "On the other hand, frequent shopping deliveries create a lot of shipping emissions and packaging waste.",
    "On the other hand, buying new items often causes factories to produce and ship more.",
    "On the other hand, single-use items add up fast in local trash dumps."
  ]
}

const STORY_CLOSINGS = {
  low: "With an amazing green score, you are already a hero for the earth! Just focus on small steps to keep the balance.",
  medium: "You have great daily habits! Focus on a few easy improvements to make an even bigger difference.",
  high: "Your habits use a lot of energy right now. Making a few simple, daily shifts will help save a huge amount of power over time."
}

// Helper to pick stable index from string
function selectIndex<T>(arr: T[], textSeed: string): number {
  let hash = 0
  for (let i = 0; i < textSeed.length; i++) {
    hash = textSeed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % arr.length
}

// ─────────────────────────────────────────────
// Main Scoring Engine Execution
// ─────────────────────────────────────────────
export function calculateProfile(answers: OnboardingAnswers): ScoredProfile {
  const city = answers.city.trim() || "your city"
  const transportKey = (answers.transport || "transit") as keyof typeof SCORE_MAP.transport
  const foodKey = (answers.food || "balanced") as keyof typeof SCORE_MAP.food
  const energyKey = (answers.energy || "standard") as keyof typeof SCORE_MAP.energy
  const shoppingKey = (answers.shopping || "conscious") as keyof typeof SCORE_MAP.shopping

  // 1. Calculate Grid Intensity Modifier based on city name
  const cityLower = city.toLowerCase()
  let gridMultiplier = 1.0
  let gridContext = "standard city power"

  if (
    cityLower.includes("delhi") ||
    cityLower.includes("mumbai") ||
    cityLower.includes("beijing") ||
    cityLower.includes("sydney") ||
    cityLower.includes("johannesburg")
  ) {
    gridMultiplier = 1.35
    gridContext = "coal-heavy city power grid"
  } else if (
    cityLower.includes("seattle") ||
    cityLower.includes("oslo") ||
    cityLower.includes("vancouver") ||
    cityLower.includes("stockholm") ||
    cityLower.includes("copenhagen")
  ) {
    gridMultiplier = 0.35
    gridContext = "clean wind and water power grid"
  }

  // 2. Fetch Raw and Normalized Scores
  const s_t = SCORE_MAP.transport[transportKey] ?? 2.0
  const s_f = SCORE_MAP.food[foodKey] ?? 5.9
  const s_e_base = SCORE_MAP.energy[energyKey] ?? 5.4
  const s_e = Math.min(10.0, s_e_base * gridMultiplier)
  const s_s = SCORE_MAP.shopping[shoppingKey] ?? 4.5

  const raw_t = EMISSIONS_MAP.transport[transportKey] ?? 900
  const raw_f = EMISSIONS_MAP.food[foodKey] ?? 1700
  const raw_e_base = EMISSIONS_MAP.energy[energyKey] ?? 1900
  const raw_e = Math.round(raw_e_base * gridMultiplier)
  const raw_s = EMISSIONS_MAP.shopping[shoppingKey] ?? 1000

  // 3. Compute Composite Impact Index (C) (0.0 to 10.0 scale)
  const composite = Number(((s_t * 0.35) + (s_f * 0.30) + (s_e * 0.20) + (s_s * 0.15)).toFixed(2))
  const totalEmissionsKg = raw_t + raw_f + raw_e + raw_s

  // 4. Identify Best (Strength) and Worst (Opportunity) Categories
  const categoryScores: { key: CategoryKey; score: number }[] = [
    { key: "transport", score: s_t },
    { key: "food", score: s_f },
    { key: "energy", score: s_e },
    { key: "shopping", score: s_s },
  ]

  // Rank: higher score is worse (Opportunity), lower score is better (Strength)
  // Tie-breaker: keep the original array order (Transport > Food > Energy > Shopping)
  let best = categoryScores[0]
  let worst = categoryScores[0]

  for (let i = 1; i < categoryScores.length; i++) {
    if (categoryScores[i].score < best.score) {
      best = categoryScores[i]
    }
    // Greater or equal to prioritize later categories or resolve ties logically
    if (categoryScores[i].score > worst.score) {
      worst = categoryScores[i]
    }
  }

  // Edge case: if best and worst are the same category, pick default secondary
  if (best.key === worst.key) {
    if (best.key === "transport") {
      best = { key: "food", score: s_f }
    } else {
      best = { key: "transport", score: s_t }
    }
  }

  // 5. Compose Identity Name & Description
  const bestTitle = STRENGTH_TITLES[best.key]
  const worstAuditor = OPPORTUNITY_AUDITORS[worst.key]

  let identityName = `${bestTitle} & ${worstAuditor}`
  let desc = `You are a star at helping the earth with your ${CATEGORY_NAMES[best.key]}! You also have a great chance to save energy in your ${CATEGORY_NAMES[worst.key]} in ${city}.`

  // Override title for extreme bounds
  if (composite <= 1.8) {
    identityName = "Green Earth Champion"
    desc = `Amazing! You are doing an incredible job helping the planet. Your daily habits are a wonderful example for everyone in ${city}.`
  } else if (composite >= 8.5) {
    identityName = "Green Path Beginner"
    desc = `You have a great opportunity to make a big difference! Changing a few simple habits in how you travel or eat in ${city} will help the planet a lot.`
  }

  // Strength/opportunity statements
  const strengthStatement = `You do an amazing job saving energy with your ${CATEGORY_NAMES[best.key]}!`
  const opportunityStatement = `A simple change in your ${CATEGORY_NAMES[worst.key]} can help the earth a lot.`

  const identity: GeneratedIdentity = {
    name: identityName,
    description: desc,
    strength: strengthStatement,
    opportunity: opportunityStatement,
  }

  // 6. Compose Carbon Story using Clauses
  const introVariant = `Living in ${city}, your home is powered by a ${gridContext}. `
  
  const strengthIndex = selectIndex(STORY_STRENGTHS[best.key], city + best.key)
  const strengthClause = STORY_STRENGTHS[best.key][strengthIndex] + " "

  const tensionIndex = selectIndex(STORY_TENSIONS[worst.key], city + worst.key)
  const tensionClause = STORY_TENSIONS[worst.key][tensionIndex] + " "

  let closingClause = STORY_CLOSINGS.medium
  if (composite <= 3.2) {
    closingClause = STORY_CLOSINGS.low
  } else if (composite >= 7.0) {
    closingClause = STORY_CLOSINGS.high
  }

  const story = `${introVariant}Your annual environmental footprint is estimated at ${(totalEmissionsKg / 1000).toFixed(1)} tons of carbon. ${strengthClause}${tensionClause}${closingClause}`

  // 7. Calculate Projections & Relatable Examples
  // Target: reduce overall baseline by 35%
  const savedKg = Math.round(totalEmissionsKg * 0.35)

  // scientific conversion metrics
  const flights = Math.max(1, Math.round(savedKg / 350)) // ~350kg per flight
  const powerMonths = Math.max(1, Math.round(savedKg / 450)) // ~450kg per home power month
  const trees = Math.max(10, Math.round(savedKg / 22)) // ~22kg per tree-year

  const twin: ClimateTwinData = {
    currentProjection: `If you keep your current ${CATEGORY_NAMES[worst.key]} habits, you will continue to use a high amount of energy.`,
    improvedProjection: `By finishing these fun challenges, you will save ${savedKg} kg of carbon every year, keeping our skies blue and our earth healthy!`,
    equivalents: {
      flightsAvoided: flights,
      householdPowerMonths: powerMonths,
      treesPlanted: trees,
    },
  }

  // 8. Dynamic Mission Selection (Ranked by Worst Category)
  // Surfaced signature missions: 1 Easy, 1 Medium, 1 Hard.
  // 1 Hard mission from the Worst Category.
  // 1 Medium mission from the Worst Category.
  // 1 Easy mission from the Best Category.
  const signatureMissions: AIMission[] = []
  const timestamp = Date.now()

  // Worst category Hard mission
  const worstHardTemplate = MISSION_POOL[worst.key].hard
  signatureMissions.push({
    id: `sig_m_hard_${timestamp}`,
    title: worstHardTemplate.title,
    description: worstHardTemplate.description,
    category: worst.key,
    points: worstHardTemplate.points,
    co2SavingsKg: worstHardTemplate.co2SavingsKg,
    difficulty: "hard",
    frequency: worstHardTemplate.frequency,
    completed: false,
    reasoning: `Recommended: This targets your highest energy-use area (${CATEGORY_NAMES[worst.key]}) for maximum impact.`,
  })

  // Worst category Medium mission
  const worstMediumTemplate = MISSION_POOL[worst.key].medium
  signatureMissions.push({
    id: `sig_m_med_${timestamp}`,
    title: worstMediumTemplate.title,
    description: worstMediumTemplate.description,
    category: worst.key,
    points: worstMediumTemplate.points,
    co2SavingsKg: worstMediumTemplate.co2SavingsKg,
    difficulty: "medium",
    frequency: worstMediumTemplate.frequency,
    completed: false,
    reasoning: `Recommended: Simple, everyday habits to lower your usage in ${CATEGORY_NAMES[worst.key]}.`,
  })

  // Best category Easy mission
  const bestEasyTemplate = MISSION_POOL[best.key].easy
  signatureMissions.push({
    id: `sig_m_easy_${timestamp}`,
    title: bestEasyTemplate.title,
    description: bestEasyTemplate.description,
    category: best.key,
    points: bestEasyTemplate.points,
    co2SavingsKg: bestEasyTemplate.co2SavingsKg,
    difficulty: "easy",
    frequency: bestEasyTemplate.frequency,
    completed: false,
    reasoning: `Recommended: Built to keep up your awesome habits in ${CATEGORY_NAMES[best.key]}!`,
  })

  return {
    identity,
    story,
    twin,
    missions: signatureMissions,
    scores: {
      transport: s_t,
      food: s_f,
      energy: s_e,
      shopping: s_s,
      composite,
    },
  }
}
