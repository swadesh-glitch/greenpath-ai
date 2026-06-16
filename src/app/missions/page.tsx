"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { Target, Check, Award, ShieldAlert, Sparkles, Sprout, Leaf } from "lucide-react"
import { toast } from "sonner"

interface Particle {
  id: number
  x: number
  y: number
  amount: string
}

export default function MissionsHub() {
  const router = useRouter()
  const { isOnboarded, missions, completeMission, points } = useAppContext()
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding")
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null

  // Get exactly 3 missions representing Easy, Medium, High Impact
  const displayMissions = [
    missions.find((m) => m.difficulty === "easy") || missions[2], // Unplug Idle
    missions.find((m) => m.difficulty === "medium") || missions[1], // Meatless Day
    missions.find((m) => m.id === "m_1") || missions[0], // Commute Car-Free (Hard/High Impact)
  ].filter(Boolean)

  const handleComplete = (e: React.MouseEvent<HTMLButtonElement>, missionId: string, amount: number) => {
    completeMission(missionId)
    
    // Trigger flying particles at the button's relative coordinates
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2 - 15
    const y = rect.top - 20
    
    const newParticle: Particle = {
      id: Date.now(),
      x,
      y,
      amount: `+${amount} pts`,
    }

    setParticles((prev) => [...prev, newParticle])
    
    // Remove particle after animation finishes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
    }, 1200)

    toast.success("Eco Mission Accomplished!", {
      description: `Earned ${amount} green points and grew your garden island!`,
      icon: "🌱",
    })
  }

  // Get color styles for difficulty badge
  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
      default:
        return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
    }
  }

  // Get color styles for categories
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "transport":
        return "🚲"
      case "food":
        return "🥗"
      case "energy":
        return "🔌"
      default:
        return "🛍"
    }
  }

  return (
    <div className="flex-1 space-y-10 py-6 max-w-3xl mx-auto w-full relative">
      {/* Flying Points Particles Overlay */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: p.y, x: p.x, scale: 0.8 }}
            animate={{ 
              opacity: 0, 
              y: p.y - 120, 
              x: p.x + (Math.random() * 40 - 20),
              scale: 1.4,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="fixed z-[100] pointer-events-none font-black text-emerald-500 dark:text-emerald-400 text-lg flex items-center gap-1 drop-shadow-md"
          >
            <Sparkles className="h-4 w-4 fill-emerald-500" />
            {p.amount}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <Target className="h-3.5 w-3.5" />
          ECO-MISSIONS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Active Missions</h1>
        <p className="text-sand-800 dark:text-sand-200 font-medium max-w-xl leading-relaxed">
          Complete daily or weekly climate habits. Your carbon garden grows immediately with every task checked off.
        </p>
      </div>

      {/* THREE MISSIONS CONTAINER */}
      <div className="space-y-6">
        {displayMissions.map((m) => {
          const isCompleted = m.completed
          return (
            <motion.div
              key={m.id}
              layout
              className={`glass-panel-light dark:glass-panel-dark rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                isCompleted 
                  ? "border-emerald-500/30 opacity-75 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]" 
                  : "border-emerald-500/10"
              }`}
            >
              {/* Completed visual green sheen overlay */}
              {isCompleted && (
                <div className="absolute inset-y-0 left-0 w-2 bg-emerald-500" />
              )}

              <div className="flex items-start gap-4 flex-1">
                <span className="text-4xl p-3 bg-white dark:bg-forest-950/60 rounded-2xl border border-emerald-500/10 shadow-sm">
                  {getCategoryEmoji(m.category)}
                </span>
                
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-lg leading-snug">{m.title}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyStyles(m.difficulty)}`}>
                      {m.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Check className="h-3 w-3 stroke-[3px]" /> Completed
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">
                    {m.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold text-sand-900 dark:text-sand-400 pt-1">
                    <span className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/10">
                      <Leaf className="h-3 w-3 text-emerald-500" />
                      Saves {m.co2SavingsKg} kg CO2
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-sand-200/50 dark:border-forest-900/50">
                <div className="text-left md:text-right pr-2">
                  <span className="block text-[9px] font-bold text-sand-800 dark:text-sand-400 uppercase tracking-wider">
                    REWARD
                  </span>
                  <span className="text-md font-extrabold text-emerald-500 flex items-center gap-1">
                    <Award className="h-4 w-4 fill-emerald-500/10" />
                    +{m.points} pts
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="completed-btn"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"
                    >
                      <Check className="h-6 w-6 stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <motion.button
                      key="active-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => handleComplete(e, m.id, m.points)}
                      className="btn-premium px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10"
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

      {/* QUICK STATUS PREVIEW */}
      <div className="glass-panel-light dark:glass-panel-dark rounded-3xl p-6 text-center space-y-4 max-w-sm mx-auto border border-emerald-500/10 shadow-lg">
        <h4 className="font-extrabold text-sm uppercase text-sand-800 dark:text-sand-400 tracking-wider">
          Next.js Carbon Garden Preview
        </h4>
        <p className="text-xs opacity-70 leading-relaxed font-semibold">
          Current score: <span className="font-black text-emerald-500">{points} pts</span>. Complete more high-impact actions to upgrade your ecosystem!
        </p>
        <button
          onClick={() => router.push("/garden")}
          className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 mx-auto"
        >
          View Live Garden <Sprout className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
