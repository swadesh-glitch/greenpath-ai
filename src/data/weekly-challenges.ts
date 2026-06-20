export interface WeeklyChallenge {
  id: string
  title: string
  description: string
  points: number
  co2SavingsKg: number
  completed?: boolean
  weekKey: string // "2026-W25"
}

interface WeeklyChallengeTemplate {
  id: string
  title: string
  description: string
  points: number
  co2SavingsKg: number
}

const WEEKLY_CHALLENGE_POOL: WeeklyChallengeTemplate[] = [
  {
    id: "wc_1",
    title: "Log 5 Daily Eco Actions This Week",
    description: "Complete any 5 daily eco actions across this week to earn this bonus reward.",
    points: 60,
    co2SavingsKg: 5.0,
  },
  {
    id: "wc_2",
    title: "Go Plant-Based for One Full Day",
    description: "Eat zero meat and dairy for an entire day — breakfast, lunch, and dinner.",
    points: 50,
    co2SavingsKg: 4.0,
  },
  {
    id: "wc_3",
    title: "Zero Single-Use Plastic for 3 Days",
    description: "Refuse all single-use plastic packaging, bags, bottles, and cutlery for 3 days.",
    points: 55,
    co2SavingsKg: 3.5,
  },
  {
    id: "wc_4",
    title: "Commute Car-Free for 3 Days",
    description: "Leave your car at home for 3 separate days this week — walk, cycle, or transit.",
    points: 60,
    co2SavingsKg: 8.0,
  },
  {
    id: "wc_5",
    title: "Cook All Meals at Home This Week",
    description: "No restaurants, delivery, or takeaway for 7 days — home-cooked only.",
    points: 45,
    co2SavingsKg: 3.0,
  },
]

/**
 * Get the ISO week key for a given date, e.g. "2026-W25"
 */
export function getISOWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
}

/**
 * Returns the weekly challenge for the current ISO week.
 * Rotates through the pool using week number as index.
 */
export function getWeeklyChallenge(weekKey?: string): WeeklyChallenge {
  const key = weekKey ?? getISOWeekKey()
  const weekNum = parseInt(key.split("-W")[1], 10)
  const template = WEEKLY_CHALLENGE_POOL[weekNum % WEEKLY_CHALLENGE_POOL.length]
  return {
    ...template,
    completed: false,
    weekKey: key,
  }
}
