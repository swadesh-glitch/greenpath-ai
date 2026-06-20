"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { mockUser, UserProfile } from "@/data/mock-user"
import { mockMissions } from "@/data/mock-missions"
import { climateIdentities, ClimateIdentity } from "@/data/climate-identities"
import { OnboardingAnswers, GeneratedIdentity, ClimateTwinData, AIMission } from "@/lib/ai-engine"
import { DailyEcoAction, pickDailyActions } from "@/data/daily-eco-actions"
import { WeeklyChallenge, getWeeklyChallenge } from "@/data/weekly-challenges"
import { LEVEL_THRESHOLDS } from "@/lib/constants"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

// ─────────────────────────────────────────────
// localStorage persistence helpers
// ─────────────────────────────────────────────
const LS_KEY = "greenpath_app_state"

interface PersistedState {
  isOnboarded: boolean
  profileName: string
  profileClimateIdentity: string
  totalPoints: number
  co2SavedKg: number
  missions: AIMission[]
  dailyActions: DailyEcoAction[]
  weeklyChallenge: WeeklyChallenge | null
  lastRefreshedDate: string | null
  hasSeenGardenIntro: boolean
  currentStreak: number
  lastActiveDate: string | null
  hasRerolledToday: boolean
  onboardingAnswers: OnboardingAnswers | null
  generatedIdentity: GeneratedIdentity | null
  carbonStory: string | null
  climateTwin: ClimateTwinData | null
}

function loadFromStorage(): Partial<PersistedState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<PersistedState>
  } catch {
    return {}
  }
}

function saveToStorage(state: PersistedState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded or private browsing — silent fail
  }
}

// ─────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────
interface AppContextType {
  // === Core ===
  isOnboarded: boolean
  onboardingStep: number
  profile: UserProfile
  gardenLevel: number
  points: number
  co2SavedKg: number
  selectedIdentity: ClimateIdentity | null

  // === Signature missions (AI-generated, one-time) ===
  missions: AIMission[]

  // === Daily / Weekly renewable missions ===
  dailyActions: DailyEcoAction[]
  weeklyChallenge: WeeklyChallenge | null
  lastRefreshedDate: string | null
  hasRerolledToday: boolean

  // === First-visit flag ===
  hasSeenGardenIntro: boolean

  // === Streak ===
  currentStreak: number
  lastActiveDate: string | null

  // === Phase 2 AI states ===
  onboardingAnswers: OnboardingAnswers | null
  generatedIdentity: GeneratedIdentity | null
  carbonStory: string | null
  climateTwin: ClimateTwinData | null

  // === Actions ===
  setOnboardingStep: (step: number) => void
  completeOnboarding: (identityId: string, name: string) => void
  completeAIOnboarding: (
    name: string,
    answers: OnboardingAnswers,
    generatedId: GeneratedIdentity,
    story: string,
    twin: ClimateTwinData,
    aiMissions: AIMission[]
  ) => void
  completeMission: (missionId: string) => void
  completeDailyAction: (actionId: string) => void
  completeWeeklyChallenge: () => void
  refreshDailyActions: () => void
  markGardenIntroSeen: () => void
  resetApp: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// ─────────────────────────────────────────────
// Level thresholds (imported from @/lib/constants)
// ─────────────────────────────────────────────

export function calcGardenLevel(points: number): number {
  let level = 0
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) { level = i; break }
  }
  return level
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = loadFromStorage()

  // ── Core state ──────────────────────────────
  const [isOnboarded, setIsOnboarded] = useState<boolean>(saved.isOnboarded ?? false)
  const [onboardingStep, setOnboardingStepState] = useState<number>(0)
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (saved.isOnboarded && saved.profileName) {
      return {
        ...mockUser,
        name: saved.profileName,
        climateIdentity: saved.profileClimateIdentity ?? mockUser.climateIdentity,
        stats: {
          totalPoints: saved.totalPoints ?? 0,
          co2SavedKg: saved.co2SavedKg ?? 0,
          level: 1,
        },
      }
    }
    return mockUser
  })
  const [selectedIdentity, setSelectedIdentity] = useState<ClimateIdentity | null>(null)

  // ── Signature missions ───────────────────────
  const [missions, setMissions] = useState<AIMission[]>(saved.missions ?? mockMissions)

  // ── Daily / Weekly ───────────────────────────
  const [dailyActions, setDailyActions] = useState<DailyEcoAction[]>(
    saved.dailyActions ?? pickDailyActions(getTodayStr())
  )
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(
    saved.weeklyChallenge ?? getWeeklyChallenge()
  )
  const [lastRefreshedDate, setLastRefreshedDate] = useState<string | null>(
    saved.lastRefreshedDate ?? null
  )
  const [hasRerolledToday, setHasRerolledToday] = useState<boolean>(
    saved.hasRerolledToday ?? false
  )

  // ── Garden intro ─────────────────────────────
  const [hasSeenGardenIntro, setHasSeenGardenIntro] = useState<boolean>(
    saved.hasSeenGardenIntro ?? false
  )

  // ── Streak ───────────────────────────────────
  const [currentStreak, setCurrentStreak] = useState<number>(saved.currentStreak ?? 0)
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(saved.lastActiveDate ?? null)

  // ── Phase 2 AI ───────────────────────────────
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(
    saved.onboardingAnswers ?? null
  )
  const [generatedIdentity, setGeneratedIdentity] = useState<GeneratedIdentity | null>(
    saved.generatedIdentity ?? null
  )
  const [carbonStory, setCarbonStory] = useState<string | null>(saved.carbonStory ?? null)
  const [climateTwin, setClimateTwin] = useState<ClimateTwinData | null>(saved.climateTwin ?? null)

  // ── Derived ──────────────────────────────────
  const points = profile.stats.totalPoints
  const co2SavedKg = profile.stats.co2SavedKg
  const gardenLevel = calcGardenLevel(points)

  // ─────────────────────────────────────────────
  // Daily refresh on mount (and when app re-focuses)
  // ─────────────────────────────────────────────
  useEffect(() => {
    // Daily/weekly dynamic refresh disabled for hackathon demo to remain static and one-session.
  }, [])

  // ─────────────────────────────────────────────
  // Persist to localStorage on every relevant state change
  // ─────────────────────────────────────────────
  useEffect(() => {
    const state: PersistedState = {
      isOnboarded,
      profileName: profile.name,
      profileClimateIdentity: profile.climateIdentity ?? "",
      totalPoints: profile.stats.totalPoints,
      co2SavedKg: profile.stats.co2SavedKg,
      missions,
      dailyActions,
      weeklyChallenge,
      lastRefreshedDate,
      hasSeenGardenIntro,
      currentStreak,
      lastActiveDate,
      hasRerolledToday,
      onboardingAnswers,
      generatedIdentity,
      carbonStory,
      climateTwin,
    }
    saveToStorage(state)
  }, [
    isOnboarded,
    profile,
    missions,
    dailyActions,
    weeklyChallenge,
    lastRefreshedDate,
    hasSeenGardenIntro,
    currentStreak,
    lastActiveDate,
    hasRerolledToday,
    onboardingAnswers,
    generatedIdentity,
    carbonStory,
    climateTwin,
  ])

  // ─────────────────────────────────────────────
  // Streak update helper
  // ─────────────────────────────────────────────
  const updateStreak = useCallback(() => {
    return 0 // Disable streak bonus for the hackathon demo
  }, [])

  // ─────────────────────────────────────────────
  // Add points + CO2 helper
  // ─────────────────────────────────────────────
  const addReward = useCallback((pts: number, co2: number) => {
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalPoints: prev.stats.totalPoints + pts,
        co2SavedKg: Number((prev.stats.co2SavedKg + co2).toFixed(2)),
      },
    }))
  }, [])

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  const setOnboardingStep = (step: number) => setOnboardingStepState(step)

  const completeOnboarding = (identityId: string, name: string) => {
    const identity = climateIdentities.find((id) => id.id === identityId) || climateIdentities[0]
    setSelectedIdentity(identity)
    setProfile((prev) => ({
      ...prev,
      name,
      climateIdentity: identity.title,
      stats: { ...prev.stats, totalPoints: 50, co2SavedKg: 0, level: 1 },
    }))
    setIsOnboarded(true)
  }

  const completeAIOnboarding = (
    name: string,
    answers: OnboardingAnswers,
    generatedId: GeneratedIdentity,
    story: string,
    twin: ClimateTwinData,
    aiMissions: AIMission[]
  ) => {
    setOnboardingAnswers(answers)
    setGeneratedIdentity(generatedId)
    setCarbonStory(story)
    setClimateTwin(twin)
    setMissions(aiMissions)
    setProfile((prev) => ({
      ...prev,
      name,
      climateIdentity: generatedId.name,
      stats: { ...prev.stats, totalPoints: 50, co2SavedKg: 0, level: 1 },
    }))
    setIsOnboarded(true)
  }

  const completeMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId || m.completed) return m
        const bonus = updateStreak()
        addReward(m.points + bonus, m.co2SavingsKg)
        return { ...m, completed: true }
      })
    )
  }

  const completeDailyAction = (actionId: string) => {
    setDailyActions((prev) =>
      prev.map((a) => {
        if (a.id !== actionId || a.completed) return a
        const bonus = updateStreak()
        addReward(a.points + bonus, a.co2SavingsKg)
        return { ...a, completed: true }
      })
    )
  }

  const completeWeeklyChallenge = () => {
    if (!weeklyChallenge || weeklyChallenge.completed) return
    const bonus = updateStreak()
    addReward(weeklyChallenge.points + bonus, weeklyChallenge.co2SavingsKg)
    setWeeklyChallenge((prev) => (prev ? { ...prev, completed: true } : prev))
  }

  const refreshDailyActions = () => {
    if (hasRerolledToday) return
    const today = getTodayStr()
    // Use offset seed so re-roll gives different 3 than initial
    const offsetSeed = today + "_reroll"
    setDailyActions(pickDailyActions(offsetSeed))
    setHasRerolledToday(true)
  }

  const markGardenIntroSeen = () => setHasSeenGardenIntro(true)

  const resetApp = () => {
    setIsOnboarded(false)
    setOnboardingStepState(0)
    setSelectedIdentity(null)
    setOnboardingAnswers(null)
    setGeneratedIdentity(null)
    setCarbonStory(null)
    setClimateTwin(null)
    setMissions(mockMissions.map((m) => ({ ...m, completed: false })))
    setProfile({ ...mockUser, stats: { totalPoints: 0, co2SavedKg: 0, level: 1 } })
    setDailyActions(pickDailyActions(getTodayStr()))
    setWeeklyChallenge(getWeeklyChallenge())
    setLastRefreshedDate(getTodayStr())
    setHasRerolledToday(false)
    setHasSeenGardenIntro(false)
    setCurrentStreak(0)
    setLastActiveDate(null)
    if (typeof window !== "undefined") localStorage.removeItem(LS_KEY)
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
        selectedIdentity,
        dailyActions,
        weeklyChallenge,
        lastRefreshedDate,
        hasRerolledToday,
        hasSeenGardenIntro,
        currentStreak,
        lastActiveDate,
        onboardingAnswers,
        generatedIdentity,
        carbonStory,
        climateTwin,
        setOnboardingStep,
        completeOnboarding,
        completeAIOnboarding,
        completeMission,
        completeDailyAction,
        completeWeeklyChallenge,
        refreshDailyActions,
        markGardenIntroSeen,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within an AppProvider")
  return context
}
