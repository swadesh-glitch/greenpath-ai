/**
 * @file LoadingStep.tsx
 * @responsibility Loading screen shown while Clover's AI engine generates the user's
 * personalised climate profile. Displays animated planet, cycling loading phrases,
 * and a retry/back flow if the API call fails.
 */
import React from "react"
import { motion } from "framer-motion"
import { LOADING_PHRASES } from "./onboarding-data"

interface LoadingStepProps {
  /** Non-null string means the API call failed; render the error/retry UI. */
  generationError: string | null
  /** Index into LOADING_PHRASES array, incremented every ~1 second by parent. */
  loadingPhraseIdx: number
  /** Called when the user clicks "Try Again". */
  onRetry: () => void
  /** Called when the user clicks "Go Back to Chat". */
  onBack: () => void
}

/**
 * Renders the AI profile generation loading screen.
 *
 * Two states:
 * - **Generating**: animating globe emoji + rotating Clover loading phrases.
 * - **Error**: error message + "Try Again" and "Go Back to Chat" buttons.
 *
 * This component is intentionally stateless — all state is owned by the parent
 * `Onboarding` page and passed down as props to keep the loading logic centralized.
 *
 * @param props - {@link LoadingStepProps}
 */
export function LoadingStep({ generationError, loadingPhraseIdx, onRetry, onBack }: LoadingStepProps) {
  return (
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
              onClick={onRetry}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-700/10 cursor-pointer"
            >
              Try Again
            </motion.button>
            <motion.button
              onClick={onBack}
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
  )
}
