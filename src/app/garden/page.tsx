"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { Sprout, Sun, Wind, Cloud, CloudRain, Leaf, Flower2, Snowflake, Calendar, Eye, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const Garden3D = dynamic(() => import("@/components/garden/Garden3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-forest-950">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <span className="text-4xl">🌱</span>
        <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Growing Garden…</p>
      </div>
    </div>
  ),
})

export default function CarbonGarden() {
  const router = useRouter()
  const { isOnboarded, gardenLevel, points, co2SavedKg } = useAppContext()
  const [mounted, setMounted] = useState(false)
  const [previewLevel, setPreviewLevel] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  
  // Simulation states
  const [weather, setWeather] = useState<"sunny" | "windy" | "rainy">("sunny")
  const [season, setSeason] = useState<"spring" | "summer" | "autumn" | "winter">("summer")

  useEffect(() => {
    if (!isOnboarded) {
      router.replace("/onboarding")
    }
  }, [isOnboarded, router])

  // Active level to display (allows clicking preview buttons to override user's level)
  const activeLevel = previewLevel !== null ? previewLevel : gardenLevel

  const getGardenDetails = (lvl: number) => {
    switch (lvl) {
      case 99:
        return { name: "Asset Isolation Lab", desc: "Inspect stylized tree, flower cluster, and rock models in isolation." }
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

  // Dynamic canvas background gradient
  const getCanvasBackground = (se: "spring" | "summer" | "autumn" | "winter") => {
    switch (se) {
      case "spring":
        return "bg-gradient-to-b from-pink-300/10 via-emerald-400/5 to-transparent dark:from-pink-950/20 dark:via-emerald-950/10 dark:to-transparent"
      case "autumn":
        return "bg-gradient-to-b from-orange-400/10 via-amber-600/5 to-transparent dark:from-orange-950/20 dark:via-amber-950/10 dark:to-transparent"
      case "winter":
        return "bg-gradient-to-b from-blue-300/10 via-slate-400/5 to-transparent dark:from-slate-900 dark:via-slate-800/50 dark:to-transparent"
      case "summer":
      default:
        return "bg-gradient-to-b from-sky-400/10 via-emerald-500/5 to-transparent dark:from-forest-950 dark:via-forest-900/30"
    }
  }

  const canvasBg = getCanvasBackground(season)

  // Empty State if not onboarded or not mounted yet
  if (!mounted || !isOnboarded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-forest-950">
        <div className="flex flex-col items-center gap-3 animate-pulse text-emerald-500 font-bold uppercase text-xs tracking-wider">
          <Sprout className="h-8 w-8 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] mt-16 overflow-hidden bg-forest-950">
      <style>
        {`
          @keyframes raindrop {
            0% { transform: translateY(-20px) translateX(0) rotate(15deg); opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            100% { transform: translateY(450px) translateX(-90px) rotate(15deg); opacity: 0; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 80s linear infinite;
          }
        `}
      </style>

      {/* 3D Canvas Background */}
      <div className={cn("absolute inset-0 z-0", canvasBg)}>
        <Garden3D level={activeLevel} weather={weather} season={season} />
      </div>

      {/* HUD OVERLAYS */}

      {/* 1. Top-Left: Logo/Badge Card */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="glass-panel-dark rounded-xl p-2.5 px-3.5 border border-emerald-500/10 shadow-lg pointer-events-auto flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <Sprout className="h-3.5 w-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-black text-white leading-none">Carbon Garden</h1>
            <span className="text-[8px] text-emerald-400 font-extrabold tracking-wider">ECO SYSTEM</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Right: Stats Boxes */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex gap-2">
        <div className="px-3.5 py-1.5 rounded-xl glass-panel-dark border border-emerald-500/10 text-center shadow-md pointer-events-auto min-w-[65px]">
          <span className="block text-[8px] font-bold opacity-60 uppercase text-sand-400">Points</span>
          <span className="text-xs font-black text-emerald-400">{points}</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl glass-panel-dark border border-emerald-500/10 text-center shadow-md pointer-events-auto min-w-[80px]">
          <span className="block text-[8px] font-bold opacity-60 uppercase text-sand-400">CO2 Offset</span>
          <span className="text-xs font-black text-emerald-400">{co2SavedKg} kg</span>
        </div>
      </div>

      {/* 3. Below Stats: Demo Screen Controls */}
      <div className="absolute top-18 right-4 z-10 pointer-events-none">
        <div className="glass-panel-dark rounded-xl p-2 border border-emerald-500/10 shadow-lg pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1 text-[8px] font-extrabold text-sand-400 pl-1">
            <Eye className="h-2.5 w-2.5 text-emerald-400" />
            <span className="hidden sm:inline">PREVIEW</span>
          </div>
          <div className="flex items-center gap-1 bg-forest-950/60 p-0.5 rounded-lg border border-forest-800">
            {[0, 1, 2, 3, 4, 5].map((lvl) => {
              const isActive = (lvl === gardenLevel && previewLevel === null) || previewLevel === lvl
              return (
                <motion.button
                  key={lvl}
                  onClick={() => setPreviewLevel(lvl === gardenLevel ? null : lvl)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isActive}
                  aria-label={`Preview Level ${lvl}`}
                  className={`h-5.5 w-5.5 rounded text-[9px] font-black transition-all flex items-center justify-center cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-sand-200 hover:bg-forest-900/40"
                  }`}
                >
                  {lvl}
                </motion.button>
              )
            })}
            <motion.button
              onClick={() => setPreviewLevel(previewLevel === 99 ? null : 99)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={previewLevel === 99}
              aria-label="Preview Asset Lab"
              className={`h-5.5 px-2 rounded text-[9px] font-black transition-all flex items-center justify-center cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none ${
                previewLevel === 99
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-400 hover:bg-forest-900/40 border border-purple-500/20"
              }`}
            >
              🧪 Lab
            </motion.button>
            {previewLevel !== null && (
              <motion.button
                onClick={() => setPreviewLevel(null)}
                title="Reset to your level"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-5.5 px-1.5 text-[8px] font-extrabold text-emerald-500 flex items-center gap-0.5 border-l border-forest-800 hover:underline cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none"
              >
                <RefreshCw className="h-2 w-2" /> reset
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom-Center: Unified Weather + Season + Level HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[92%] max-w-2xl">
        <div className="glass-panel-dark rounded-3xl p-4 border border-emerald-500/10 shadow-2xl pointer-events-auto space-y-3 bg-forest-950/80 backdrop-blur-md">
          
          {/* Header Row: Level Information */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Level {activeLevel}: {currentDetails.name}</span>
            </div>
            <span className="text-sand-400 font-bold hidden sm:inline text-[9px]">{currentDetails.desc}</span>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Weather controls */}
            <div className="space-y-1">
              <span className="text-[8px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                <Cloud className="h-3 w-3" /> WEATHER
              </span>
              <div className="flex gap-1">
                {[
                  { id: "sunny", label: "Sunny", icon: Sun, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
                  { id: "windy", label: "Windy", icon: Wind, color: "text-teal-500 bg-teal-500/10 border-teal-500/30" },
                  { id: "rainy", label: "Rainy", icon: CloudRain, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
                ].map((w) => {
                  const Icon = w.icon
                  const isActive = weather === w.id
                  return (
                    <motion.button
                      key={w.id}
                      onClick={() => setWeather(w.id as "sunny" | "windy" | "rainy")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-pressed={isActive}
                      aria-label={`Simulate ${w.label} weather`}
                      className={`py-1 px-2.5 rounded-lg border flex items-center gap-1 transition-all font-bold text-[9px] cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none ${
                        isActive
                          ? `${w.color} ring-1 ring-offset-1 ring-offset-emerald-950 ring-emerald-500 scale-102`
                          : "bg-white/5 border-white/10 text-sand-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {w.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-8 bg-white/10" />

            {/* Season controls */}
            <div className="space-y-1">
              <span className="text-[8px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> SEASON
              </span>
              <div className="flex gap-1">
                {[
                  { id: "spring", label: "Spring", icon: Flower2, color: "text-pink-500 bg-pink-500/10 border-pink-500/30" },
                  { id: "summer", label: "Summer", icon: Leaf, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
                  { id: "autumn", label: "Autumn", icon: Leaf, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
                  { id: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
                ].map((s) => {
                  const Icon = s.icon
                  const isActive = season === s.id
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => setSeason(s.id as "spring" | "summer" | "autumn" | "winter")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-pressed={isActive}
                      aria-label={`Simulate ${s.label} season`}
                      className={`py-1 px-2 rounded-lg border flex items-center gap-1 transition-all font-bold text-[9px] cursor-pointer focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none ${
                        isActive
                          ? `${s.color} ring-1 ring-offset-1 ring-offset-emerald-950 ring-emerald-500 scale-102`
                          : "bg-white/5 border-white/10 text-sand-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
