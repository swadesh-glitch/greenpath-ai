/**
 * @file climate-identities.ts
 * @responsibility Data definitions and configuration list for static Climate Identity archetypes.
 */
export interface ClimateIdentity {
  id: string
  title: string
  description: string
  icon: string
  traits: string[]
  startingBonus: string
}

export const climateIdentities: ClimateIdentity[] = [
  {
    id: "eco_champion",
    title: "Eco Champion",
    description: "Deeply committed to zero waste and systemic change. You want to lead by example.",
    icon: "ShieldAlert",
    traits: ["Zero Waste Advocate", "Active Campaigner", "Sustainable Consumer"],
    startingBonus: "Double points on Waste reduction missions"
  },
  {
    id: "conscious_commuter",
    title: "Conscious Commuter",
    description: "Your focus is on reducing transport emissions. You prefer biking, transit, or EV usage.",
    icon: "Bike",
    traits: ["Low Carbon Transit", "Smart Travel Planner", "Active Lifestyle"],
    startingBonus: "20% extra CO2 savings on Transport missions"
  },
  {
    id: "green_foodie",
    title: "Green Foodie",
    description: "You believe the way to save the planet is through your plate. Focused on local and plant-based foods.",
    icon: "Leaf",
    traits: ["Plant-Based Devotee", "Local Produce Supporter", "Zero Food Waste Fighter"],
    startingBonus: "Double points on Food category missions"
  },
  {
    id: "energy_optimizer",
    title: "Energy Optimizer",
    description: "You love efficiency. You optimize your home heating, cooling, lighting, and power usage.",
    icon: "Zap",
    traits: ["Smart Home Enthusiast", "Resource Conscious", "Carbon Auditor"],
    startingBonus: "15% bonus points on Energy saving missions"
  }
]
