"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Sprout, Target, BarChart2, User } from "lucide-react"

type RouteKey = "garden" | "missions" | "analysis" | "identity"

interface RouteConfig {
  icon: React.ReactNode
  title: string
  teaser: string
  cta: string
  preview: React.ReactNode
}

const ROUTE_CONFIG: Record<RouteKey, RouteConfig> = {
  garden: {
    icon: <Sprout className="h-9 w-9 text-emerald-500" />,
    title: "Your Garden is Waiting",
    teaser: "Your 3D island ecosystem is ready to grow. Takes 90 seconds to start.",
    cta: "Grow My Garden",
    preview: (
      <div className="space-y-3">
        {/* Island silhouette */}
        <div className="mx-auto w-48 h-32 rounded-2xl bg-gradient-to-b from-emerald-800/40 to-forest-900/60 border border-emerald-500/15 flex items-end justify-center pb-4 overflow-hidden relative">
          {/* Water ring */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-900/30 rounded-b-2xl" />
          {/* Island body */}
          <div className="w-28 h-16 rounded-full bg-emerald-900/50 border border-emerald-500/20 flex items-center justify-center relative">
            <div className="text-2xl">🌳</div>
            <div className="absolute -left-3 bottom-2 text-lg">🌱</div>
            <div className="absolute -right-3 bottom-2 text-lg">🌿</div>
          </div>
        </div>
        {/* Level bar */}
        <div className="mx-auto w-48 space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-emerald-500/60 uppercase tracking-wider">
            <span>Level 3</span><span>200 pts</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-900/40 rounded-full">
            <div className="h-full w-3/5 bg-emerald-500/40 rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  missions: {
    icon: <Target className="h-9 w-9 text-emerald-500" />,
    title: "3 Missions Are Ready",
    teaser: "Clover has 3 personal eco-missions and daily actions waiting for you. Takes 90 seconds to start.",
    cta: "See My Missions",
    preview: (
      <div className="space-y-2 w-full max-w-xs mx-auto">
        {[
          { emoji: "🚲", label: "Skip the Car Today", pts: "+15 pts" },
          { emoji: "🥗", label: "One Plant-Based Meal", pts: "+15 pts" },
          { emoji: "🔌", label: "Unplug Standby Devices", pts: "+10 pts" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/10">
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] font-bold text-emerald-300/70 flex-1">{item.label}</span>
            <span className="text-[10px] font-black text-emerald-500/60">{item.pts}</span>
          </div>
        ))}
      </div>
    ),
  },
  analysis: {
    icon: <BarChart2 className="h-9 w-9 text-emerald-500" />,
    title: "Your Carbon Story is Waiting",
    teaser: "Your full carbon analysis and Climate Twin projection are one profile away. Takes 90 seconds.",
    cta: "Reveal My Analysis",
    preview: (
      <div className="space-y-2 w-full max-w-xs mx-auto">
        <div className="h-16 rounded-xl bg-gradient-to-r from-emerald-900/40 to-forest-900/30 border border-emerald-500/10 flex items-center px-4 gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-sm">🪬</div>
          <div>
            <div className="h-2 w-24 bg-emerald-500/25 rounded mb-1.5" />
            <div className="h-1.5 w-16 bg-emerald-500/15 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["✈️", "⚡", "🌳"].map((emoji, i) => (
            <div key={i} className="h-14 rounded-xl bg-emerald-900/30 border border-emerald-500/10 flex flex-col items-center justify-center gap-1">
              <span className="text-lg">{emoji}</span>
              <div className="h-1.5 w-8 bg-emerald-500/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  identity: {
    icon: <User className="h-9 w-9 text-emerald-500" />,
    title: "Your Climate Identity Awaits",
    teaser: "Your AI-generated Climate Identity is ready to be revealed. Takes 90 seconds to start.",
    cta: "Reveal My Identity",
    preview: (
      <div className="w-full max-w-xs mx-auto">
        <div className="rounded-2xl bg-gradient-to-b from-emerald-900/40 to-forest-900/50 border border-emerald-500/15 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center text-xl">🪬</div>
            <div>
              <div className="h-2.5 w-28 bg-emerald-500/30 rounded mb-2" />
              <div className="h-1.5 w-20 bg-emerald-500/15 rounded" />
            </div>
          </div>
          <div className="h-1 w-full bg-emerald-500/10 rounded" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-emerald-500/15 rounded" />
            <div className="h-1.5 w-4/5 bg-emerald-500/10 rounded" />
            <div className="h-1.5 w-3/5 bg-emerald-500/10 rounded" />
          </div>
        </div>
      </div>
    ),
  },
}

interface LockedScreenPreviewProps {
  route: RouteKey
}

export const LockedScreenPreview: React.FC<LockedScreenPreviewProps> = ({ route }) => {
  const router = useRouter()
  const config = ROUTE_CONFIG[route]

  return (
    <div className="flex-1 relative flex items-center justify-center py-8 w-full overflow-hidden min-h-[70vh]">
      {/* Blurred silhouette background */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none blur-[5px] grayscale opacity-25 scale-105"
      >
        <div className="w-full max-w-2xl px-8 py-12 space-y-4">
          {config.preview}
        </div>
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60 dark:from-forest-950/70 dark:via-transparent dark:to-forest-950/70 pointer-events-none" />

      {/* Glass lock card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-auto rounded-3xl border border-emerald-500/20 shadow-2xl p-8 text-center space-y-5 backdrop-blur-xl bg-white/85 dark:bg-forest-950/85"
      >
        {/* Icon with ambient glow */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/15 shadow-inner">
          {config.icon}
          <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-xl animate-pulse" />
          {/* Lock badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sand-100 dark:bg-forest-900 border border-sand-200 dark:border-forest-700 flex items-center justify-center shadow-sm">
            <Lock className="h-3.5 w-3.5 text-sand-500 dark:text-sand-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-sand-950 dark:text-white">{config.title}</h3>
          <p className="text-xs text-sand-600 dark:text-sand-300 font-semibold leading-relaxed">
            {config.teaser.split("Takes 90 seconds").map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-emerald-500 font-bold">Takes 90 seconds</span>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>

        <motion.button
          onClick={() => router.push("/onboarding")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-premium w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {config.cta}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  )
}
