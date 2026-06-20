/**
 * @file mock-missions.ts
 * @responsibility Data definitions and template mocks for general carbon-saving missions.
 */
export interface Mission {
  id: string
  title: string
  description: string
  category: "transport" | "energy" | "food" | "waste" | "shopping"
  points: number
  co2SavingsKg: number
  difficulty: "easy" | "medium" | "hard"
  frequency: "daily" | "weekly" | "one-time"
  completed?: boolean
}

export const mockMissions: Mission[] = [
  {
    id: "m_1",
    title: "Commute Car-Free",
    description: "Walk, bike, or take public transit for your daily commute.",
    category: "transport",
    points: 50,
    co2SavingsKg: 4.6,
    difficulty: "medium",
    frequency: "daily"
  },
  {
    id: "m_2",
    title: "Meatless Day",
    description: "Eat entirely plant-based meals today.",
    category: "food",
    points: 30,
    co2SavingsKg: 2.5,
    difficulty: "easy",
    frequency: "daily"
  },
  {
    id: "m_3",
    title: "Unplug Idle Electronics",
    description: "Unplug chargers, appliances, and devices when not in use.",
    category: "energy",
    points: 15,
    co2SavingsKg: 0.8,
    difficulty: "easy",
    frequency: "daily"
  },
  {
    id: "m_4",
    title: "Bring Your Own Bag",
    description: "Avoid single-use plastic bags on your next shopping trip.",
    category: "shopping",
    points: 20,
    co2SavingsKg: 0.2,
    difficulty: "easy",
    frequency: "one-time"
  }
]
