"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { generateClimateProfile, OnboardingAnswers, GeneratedIdentity, ClimateTwinData, AIMission } from "@/lib/ai-engine"
import { ArrowRight, Sparkles, Leaf, Bot, Globe, Check, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageBackground } from "@/components/shared/PageBackground"
import { getCategoryIcon, getDifficultyPillClasses } from "@/lib/category-utils"
import {
  LOADING_PHRASES,
  getQuestionText,
  REACTION_VARIANTS,
  TRANSPORT_OPTIONS,
  FOOD_OPTIONS,
  SHOPPING_OPTIONS,
  ENERGY_OPTIONS,
} from "./onboarding-data"



type OnboardingStep = "chat" | "loading" | "reveal"

const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    if (ctx.state === "suspended") {
      ctx.resume()
    }
    
    // Whoosh (noise builder)
    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(120, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3)
    filter.Q.setValueAtTime(4, ctx.currentTime)
    
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()
    
    // Synth bell major arpeggio notes
    const playBell = (freq: number, delay: number, vol: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      
      // Harmonics
      const modifier = ctx.createOscillator()
      modifier.type = "triangle"
      modifier.frequency.setValueAtTime(freq * 2.01, ctx.currentTime + delay)
      
      const modGain = ctx.createGain()
      modGain.gain.setValueAtTime(vol * 0.1, ctx.currentTime + delay)
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6)
      
      osc.connect(gain)
      modifier.connect(modGain)
      modGain.connect(gain)
      
      gain.connect(ctx.destination)
      
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.7)
      modifier.start(ctx.currentTime + delay)
      modifier.stop(ctx.currentTime + delay + 0.7)
    }
    
    playBell(523.25, 0.0, 0.15) // C5
    playBell(659.25, 0.08, 0.12) // E5
    playBell(783.99, 0.16, 0.12) // G5
    playBell(1046.50, 0.24, 0.2) // C6
  } catch (e) {
    console.warn("Web Audio chime failed to play:", e)
  }
}

interface WordRevealProps {
  text: string
  onComplete: () => void
}

function WordReveal({ text, onComplete }: WordRevealProps) {
  const words = text.split(" ")
  
  useEffect(() => {
    const totalDuration = words.length * 0.08 + 0.3
    const timer = setTimeout(() => {
      onComplete()
    }, totalDuration * 1000)
    return () => clearTimeout(timer)
  }, [text, words.length, onComplete])

  return (
    <motion.span 
      className="inline-flex flex-wrap justify-center gap-x-2 gap-y-1"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.08,
          }
        }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              transition: { type: "spring", stiffness: 100, damping: 12 } 
            }
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}



export default function Onboarding() {
  const router = useRouter()
  const { completeAIOnboarding } = useAppContext()

  const [step, setStep] = useState<OnboardingStep>("chat")
  const [revealSubStep, setRevealSubStep] = useState(1)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  
  // Answers states
  const [userName, setUserName] = useState("")
  const [city, setCity] = useState("")
  const [transport, setTransport] = useState("")
  const [food, setFood] = useState("")
  const [shopping, setShopping] = useState("")
  const [energy, setEnergy] = useState("")

  // Form input field state
  const [textInput, setTextInput] = useState("")
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isOptionTransitioning, setIsOptionTransitioning] = useState(false)
  const [isTextRevealFinished, setIsTextRevealFinished] = useState(false)

  // Clover reaction states
  const [isDisplayingReaction, setIsDisplayingReaction] = useState(false)
  const [activeReactionText, setActiveReactionText] = useState("")

  // Reveal screen cinematic states
  const [revealPhase, setRevealPhase] = useState<"suspense" | "burst" | "settled">("suspense")
  const [isShaking, setIsShaking] = useState(false)

  // Loading indicator states
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0)

  // Dynamic AI generated results
  const [aiIdentity, setAiIdentity] = useState<GeneratedIdentity | null>(null)
  const [aiStory, setAiStory] = useState("")
  const [aiTwin, setAiTwin] = useState<ClimateTwinData | null>(null)
  const [aiMissions, setAiMissions] = useState<AIMission[]>([])

  // Phase change loading effect
  useEffect(() => {
    if (step === "loading") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPhraseIdx(0)
      const phraseInterval = setInterval(() => {
        setLoadingPhraseIdx((prev) => {
          if (prev < LOADING_PHRASES.length - 1) return prev + 1
          return prev
        })
      }, 1000)

      // Invoke AI engine in background
      const executeAIGeneration = async () => {
        try {
          const answers: OnboardingAnswers = {
            city,
            transport,
            food,
            shopping,
            energy,
            name: userName,
          }
          
          const results = await generateClimateProfile(answers)
          setAiIdentity(results.identity)
          setAiStory(results.story)
          setAiTwin(results.twin)
          setAiMissions(results.missions)
          
          // Wait at least 5.5s to let animations play out premium feel
          setTimeout(() => {
            clearInterval(phraseInterval)
            setStep("reveal")
            setRevealSubStep(1)
            setRevealPhase("suspense")
          }, 5500)
        } catch (err) {
          console.error("AI Generation Error:", err)
          clearInterval(phraseInterval)
          setGenerationError("We encountered a server error generating your profile. Please check your network and try again.")
        }
      }

      executeAIGeneration()

      return () => clearInterval(phraseInterval)
    }
  }, [step, city, transport, food, shopping, energy, userName, retryCount])

  // Reveal Step 1: suspense to burst arpeggio chime chime
  useEffect(() => {
    if (step === "reveal" && revealSubStep === 1) {
      if (revealPhase === "suspense") {
        const timer = setTimeout(() => {
          setRevealPhase("burst")
        }, 1200)
        return () => clearTimeout(timer)
      } else if (revealPhase === "burst") {
        playChimeSound()
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsShaking(true)
        const shakeTimer = setTimeout(() => {
          setIsShaking(false)
          setRevealPhase("settled")
        }, 150)
        return () => clearTimeout(shakeTimer)
      }
    }
  }, [step, revealSubStep, revealPhase])

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim() || isOptionTransitioning) return

    const submittedVal = textInput.trim()
    
    if (currentQuestionIdx === 0) {
      // Validate Name
      const nameRegex = /^[\p{L}\s'\-]{1,40}$/u
      if (!nameRegex.test(submittedVal)) {
        toast.error("Please enter a valid name (letters, spaces, hyphens, and apostrophes only, up to 40 characters).")
        return
      }

      setIsOptionTransitioning(true)
      setUserName(submittedVal)
      setTextInput("")

      // Random reaction line
      const reactions = [
        `Nice to meet you, ${submittedVal}! Let's make your path greener.`,
        `Welcome, ${submittedVal}! Great to have you on GreenPath.`,
        `Hi, ${submittedVal}! Excited to start this eco-journey with you.`
      ]
      const chosenReaction = reactions[Math.floor(Math.random() * reactions.length)]
      setActiveReactionText(chosenReaction)
      setIsDisplayingReaction(true)

      setTimeout(() => {
        setIsDisplayingReaction(false)
        setIsTextRevealFinished(false)
        setCurrentQuestionIdx(1)
        setIsOptionTransitioning(false)
      }, 1500)
    } else if (currentQuestionIdx === 1) {
      // Validate City
      const cityRegex = /^[\p{L}\s'\-,\.]{1,60}$/u
      if (!cityRegex.test(submittedVal)) {
        toast.error("Please enter a valid city name (letters, spaces, commas, periods, hyphens, or apostrophes only, up to 60 characters).")
        return
      }

      setIsOptionTransitioning(true)
      setCity(submittedVal)
      setTextInput("")

      // Random reaction line
      const reactions = [
        `Ah, ${submittedVal}! A wonderful place to grow a green garden.`,
        `Got it! ${submittedVal} is a great place to start making a difference.`,
        `Understood, ${submittedVal}. Let's see how we can bring green habits to your town.`
      ]
      const chosenReaction = reactions[Math.floor(Math.random() * reactions.length)]
      setActiveReactionText(chosenReaction)
      setIsDisplayingReaction(true)

      setTimeout(() => {
        setIsDisplayingReaction(false)
        setIsTextRevealFinished(false)
        setCurrentQuestionIdx(2)
        setIsOptionTransitioning(false)
      }, 1500)
    }
  }

  const handleSelectOption = (field: "transport" | "food" | "shopping" | "energy", optionLabel: string, optionId: string) => {
    if (isOptionTransitioning) return
    setIsOptionTransitioning(true)

    if (field === "transport") setTransport(optionId)
    else if (field === "food") setFood(optionId)
    else if (field === "shopping") setShopping(optionId)
    else if (field === "energy") setEnergy(optionId)

    // Select random reaction variant
    const variants = REACTION_VARIANTS[optionId] || ["Got it, logged! Let's continue."]
    // eslint-disable-next-line react-hooks/purity
    const chosenReaction = variants[Math.floor(Math.random() * variants.length)]
    setActiveReactionText(chosenReaction)
    setIsDisplayingReaction(true)

    setTimeout(() => {
      setIsDisplayingReaction(false)
      setIsTextRevealFinished(false)

      if (field === "transport") {
        setCurrentQuestionIdx(3)
        setIsOptionTransitioning(false)
      } else if (field === "food") {
        setCurrentQuestionIdx(4)
        setIsOptionTransitioning(false)
      } else if (field === "shopping") {
        setCurrentQuestionIdx(5)
        setIsOptionTransitioning(false)
      } else if (field === "energy") {
        setStep("loading")
        setIsOptionTransitioning(false)
      }
    }, 1500)
  }

  const handleRevealConfirm = () => {
    if (aiIdentity && aiTwin) {
      completeAIOnboarding(
        userName,
        { city, transport, food, shopping, energy },
        aiIdentity,
        aiStory,
        aiTwin,
        aiMissions
      )
      router.push("/garden")
    }
  }


  const fields: ("name" | "city" | "transport" | "food" | "shopping" | "energy")[] = [
    "name",
    "city",
    "transport",
    "food",
    "shopping",
    "energy"
  ]
  const currentField = fields[currentQuestionIdx]

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-4 px-4 max-w-4xl mx-auto w-full min-h-[70vh] relative">
      <PageBackground image="/backgrounds/onboarding-bg.jpg" />

      <AnimatePresence mode="wait">
        
        {/* CHAT STEP: Conversational Questionnaire */}
        {step === "chat" && (
          <div className="fixed inset-0 w-screen h-screen flex flex-col justify-between items-center z-40 bg-transparent select-none">

            {/* Top Bar: Progress Segments & Title */}
            <div className="w-full pt-8 px-6 flex flex-col items-center gap-4 z-50">
              <div className="flex justify-between items-center w-full max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/15">
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-extrabold text-[11px] text-emerald-400 tracking-tight">GreenPath Onboarding</span>
                </div>
                <div className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 uppercase tracking-widest">
                  Question {currentQuestionIdx + 1}/6
                </div>
              </div>

              {/* 6 glowing progress segments */}
              <div className="flex gap-2 w-full max-w-3xl px-2" role="img" aria-label={`Onboarding progress: step ${currentQuestionIdx + 1} of 6`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-500",
                      i <= currentQuestionIdx
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Central Narrative Area: Typewriter Question */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-3xl mx-auto w-full z-45 mb-8">
              <div className="min-h-[160px] flex flex-col items-center justify-center">
                <h1 className="text-2xl md:text-3xl font-black text-white text-center leading-relaxed tracking-tight select-text drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  <WordReveal
                    key={currentQuestionIdx}
                    text={getQuestionText(currentQuestionIdx, userName, city)}
                    onComplete={() => setIsTextRevealFinished(true)}
                  />
                </h1>

                {/* Clover Reaction response bubble */}
                <AnimatePresence>
                  {isDisplayingReaction && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 15 }}
                      className="mt-6 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 max-w-md mx-auto text-emerald-400 text-xs font-bold text-center tracking-wide leading-relaxed shadow-lg shadow-emerald-500/5"
                    >
                      {activeReactionText}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Delayed Choice Input Area */}
            <div className="w-full pb-16 px-6 z-50">
              <AnimatePresence mode="wait">
                {isTextRevealFinished && !isDisplayingReaction && (
                  <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="w-full max-w-3xl mx-auto"
                  >
                    {/* Text Fields (Name & City) */}
                    {(currentField === "name" || currentField === "city") && (
                      <form onSubmit={handleTextSubmit} className="flex gap-2 max-w-lg mx-auto w-full">
                        <input
                          type="text"
                          id="onboarding-text-input"
                          aria-label={currentField === "name" ? "Your name" : "Your city"}
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          maxLength={currentField === "name" ? 40 : 60}
                          placeholder={currentField === "name" ? "Enter your name..." : "Enter your city..."}
                          className="flex-1 px-4 py-3.5 rounded-2xl border border-forest-800 bg-forest-950/80 backdrop-blur-md text-white placeholder-white/30 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                          autoFocus
                          autoComplete="off"
                        />
                        <motion.button
                          type="submit"
                          disabled={!textInput.trim() || isOptionTransitioning}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-700/10 transition-all disabled:opacity-40 cursor-pointer h-[46px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </motion.button>
                      </form>
                    )}

                    {/* Transit Selection */}
                    {currentField === "transport" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {TRANSPORT_OPTIONS.map((o) => (
                          <motion.button
                            key={o.id}
                            onClick={() => handleSelectOption("transport", o.label, o.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl hover:border-emerald-500/55 transition-all cursor-pointer flex flex-col gap-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none glass-panel"
                          >
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              {getCategoryIcon("transport", "h-4 w-4 text-emerald-400")}
                              {o.label}
                            </span>
                            <span className="text-[10px] text-sand-400 font-bold leading-normal">{o.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Diet Selection */}
                    {currentField === "food" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {FOOD_OPTIONS.map((o) => (
                          <motion.button
                            key={o.id}
                            onClick={() => handleSelectOption("food", o.label, o.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl hover:border-emerald-500/55 transition-all cursor-pointer flex flex-col gap-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none glass-panel"
                          >
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              {getCategoryIcon("food", "h-4 w-4 text-emerald-400")}
                              {o.label}
                            </span>
                            <span className="text-[10px] text-sand-400 font-bold leading-normal">{o.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Shopping Habits Selection */}
                    {currentField === "shopping" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                        {SHOPPING_OPTIONS.map((o) => (
                          <motion.button
                            key={o.id}
                            onClick={() => handleSelectOption("shopping", o.label, o.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl hover:border-emerald-500/55 transition-all cursor-pointer flex flex-col gap-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none glass-panel"
                          >
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              {getCategoryIcon("shopping", "h-4 w-4 text-emerald-400")}
                              {o.label}
                            </span>
                            <span className="text-[10px] text-sand-400 font-bold leading-normal">{o.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Home Energy Selection */}
                    {currentField === "energy" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {ENERGY_OPTIONS.map((o) => (
                          <motion.button
                            key={o.id}
                            onClick={() => handleSelectOption("energy", o.label, o.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-2xl hover:border-emerald-500/55 transition-all cursor-pointer flex flex-col gap-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none glass-panel"
                          >
                            <span className="font-black text-xs text-white flex items-center gap-1.5">
                              {getCategoryIcon("energy", "h-4 w-4 text-emerald-400")}
                              {o.label}
                            </span>
                            <span className="text-[10px] text-sand-400 font-bold leading-normal">{o.desc}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating Guide Clover Panel */}
            <motion.div
              className="fixed bottom-6 left-6 z-50 flex items-center gap-3 p-3 rounded-2xl shadow-xl glass-panel"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Avatar container with speaking indicator */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20"
                >
                  <Bot className="h-4.5 w-4.5 text-white" />
                </motion.div>

                {/* Speaking/Typing indicator (shown when text is actively revealing) */}
                <AnimatePresence>
                  {!isTextRevealFinished && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 border border-forest-950 shadow-md shadow-emerald-500/35"
                    >
                      <span className="flex gap-[1.5px] items-center">
                        <span className="h-[2px] w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                        <span className="h-[2px] w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <span className="h-[2px] w-[2px] bg-white rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <div className="font-black text-[10px] text-white text-left leading-none">Clover</div>
                <p className="text-[7.5px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">AI Advisor</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* LOADING STEP: Generation screen */}
        {step === "loading" && (
          <motion.div
            key="onboarding-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl border border-emerald-500/10 shadow-2xl p-10 flex flex-col items-center justify-center text-center space-y-8 min-h-[380px] glass-panel"
          >
            {generationError ? (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="text-5xl animate-bounce">⚠️</div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-red-500 tracking-tight">
                    Generation Failed
                  </h3>
                  <p className="text-xs text-sand-800 dark:text-sand-300 font-semibold leading-relaxed">
                    {generationError}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <motion.button
                    onClick={() => {
                      setGenerationError(null)
                      setRetryCount((prev) => prev + 1)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-700/10 cursor-pointer"
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setGenerationError(null)
                      setStep("chat")
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-sand-800 dark:text-sand-300 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Go Back to Chat
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.12, 1], 
                      rotate: [0, 8, -8, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-7xl select-none"
                  >
                    🌍
                  </motion.div>
                  <div className="absolute inset-0 bg-emerald-400/15 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-30" />
                </div>

                <div className="space-y-2">
                  <motion.h3
                    key={loadingPhraseIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight"
                  >
                    {LOADING_PHRASES[loadingPhraseIdx]}
                  </motion.h3>
                  <p className="text-xs text-sand-800 dark:text-sand-400 font-bold">Clover is creating your personalized story and challenges...</p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* REVEAL STEP: Segmented Reveal Sequence */}
        {step === "reveal" && aiIdentity && aiTwin && (
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
                                    onClick={() => setRevealSubStep(2)}
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
                        onClick={() => setRevealSubStep(3)}
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
                        onClick={() => setRevealSubStep(4)}
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
                        onClick={handleRevealConfirm}
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
        )}

      </AnimatePresence>
    </div>
  )
}
