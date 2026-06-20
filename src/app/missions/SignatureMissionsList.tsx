/**
 * @file SignatureMissionsList.tsx
 * @responsibility Renders the list of custom, AI-tailored signature missions designed for the user's
 * specific opportunity category. Handles complete triggers and custom layout animations.
 */
import React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Check, Leaf, Clock, Award, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AIMission } from "@/lib/ai-engine"
import { getCategoryEmoji, getDifficultyStyles } from "@/lib/category-utils"

interface SignatureMissionsListProps {
  /** The list of personalized signature missions. */
  missions: AIMission[]
  /** Animation variants for staggered child transitions. */
  itemVariants: Variants
  /** Callback fired when a user logs a completed signature mission. */
  onCompleteSignature: (e: React.MouseEvent<HTMLButtonElement>, missionId: string, points: number) => void
}

/**
 * SignatureMissionsList component displaying cards for each AI-generated signature mission.
 * Features inline completion badges, Clover rationale explanations, and action triggers.
 *
 * @param props - {@link SignatureMissionsListProps}
 */
export function SignatureMissionsList({
  missions,
  itemVariants,
  onCompleteSignature,
}: SignatureMissionsListProps) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="border-b border-sand-200 dark:border-forest-900 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-sand-950 dark:text-white">
            Signature AI Missions
          </h2>
          <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-widest bg-violet-500/15 text-violet-500 dark:text-violet-400 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)] animate-pulse">
            AI-Personalized
          </span>
        </div>
        <p className="text-xs text-sand-800 dark:text-sand-400 font-medium mt-1 leading-relaxed">
          Clover crafted these specifically from your onboarding profile — one-time, high-impact habits.
        </p>
      </div>

      <div className="space-y-4">
        {missions.map((m) => {
          const isCompleted = m.completed
          return (
            <motion.div
              key={m.id}
              layout
              className={cn(
                "glass-panel rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6",
                isCompleted 
                  ? "border-violet-500/30 opacity-75 shadow-none" 
                  : "border-violet-500/25 hover:border-violet-500/40 bg-gradient-to-br from-violet-500/[0.02] to-transparent shadow-[0_0_30px_rgba(139,92,246,0.06)]"
              )}
            >
              {isCompleted && <div className="absolute inset-y-0 left-0 w-2 bg-violet-500" />}

              <div className="flex items-start gap-4 flex-1">
                <span 
                  className="text-4xl p-3 bg-white dark:bg-forest-950/60 rounded-2xl border border-emerald-500/10 shadow-sm flex-shrink-0"
                  role="img"
                  aria-label={`${m.category} category`}
                >
                  {getCategoryEmoji(m.category)}
                </span>
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-base leading-snug text-sand-950 dark:text-white">{m.title}</h3>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Check className="h-3 w-3 stroke-[3px]" /> Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sand-800 dark:text-sand-300 leading-relaxed font-semibold">{m.description}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-sand-900 dark:text-sand-400 pt-1">
                    <span className={cn("px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider", getDifficultyStyles(m.difficulty))}>
                      {m.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-sand-400" /> One-Time
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                      <Leaf className="h-3 w-3 text-emerald-500" /> {m.co2SavingsKg} kg CO₂
                    </span>
                  </div>
                  {m.reasoning && (
                    <div className="text-[10px] text-violet-600 dark:text-violet-400 font-extrabold flex items-center gap-1 mt-2.5 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 dark:border-violet-500/10 px-3 py-1 rounded-xl w-fit">
                      <Sparkles className="h-3 w-3 fill-current animate-pulse" />
                      {m.reasoning}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-sand-200/50 dark:border-forest-900/50">
                <div className="text-left md:text-right pr-2">
                  <span className="block text-[9px] font-bold text-sand-800 dark:text-sand-400 uppercase tracking-wider">REWARD</span>
                  <span className="text-md font-extrabold text-emerald-500 flex items-center gap-1">
                    <Award className="h-4 w-4 fill-emerald-500/10" />+{m.points} pts
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="completed-btn"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 flex-shrink-0"
                    >
                      <Check className="h-6 w-6 stroke-[3px]" />
                    </motion.div>
                  ) : (
                    <motion.button
                      key="active-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => onCompleteSignature(e, m.id, m.points)}
                      className="btn-premium px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/10 flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
                      aria-label={`Log action for signature mission: ${m.title}`}
                    >
                      Log Action
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
