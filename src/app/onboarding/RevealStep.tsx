/**
 * @file RevealStep.tsx
 * @responsibility 4-screen cinematic reveal sequence shown after AI profile generation.
 * Progresses through: (1) Identity reveal, (2) Carbon story, (3) Climate twin impact,
 * (4) Signature missions preview → "Enter My Carbon Garden" CTA.
 */
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, Check, BookOpen, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { GeneratedIdentity, ClimateTwinData, AIMission } from "@/lib/ai-engine"
import { getCategoryIcon, getDifficultyPillClasses } from "@/lib/category-utils"

interface RevealStepProps {
  /** Current 1-based sub-step within the 4-screen reveal sequence. */
  revealSubStep: number
  /** AI-generated archetype name, description, strength, and opportunity. */
  aiIdentity: GeneratedIdentity
  /** Personalised carbon narrative composed by the scoring engine. */
  aiStory: string
  /** Climate twin projection with CO₂ equivalents. */
  aiTwin: ClimateTwinData
  /** Three signature missions generated for the user. */
  aiMissions: AIMission[]
  /** The user's city name for contextual copy. */
  city: string
  /** Animation phase for the identity burst reveal on sub-step 1. */
  revealPhase: "suspense" | "burst" | "settled"
  /** Whether the identity card shake animation is active (burst moment). */
  isShaking: boolean
  /** Callback to advance to the next sub-step. */
  onNextSubStep: (step: number) => void
  /** Callback when the user clicks "Enter My Carbon Garden". */
  onConfirm: () => void
}

/**
 * Renders the 4-screen post-onboarding reveal sequence.
 *
 * Each sub-step is animated in/out via Framer Motion's `AnimatePresence`.
 * Sub-step 1 has an additional `revealPhase` FSM: suspense → burst → settled,
 * where the burst triggers the `playChimeSound` in the parent and shakes the card.
 *
 * @param props - {@link RevealStepProps}
 */
export function RevealStep({
  revealSubStep,
  aiIdentity,
  aiStory,
  aiTwin,
  aiMissions,
  city,
  revealPhase,
  isShaking,
  onNextSubStep,
  onConfirm,
}: RevealStepProps) {
  return (
    <motion.div
      key="onboarding-reveal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      className="w-full max-w-2xl relative"
    >
      <div className="absolute inset-0 bg-radial-[circle_at_50%_40%] from-emerald-500/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full rounded-3xl border border-emerald-500/20 shadow-2xl p-6 md:p-10 space-y-6 overflow-hidden text-center relative glass-panel">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/10 rounded-full blur-xl pointer-events-none" />

        {/* Reveal progress dots */}
        <div className="flex justify-center gap-2 mb-2" role="img" aria-label={`Reveal stage progress ${revealSubStep} of 4`}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                revealSubStep === s
                  ? "w-8 bg-emerald-500"
                  : s < revealSubStep
                  ? "w-2.5 bg-emerald-500/40"
                  : "w-2 bg-white/10"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Sub-step 1: Identity Reveal ─── */}
          {revealSubStep === 1 && (
            <motion.div
              key="reveal-step-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full flex flex-col items-center justify-center min-h-[420px] relative"
            >
              <motion.div
                animate={isShaking ? { 
                  x: [-6, 6, -6, 6, -3, 3, 0],
                  y: [-4, 4, -4, 4, -2, 2, 0]
                } : {}}
                transition={{ duration: 0.15 }}
                className="w-full flex flex-col items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  {revealPhase === "suspense" && (
                    <motion.div
                      key="suspense-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.7, 0.3],
                          }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute w-12 h-12 bg-emerald-500/20 rounded-full blur-xl"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.6, 1, 0.6],
                          }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-5 h-5 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase animate-pulse">
                        Creating your Green Character...
                      </span>
                    </motion.div>
                  )}

                  {(revealPhase === "burst" || revealPhase === "settled") && (
                    <div className="w-full flex flex-col items-center justify-center space-y-6">
                      {/* Radial gradient burst effect */}
                      <AnimatePresence>
                        {revealPhase === "burst" && (
                          <motion.div
                            initial={{ scale: 0.1, opacity: 0 }}
                            animate={{ scale: 2.2, opacity: [0.8, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute w-64 h-64 bg-radial-gradient from-emerald-400/40 to-transparent rounded-full blur-lg pointer-events-none -z-10"
                          />
                        )}
                      </AnimatePresence>

                      {/* Step 1 badge */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase border border-emerald-500/20"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-emerald-500/20" />
                        Step 1: Your Green Character is Ready!
                      </motion.div>

                      {/* Identity Name LARGE & Centered with Settle Animation */}
                      <motion.h1
                        initial={{ scale: 1.5, opacity: 0, filter: "brightness(2) blur(6px)" }}
                        animate={{ scale: 1, opacity: 1, filter: "brightness(1) blur(0px)" }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 90, 
                          damping: 14,
                          delay: 0.05
                        }}
                        className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] text-center py-2"
                      >
                        {aiIdentity.name}
                      </motion.h1>

                      {/* Supporting details cascade in settled phase */}
                      {revealPhase === "settled" && (
                        <div className="w-full flex flex-col items-center space-y-6">
                          {/* Description */}
                          <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-xs font-semibold text-sand-800 dark:text-sand-200 leading-relaxed max-w-md mx-auto text-center"
                          >
                            {aiIdentity.description}
                          </motion.p>

                          {/* Strength & Opportunity Staggered */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left w-full">
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, duration: 0.4 }}
                              className="p-4 rounded-2xl space-y-1 glass-panel"
                            >
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                                🌿 Biggest Strength
                              </span>
                              <p className="text-xs font-bold leading-relaxed text-zinc-100">
                                {aiIdentity.strength}
                              </p>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6, duration: 0.4 }}
                              className="p-4 rounded-2xl space-y-1 glass-panel"
                            >
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                                ⚡ Biggest Opportunity
                              </span>
                              <p className="text-xs font-bold leading-relaxed text-zinc-100">
                                {aiIdentity.opportunity}
                              </p>
                            </motion.div>
                          </div>

                          {/* Continue Button */}
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                            className="pt-4 flex justify-center w-full"
                          >
                            <motion.button
                              onClick={() => onNextSubStep(2)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="btn-premium px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20 max-w-xs w-full cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                            >
                              Discover Your Carbon Story
                              <ArrowRight className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ─── Sub-step 2: Carbon Story ─── */}
          {revealSubStep === 2 && (
            <motion.div
              key="reveal-step-2"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase border border-emerald-500/20">
                <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                Step 2: Your Personalized Nature Story
              </div>

              <div className="max-w-lg mx-auto p-6 rounded-3xl text-left space-y-4 glass-panel">
                <h3 className="font-extrabold text-white text-base">Clover&apos;s Green Assessment</h3>
                <p className="text-xs text-zinc-200 leading-relaxed font-semibold italic">
                  &ldquo;{aiStory}&rdquo;
                </p>
                <p className="text-[10px] text-emerald-400 font-bold leading-normal">
                  As a {aiIdentity.name}, your choices in {city || "your city"} play a big role in helping your local environment.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <motion.button
                  onClick={() => onNextSubStep(3)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20 max-w-xs w-full cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  Visualize Your Future Twin
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Sub-step 3: Climate Twin Impact ─── */}
          {revealSubStep === 3 && (
            <motion.div
              key="reveal-step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase border border-emerald-500/20">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                Step 3: Your Positive Impact
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Your Future Positive Impact</h2>
                <p className="text-xs text-sand-300 font-semibold max-w-md mx-auto leading-relaxed">
                  By doing the simple daily habits planned by Clover, you will help save this much energy and pollution:
                </p>
              </div>

              <div className="p-6 rounded-3xl max-w-lg mx-auto space-y-4 glass-panel">
                <div className="grid grid-cols-3 gap-2 text-center items-center">
                  <div className="space-y-1">
                    <span className="text-2xl block animate-bounce" role="img" aria-label="Plane emoji">✈️</span>
                    <span className="text-lg font-black block text-white">{aiTwin.equivalents.flightsAvoided}</span>
                    <span className="text-[8px] font-bold text-sand-300 uppercase leading-none block">Flights Saved</span>
                  </div>
                  <div className="space-y-1 border-x border-white/10">
                    <span className="text-2xl block animate-bounce" style={{ animationDelay: "0.2s" }} role="img" aria-label="Lightning emoji">⚡</span>
                    <span className="text-lg font-black block text-white">{aiTwin.equivalents.householdPowerMonths}m</span>
                    <span className="text-[8px] font-bold text-sand-300 uppercase leading-none block">Months of Home Power Saved</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl block animate-bounce" style={{ animationDelay: "0.4s" }} role="img" aria-label="Tree emoji">🌳</span>
                    <span className="text-lg font-black block text-white">{aiTwin.equivalents.treesPlanted}</span>
                    <span className="text-[8px] font-bold text-sand-300 uppercase leading-none block">Trees Planted Equivalent</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <motion.button
                  onClick={() => onNextSubStep(4)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/20 max-w-xs w-full cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  Review Climate Action Plan
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── Sub-step 4: Signature Missions Preview ─── */}
          {revealSubStep === 4 && (
            <motion.div
              key="reveal-step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase border border-emerald-500/20">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Step 4: Custom Challenges Activated
              </div>

              <div className="max-w-lg mx-auto space-y-3 text-left">
                <h4 className="text-[10px] font-black text-sand-300 uppercase tracking-widest border-b border-white/10 pb-1.5">
                  Your Custom Green Challenges
                </h4>
                
                <div className="space-y-2">
                  {aiMissions.map((m) => (
                    <div 
                      key={m.id} 
                      className="p-3.5 rounded-xl flex justify-between items-center text-xs glass-panel"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
                          {getCategoryIcon(m.category)}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-white flex items-center gap-1.5">
                            {m.title}
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${getDifficultyPillClasses(m.difficulty)}`}>
                              {m.difficulty}
                            </span>
                          </h5>
                          <p className="text-[10px] text-sand-300 opacity-60 leading-normal line-clamp-1">{m.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                          +{m.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <motion.button
                  onClick={onConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-700/20 max-w-xs w-full cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  Enter My Carbon Garden
                  <ArrowRight className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </motion.div>
  )
}
