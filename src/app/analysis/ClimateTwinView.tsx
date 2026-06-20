"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Car, Leaf, BatteryCharging, ShoppingBag,
  Plane, ArrowRight
} from "lucide-react"

const TRANSIT_MAX_KG  = 1200   // ~42 kg/mo × 12 = 504 → upgraded to realistic max
const DIET_MAX_KG     = 600
const ENERGY_MAX_KG   = 450
const SHOPPING_MAX_KG = 300

type SliderKey = "transit" | "diet" | "energy" | "shopping"

export interface TwinState {
  transit:  number   // 0–100
  diet:     number
  energy:   number
  shopping: number
}

interface ClimateTwinViewProps {
  twin: TwinState
  setTwin: React.Dispatch<React.SetStateAction<TwinState>>
}

export function ClimateTwinView({ twin, setTwin }: ClimateTwinViewProps) {
  const router = useRouter()

  // ── Globe rotation clock (same technique as homepage Globe.tsx) ───────────
  // Drives backgroundPosition on a cylindrical earth map to simulate spin.
  const rafRef   = useRef<number>(0)
  const [mapX, setMapX] = useState(0)          // earth map offset %
  const [cloudsX, setCloudsX] = useState(0)    // clouds offset %

  useEffect(() => {
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
  }, [])

  // ── Computed twin metrics ──────────────────────────────────────────────────
  const totalKgYear = useMemo(() => {
    return Math.round(
      (twin.transit  / 100) * TRANSIT_MAX_KG  +
      (twin.diet     / 100) * DIET_MAX_KG     +
      (twin.energy   / 100) * ENERGY_MAX_KG   +
      (twin.shopping / 100) * SHOPPING_MAX_KG
    )
  }, [twin])

  const avgProgress = (twin.transit + twin.diet + twin.energy + twin.shopping) / 400 // 0–1

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

  // ── Slider config ──────────────────────────────────────────────────────────
  const sliders: { key: SliderKey; label: string; icon: React.ElementType; maxKg: number; color: string; trackColor: string }[] = [
    { key: "transit",  label: "Transit Improvement",  icon: Car,         maxKg: TRANSIT_MAX_KG,  color: "text-emerald-400", trackColor: "#34d399" },
    { key: "diet",     label: "Diet Improvement",     icon: Leaf,        maxKg: DIET_MAX_KG,     color: "text-lime-400",    trackColor: "#a3e635" },
    { key: "energy",   label: "Energy Efficiency",    icon: BatteryCharging, maxKg: ENERGY_MAX_KG, color: "text-yellow-400", trackColor: "#facc15" },
    { key: "shopping", label: "Shopping & Waste",     icon: ShoppingBag, maxKg: SHOPPING_MAX_KG, color: "text-sky-400",     trackColor: "#38bdf8" },
  ]

  return (
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
  )
}
