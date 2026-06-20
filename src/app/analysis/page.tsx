"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useAppContext } from "@/store/AppContext"
import {
  Car, Utensils, Zap, ShoppingBag, ArrowRight,
  BookOpen, Globe, Plane, BatteryCharging, Leaf,
} from "lucide-react"
import { PageBackground } from "@/components/shared/PageBackground"

// ─── Slider impact weights (kg CO2 saved per year at 100%) ───────────────────
const TRANSIT_MAX_KG  = 1200   // ~42 kg/mo × 12 = 504 → upgraded to realistic max
const DIET_MAX_KG     = 600
const ENERGY_MAX_KG   = 450
const SHOPPING_MAX_KG = 300

type SliderKey = "transit" | "diet" | "energy" | "shopping"

interface TwinState {
  transit:  number   // 0–100
  diet:     number
  energy:   number
  shopping: number
}

function useLocalState<T>(key: string, init: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [val, setVal] = React.useState<T>(init)
  return [val, setVal]
}

export default function ClimateAnalysis() {
  const router = useRouter()
  const { isOnboarded, selectedIdentity, points, co2SavedKg } = useAppContext()
  const [activeSubTab, setActiveSubTab] = React.useState<"story" | "twin">("story")

  // Independent twin sliders
  const [twin, setTwin] = useLocalState<TwinState>("twin", {
    transit: 0, diet: 0, energy: 0, shopping: 0,
  })

  // ── Mounted guard ─────────────────────────────────────────────────────────
  const [mounted, setMounted] = React.useState(false)

  // ── Globe rotation clock (same technique as homepage Globe.tsx) ───────────
  // Drives backgroundPosition on a cylindrical earth map to simulate spin.
  const rafRef   = useRef<number>(0)
  const [mapX, setMapX] = useState(0)          // earth map offset %
  const [cloudsX, setCloudsX] = useState(0)    // clouds offset %

  useEffect(() => {
    setMounted(true)
    if (!isOnboarded) router.push("/onboarding")
  }, [isOnboarded, router])

  useEffect(() => {
    if (!mounted) return
    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) / 1000   // seconds
      // Earth: 1 full revolution every 36 s → 200% bg width per rev
      setMapX((-(t / 36) * 200) % 200)
      // Clouds slightly faster
      setCloudsX((-(t / 28) * 200) % 200)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [mounted])

  // ── Computed twin metrics (MUST be before any conditional return) ───────────
  const totalKgYear = useMemo(() => {
    return Math.round(
      (twin.transit  / 100) * TRANSIT_MAX_KG  +
      (twin.diet     / 100) * DIET_MAX_KG     +
      (twin.energy   / 100) * ENERGY_MAX_KG   +
      (twin.shopping / 100) * SHOPPING_MAX_KG
    )
  }, [twin])

  const avgProgress = (twin.transit + twin.diet + twin.energy + twin.shopping) / 400 // 0–1

  // ── Early exits (after all hooks) ───────────────────────────────────────────
  if (!mounted || !isOnboarded) return null


  // Derived stats
  const flightsAvoided   = +(totalKgYear / 250).toFixed(1)  // Delhi–Mumbai ≈ 250 kg CO2
  const gridMonthsSaved  = +(totalKgYear / 120).toFixed(1)  // avg home ≈ 120 kg/mo
  const treeEquivalents  = Math.round(totalKgYear / 21)     // mature tree ≈ 21 kg/yr

  // ── Globe CSS filter ─────────────────────────────────────────────────────
  // Uses an eased curve so even one slider at 100% (p=0.25) makes a very
  // obvious visual difference. Full vivid is reached at p=0.5 (2 sliders).
  const p = avgProgress                              // 0 – 1
  const eased = 1 - Math.pow(1 - p, 1.6)           // ease-out curve: fast start

  const gGrayscale  = +((1 - eased)).toFixed(3)     // 1.0 (B&W) → 0 (full colour)
  const gSepia      = +((1 - eased) * 0.4).toFixed(3) // 0.4 → 0   (warm tint)
  const gSaturate   = +(0.5 + eased * 1.8).toFixed(3) // 0.5 → 2.3 (vivid boost)
  const gBrightness = +(0.65 + eased * 0.5).toFixed(3)// 0.65 → 1.15
  const gHueRotate  = +((1 - eased) * 25).toFixed(1)  // 25° → 0°
  const globeFilter = [
    `grayscale(${gGrayscale})`,
    `sepia(${gSepia})`,
    `saturate(${gSaturate})`,
    `brightness(${gBrightness})`,
    `hue-rotate(${gHueRotate}deg)`,
  ].join(" ")

  // ── Atmospheric glow — smooth linear RGB interpolation ───────────────────
  // 0 → dim amber (160,80,20)  |  1 → vivid teal (52,211,153)
  const glowR = Math.round(160 + (52  - 160) * eased)
  const glowG = Math.round(80  + (211 - 80)  * eased)
  const glowB = Math.round(20  + (153 - 20)  * eased)
  const glowA = +(0.22 + eased * 0.38).toFixed(2)    // 0.22 → 0.60
  const glowColor = `rgba(${glowR},${glowG},${glowB},${glowA})`
  // Green tint overlay opacity that rises with progress
  const greenTintOpacity = +(eased * 0.18).toFixed(3) // 0 → 0.18

  // ── Narrative ──────────────────────────────────────────────────────────────
  const getTwinNarrative = () => {
    if (totalKgYear === 0) {
      return "Your current habits maintain the status quo — industrial smog keeps growing and carbon accumulates unchecked. Move the sliders to see your future impact."
    }
    if (totalKgYear < 300) {
      return `By enacting these climate missions, you clean up your footprint by ${totalKgYear} kg/year — a meaningful first step. Sunlight is starting to break through the haze.`
    }
    if (totalKgYear < 900) {
      return `By enacting these climate missions, you clean up your footprint by ${totalKgYear} kg/year — equivalent to planting ${treeEquivalents} mature trees. Forest patches are recovering across continents.`
    }
    return `Outstanding! Your actions avoid ${totalKgYear} kg CO2/year — equivalent to ${flightsAvoided} domestic flights and ${gridMonthsSaved} months of grid power. Earth is visibly regenerating.`
  }

  // ── My Story category data ─────────────────────────────────────────────────
  const categories = [
    {
      id: "transport", title: "Transportation", icon: Car, level: "High Potential",
      color: "from-red-500/10 to-red-600/5 dark:from-red-950/20 dark:to-transparent border-red-500/20",
      accentColor: "bg-red-500",
      description: "Commuting forms the biggest chapter in your climate story. Going car-free twice a week lowers emissions significantly.",
      progress: 68, savings: "42.5 kg CO2/mo potential",
    },
    {
      id: "food", title: "Food Intake", icon: Utensils, level: "Medium Potential",
      color: "from-amber-500/10 to-amber-600/5 dark:from-amber-950/20 dark:to-transparent border-amber-500/20",
      accentColor: "bg-amber-500",
      description: "Transitioning to plant-based meals cuts agricultural emissions, packing a high carbon punch for tiny efforts.",
      progress: 45, savings: "24.1 kg CO2/mo potential",
    },
    {
      id: "energy", title: "Home Energy", icon: Zap, level: "Medium Potential",
      color: "from-yellow-500/10 to-yellow-600/5 dark:from-yellow-950/20 dark:to-transparent border-yellow-500/20",
      accentColor: "bg-yellow-500",
      description: "Phantom electricity draw and home heating efficiency are hidden leaks in your home carbon score.",
      progress: 30, savings: "15.8 kg CO2/mo potential",
    },
    {
      id: "shopping", title: "Shopping & Waste", icon: ShoppingBag, level: "Low Potential",
      color: "from-blue-500/10 to-blue-600/5 dark:from-blue-950/20 dark:to-transparent border-blue-500/20",
      accentColor: "bg-blue-500",
      description: "Single-use packaging and frequent delivery shipping emissions build up your packaging footprint over time.",
      progress: 22, savings: "9.3 kg CO2/mo potential",
    },
  ]

  const bgImage = activeSubTab === "twin" ? "/backgrounds/twin-bg.jpg" : "/backgrounds/story-bg.jpg"

  // ── Slider config ──────────────────────────────────────────────────────────
  const sliders: { key: SliderKey; label: string; icon: React.ElementType; maxKg: number; color: string; trackColor: string }[] = [
    { key: "transit",  label: "Transit Improvement",  icon: Car,         maxKg: TRANSIT_MAX_KG,  color: "text-emerald-400", trackColor: "#34d399" },
    { key: "diet",     label: "Diet Improvement",     icon: Leaf,        maxKg: DIET_MAX_KG,     color: "text-lime-400",    trackColor: "#a3e635" },
    { key: "energy",   label: "Energy Efficiency",    icon: BatteryCharging, maxKg: ENERGY_MAX_KG, color: "text-yellow-400", trackColor: "#facc15" },
    { key: "shopping", label: "Shopping & Waste",     icon: ShoppingBag, maxKg: SHOPPING_MAX_KG, color: "text-sky-400",     trackColor: "#38bdf8" },
  ]

  return (
    <>
      <PageBackground image={bgImage} />

      <div className="flex-1 space-y-10 py-6 max-w-4xl mx-auto w-full">

        {/* ── HEADER & TAB SWITCHER ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              CLIMATE STORY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Climate Story</h1>
            <p className="text-sm text-sand-800 dark:text-sand-300 font-medium max-w-md">
              Review your personalized footprints or simulate your future impact with the Climate Twin.
            </p>
          </div>

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

        {/* ── TABS ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ── VIEW 1: MY STORY ─────────────────────────────────────────── */}
          {activeSubTab === "story" && (
            <motion.div
              key="view-story"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Hero narrative card */}
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
                      <span className="block text-[10px] uppercase font-bold text-sand-800 dark:text-sand-400">CO2 SAVED TOTAL</span>
                      <span className="text-2xl font-black text-emerald-500">{co2SavedKg} kg</span>
                    </div>
                    <div className="h-8 w-[1px] md:h-[1px] md:w-12 bg-sand-300 dark:bg-forest-800" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-sand-800 dark:text-sand-400">TOTAL BALANCE</span>
                      <span className="text-xl font-black text-foreground">{points} pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category cards */}
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
                      className={`group flex flex-col justify-between p-6 rounded-3xl border bg-gradient-to-br ${c.color} glass-panel-light dark:glass-panel-dark shadow-md transition-all relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.015] duration-300 pointer-events-none" />
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
                          <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">{c.description}</p>
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

          {/* ── VIEW 2: CLIMATE TWIN ─────────────────────────────────────── */}
          {activeSubTab === "twin" && (
            <motion.div
              key="view-twin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              {/* ── Cinematic outer card ── */}
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                style={{ background: "linear-gradient(160deg,#050f0a 0%,#020b06 60%,#031510 100%)" }}>

                {/* Subtle radial star-field */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(52,211,153,0.05) 0%,transparent 70%)" }} />

                <div className="relative flex flex-col lg:flex-row">

                  {/* ════════════════════════════════════════
                      LEFT PANEL — Globe + stats
                  ════════════════════════════════════════ */}
                  <div className="flex flex-col items-center gap-8 p-10 lg:p-12 lg:w-[48%]
                                  border-b lg:border-b-0 lg:border-r border-white/[0.05]">

                    {/* Title */}
                    <div className="text-center space-y-2 w-full">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                                       bg-emerald-500/10 border border-emerald-500/20
                                       text-emerald-400 font-bold text-[10px] tracking-[0.15em] uppercase">
                        Future Impact Simulator
                      </span>
                      <h2 className="text-[1.6rem] font-black tracking-tight leading-tight
                                     bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-400
                                     bg-clip-text text-transparent">
                        Meet Your Climate Twin
                      </h2>
                    </div>

                    {/* ── Globe ── */}
                    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>

                      {/* Outer diffuse atmosphere */}
                      <div className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: -40,
                          background: glowColor,
                          filter: "blur(50px)",
                          opacity: 0.7,
                          transition: "background 0.5s ease-out, opacity 0.5s ease-out",
                        }} />

                      {/* Inner crisp glow ring */}
                      <div className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: -12,
                          background: glowColor,
                          filter: "blur(18px)",
                          opacity: 0.5,
                          transition: "background 0.5s ease-out",
                        }} />

                      {/* Globe circle */}
                      <div className="relative rounded-full overflow-hidden"
                        style={{
                          width: 340, height: 340, flexShrink: 0,
                          boxShadow: "0 0 0 1.5px rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.7)",
                        }}>

                        {/* 1. Rotating earth map texture */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: "url('/earth/globe_base.jpg')",
                            backgroundSize: "200% 100%",
                            backgroundRepeat: "repeat-x",
                            backgroundPosition: `${mapX}% center`,
                            filter: globeFilter,
                            transition: "filter 0.35s ease-out",
                            willChange: "background-position, filter",
                          }}
                        />

                        {/* 2. Clouds layer (slightly faster) */}
                        <div
                          className="absolute inset-0 pointer-events-none mix-blend-screen"
                          style={{
                            backgroundImage: "url('/earth/earth_clouds.png')",
                            backgroundSize: "200% 100%",
                            backgroundRepeat: "repeat-x",
                            backgroundPosition: `${cloudsX}% center`,
                            opacity: 0.35 + eased * 0.3,
                            filter: eased < 0.3 ? "brightness(0.5) sepia(0.3)" : "brightness(1.1)",
                            transition: "opacity 0.5s ease-out, filter 0.5s ease-out",
                          }}
                        />

                        {/* 3. Emerald life tint overlay */}
                        <div className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "radial-gradient(circle at 38% 38%, rgba(52,211,153,1) 0%, rgba(16,120,60,0.7) 55%, transparent 100%)",
                            opacity: greenTintOpacity,
                            mixBlendMode: "color",
                            transition: "opacity 0.4s ease-out",
                          }} />

                        {/* 4. Spherical lighting overlay (homepage style) */}
                        <div className="absolute inset-0 pointer-events-none rounded-full z-10 mix-blend-multiply"
                          style={{
                            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(200,200,200,0.85) 25%, rgba(80,80,80,0.5) 55%, rgba(0,0,0,0.92) 82%, rgba(0,0,0,1) 100%)",
                          }} />

                        {/* 5. Rim atmosphere glow */}
                        <div className="absolute inset-0 pointer-events-none rounded-full"
                          style={{
                            boxShadow: `inset 0 0 ${25 + eased * 15}px ${glowColor}, inset -4px 0 12px ${glowColor}`,
                            transition: "box-shadow 0.5s ease-out",
                          }} />
                      </div>

                      {/* Timeline badge */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2
                                      px-4 py-1.5 rounded-full backdrop-blur-xl
                                      border border-emerald-500/25 text-[9px] font-black
                                      text-emerald-300 tracking-[0.15em] whitespace-nowrap"
                        style={{ background: "rgba(2,10,6,0.85)" }}>
                        {avgProgress <= 0.05 ? "CURRENT TIMELINE"
                          : avgProgress >= 0.95 ? "✦ REGENERATED TIMELINE"
                          : "◈ TRANSFORMATION STATE"}
                      </div>
                    </div>

                    {/* ── Stat chips ── */}
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {[
                        { icon: Plane,          label: "Flights Avoided",  value: flightsAvoided,  unit: "flights/yr",  color: "text-sky-400",    glow: "rgba(56,189,248,0.12)" },
                        { icon: BatteryCharging, label: "Grid Power Saved", value: gridMonthsSaved, unit: "months equiv.", color: "text-yellow-400", glow: "rgba(250,204,21,0.12)" },
                        { icon: Leaf,            label: "Trees Nourished",  value: treeEquivalents, unit: "trees/yr",     color: "text-emerald-400", glow: "rgba(52,211,153,0.12)" },
                      ].map((stat) => (
                        <div key={stat.label}
                          className="flex flex-col items-center gap-1.5 p-4 rounded-2xl text-center"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            boxShadow: `inset 0 0 30px ${stat.glow}`,
                          }}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-xl font-black text-white leading-none tabular-nums">{stat.value}</span>
                          <span className="text-[9px] font-bold text-white/40 leading-tight uppercase tracking-wide">{stat.unit}</span>
                          <span className="text-[8px] font-semibold text-white/25 leading-tight">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* ── CO2 savings total ── */}
                    <div className="w-full rounded-2xl p-5 text-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg,rgba(52,211,153,0.08) 0%,rgba(16,185,129,0.04) 100%)",
                        border: "1px solid rgba(52,211,153,0.18)",
                      }}>
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(52,211,153,0.08) 0%,transparent 70%)" }} />
                      <span className="block text-[9px] font-black text-emerald-400/70 tracking-[0.2em] uppercase mb-2">
                        Simulated CO₂ Savings
                      </span>
                      <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl font-black text-white tabular-nums leading-none">
                          {totalKgYear.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-emerald-400">kg / yr</span>
                      </div>
                    </div>
                  </div>

                  {/* ════════════════════════════════════════
                      RIGHT PANEL — Sliders + Narrative
                  ════════════════════════════════════════ */}
                  <div className="flex flex-col gap-7 p-10 lg:p-12 flex-1">

                    {/* Panel header */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white tracking-tight">Climate Impact Controls</h3>
                      <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                        Adjust each category independently — your Earth responds instantly.
                      </p>
                    </div>

                    {/* ── Premium slider cards ── */}
                    <div className="space-y-4">
                      {sliders.map((s) => {
                        const Icon = s.icon as React.FC<{ className?: string }>
                        const val = twin[s.key]
                        const kgThisSlider = Math.round((val / 100) * s.maxKg)
                        return (
                          <div key={s.key}
                            className="rounded-2xl p-4 space-y-3 transition-all duration-200"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${val > 0 ? s.trackColor + "30" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: val > 0 ? `0 0 24px ${s.trackColor}12` : "none",
                              transition: "border-color 0.3s, box-shadow 0.3s",
                            }}>

                            {/* Label row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                  style={{ background: s.trackColor + "20" }}>
                                  <Icon className={`h-4 w-4 ${s.color}`} />
                                </div>
                                <span className="text-sm font-bold text-white">{s.label}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-black tabular-nums leading-none"
                                  style={{ color: val > 0 ? s.trackColor : "rgba(255,255,255,0.3)" }}>
                                  {val}%
                                </div>
                                <div className="text-[9px] font-semibold text-white/30 mt-0.5">
                                  −{kgThisSlider.toLocaleString()} kg/yr
                                </div>
                              </div>
                            </div>

                            {/* Slider */}
                            <input
                              id={`slider-${s.key}`}
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={val}
                              onChange={(e) =>
                                setTwin((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                              }
                              className="twin-slider w-full cursor-pointer"
                              style={{
                                "--slider-fill": s.trackColor,
                                "--slider-pct": `${val}%`,
                              } as React.CSSProperties}
                              aria-label={s.label}
                            />

                            {/* Mini progress bar with glow */}
                            <div className="h-[2px] w-full rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${val}%`,
                                  background: `linear-gradient(90deg, ${s.trackColor}80, ${s.trackColor})`,
                                  boxShadow: val > 0 ? `0 0 8px ${s.trackColor}` : "none",
                                }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* ── Narrative card ── */}
                    <div className="rounded-2xl p-5 relative overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}>
                      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                        style={{ background: `linear-gradient(180deg,${glowColor},transparent)` }} />
                      <p className="text-[11px] font-semibold leading-relaxed text-white/60 pl-3">
                        &ldquo;{getTwinNarrative()}&rdquo;
                      </p>
                    </div>

                    {/* ── CTA ── */}
                    <button
                      onClick={() => router.push("/missions")}
                      className="w-full py-4 rounded-2xl font-bold text-sm
                                 flex items-center justify-center gap-2
                                 transition-all duration-200 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg,#059669,#10b981)",
                        boxShadow: "0 8px 32px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                        color: "#fff",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 12px 40px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)")}
                    >
                      Start These Missions <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── BOTTOM CTA (story tab) ────────────────────────────────────── */}
        {activeSubTab === "story" && (
          <div className="flex justify-center pt-4">
            <Link href="/missions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-premium px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                Rewrite Your Story in Missions Center
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
