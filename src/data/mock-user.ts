export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  climateIdentity?: string
  joinedAt: string
  stats: {
    streakDays: number
    totalPoints: number
    co2SavedKg: number // cumulative CO2 saved
    level: number
  }
}

export const mockUser: UserProfile = {
  id: "user_1",
  name: "Eco Warrior",
  email: "warrior@greenpath.ai",
  joinedAt: new Date().toISOString(),
  stats: {
    streakDays: 5,
    totalPoints: 320,
    co2SavedKg: 45.2,
    level: 2
  }
}
