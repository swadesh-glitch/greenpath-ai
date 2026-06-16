"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { climateIdentities } from "@/data/climate-identities"
import { ArrowRight, Sparkles, Bike, Leaf, Zap, Shield } from "lucide-react"

type OnboardingStep = "name" | "concern" | "habit" | "loading" | "reveal"

const PROGRESS_STAGES = [
  { name: "Seed", icon: "🌱" },
  { name: "Sprout", icon: "🌿" },
  { name: "Plant", icon: "🪴" },
  { name: "Tree", icon: "🌳" },
  { name: "Forest", icon: "🌲" },
]

export default function Onboarding() {
  const router = useRouter()
  const { completeOnboarding } = useAppContext()

  const [step, setStep] = useState<OnboardingStep>("name")
  const [stepIdx, setStepIdx] = useState(0) // 0 to 4
  const [userName, setUserName] = useState("")
  const [primaryConcern, setPrimaryConcern] = useState("")
  const [dailyHabit, setDailyHabit] = useState("")
  
  // Loading phrases
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0)
  const loadingPhrases = [
    "Understanding your habits...",
    "Analyzing daily choices...",
    "Building your Climate Identity...",
    "Creating your personalized journey...",
  ]

  // Calculated Identity
  const [calculatedId, setCalculatedId] = useState("")

  // Loading Screen Timer
  useEffect(() => {
    if (step === "loading") {
      const phraseInterval = setInterval(() => {
        setLoadingPhraseIdx((prev) => {
          if (prev < loadingPhrases.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 1200)

      const revealTimeout = setTimeout(() => {
        clearInterval(phraseInterval)
        
        // Calculate Identity based on answers
        let identity = "eco_champion" // default
        if (primaryConcern === "transport" || dailyHabit === "driving") {
          identity = "conscious_commuter"
        } else if (primaryConcern === "food" || dailyHabit === "meat") {
          identity = "green_foodie"
        } else if (primaryConcern === "energy" || dailyHabit === "heating") {
          identity = "energy_optimizer"
        }
        
        setCalculatedId(identity)
        setStep("reveal")
        setStepIdx(4) // Forest stage
      }, 5000)

      return () => {
        clearInterval(phraseInterval)
        clearTimeout(revealTimeout)
      }
    }
  }, [step, primaryConcern, dailyHabit, loadingPhrases.length])

  // Move to next step
  const nextStep = () => {
    if (step === "name" && userName.trim() !== "") {
      setStep("concern")
      setStepIdx(1) // Sprout
    } else if (step === "concern" && primaryConcern !== "") {
      setStep("habit")
      setStepIdx(2) // Plant
    } else if (step === "habit" && dailyHabit !== "") {
      setStep("loading")
      setStepIdx(3) // Tree
    }
  }

  // Handle final reveal confirmation
  const handleRevealConfirm = () => {
    completeOnboarding(calculatedId, userName)
    router.push("/garden")
  }

  // Choose icon for Identity card
  const getIdentityIcon = (iconName: string) => {
    switch (iconName) {
      case "Bike":
        return <Bike className="h-10 w-10 text-emerald-500" />
      case "Leaf":
        return <Leaf className="h-10 w-10 text-emerald-500" />
      case "Zap":
        return <Zap className="h-10 w-10 text-emerald-500" />
      default:
        return <Shield className="h-10 w-10 text-emerald-500" />
    }
  }

  const currentIdentity = climateIdentities.find((id) => id.id === calculatedId)

  // Card Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95, x: 20 },
    animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] as const } },
    exit: { opacity: 0, scale: 0.95, x: -20, transition: { duration: 0.3 } },
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 max-w-2xl mx-auto w-full min-h-[80vh] relative">
      
      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      {/* Onboarding Header (Progress Bar and Sprout States) */}
      {step !== "loading" && step !== "reveal" && (
        <div className="w-full mb-8 text-center space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-sand-800 dark:text-sand-300">
            <span>Progress: {PROGRESS_STAGES[stepIdx].name}</span>
            <span className="text-lg">{PROGRESS_STAGES[stepIdx].icon}</span>
          </div>
          {/* Visual growth indicator bar */}
          <div className="w-full h-1.5 bg-sand-200 dark:bg-forest-900/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: "20%" }}
              animate={{ width: `${(stepIdx + 1) * 20}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Main Conversational Container */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: User's Name */}
        {step === "name" && (
          <motion.div
            key="step-name"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <span className="text-3xl">👋</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Let&apos;s start with your name.</h2>
            <p className="text-sm opacity-70 max-w-md mx-auto">
              We personalize your journey and climate reports. What should we call you?
            </p>
            
            <div className="pt-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && nextStep()}
                placeholder="Eco Hero"
                className="w-full max-w-sm px-5 py-4 rounded-2xl border border-sand-300 dark:border-forest-800 bg-white dark:bg-forest-950/60 text-foreground text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-shadow"
                autoFocus
              />
            </div>

            <div className="pt-4 flex justify-center">
              <button
                disabled={userName.trim() === ""}
                onClick={nextStep}
                className="btn-premium px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl font-bold flex items-center gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Primary Concern */}
        {step === "concern" && (
          <motion.div
            key="step-concern"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <span className="text-3xl">🌏</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hey {userName}, what is your primary green concern?
            </h2>
            <p className="text-sm opacity-70">Pick one area you care about reducing the most.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              {[
                { id: "transport", label: "Commutes & Vehicles", desc: "Reducing daily transit impact" },
                { id: "food", label: "Sustainable Foods", desc: "Eating local & plant-based" },
                { id: "energy", label: "Energy Savings", desc: "Optimizing utility bills" },
                { id: "waste", label: "Waste Reduction", desc: "Composting & zero plastic" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPrimaryConcern(c.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col space-y-1 hover:border-emerald-500/60 dark:hover:border-emerald-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-forest-950/50 ${
                    primaryConcern === c.id
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5"
                      : "border-sand-300 dark:border-forest-800"
                  }`}
                >
                  <span className="font-bold text-sm">{c.label}</span>
                  <span className="text-xs opacity-60 font-medium">{c.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between max-w-md mx-auto">
              <button
                onClick={() => {
                  setStep("name")
                  setStepIdx(0)
                }}
                className="px-4 py-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
              >
                Back
              </button>
              <button
                disabled={primaryConcern === ""}
                onClick={nextStep}
                className="btn-premium px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl font-bold flex items-center gap-2"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Daily Habits */}
        {step === "habit" && (
          <motion.div
            key="step-habit"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <span className="text-3xl">⏳</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Which habit describes you best?
            </h2>
            <p className="text-sm opacity-70">This determines your starting daily carbon footprint level.</p>

            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto pt-2">
              {[
                { id: "driving", label: "I drive a personal car daily", icon: "🚗" },
                { id: "meat", label: "I eat meat most days", icon: "🍔" },
                { id: "heating", label: "I keep heater/AC on high", icon: "⚡" },
                { id: "shopping", label: "I shop frequently online", icon: "🛍" },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => setDailyHabit(h.id)}
                  className={`p-4 rounded-xl border text-left flex items-center gap-4 hover:border-emerald-500/60 hover:scale-[1.01] transition-all bg-white dark:bg-forest-950/50 ${
                    dailyHabit === h.id
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                      : "border-sand-300 dark:border-forest-800"
                  }`}
                >
                  <span className="text-xl">{h.icon}</span>
                  <span className="font-bold text-sm">{h.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between max-w-sm mx-auto">
              <button
                onClick={() => {
                  setStep("concern")
                  setStepIdx(1)
                }}
                className="px-4 py-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
              >
                Back
              </button>
              <button
                disabled={dailyHabit === ""}
                onClick={nextStep}
                className="btn-premium px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl font-bold flex items-center gap-2"
              >
                Build My Journey
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Loading Screen */}
        {step === "loading" && (
          <motion.div
            key="step-loading"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-10 shadow-xl text-center space-y-8 flex flex-col items-center justify-center min-h-[350px]"
          >
            {/* Growing Tree Animation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🌳
              </motion.div>
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
            </div>

            {/* Custom Loading Words */}
            <div className="space-y-2">
              <motion.h3
                key={loadingPhraseIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400"
              >
                {loadingPhrases[loadingPhraseIdx]}
              </motion.h3>
              <p className="text-xs opacity-50 font-medium">Crunching environmental impact metrics...</p>
            </div>
          </motion.div>
        )}

        {/* STEP 5: WOW Identity Reveal */}
        {step === "reveal" && currentIdentity && (
          <motion.div
            key="step-reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            className="w-full relative"
          >
            {/* Particle effects behind the card */}
            <div className="absolute inset-0 bg-radial-[circle_at_50%_40%] from-emerald-500/20 to-transparent blur-2xl pointer-events-none -z-10" />

            <div className="w-full glass-panel-light dark:glass-panel-dark rounded-3xl p-8 shadow-2xl border-2 border-emerald-500/20 text-center space-y-6 relative overflow-hidden">
              {/* Corner decoration glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/10 rounded-full blur-xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-yellow/15 text-yellow-600 dark:text-yellow-400 font-extrabold text-[10px] tracking-wider uppercase border border-accent-yellow/20">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                CLIMATE IDENTITY REVEALED
              </div>

              <div className="mx-auto h-20 w-20 rounded-2xl bg-white dark:bg-forest-950 flex items-center justify-center shadow-lg border border-emerald-500/10">
                {getIdentityIcon(currentIdentity.icon)}
              </div>

              <h2 className="text-3xl font-black tracking-tight text-gradient-green bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                {currentIdentity.title}
              </h2>
              
              <p className="text-sm font-semibold text-sand-800 dark:text-sand-200 leading-relaxed max-w-md mx-auto">
                {currentIdentity.description}
              </p>

              {/* Bonus Trait Details */}
              <div className="py-4 px-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 max-w-sm mx-auto text-left space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Starting Bonus:
                </span>
                <p className="text-sm font-bold text-foreground">
                  {currentIdentity.startingBonus}
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {currentIdentity.traits.map((trait) => (
                    <span
                      key={trait}
                      className="text-[9px] font-bold px-2 py-0.5 bg-white dark:bg-forest-900/60 text-sand-900 dark:text-sand-100 rounded-full border border-sand-200 dark:border-forest-800"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleRevealConfirm}
                  className="btn-premium w-full max-w-xs py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20"
                >
                  Enter My Carbon Garden
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
