"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { Car, Utensils, Zap, ShoppingBag, ArrowRight, Sparkles, Sprout, Target, Shield, Trees, Compass } from "lucide-react"

// Dynamically import photorealistic 2D Globe component with SSR disabled
const Globe = dynamic(() => import("@/components/storytelling/Globe").then((mod) => mod.Globe), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-emerald-500 font-semibold text-sm animate-pulse">
      Rendering planet simulation...
    </div>
  ),
})

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<"identity" | "missions" | "garden">("identity")

  // Track page scroll progress to feed into 3D Earth transformation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest)
  })

  // Map scroll progress to storytelling stages
  const stage = 
    scrollProgress < 0.25 ? "polluted" :
    scrollProgress < 0.50 ? "awareness" :
    scrollProgress < 0.75 ? "recovery" :
    "thriving";

  // Stagger animation configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
  }

  // Smooth scroll helper
  const scrollToNextSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div ref={containerRef} className="relative w-full flex flex-col bg-sand-50 dark:bg-forest-950 text-foreground transition-colors duration-300">
      
      {/* 3D STICKY CANVAS CONTAINER (Occupies 35-45% width on desktop, fixed on right) */}
      <motion.div 
        style={{
          scale: 1 - scrollProgress * 0.35,
          opacity: scrollProgress > 0.85 ? Math.max(0, 1 - (scrollProgress - 0.85) * 6.6) : 1
        }}
        className="fixed right-4 lg:right-12 top-[12vh] w-full lg:w-[42%] h-[60vh] lg:h-[75vh] pointer-events-none z-10 flex items-center justify-center select-none lg:opacity-100"
      >
        <Globe stage={stage} progress={scrollProgress} />
      </motion.div>

      {/* SCENE 1: THE WORLD TODAY (Hero Section) */}
      <section className="min-h-[85vh] flex flex-col justify-center items-start py-12 relative overflow-hidden lg:w-[55%] z-20">
        <div className="space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] tracking-wider uppercase"
          >
            <Sparkles className="h-3 w-3 fill-current" />
            3D CLIMATE SIMULATION
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05]"
          >
            The Planet Doesn&apos;t Need <br />
            <span className="text-gradient-green bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              Perfect People.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-sand-800 dark:text-sand-200 leading-relaxed font-semibold"
          >
            It needs millions of people making small sustainable choices. Your choices matter, starting today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-premium px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                Start My Climate Journey
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>

            <button
              onClick={() => scrollToNextSection("problem-section")}
              className="px-6 py-4 glass-panel-light dark:glass-panel-dark text-sand-800 dark:text-sand-200 rounded-2xl font-bold hover:bg-sand-100 dark:hover:bg-forest-900/40 transition-colors"
            >
              Watch The Story
            </button>
          </motion.div>
        </div>
      </section>

      {/* SCENE 2: THE TURNING POINT */}
      <section id="problem-section" className="min-h-[85vh] flex flex-col justify-center items-start py-16 border-t border-sand-200/50 dark:border-forest-900/40 lg:w-[55%] z-20">
        <div className="space-y-8 max-w-xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Every Choice Leaves A Footprint.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-sand-800 dark:text-sand-200 font-semibold">
              The planet is currently clouded by smoke and industrial haze. Small choices compound into our global reality.
            </motion.p>
          </motion.div>

          {/* Staggered category cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            {[
              { name: "Transportation", icon: Car, val: "🚗 commutes", color: "from-red-500/10 to-transparent border-red-500/25" },
              { name: "Food Diet", icon: Utensils, val: "🍔 meatless targets", color: "from-amber-500/10 to-transparent border-amber-500/25" },
              { name: "Home Energy", icon: Zap, val: "⚡ smart savings", color: "from-yellow-500/10 to-transparent border-yellow-500/25" },
              { name: "Shopping", icon: ShoppingBag, val: "🛍 plastic audits", color: "from-blue-500/10 to-transparent border-blue-500/25" },
            ].map((cat) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.name}
                  variants={itemVariants}
                  className={`p-5 rounded-2xl border bg-gradient-to-br ${cat.color} bg-white/40 dark:bg-forest-900/10 flex items-center gap-3`}
                >
                  <span className="p-2 rounded-xl bg-white dark:bg-forest-950 shadow-sm border border-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight text-foreground">{cat.name}</h4>
                    <span className="text-[10px] opacity-60 font-semibold">{cat.val}</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* SCENE 3: TRANSFORMATION */}
      <section id="possibility-section" className="min-h-[85vh] flex flex-col justify-center items-start py-16 border-t border-sand-200/50 dark:border-forest-900/40 lg:w-[55%] z-20">
        <div className="space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] tracking-wide uppercase border border-emerald-500/20">
              <Trees className="h-3 w-3 fill-current" />
              ECO REGENERATION
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Small Actions.<br />
              <span className="text-gradient-green bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Global Impact.
              </span>
            </h2>
            <p className="text-md text-sand-800 dark:text-sand-300 font-semibold leading-relaxed">
              As you scroll and log climate activities, notice the planet changing. Grey smog starts clearing. Fresh vegetation takes root. Light breaks through the clouds. The choices you make today shape the planet of tomorrow.
            </p>
          </motion.div>

          {/* Interactive Growing Sprout Indicator Card */}
          <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 flex items-center gap-6 shadow-md">
            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
              🌱
            </div>
            <div className="text-left space-y-1">
              <h4 className="font-extrabold text-sm">Active Seed Sprouting</h4>
              <p className="text-xs opacity-60 leading-normal font-semibold">
                Your profile registers as a fresh sprout. Every completed mission adds foliage and clears atmosphere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SCENE 4: THRIVING PLANET */}
      <section id="about-section" className="min-h-[85vh] flex flex-col justify-center items-start py-16 border-t border-sand-200/50 dark:border-forest-900/40 lg:w-[55%] z-20">
        <div className="space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              A Better Future Is Possible.
            </h2>
            <p className="text-md text-sand-800 dark:text-sand-300 font-semibold leading-relaxed">
              Witness the destination of our journey. A bright green atmosphere, healthy forests, clean oceans, and shimmering sunlight beams. When we all play our part, the ecosystem thrives.
            </p>
          </motion.div>

          {/* Environmental facts list */}
          <div className="space-y-3 pt-2">
            {[
              "100% Procedural 3D planetary rendering model.",
              "Track real-world CO2 offsets dynamically in our mission log.",
              "Watch birds, butterflies, and foliage expand in your digital garden.",
            ].map((fact, index) => (
              <div key={index} className="flex items-center gap-3 text-xs font-semibold">
                <span className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 5: GREENPATH REVEAL */}
      <section id="preview-section" className="min-h-screen py-20 border-t border-sand-200/50 dark:border-forest-900/40 z-20 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs mx-auto">
            <Compass className="h-3.5 w-3.5" />
            PRODUCT SHOWCASE
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            Meet GreenPath AI
          </h2>
          <p className="text-sand-800 dark:text-sand-200 font-semibold max-w-xl mx-auto leading-relaxed">
            Your personal climate companion that helps you understand your impact, reduce your footprint, and grow a thriving digital ecosystem.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex justify-center gap-3 p-1.5 glass-panel-light dark:glass-panel-dark rounded-2xl max-w-md mx-auto">
          {[
            { id: "identity", label: "Climate Identity", icon: Shield },
            { id: "missions", label: "Missions", icon: Target },
            { id: "garden", label: "Carbon Garden", icon: Sprout },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-sand-800 dark:text-sand-200 opacity-70"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="reveal-tab-pill"
                    className="absolute inset-0 bg-white dark:bg-forest-950 rounded-xl shadow-sm border border-sand-200/40 dark:border-forest-800/40 -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Showcase Panel Cards */}
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "identity" && (
              <motion.div
                key="tab-id"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-panel-light dark:glass-panel-dark rounded-3xl p-8 border border-emerald-500/10 shadow-lg text-center space-y-4 max-w-md mx-auto"
              >
                <span className="text-5xl">🌱</span>
                <h3 className="font-extrabold text-xl">Conscious Commuter</h3>
                <p className="text-sm opacity-70 leading-relaxed font-semibold">
                  A personalized climate identity card. Active transit choices boost your streak and award bonus green points daily.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Perk: +20% CO2 savings
                  </span>
                </div>
              </motion.div>
            )}

            {activeTab === "missions" && (
              <motion.div
                key="tab-miss"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 max-w-md mx-auto"
              >
                {[
                  { title: "Commute Car-Free", points: "+50 pts", desc: "Walk, bike, or use transit" },
                  { title: "Meatless Meals", points: "+30 pts", desc: "Choose plant-based proteins" },
                ].map((m) => (
                  <div key={m.title} className="p-4 rounded-2xl glass-panel-light dark:glass-panel-dark border border-emerald-500/10 flex justify-between items-center text-left">
                    <div>
                      <h4 className="font-bold text-sm">{m.title}</h4>
                      <p className="text-xs opacity-60 font-semibold">{m.desc}</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-1 rounded-full">
                      {m.points}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "garden" && (
              <motion.div
                key="tab-gar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center space-y-4"
              >
                {/* Visual miniature representation of garden */}
                <div className="relative w-48 h-48 flex items-center justify-center bg-emerald-500/10 rounded-full border border-emerald-500/10 overflow-hidden shadow-inner">
                  {/* Floating particles details */}
                  <span className="text-6xl animate-bounce">🌳</span>
                  <span className="absolute bottom-6 right-6 text-3xl animate-pulse">🦋</span>
                  <span className="absolute top-6 left-8 text-2xl">☁️</span>
                  {/* Glowing background rays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                </div>
                <div>
                  <h4 className="font-extrabold text-md text-emerald-600 dark:text-emerald-400">Carbon Garden (Level 3)</h4>
                  <p className="text-xs opacity-60 leading-relaxed font-semibold max-w-xs mx-auto">
                    Progression stages: Seed → Sprout → Tree → Forest → Thriving Ecosystem. Plants and weather adjust dynamically.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global call to action */}
        <div className="pt-8 text-center space-y-4">
          <h3 className="font-extrabold text-xl">Ready to reshape the future?</h3>
          <Link href="/onboarding">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-premium px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm uppercase tracking-wider"
            >
              Start My Onboarding Journey
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  )
}
