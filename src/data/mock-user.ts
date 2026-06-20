/**
 * @file mock-user.ts
 * @responsibility Data definitions and default mocks representing user details and accumulated metrics.
 */
export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  climateIdentity?: string
  joinedAt: string
  stats: {
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
    totalPoints: 320,
    co2SavedKg: 45.2,
    level: 2
  }
}
