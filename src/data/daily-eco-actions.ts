export interface DailyEcoAction {
  id: string
  title: string
  description: string
  category: "transport" | "energy" | "food" | "waste" | "shopping"
  points: number
  co2SavingsKg: number
  completed?: boolean
}

/** Full pool of 8 one-time standard eco actions for the hackathon demo. */
export const DAILY_ECO_ACTION_POOL: DailyEcoAction[] = [
  {
    id: "dea_1",
    title: "Choose Second-Hand First",
    description: "Purchase a pre-owned clothing item, book, or tool instead of buying new to bypass manufacturing emissions.",
    category: "shopping",
    points: 65,
    co2SavingsKg: 4.5,
    completed: false,
  },
  {
    id: "dea_2",
    title: "Zero-Waste Plant-Based Day",
    description: "Eat entirely plant-based meals today and compost all organic waste to eliminate methane footprint.",
    category: "food",
    points: 60,
    co2SavingsKg: 4.0,
    completed: false,
  },
  {
    id: "dea_3",
    title: "Take the Train or Bus",
    description: "Commute via public transit or carpool for your daily travels to offset personal vehicle emissions.",
    category: "transport",
    points: 55,
    co2SavingsKg: 3.5,
    completed: false,
  },
  {
    id: "dea_4",
    title: "Active Transport Commute",
    description: "Walk or cycle for any trip under 3 km to completely clean your transport footprint.",
    category: "transport",
    points: 55,
    co2SavingsKg: 3.2,
    completed: false,
  },
  {
    id: "dea_5",
    title: "Zero Single-Use Plastic",
    description: "Avoid plastic bags, plastic bottles, straws, and disposable packaging all day.",
    category: "waste",
    points: 50,
    co2SavingsKg: 2.5,
    completed: false,
  },
  {
    id: "dea_6",
    title: "Compost All Kitchen Scraps",
    description: "Collect and compost fruit peels, coffee grounds, and food scraps to enrich soil.",
    category: "waste",
    points: 50,
    co2SavingsKg: 2.2,
    completed: false,
  },
  {
    id: "dea_7",
    title: "Unplug Standby Vampires",
    description: "Unplug standby gadgets (TVs, chargers, consoles) before leaving the house to stop phantom power draw.",
    category: "energy",
    points: 45,
    co2SavingsKg: 1.8,
    completed: false,
  },
  {
    id: "dea_8",
    title: "Wash Cold & Air-Dry Laundry",
    description: "Wash your clothes at 30°C and hang them to dry naturally instead of using a high-heat machine dryer.",
    category: "energy",
    points: 45,
    co2SavingsKg: 1.5,
    completed: false,
  },
]

/**
 * Returns all 8 actions directly for the demo, ignoring date strings.
 */
export function pickDailyActions(_dateStr?: string): DailyEcoAction[] {
  return DAILY_ECO_ACTION_POOL.map((a) => ({ ...a, completed: false }))
}
