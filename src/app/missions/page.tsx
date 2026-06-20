"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { PageBackground } from "@/components/shared/PageBackground"
import {
  Target, Award, Leaf, Sparkles, Sprout
} from "lucide-react"
import { toast } from "sonner"
import { Counter } from "@/components/shared/Counter"
import { LEVEL_THRESHOLDS, LEVEL_NAMES } from "@/lib/constants"
import { GardenPreviewPanel } from "./GardenPreviewPanel"
import { SignatureMissionsList } from "./SignatureMissionsList"
import { EcoActionsList } from "./EcoActionsList"

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

/**
 * MissionsHub page orchestrator managing state, score counters, particle generation
 * triggers, and route checks. Delegating sub-components to GardenPreviewPanel,
 * SignatureMissionsList, and EcoActionsList.
 */
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
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-sand-950 dark:text-white">
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
          <GardenPreviewPanel
            gardenLevel={gardenLevel}
            points={points}
            curThreshold={curThreshold}
            nextThreshold={nextThreshold}
            progressPct={progressPct}
            animatePreview={animatePreview}
          />
        </motion.div>

        {/* ── SECTION 1: SIGNATURE AI MISSIONS ── */}
        <SignatureMissionsList
          missions={missions}
          itemVariants={itemVariants}
          onCompleteSignature={handleCompleteSignature}
        />

        {/* ── SECTION 2: ECO-ACTION MISSIONS ── */}
        <EcoActionsList
          dailyActions={dailyActions}
          itemVariants={itemVariants}
          onCompleteDaily={handleCompleteDaily}
        />
      </motion.div>
    </>
  )
}
