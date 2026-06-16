"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { User, Flame, Award, Calendar, CheckSquare, Sparkles, RefreshCw, Trash2 } from "lucide-react"

export default function ProfileDashboard() {
  const router = useRouter()
  const { isOnboarded, profile, missions, gardenLevel, points, co2SavedKg, streakDays, selectedIdentity, resetApp } = useAppContext()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding")
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null

  // Count completed missions
  const completedMissionsCount = missions.filter((m) => m.completed).length

  // Achievements data
  const achievements = [
    {
      id: "a_1",
      title: "First Sprout",
      desc: "Complete your very first daily climate action.",
      icon: "🌱",
      unlocked: completedMissionsCount > 0,
    },
    {
      id: "a_2",
      title: "CO2 Saver",
      desc: "Save your first 2kg of carbon emissions.",
      icon: "🍃",
      unlocked: co2SavedKg >= 2,
    },
    {
      id: "a_3",
      title: "Climate Devotee",
      desc: "Maintain a daily action streak.",
      icon: "🔥",
      unlocked: streakDays > 0,
    },
    {
      id: "a_4",
      title: "Habitat Master",
      desc: "Grow your garden to Level 3 or higher.",
      icon: "🌳",
      unlocked: gardenLevel >= 3,
    },
  ]

  const handleReset = () => {
    resetApp()
    router.push("/")
  }

  return (
    <div className="flex-1 space-y-10 py-6 max-w-4xl mx-auto w-full relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <User className="h-3.5 w-3.5" />
            USER PROFILE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Dashboard</h1>
          <p className="text-sm opacity-60 flex items-center gap-1.5 font-bold">
            <Calendar className="h-4 w-4" /> Joined GreenPath Journey today
          </p>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CLIMATE IDENTITY CARD */}
        <div className="md:col-span-1 space-y-6">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-sand-800 dark:text-sand-400">
            Climate Identity Card
          </h3>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-6 border-2 border-emerald-500/20 text-center space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-b from-emerald-500/5 to-transparent"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-yellow/5 rounded-full blur-lg" />
            
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] tracking-wider uppercase border border-emerald-500/20">
              <Sparkles className="h-3 w-3 fill-current" />
              Active Profile
            </div>

            <div className="mx-auto h-16 w-16 rounded-2xl bg-white dark:bg-forest-950 flex items-center justify-center text-3xl shadow-sm border border-emerald-500/10">
              {selectedIdentity?.icon === "Bike" && "🚲"}
              {selectedIdentity?.icon === "Leaf" && "🥗"}
              {selectedIdentity?.icon === "Zap" && "⚡"}
              {selectedIdentity?.icon === "ShieldAlert" && "🛡"}
            </div>

            <div>
              <h2 className="font-black text-xl text-gradient-green bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                {selectedIdentity?.title || "Eco Warrior"}
              </h2>
              <span className="text-[10px] font-bold opacity-60">GREENPATH CITIZEN</span>
            </div>

            <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">
              {selectedIdentity?.description}
            </p>

            <div className="h-[1px] bg-sand-200 dark:bg-forest-800" />

            <div className="text-left space-y-1 bg-white/40 dark:bg-forest-900/30 p-3 rounded-xl border border-sand-200/50 dark:border-forest-800/40">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Passive Perk
              </span>
              <p className="text-xs font-bold leading-tight">{selectedIdentity?.startingBonus}</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: STATS AND ACHIEVEMENTS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* STATS COUNTER GRID */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-sand-800 dark:text-sand-400">
              Impact Indicators
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Daily Streak", val: `${streakDays} days`, icon: Flame, color: "text-orange-500" },
                { label: "Total Points", val: `${points} pts`, icon: Award, color: "text-accent-yellow" },
                { label: "CO2 Offset", val: `${co2SavedKg} kg`, icon: User, color: "text-emerald-500" },
                { label: "Missions Logged", val: `${completedMissionsCount} completed`, icon: CheckSquare, color: "text-blue-500" },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="p-4 rounded-2xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 text-left shadow-md flex flex-col justify-between h-28"
                  >
                    <Icon className={`h-5 w-5 ${s.color}`} />
                    <div>
                      <span className="block text-[10px] font-bold opacity-60 uppercase">{s.label}</span>
                      <span className="text-md font-black">{s.val}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ACHIEVEMENTS GRID */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-sand-800 dark:text-sand-400">
              Eco Achievements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-4 bg-white dark:bg-forest-900/20 ${
                    a.unlocked
                      ? "border-emerald-500/20 shadow-md"
                      : "border-sand-200 dark:border-forest-800/40 opacity-40 grayscale"
                  }`}
                >
                  <span className="text-3xl p-2 bg-sand-100 dark:bg-forest-950 rounded-xl border border-sand-200 dark:border-forest-800 shadow-inner">
                    {a.icon}
                  </span>
                  <div className="text-left space-y-1">
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      {a.title}
                      {a.unlocked && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Unlocked</span>}
                    </h4>
                    <p className="text-xs opacity-60 font-semibold">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RESET APP CONTROL PANEL */}
      <div className="pt-8 border-t border-sand-200 dark:border-forest-900/50 flex justify-center">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 border border-red-500/10 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Restart Onboarding Demo
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 max-w-sm">
            <p className="text-xs font-bold text-red-500 text-center">
              Are you sure you want to reset all your points, garden levels, and climate identity settings?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-sand-200 dark:bg-forest-800 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
