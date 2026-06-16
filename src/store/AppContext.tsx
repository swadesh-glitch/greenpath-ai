"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { mockUser, UserProfile } from "@/data/mock-user"
import { mockMissions, Mission } from "@/data/mock-missions"
import { climateIdentities, ClimateIdentity } from "@/data/climate-identities"

interface AppContextType {
  isOnboarded: boolean
  onboardingStep: number
  profile: UserProfile
  missions: Mission[]
  gardenLevel: number
  points: number
  co2SavedKg: number
  streakDays: number
  selectedIdentity: ClimateIdentity | null
  setOnboardingStep: (step: number) => void
  completeOnboarding: (identityId: string, name: string) => void
  completeMission: (missionId: string) => void
  resetApp: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)
  const [onboardingStep, setOnboardingStepState] = useState<number>(0)
  const [profile, setProfile] = useState<UserProfile>(mockUser)
  const [missions, setMissions] = useState<Mission[]>(mockMissions)
  const [selectedIdentity, setSelectedIdentity] = useState<ClimateIdentity | null>(null)

  // Sync state stats directly with profile stats to avoid stale values
  const points = profile.stats.totalPoints
  const co2SavedKg = profile.stats.co2SavedKg
  const streakDays = profile.stats.streakDays
  const [gardenLevel, setGardenLevel] = useState<number>(0)

  // Dynamically calculate garden level based on points
  useEffect(() => {
    let level = 0
    if (points >= 450) level = 5
    else if (points >= 300) level = 4
    else if (points >= 200) level = 3
    else if (points >= 120) level = 2
    else if (points >= 50) level = 1
    
    setGardenLevel(level)
  }, [points])

  const setOnboardingStep = (step: number) => {
    setOnboardingStepState(step)
  }

  const completeOnboarding = (identityId: string, name: string) => {
    const identity = climateIdentities.find((id) => id.id === identityId) || climateIdentities[0]
    setSelectedIdentity(identity)
    
    // Set starting points based on user stats
    setProfile((prev) => ({
      ...prev,
      name,
      climateIdentity: identity.title,
      stats: {
        ...prev.stats,
        totalPoints: 50, // Starting bonus points
        co2SavedKg: 0,
        level: 1,
      },
    }))
    
    setIsOnboarded(true)
  }

  const completeMission = (missionId: string) => {
    setMissions((prevMissions) =>
      prevMissions.map((m) => {
        if (m.id === missionId) {
          if (m.completed) return m // already completed

          // Update user points and CO2 saved
          setProfile((prev) => {
            const addedPoints = m.points
            const addedCO2 = m.co2SavingsKg
            return {
              ...prev,
              stats: {
                ...prev.stats,
                totalPoints: prev.stats.totalPoints + addedPoints,
                co2SavedKg: Number((prev.stats.co2SavedKg + addedCO2).toFixed(1)),
              },
            }
          })
          
          return { ...m, completed: true }
        }
        return m
      })
    )
  }

  const resetApp = () => {
    setIsOnboarded(false)
    setOnboardingStepState(0)
    setSelectedIdentity(null)
    setMissions(mockMissions.map((m) => ({ ...m, completed: false })))
    setProfile({
      ...mockUser,
      stats: {
        streakDays: 5,
        totalPoints: 0,
        co2SavedKg: 0,
        level: 1,
      },
    })
  }

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        onboardingStep,
        profile,
        missions,
        gardenLevel,
        points,
        co2SavedKg,
        streakDays,
        selectedIdentity,
        setOnboardingStep,
        completeOnboarding,
        completeMission,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
