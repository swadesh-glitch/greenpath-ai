/**
 * @file GardenPreviewPanel.tsx
 * @responsibility Renders the interactive Carbon Garden progress panel inside the missions hub,
 * illustrating current diorama level, thresholds, and next level requirements.
 */
import React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sprout, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Counter } from "@/components/shared/Counter"

interface GardenPreviewPanelProps {
  /** Current garden level integer [0, 5]. */
  gardenLevel: number
  /** Accumulated carbon points total. */
  points: number
  /** Point threshold for the current level. */
  curThreshold: number
  /** Point threshold required to reach the next level. */
  nextThreshold: number
  /** Percentage of progress towards the next level [0, 100]. */
  progressPct: number
  /** True when the points value changes to trigger a scale bump animation. */
  animatePreview: boolean
}

/**
 * Resolves static visual tokens (emoji, gradients, labels) for each garden level.
 *
 * @param lvl - Garden level [0, 5].
 */
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

/**
 * GardenPreviewPanel component rendering level name, progress bar, and quick link
 * to route back to `/garden`.
 *
 * @param props - {@link GardenPreviewPanelProps}
 */
export function GardenPreviewPanel({
  gardenLevel,
  points,
  curThreshold,
  nextThreshold,
  progressPct,
  animatePreview,
}: GardenPreviewPanelProps) {
  const router = useRouter()

  return (
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
        <span className="text-4xl" aria-hidden="true">
          {getGardenPreviewVisual(gardenLevel).emoji}
        </span>
        <span className="absolute bottom-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
          Diorama
        </span>
      </motion.div>

      {/* Content & Progress */}
      <div className="flex-1 space-y-3.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-extrabold text-sm uppercase text-sand-800 dark:text-sand-400 tracking-wider flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-500" /> Active Garden Preview
            </h2>
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
            <span>
              <Counter value={points} /> / {nextThreshold} pts
            </span>
            <span>
              <Counter value={Math.max(0, nextThreshold - points)} /> pts to Level {Math.min(gardenLevel + 1, 5)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full md:w-auto shrink-0 flex justify-end">
        <motion.button
          onClick={() => router.push("/garden")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-premium w-full md:w-auto px-5 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/10 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
          aria-label="View the 3D garden diorama"
        >
          See 3D Garden
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
