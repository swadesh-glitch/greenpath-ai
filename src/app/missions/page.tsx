"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { PageBackground } from "@/components/shared/PageBackground"
import {
  Target, Check, Award, Sparkles, Sprout, Leaf,
  ArrowRight, Clock
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Counter } from "@/components/shared/Counter"
import { LEVEL_THRESHOLDS, LEVEL_NAMES } from "@/lib/constants"
import { getCategoryIcon, getCategoryEmoji, getDifficultyStyles } from "@/lib/category-utils"

interface Particle {
  id: number
  x: number
  y: number
  amount: string
  offsetX: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
}


function getNextThreshold(pts: number): number {
  return LEVEL_THRESHOLDS.find((t) => t > pts) ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}
function getCurrentThreshold(pts: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pts >= LEVEL_THRESHOLDS[i]) return LEVEL_THRESHOLDS[i]
  }
  return 0
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGardenPreviewVisual(lvl: number) {
  switch (lvl) {
    case 0:
      return {
        emoji: "🏜️",
        bg: "from-amber-900/40 via-yellow-950/20 to-stone-900/30",
        border: "border-amber-500/15",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        label: "Barren Land",
      }
    case 1:
      return {
        emoji: "🌸",
        bg: "from-emerald-950/40 via-emerald-900/20 to-stone-900/30",
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        label: "Lush Wildflowers",
      }
    case 2:
      return {
        emoji: "🌱🦋",
        bg: "from-emerald-950/50 via-teal-900/25 to-stone-900/30",
        border: "border-teal-500/20",
        glow: "shadow-[0_0_25px_rgba(20,184,166,0.25)]",
        label: "Young Sprout",
      }
    case 3:
      return {
        emoji: "🌳",
        bg: "from-emerald-950/60 via-green-900/30 to-stone-900/30",
        border: "border-green-500/30",
        glow: "shadow-[0_0_30px_rgba(34,197,94,0.3)]",
        label: "Mature Tree",
      }
    case 4:
      return {
        emoji: "🌲🦅",
        bg: "from-emerald-950/70 via-emerald-800/20 to-stone-900/30",
        border: "border-emerald-500/45",
        glow: "shadow-[0_0_35px_rgba(16,185,129,0.4)]",
        label: "Young Forest",
      }
    default:
      return {
        emoji: "🌸✨",
        bg: "from-pink-950/30 via-emerald-900/40 to-yellow-900/20",
        border: "border-pink-500/35",
        glow: "shadow-[0_0_40px_rgba(236,72,153,0.35)]",
        label: "Thriving Sanctuary",
      }
  }
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function MissionsHub() {
  const router = useRouter()
  const {
    isOnboarded,
    missions,
    completeMission,
    completeDailyAction,
    dailyActions,
    points,
    gardenLevel,
    co2SavedKg,
  } = useAppContext()

  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)
  const prevPointsRef = useRef(points)
  const completedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // ── Inline Garden Preview Animation ───────────
  const [animatePreview, setAnimatePreview] = useState(false)
  const prevPointsForPreview = useRef(points)

  useEffect(() => {
    if (points !== prevPointsForPreview.current) {
      setAnimatePreview(true)
      const timer = setTimeout(() => setAnimatePreview(false), 800)
      prevPointsForPreview.current = points
      return () => clearTimeout(timer)
    }
  }, [points])

  // ── Onboarding redirect ───────────────────────
  useEffect(() => {
    if (!isOnboarded) {
      router.replace("/onboarding")
    }
  }, [isOnboarded, router])

  // ── Level-up toast ────────────────────────────
  useEffect(() => {
    const prev = prevPointsRef.current
    const crossed = LEVEL_THRESHOLDS.find((t) => t > 0 && prev < t && points >= t)
    if (crossed) {
      const newLevel = LEVEL_THRESHOLDS.indexOf(crossed)
      toast.success(`🌱 Garden grew to Level ${newLevel}!`, {
        description: `${LEVEL_NAMES[newLevel]} unlocked. Come see your ecosystem.`,
        duration: 6000,
        action: {
          label: "View Garden →",
          onClick: () => router.push("/garden"),
        },
      })
    }
    prevPointsRef.current = points
  }, [points, router])

  // ── Flying particle helper ────────────────────
  const spawnParticle = (e: React.MouseEvent<HTMLButtonElement>, amount: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2 - 15
    const y = rect.top - 20
    const label = `+${amount} pts`
    // eslint-disable-next-line react-hooks/purity
    const p: Particle = { id: Date.now(), x, y, amount: label, offsetX: Math.random() * 40 - 20 }
    setParticles((prev) => [...prev, p])
    setTimeout(() => setParticles((prev) => prev.filter((pp) => pp.id !== p.id)), 1300)
  }

  const handleCompleteSignature = (e: React.MouseEvent<HTMLButtonElement>, missionId: string, pts: number) => {
    const mission = missions.find(m => m.id === missionId)
    if (mission?.completed || completedIdsRef.current.has(missionId)) return
    completedIdsRef.current.add(missionId)

    completeMission(missionId)
    spawnParticle(e, pts)
    toast.success("Mission Complete!", {
      description: `Earned ${pts} green points!`,
      icon: "🌿",
    })
  }

  const handleCompleteDaily = (e: React.MouseEvent<HTMLButtonElement>, actionId: string, pts: number) => {
    const action = dailyActions.find(a => a.id === actionId)
    if (action?.completed || completedIdsRef.current.has(actionId)) return
    completedIdsRef.current.add(actionId)

    completeDailyAction(actionId)
    spawnParticle(e, pts)
    toast.success("Eco Action Logged!", {
      description: `+${pts} points added to your garden.`,
      icon: "🌱",
    })
  }

  // ── Progress math ─────────────────────────────
  const curThreshold = getCurrentThreshold(points)
  const nextThreshold = getNextThreshold(points)
  const progressPct = nextThreshold === curThreshold
    ? 100
    : Math.round(((points - curThreshold) / (nextThreshold - curThreshold)) * 100)

  if (!mounted || !isOnboarded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3 animate-pulse text-emerald-500 font-bold uppercase text-xs tracking-wider">
          <Sprout className="h-8 w-8 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <>
      <PageBackground image="/backgrounds/missions-bg.jpg" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-10 py-6 max-w-3xl mx-auto w-full relative"
      >
      {/* Flying Points Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: p.y, x: p.x, scale: 0.8 }}
            animate={{ opacity: 0, y: p.y - 130, x: p.x + p.offsetX, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed z-[100] pointer-events-none font-black text-emerald-500 dark:text-emerald-400 text-sm flex items-center gap-1 drop-shadow-md"
          >
            <Sparkles className="h-4 w-4 fill-emerald-500" />
            {p.amount}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <Target className="h-3.5 w-3.5" />
          AI ACTION PLAN
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-sand-900 dark:text-white">
          Your Climate Action Plan
        </h1>
        <p className="text-sand-800 dark:text-sand-300 font-medium max-w-xl leading-relaxed text-sm">
          Clover has compiled personalized signature missions, plus standard eco actions. Log habits to grow your Carbon Garden in real-time.
        </p>

        {/* Progress summary bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-100/60 dark:bg-forest-900/50 border border-sand-200/50 dark:border-forest-800/50 text-xs font-bold text-sand-900 dark:text-sand-200">
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            <Counter value={points} suffix=" pts" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-100/60 dark:bg-forest-900/50 border border-sand-200/50 dark:border-forest-800/50 text-xs font-bold text-sand-900 dark:text-sand-200">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            <Counter value={co2SavedKg} decimals={1} suffix=" kg CO₂ saved" />
          </div>
        </div>
      </motion.div>

      {/* ── STICKY GARDEN PREVIEW PANEL ── */}
      <motion.div variants={itemVariants}>
        <motion.div
          animate={animatePreview ? { scale: [1, 1.02, 1] } : {}}
          className={cn(
            "glass-panel rounded-3xl p-6 border transition-all duration-300 shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden",
            animatePreview ? "border-emerald-500 bg-emerald-500/5 shadow-emerald-500/10" : "border-emerald-500/10"
          )}
        >
        {/* Diorama Box */}
        <motion.div
          animate={animatePreview ? { rotate: [0, -3, 3, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
          className={cn(
            "w-24 h-24 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center border shadow-inner relative select-none shrink-0 transition-shadow duration-500",
            getGardenPreviewVisual(gardenLevel).bg,
            getGardenPreviewVisual(gardenLevel).border,
            getGardenPreviewVisual(gardenLevel).glow
          )}
          role="img"
          aria-label={`Garden Level ${gardenLevel}: ${getGardenPreviewVisual(gardenLevel).label} diorama preview`}
        >
          <span className="text-4xl" aria-hidden="true">{getGardenPreviewVisual(gardenLevel).emoji}</span>
          <span className="absolute bottom-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">Diorama</span>
        </motion.div>

        {/* Content & Progress */}
        <div className="flex-1 space-y-3.5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm uppercase text-sand-800 dark:text-sand-400 tracking-wider flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-500" /> Active Garden Preview
              </h4>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                Level {gardenLevel} — {getGardenPreviewVisual(gardenLevel).label}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs font-semibold text-sand-700 dark:text-sand-400">Total Points: </span>
              <Counter className="text-sm font-black text-emerald-500" value={points} suffix=" pts" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div 
              className="h-2 w-full bg-sand-200/50 dark:bg-forest-900/50 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={points}
              aria-valuemin={curThreshold}
              aria-valuemax={nextThreshold}
              aria-valuetext={`${points} points out of ${nextThreshold} required for next level`}
              aria-label="Garden level progression"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-sand-700 dark:text-sand-400">
              <span><Counter value={points} /> / {nextThreshold} pts</span>
              <span><Counter value={Math.max(0, nextThreshold - points)} /> pts to Level {Math.min(gardenLevel + 1, 5)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0 flex justify-end">
          <motion.button
            onClick={() => router.push("/garden")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-premium w-full md:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
            aria-label="View the 3D garden diorama"
          >
            See 3D Garden
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
      </motion.div>

      {/* ── SECTION 1: SIGNATURE AI MISSIONS ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="border-b border-sand-200 dark:border-forest-900 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-sand-950 dark:text-white">
              Signature AI Missions
            </h2>
            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest bg-violet-500/15 text-violet-500 dark:text-violet-400 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)] animate-pulse">
              AI-Personalized
            </span>
          </div>
          <p className="text-xs text-sand-800 dark:text-sand-400 font-medium mt-1 leading-relaxed">
            Clover crafted these specifically from your onboarding profile — one-time, high-impact habits.
          </p>
        </div>

        <div className="space-y-4">
          {missions.map((m) => {
            const isCompleted = m.completed
            return (
              <motion.div
                key={m.id}
                layout
                className={cn(
                  "glass-panel rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
                  isCompleted 
                    ? "border-violet-500/30 opacity-75 shadow-none" 
                    : "border-violet-500/25 hover:border-violet-500/40 bg-gradient-to-br from-violet-500/[0.02] to-transparent shadow-[0_0_30px_rgba(139,92,246,0.06)]"
                )}
              >
                {isCompleted && <div className="absolute inset-y-0 left-0 w-2 bg-violet-500" />}

                <div className="flex items-start gap-4 flex-1">
                  <span 
                    className="text-4xl p-3 bg-white dark:bg-forest-950/60 rounded-2xl border border-emerald-500/10 shadow-sm flex-shrink-0"
                    role="img"
                    aria-label={`${m.category} category`}
                  >
                    {getCategoryEmoji(m.category)}
                  </span>
                  <div className="space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base leading-snug text-sand-950 dark:text-white">{m.title}</h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <Check className="h-3 w-3 stroke-[3px]" /> Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">{m.description}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-sand-900 dark:text-sand-400 pt-1">
                      <span className={cn("px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider", getDifficultyStyles(m.difficulty))}>
                        {m.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-sand-400" /> One-Time
                      </span>
                      <span className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                        <Leaf className="h-3 w-3 text-emerald-500" /> {m.co2SavingsKg} kg CO₂
                      </span>
                    </div>
                    {m.reasoning && (
                      <div className="text-[10px] text-violet-600 dark:text-violet-400 font-extrabold flex items-center gap-1 mt-2.5 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 dark:border-violet-500/10 px-3 py-1 rounded-xl w-fit">
                        <Sparkles className="h-3 w-3 fill-current animate-pulse" />
                        {m.reasoning}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-sand-200/50 dark:border-forest-900/50">
                  <div className="text-left md:text-right pr-2">
                    <span className="block text-[9px] font-bold text-sand-800 dark:text-sand-400 uppercase tracking-wider">REWARD</span>
                    <span className="text-md font-extrabold text-emerald-500 flex items-center gap-1">
                      <Award className="h-4 w-4 fill-emerald-500/10" />+{m.points} pts
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="completed-btn"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0"
                      >
                        <Check className="h-6 w-6 stroke-[3px]" />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="active-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleCompleteSignature(e, m.id, m.points)}
                        className="btn-premium px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
                        aria-label={`Log action for signature mission: ${m.title}`}
                      >
                        Log Action
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── SECTION 2: ECO-ACTION MISSIONS (DAILY POOL REPURPOSED) ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="border-b border-sand-200 dark:border-forest-900 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-sand-950 dark:text-white">
              Standard Eco Actions
            </h2>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              One-Time
            </span>
          </div>
          <p className="text-xs text-sand-800 dark:text-sand-400 font-medium mt-1 leading-relaxed">
            Choose from these generic one-time habits to accumulate points and visibly grow your garden diorama.
          </p>
        </div>

        <div className="space-y-3">
          {dailyActions.map((action) => (
            <motion.div
              key={action.id}
              layout
              className={cn(
                "glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                action.completed ? "border-emerald-500/30 opacity-75" : "border-emerald-500/10 hover:border-emerald-500/25"
              )}
            >
              {action.completed && <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500 rounded-l-2xl" />}

              <div className="flex items-start gap-3 flex-1">
                <span 
                  className="text-3xl p-2.5 bg-white dark:bg-forest-950/60 rounded-xl border border-emerald-500/10 shadow-sm flex-shrink-0"
                  role="img"
                  aria-label={`${action.category} category`}
                >
                  {getCategoryEmoji(action.category)}
                </span>
                <div className="space-y-1 text-left min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-sm leading-snug text-sand-950 dark:text-white">{action.title}</h3>
                    {action.completed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Check className="h-3 w-3 stroke-[3px]" /> Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sand-700 dark:text-sand-400 leading-relaxed font-medium">{action.description}</p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-sand-900 dark:text-sand-400 pt-0.5">
                    <span className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                      {getCategoryIcon(action.category)} {action.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-emerald-500" /> {action.co2SavingsKg} kg CO₂
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-sand-200/50 dark:border-forest-900/50">
                <div className="text-left sm:text-right pr-2">
                  <span className="block text-[9px] font-bold text-sand-700 dark:text-sand-400 uppercase tracking-wider">REWARD</span>
                  <span className="text-sm font-extrabold text-emerald-500 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 fill-emerald-500/10" />
                    +{action.points} pts
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {action.completed ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-11 w-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0"
                    >
                      <Check className="h-5 w-5 stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <motion.button
                      key="log"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => handleCompleteDaily(e, action.id, action.points)}
                      className="btn-premium px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
                      aria-label={`Log completion of action: ${action.title}`}
                    >
                      Log It
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
    </>
  )
}
