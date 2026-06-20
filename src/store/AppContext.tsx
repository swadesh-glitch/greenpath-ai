"use client"

/**
 * @file AppContext.tsx
 * @responsibility Application-wide React state provider managing user profile data, carbon points,
 * completed missions, streaks, and dynamic garden level calculations with localStorage synchronization.
 */

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

/**
 * Derives the Carbon Garden diorama level (0–5) from accumulated points.
 *
 * Iterates `LEVEL_THRESHOLDS` in reverse order so the highest qualifying
 * threshold wins, avoiding a redundant ascending comparison loop.
 *
 * | Level | Min Points | Garden State     |
 * |-------|-----------|------------------|
 * | 0     | 0          | Empty sprout     |
 * | 1     | 50         | Seedling         |
 * | 2     | 120        | Sapling          |
 * | 3     | 200        | Young tree       |
 * | 4     | 300        | Mature forest    |
 * | 5     | 450        | Thriving ecosystem |
 *
 * @param points - Non-negative integer representing total accumulated points.
 * @returns Garden level integer in the range [0, 5].
 */
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
  /**
   * Evaluates streak state and returns a bonus points value.
   *
   * In the production build this would compute the consecutive-day streak
   * and award up to +10 bonus points. For the hackathon demo, the streak
   * bonus is disabled (always returns 0) so users reach peak garden level
   * within a single demo session without waiting multiple days.
   *
   * @returns Streak bonus points to add on top of the mission/action reward.
   */
  const updateStreak = useCallback(() => {
    return 0 // Disable streak bonus for the hackathon demo
  }, [])

  // ─────────────────────────────────────────────
  // Add points + CO2 helper
  // ─────────────────────────────────────────────
  /**
   * Atomically adds reward points and CO₂ savings to the user profile.
   *
   * Uses a functional `setState` update to avoid stale closures in rapid
   * successive calls (e.g. bulk mission logging). CO₂ savings are rounded to
   * two decimal places to prevent floating-point drift across sessions.
   *
   * @param pts - Positive integer points to add to `totalPoints`.
   * @param co2 - Non-negative kg CO₂ savings to accumulate in `co2SavedKg`.
   */
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
  /**
   * Advances or rewinds the conversational onboarding step counter.
   *
   * @param step - Target step index (0-based). Steps correspond to questionnaire questions.
   */
  const setOnboardingStep = useCallback((step: number) => {
    setOnboardingStepState(step)
  }, [])

  /**
   * Finalizes the legacy (non-AI) onboarding flow.
   *
   * Looks up the selected `ClimateIdentity` record by ID, updates the user
   * profile, and grants the 50-point starting bonus. Used by the static
   * identity picker; superseded by `completeAIOnboarding` for the AI flow.
   *
   * @param identityId - The `id` field of the chosen `ClimateIdentity`.
   * @param name       - The user's display name entered during onboarding.
   */
  const completeOnboarding = useCallback((identityId: string, name: string) => {
    const identity = climateIdentities.find((id) => id.id === identityId) || climateIdentities[0]
    setSelectedIdentity(identity)
    setProfile((prev) => ({
      ...prev,
      name,
      climateIdentity: identity.title,
      stats: { ...prev.stats, totalPoints: 50, co2SavedKg: 0, level: 1 },
    }))
    setIsOnboarded(true)
  }, [])

  /**
   * Finalizes the AI-powered onboarding flow and seeds the app state.
   *
   * Called by the onboarding page immediately after `generateClimateProfile`
   * resolves. Stores all AI outputs (identity, story, twin projection, and
   * three signature missions) into context and localStorage, grants the 50-point
   * starting bonus, and marks the user as onboarded.
   *
   * @param name        - User display name from the conversational chat.
   * @param answers     - Raw onboarding answers (city, transport, food, shopping, energy).
   * @param generatedId - AI-generated archetype name, description, strength, and opportunity.
   * @param story       - Personalised 2–4 sentence carbon narrative from `scoring-engine.ts`.
   * @param twin        - Climate twin projection with CO₂ savings and real-world equivalents.
   * @param aiMissions  - Three signature missions (hard + medium from worst, easy from best).
   */
  const completeAIOnboarding = useCallback((
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
  }, [])

  /**
   * Marks a signature mission as completed and rewards points + CO₂ savings.
   *
   * Idempotent: calling this with an already-completed mission ID is a no-op.
   * Streak bonus is evaluated via `updateStreak()` before the reward is applied.
   *
   * @param missionId - The `id` field of the `AIMission` to complete.
   */
  const completeMission = useCallback((missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId || m.completed) return m
        const bonus = updateStreak()
        addReward(m.points + bonus, m.co2SavingsKg)
        return { ...m, completed: true }
      })
    )
  }, [updateStreak, addReward])

  /**
   * Marks a daily eco-action as completed and rewards points + CO₂ savings.
   *
   * Identical idempotency guarantee to `completeMission`. Daily actions reset
   * each day when `refreshDailyActions` is called with a new date seed.
   *
   * @param actionId - The `id` field of the `DailyEcoAction` to complete.
   */
  const completeDailyAction = useCallback((actionId: string) => {
    setDailyActions((prev) =>
      prev.map((a) => {
        if (a.id !== actionId || a.completed) return a
        const bonus = updateStreak()
        addReward(a.points + bonus, a.co2SavingsKg)
        return { ...a, completed: true }
      })
    )
  }, [updateStreak, addReward])

  /**
   * Completes the active weekly challenge and awards its points + CO₂ reward.
   *
   * No-op if `weeklyChallenge` is null or already completed. Weekly challenges
   * are seeded deterministically so the same challenge is shown across devices
   * during the same ISO calendar week.
   */
  const completeWeeklyChallenge = useCallback(() => {
    if (!weeklyChallenge || weeklyChallenge.completed) return
    const bonus = updateStreak()
    addReward(weeklyChallenge.points + bonus, weeklyChallenge.co2SavingsKg)
    setWeeklyChallenge((prev) => (prev ? { ...prev, completed: true } : prev))
  }, [weeklyChallenge, updateStreak, addReward])

  /**
   * Re-rolls the daily eco-action pool once per calendar day.
   *
   * An `offsetSeed` (today's date + `"_reroll"`) ensures the re-roll always
   * produces a different set of three actions than the initial morning pick.
   * Calling this a second time on the same day is a no-op (`hasRerolledToday`).
   */
  const refreshDailyActions = useCallback(() => {
    if (hasRerolledToday) return
    const today = getTodayStr()
    // Use offset seed so re-roll gives different 3 than initial
    const offsetSeed = today + "_reroll"
    setDailyActions(pickDailyActions(offsetSeed))
    setHasRerolledToday(true)
  }, [hasRerolledToday])

  /**
   * Permanently dismisses the 3D garden intro camera animation.
   *
   * Stored in `PersistedState` so returning users skip the cinematic dolly-in
   * on subsequent sessions and land directly on the interactive diorama.
   */
  const markGardenIntroSeen = useCallback(() => {
    setHasSeenGardenIntro(true)
  }, [])

  /**
   * Hard-resets all application state to factory defaults.
   *
   * Clears the `greenpath_app_state` localStorage key and restores every slice
   * of React state to its initial value. Intended for the floating "Reset Demo"
   * button used by hackathon judges to start a fresh walkthrough without
   * refreshing the browser tab.
   */
  const resetApp = useCallback(() => {
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
  }, [])

  const contextValue = React.useMemo(() => ({
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
  }), [
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
  ])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Convenience hook for consuming the `AppContext` from any client component.
 *
 * Throws a descriptive error when called outside `<AppProvider>` so
 * mis-use is caught immediately during development rather than producing
 * a silent undefined context.
 *
 * @returns The full `AppContextType` — all state values and action callbacks.
 * @throws {Error} If called outside an `<AppProvider>` subtree.
 */
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within an AppProvider")
  return context
}
