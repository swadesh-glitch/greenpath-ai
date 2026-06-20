/**
 * @file ChatStep.tsx
 * @responsibility Renders the conversational chat interface of the onboarding sequence,
 * including question progression, option menus, Clover reactions, and progress indicators.
 */
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Leaf, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/category-utils"
import {
  getQuestionText,
  TRANSPORT_OPTIONS,
  FOOD_OPTIONS,
  SHOPPING_OPTIONS,
  ENERGY_OPTIONS,
} from "./onboarding-data"
import { WordReveal } from "./WordReveal"

interface ChatStepProps {
  /** The current 0-based question index (0 to 5). */
  currentQuestionIdx: number
  /** User's display name collected from the first question. */
  userName: string
  /** User's city name collected from the second question. */
  city: string
  /** Value bound to the text input for name and city fields. */
  textInput: string
  /** Setter for updating `textInput`. */
  setTextInput: (val: string) => void
  /** True when transitions between options are taking place (blocking double taps). */
  isOptionTransitioning: boolean
  /** True when the typewriter question has fully rendered its words. */
  isTextRevealFinished: boolean
  /** Setter for updating `isTextRevealFinished`. */
  setIsTextRevealFinished: (val: boolean) => void
  /** True when displaying Clover's conversational reaction bubble. */
  isDisplayingReaction: boolean
  /** The text inside the reaction bubble. */
  activeReactionText: string
  /** Handler invoked when submitting name/city text fields. */
  handleTextSubmit: (e: React.FormEvent) => void
  /** Handler invoked when selecting an option from a lifestyle category card group. */
  handleSelectOption: (field: "transport" | "food" | "shopping" | "energy", optionLabel: string, optionId: string) => void
}

/**
 * Renders the full conversational Clover questionnaire panel.
 *
 * Implements a strict progressive disclose mechanism: inputs are hidden until
 * the `WordReveal` typewriter animation finishes. Displays city-aware reactions
 * and a floating Clover assistant badge.
 *
 * @param props - {@link ChatStepProps}
 */
export function ChatStep({
  currentQuestionIdx,
  userName,
  city,
  textInput,
  setTextInput,
  isOptionTransitioning,
  isTextRevealFinished,
  setIsTextRevealFinished,
  isDisplayingReaction,
  activeReactionText,
  handleTextSubmit,
  handleSelectOption,
}: ChatStepProps) {
  const fields: ("name" | "city" | "transport" | "food" | "shopping" | "energy")[] = [
    "name",
    "city",
    "transport",
    "food",
    "shopping",
    "energy",
  ]
  const currentField = fields[currentQuestionIdx]

  return (
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
  )
}
