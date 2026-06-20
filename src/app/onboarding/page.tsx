"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { generateClimateProfile, OnboardingAnswers, GeneratedIdentity, ClimateTwinData, AIMission } from "@/lib/ai-engine"
import { toast } from "sonner"
import { PageBackground } from "@/components/shared/PageBackground"
import {
  LOADING_PHRASES,
  REACTION_VARIANTS,
} from "./onboarding-data"
import { LoadingStep } from "./LoadingStep"
import { RevealStep } from "./RevealStep"
import { ChatStep } from "./ChatStep"
import { playChimeSound } from "./audio-utils"

type OnboardingStep = "chat" | "loading" | "reveal"

/**
 * Main conversational onboarding component orchestrating the Clover Chat,
 * loading simulation, and cinematic profile reveal steps.
 *
 * This file acts as the state manager and page layout container, delegating
 * the complex UI steps to `ChatStep`, `LoadingStep`, and `RevealStep`.
 */
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

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-4 px-4 max-w-4xl mx-auto w-full min-h-[70vh] relative">
      <PageBackground image="/backgrounds/onboarding-bg.jpg" />

      <AnimatePresence mode="wait">
        {step === "chat" && (
          <ChatStep
            currentQuestionIdx={currentQuestionIdx}
            userName={userName}
            city={city}
            textInput={textInput}
            setTextInput={setTextInput}
            isOptionTransitioning={isOptionTransitioning}
            isTextRevealFinished={isTextRevealFinished}
            setIsTextRevealFinished={setIsTextRevealFinished}
            isDisplayingReaction={isDisplayingReaction}
            activeReactionText={activeReactionText}
            handleTextSubmit={handleTextSubmit}
            handleSelectOption={handleSelectOption}
          />
        )}

        {step === "loading" && (
          <LoadingStep
            generationError={generationError}
            loadingPhraseIdx={loadingPhraseIdx}
            onRetry={() => {
              setGenerationError(null)
              setRetryCount((prev) => prev + 1)
            }}
            onBack={() => {
              setGenerationError(null)
              setStep("chat")
            }}
          />
        )}

        {step === "reveal" && aiIdentity && aiTwin && (
          <RevealStep
            revealSubStep={revealSubStep}
            aiIdentity={aiIdentity}
            aiStory={aiStory}
            aiTwin={aiTwin}
            aiMissions={aiMissions}
            city={city}
            revealPhase={revealPhase}
            isShaking={isShaking}
            onNextSubStep={setRevealSubStep}
            onConfirm={handleRevealConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
