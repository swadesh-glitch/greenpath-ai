"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { Car, Utensils, Zap, ShoppingBag, ArrowRight, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ClimateAnalysis() {
  const router = useRouter()
  const { isOnboarded, selectedIdentity, points, co2SavedKg } = useAppContext()

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding")
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null

  // Impact categories
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

  return (
    <div className="flex-1 space-y-10 py-6 max-w-4xl mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <BookOpen className="h-3.5 w-3.5" />
          CLIMATE STORY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Climate Story</h1>
        <p className="text-sand-800 dark:text-sand-200 font-medium max-w-xl leading-relaxed">
          GreenPath AI doesn&apos;t just show carbon statistics. We translate your habits into a continuous, evolving narrative about your impact.
        </p>
      </div>

      {/* CORE NARRATIVE HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel-light dark:glass-panel-dark rounded-3xl p-6 md:p-8 border border-emerald-500/10 shadow-lg relative overflow-hidden"
      >
        {/* Glow overlay */}
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
      </motion.div>

      {/* DETAILED CATEGORY STORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((c, index) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ 
                y: -6, 
                boxShadow: "0 20px 40px -15px rgba(16,185,129,0.12)",
              }}
              className={`group flex flex-col justify-between p-6 rounded-3xl border bg-gradient-to-br ${c.color} shadow-md transition-all relative overflow-hidden`}
            >
              {/* Outer Glow on Hover */}
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.015] duration-300 pointer-events-none" />

              <div className="space-y-4">
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-white dark:bg-forest-950 flex items-center justify-center shadow-sm border border-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white dark:bg-forest-950/80 text-sand-900 dark:text-sand-100 border border-sand-200 dark:border-forest-800/80">
                    {c.level}
                  </span>
                </div>

                {/* Card Title & Text */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground">{c.title}</h3>
                  <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">
                    {c.description}
                  </p>
                </div>
              </div>

              {/* Progress and Potential bottom section */}
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

      {/* STORY ACTION CTA CARD */}
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
    </div>
  )
}
