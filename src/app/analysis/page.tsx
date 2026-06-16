"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { Car, Utensils, Zap, ShoppingBag, ArrowRight, Sparkles, BookOpen, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import EarthGlobe with SSR disabled
const EarthGlobe = dynamic(() => import("@/components/landing/EarthGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-emerald-500 font-semibold text-sm">
      Loading planet environment...
    </div>
  ),
})

// SVG Ink Reveal Clip Mask Component
const InkClip: React.FC<{ progress: number }> = ({ progress }) => {
  // Stagger coordinates to make it feel organic, like plant roots spreading
  const r1 = Math.max(0, Math.min(0.8, (progress - 0.0) * 1.5))
  const r2 = Math.max(0, Math.min(0.6, (progress - 0.15) * 1.5))
  const r3 = Math.max(0, Math.min(0.5, (progress - 0.3) * 1.5))
  const r4 = Math.max(0, Math.min(0.6, (progress - 0.45) * 1.5))
  const r5 = Math.max(0, Math.min(0.5, (progress - 0.6) * 1.5))
  const r6 = Math.max(0, Math.min(0.4, (progress - 0.7) * 1.5))
  const r7 = Math.max(0, Math.min(0.5, (progress - 0.8) * 1.5))

  return (
    <svg className="absolute w-0 h-0">
      <defs>
        <clipPath id="ink-reveal-mask" clipPathUnits="objectBoundingBox">
          {progress >= 0.98 ? (
            <rect x="0" y="0" width="1" height="1" />
          ) : (
            <>
              <circle cx="0.5" cy="0.5" r={r1} />
              <circle cx="0.3" cy="0.4" r={r2} />
              <circle cx="0.7" cy="0.3" r={r3} />
              <circle cx="0.4" cy="0.7" r={r4} />
              <circle cx="0.7" cy="0.6" r={r5} />
              <circle cx="0.2" cy="0.6" r={r6} />
              <circle cx="0.8" cy="0.5" r={r7} />
            </>
          )}
        </clipPath>
      </defs>
    </svg>
  )
}

export default function ClimateAnalysis() {
  const router = useRouter()
  const { isOnboarded, selectedIdentity, points, co2SavedKg } = useAppContext()
  const [activeSubTab, setActiveSubTab] = useState<"story" | "twin">("story")
  const [twinProgress, setTwinProgress] = useState(0.0) // 0 to 1

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding")
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null

  // Category cards details
  const categories = [
    {
      id: "transport",
      title: "Transportation",
      icon: Car,
      level: "High Potential",
      color: "from-red-500/10 to-red-600/5 dark:from-red-950/20 dark:to-transparent border-red-500/20",
      accentColor: "bg-red-500",
      description: "Commuting forms the biggest chapter in your climate story. Commuting car-free can lower emissions significantly.",
      progress: 68,
      savings: "42.5 kg CO2/mo potential",
    },
    {
      id: "food",
      title: "Food Intake",
      icon: Utensils,
      level: "Medium Potential",
      color: "from-amber-500/10 to-amber-600/5 dark:from-amber-950/20 dark:to-transparent border-amber-500/20",
      accentColor: "bg-amber-500",
      description: "Transitioning to plant-based meals cuts agricultural emissions, packing a high carbon punch for tiny efforts.",
      progress: 45,
      savings: "24.1 kg CO2/mo potential",
    },
    {
      id: "energy",
      title: "Home Energy",
      icon: Zap,
      level: "Medium Potential",
      color: "from-yellow-500/10 to-yellow-600/5 dark:from-yellow-950/20 dark:to-transparent border-yellow-500/20",
      accentColor: "bg-yellow-500",
      description: "Phantom electricity draw and home heating efficiency are hidden leaks in your home carbon score.",
      progress: 30,
      savings: "15.8 kg CO2/mo potential",
    },
    {
      id: "shopping",
      title: "Shopping & Waste",
      icon: ShoppingBag,
      level: "Low Potential",
      color: "from-blue-500/10 to-blue-600/5 dark:from-blue-950/20 dark:to-transparent border-blue-500/20",
      accentColor: "bg-blue-500",
      description: "Single-use packing and frequent online delivery shipping emissions build up packaging footprints over time.",
      progress: 22,
      savings: "9.3 kg CO2/mo potential",
    },
  ]

  // Dynamic Impact Narrative calculation
  const getTwinNarrative = (prog: number) => {
    if (prog <= 0.05) {
      return "Based on your current habits, your environmental impact continues to grow over time, leading to industrial smog and heavy carbon retention."
    } else if (prog <= 0.3) {
      return "By choosing public transport twice per week and reducing food delivery, Future You will save 1.2 tons of CO2 by 2030, equivalent to planting 15 mature trees."
    } else if (prog <= 0.6) {
      return "A balanced lifestyle avoids emissions equal to heating 2 homes for a year, allowing sunlight to break through the cloud layer and clear toxic smog."
    } else if (prog <= 0.85) {
      return "Making active transit and plant-based choices avoids emissions equal to 3 Delhi–Mumbai flights, driving significant forest recovery across continents."
    } else {
      return "Outstanding! Achieving a carbon neutral lifestyle avoids emissions equivalent to 5 Delhi–Mumbai flights by 2030, restoring a thriving global ecosystem."
    }
  }

  return (
    <div className="flex-1 space-y-10 py-6 max-w-4xl mx-auto w-full">
      {/* HEADER SECTION & SUB-TAB SWITCHER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            CLIMATE STORY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Climate Story</h1>
          <p className="text-sm text-sand-800 dark:text-sand-300 font-medium max-w-md">
            Review your personalized footprints or launch the scrollytelling future twin simulator.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex p-1.5 glass-panel-light dark:glass-panel-dark rounded-2xl border border-emerald-500/10">
          <button
            onClick={() => setActiveSubTab("story")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === "story"
                ? "bg-white dark:bg-forest-950 text-emerald-500 shadow-sm"
                : "text-sand-800 dark:text-sand-200 opacity-70 hover:opacity-100"
            }`}
          >
            My Story
          </button>
          <button
            onClick={() => setActiveSubTab("twin")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === "twin"
                ? "bg-white dark:bg-forest-950 text-emerald-500 shadow-sm"
                : "text-sand-800 dark:text-sand-200 opacity-70 hover:opacity-100"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> Climate Twin
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUB-TAB VIEW */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: MY STORY */}
        {activeSubTab === "story" && (
          <motion.div
            key="view-story"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="glass-panel-light dark:glass-panel-dark rounded-3xl p-6 md:p-8 border border-emerald-500/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
                <div className="space-y-3 flex-1">
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                    Primary Chapter
                  </span>
                  <h2 className="text-xl md:text-2xl font-black leading-snug">
                    &ldquo;Your daily commute tells the biggest part of your climate story.&rdquo;
                  </h2>
                  <p className="text-sm text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">
                    Small improvements here will create your largest positive impact. As a{" "}
                    <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">
                      {selectedIdentity?.title || "Eco Hero"}
                    </span>
                    , you have a natural advantage.
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center gap-4 bg-sand-100/50 dark:bg-forest-800/20 p-4 rounded-2xl border border-sand-200/40 dark:border-forest-800/40 w-full md:w-auto text-center md:text-right">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sand-800 dark:text-sand-400">
                      CO2 SAVED TOTAL
                    </span>
                    <span className="text-2xl font-black text-emerald-500">{co2SavedKg} kg</span>
                  </div>
                  <div className="h-8 w-[1px] md:h-[1px] md:w-12 bg-sand-300 dark:bg-forest-800" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sand-800 dark:text-sand-400">
                      TOTAL BALANCE
                    </span>
                    <span className="text-xl font-black text-foreground">{points} pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((c, index) => {
                const Icon = c.icon
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -15px rgba(16,185,129,0.12)" }}
                    className={`group flex flex-col justify-between p-6 rounded-3xl border bg-gradient-to-br ${c.color} shadow-md transition-all relative overflow-hidden`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-forest-950 flex items-center justify-center shadow-sm border border-emerald-500/10">
                          <Icon className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white dark:bg-forest-950/80 text-sand-900 dark:text-sand-100 border border-sand-200 dark:border-forest-800/80">
                          {c.level}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-extrabold text-lg text-foreground">{c.title}</h3>
                        <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="opacity-60">Impact Reduced</span>
                        <span className="text-emerald-500">{c.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-sand-200 dark:bg-forest-900/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${c.accentColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${c.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold opacity-60">
                        <span>Carbon Savings potential</span>
                        <span>{c.savings}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: FUTURE CLIMATE TWIN */}
        {activeSubTab === "twin" && (
          <motion.div
            key="view-twin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Cinematic Large 700-800px card */}
            <div className="w-full min-h-[750px] rounded-3xl p-6 md:p-10 border border-emerald-500/10 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#020b08] to-[#041d16] text-white flex flex-col justify-between">
              
              {/* Outer starry space background overlay inside card */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-forest-900/20 via-[#020806] to-[#020b08] pointer-events-none" />
              
              {/* Card Header */}
              <div className="relative text-center space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[10px] tracking-widest uppercase">
                  Future Impact Simulator
                </span>
                <h2 className="text-3xl font-black tracking-tight text-gradient-green bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Meet Your Climate Twin
                </h2>
                <p className="text-xs text-sand-300 font-semibold max-w-sm mx-auto leading-relaxed">
                  Adjust your future choices slider and watch the organic ink reveal heal the planet in real-time.
                </p>
              </div>

              {/* Ink-Reveal Globe Visualizer */}
              <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto flex items-center justify-center my-6">
                
                {/* Defs container for mask */}
                <InkClip progress={twinProgress} />

                {/* Layer 1: Polluted Earth Globe (Base, always visible) */}
                <div className="absolute inset-0 z-10 w-full h-full">
                  <EarthGlobe progress={0} />
                </div>

                {/* Layer 2: Healthy Earth Globe (Overlay, clipped by organic SVG mask) */}
                <div 
                  className="absolute inset-0 z-20 w-full h-full transition-all duration-300"
                  style={{ clipPath: "url(#ink-reveal-mask)" }}
                >
                  <EarthGlobe progress={1} />
                </div>

                {/* Overlay Text showing Current vs Future label */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-[#020b08]/80 backdrop-blur-md border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-wider">
                  {twinProgress <= 0.05 ? "CURRENT TIMELINE" : twinProgress >= 0.95 ? "REGENERATED TIMELINE" : "TRANSFORMATION STATE"}
                </div>
              </div>

              {/* Interaction Slider & Narrative details */}
              <div className="relative space-y-6 w-full max-w-md mx-auto z-30">
                
                {/* Dynamic Story Narrative */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center min-h-[90px] flex items-center justify-center">
                  <p className="text-xs font-semibold leading-relaxed text-sand-100">
                    &ldquo;{getTwinNarrative(twinProgress)}&rdquo;
                  </p>
                </div>

                {/* Slider Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 tracking-wider">
                    <span>FUTURE CHOICES</span>
                    <span>{Math.round(twinProgress * 100)}% ACTION</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.25"
                    value={twinProgress}
                    onChange={(e) => setTwinProgress(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  {/* Slider tick labels */}
                  <div className="flex justify-between text-[9px] font-bold text-sand-300 px-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* STORY ACTION CTA CARD */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => router.push("/missions")}
          className="btn-premium px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          Take Sustainable Action Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
