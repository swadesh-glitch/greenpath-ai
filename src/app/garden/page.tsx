"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { Sprout, Sun, Wind, Cloud, Eye, RefreshCw } from "lucide-react"

export default function CarbonGarden() {
  const router = useRouter()
  const { isOnboarded, gardenLevel, points, co2SavedKg } = useAppContext()
  const [previewLevel, setPreviewLevel] = useState<number | null>(null)

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding")
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null

  // Active level to display (allows clicking preview buttons to override user's level)
  const activeLevel = previewLevel !== null ? previewLevel : gardenLevel

  const getGardenDetails = (lvl: number) => {
    switch (lvl) {
      case 0:
        return { name: "Empty Land", desc: "A bare soil plot. Complete actions to plant seeds." }
      case 1:
        return { name: "Lush Grass", desc: "Fresh grass shoots and wildflowers are cropping up!" }
      case 2:
        return { name: "Small Sprout", desc: "A young sapling has taken root in your ecosystem." }
      case 3:
        return { name: "Mature Tree", desc: "A grand tree with swaying branches stands tall." }
      case 4:
        return { name: "Young Forest", desc: "Multiple trees and shrubs cover the fertile land." }
      default:
        return { name: "Thriving Ecosystem", desc: "Butterflies, birds, and sunlight beams surround your vibrant sanctuary!" }
    }
  }

  const currentDetails = getGardenDetails(activeLevel)

  return (
    <div className="flex-1 space-y-8 py-6 max-w-4xl mx-auto w-full relative">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Sprout className="h-3.5 w-3.5" />
            CARBON GARDEN
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Carbon Garden</h1>
          <p className="text-sm text-sand-800 dark:text-sand-300 font-medium max-w-md leading-relaxed">
            Every green point you earn transforms this digital landscape. Watch your micro-impact materialize.
          </p>
        </div>

        {/* STATS BUBBLES */}
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-2xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 text-center shadow-md">
            <span className="block text-[9px] font-bold opacity-60 uppercase">Points</span>
            <span className="text-lg font-black text-emerald-500">{points}</span>
          </div>
          <div className="px-5 py-3 rounded-2xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 text-center shadow-md">
            <span className="block text-[9px] font-bold opacity-60 uppercase">CO2 Offset</span>
            <span className="text-lg font-black text-emerald-500">{co2SavedKg} kg</span>
          </div>
        </div>
      </div>

      {/* GARDEN INTERACTIVE CANVAS */}
      <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto rounded-3xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-sky-400/10 via-emerald-500/5 to-transparent dark:from-forest-950 dark:via-forest-900/30">
        
        {/* Environment Layer: Sun rays / Light beams */}
        {activeLevel >= 5 && (
          <div className="absolute inset-0 bg-radial-[circle_at_20%_-20%] from-yellow-300/15 via-transparent to-transparent pointer-events-none z-10 animate-pulse-slow" />
        )}

        {/* Environment Layer: Floating Clouds */}
        {activeLevel >= 1 && (
          <>
            <motion.div
              animate={{ x: [-80, 500] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute top-10 left-0 text-white opacity-25 pointer-events-none"
            >
              <Cloud className="h-10 w-16 fill-current" />
            </motion.div>
            <motion.div
              animate={{ x: [500, -80] }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="absolute top-24 right-0 text-white opacity-15 pointer-events-none"
            >
              <Cloud className="h-8 w-12 fill-current" />
            </motion.div>
          </>
        )}

        {/* Environment Layer: Floating Leaves */}
        {activeLevel >= 3 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -50, x: Math.random() * 400 + 50, opacity: 0, rotate: 0 }}
                animate={{
                  y: [null, 400],
                  x: [null, Math.random() * 200 + 50],
                  opacity: [0, 0.7, 0.7, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                className="absolute text-emerald-500/40 text-sm"
              >
                🍃
              </motion.div>
            ))}
          </div>
        )}

        {/* Environment Layer: Fluttering Butterflies & Flying Birds */}
        {activeLevel >= 5 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Butterfly */}
            <motion.div
              animate={{
                x: [100, 180, 140, 100],
                y: [200, 160, 220, 200],
                rotate: [0, 15, -15, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute text-xl"
            >
              🦋
            </motion.div>
            {/* Birds */}
            <motion.div
              animate={{
                x: [-50, 600],
                y: [80, 120],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute text-xs font-bold text-emerald-600/30 opacity-70"
            >
              🦅
            </motion.div>
          </div>
        )}

        {/* 3D Isometric / Orthographic Island Visualizer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex flex-col justify-end items-center">
          
          {/* ISOMETRIC BASE ISLAND (SVG) */}
          <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl">
            {/* Under-island soil block */}
            <path
              d="M 10 60 L 100 105 L 190 60 L 100 15 Z"
              fill={activeLevel > 0 ? "#1e3b2e" : "#3b302c"}
              stroke={activeLevel > 0 ? "#11261d" : "#231d1b"}
              strokeWidth="2"
            />
            {/* Soil Side face */}
            <path
              d="M 10 60 L 100 105 L 100 120 L 10 75 Z"
              fill={activeLevel > 0 ? "#10231b" : "#2a221f"}
            />
            <path
              d="M 190 60 L 100 105 L 100 120 L 190 75 Z"
              fill={activeLevel > 0 ? "#0d1b15" : "#1e1816"}
            />
            {/* Island Grass Cover */}
            <path
              d="M 10 58 L 100 103 L 190 58 L 100 13 Z"
              fill={activeLevel > 0 ? "#10b981" : "#5c4f4a"}
            />
          </svg>

          {/* VEGETATION & LIFE OVERLAYS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="popLayout">
              
              {/* Level 0: Cracks and stones */}
              {activeLevel === 0 && (
                <motion.div
                  key="lvl0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-16 text-3xl"
                >
                  🪨
                </motion.div>
              )}

              {/* Level 1: Wildflowers */}
              {activeLevel === 1 && (
                <motion.div
                  key="lvl1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-16 flex gap-4 text-xl"
                >
                  <span>🪻</span>
                  <span>🌼</span>
                  <span>🌱</span>
                </motion.div>
              )}

              {/* Level 2: Sprout */}
              {activeLevel === 2 && (
                <motion.div
                  key="lvl2"
                  initial={{ opacity: 0, y: 10, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 150 }}
                  className="absolute bottom-16 text-4xl"
                >
                  🪴
                </motion.div>
              )}

              {/* Level 3: Large Tree */}
              {activeLevel === 3 && (
                <motion.div
                  key="lvl3"
                  initial={{ opacity: 0, y: 30, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="absolute bottom-16 text-7xl flex flex-col items-center"
                >
                  <motion.span
                    animate={{ rotate: [-1, 1, -1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="origin-bottom"
                  >
                    🌳
                  </motion.span>
                </motion.div>
              )}

              {/* Level 4: Forest */}
              {activeLevel === 4 && (
                <motion.div
                  key="lvl4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-16 flex items-end gap-1"
                >
                  <span className="text-5xl opacity-80">🌲</span>
                  <span className="text-7xl">🌳</span>
                  <span className="text-5xl opacity-80">🌲</span>
                </motion.div>
              )}

              {/* Level 5: Complete Sanctuary */}
              {activeLevel >= 5 && (
                <motion.div
                  key="lvl5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-14 flex flex-col items-center"
                >
                  <div className="flex items-end gap-1 relative">
                    <span className="text-5xl opacity-90 animate-bounce">🌸</span>
                    <span className="text-8xl">🌳</span>
                    <span className="text-6xl opacity-90">🌲</span>
                    {/* Glowing sparks */}
                    <span className="absolute -top-6 left-6 text-xl animate-pulse">✨</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS / DETAILS CARD */}
      <div className="glass-panel-light dark:glass-panel-dark rounded-3xl p-6 border border-emerald-500/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left space-y-1">
          <h3 className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
            {currentDetails.name} (Level {activeLevel})
          </h3>
          <p className="text-xs text-sand-800 dark:text-sand-300 font-semibold leading-relaxed max-w-sm">
            {currentDetails.desc}
          </p>
        </div>

        {/* DEMO LEVEL TOGGLE (Allows checking other stages!) */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-1.5 text-[9px] uppercase font-extrabold text-sand-800 dark:text-sand-400">
            <Eye className="h-3 w-3" /> DEMO SCREEN CONTROLS
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 bg-sand-100 dark:bg-forest-950 p-1 rounded-xl border border-sand-200 dark:border-forest-800">
            {[0, 1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setPreviewLevel(lvl === gardenLevel ? null : lvl)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  (lvl === gardenLevel && previewLevel === null) || previewLevel === lvl
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-sand-800 dark:text-sand-200 hover:bg-sand-200/50 dark:hover:bg-forest-900/40"
                }`}
              >
                {lvl}
              </button>
            ))}
            {previewLevel !== null && (
              <button
                onClick={() => setPreviewLevel(null)}
                title="Reset to your level"
                className="h-7 px-2 text-[10px] font-bold text-emerald-500 flex items-center gap-1 border-l border-sand-300/50 dark:border-forest-800 hover:underline"
              >
                <RefreshCw className="h-2.5 w-2.5" /> reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
