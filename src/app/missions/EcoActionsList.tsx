/**
 * @file EcoActionsList.tsx
 * @responsibility Renders the list of generic standard eco actions, complete with category icons,
 * point rewards, and action handlers.
 */
import React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Check, Leaf, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyEcoAction } from "@/data/daily-eco-actions"
import { getCategoryEmoji, getCategoryIcon } from "@/lib/category-utils"

interface EcoActionsListProps {
  /** List of standard eco-actions. */
  dailyActions: DailyEcoAction[]
  /** Animation variants for staggered child transitions. */
  itemVariants: Variants
  /** Callback fired when a user logs a standard eco action. */
  onCompleteDaily: (e: React.MouseEvent<HTMLButtonElement>, actionId: string, points: number) => void
}

/**
 * EcoActionsList component displaying cards for standard/reusable actions.
 * Allows the user to select and log actions to earn green points.
 *
 * @param props - {@link EcoActionsListProps}
 */
export function EcoActionsList({
  dailyActions,
  itemVariants,
  onCompleteDaily,
}: EcoActionsListProps) {
  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="border-b border-sand-200 dark:border-forest-900 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight text-sand-950 dark:text-white">
            Standard Eco Actions
          </h2>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            One-Time
          </span>
        </div>
        <p className="text-xs text-sand-800 dark:text-sand-400 font-medium mt-1 leading-relaxed">
          Choose from these generic one-time habits to accumulate points and visibly grow your garden diorama.
        </p>
      </div>

      <div className="space-y-3">
        {dailyActions.map((action) => (
          <motion.div
            key={action.id}
            layout
            className={cn(
              "glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
              action.completed ? "border-emerald-500/30 opacity-75" : "border-emerald-500/10 hover:border-emerald-500/25"
            )}
          >
            {action.completed && <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500 rounded-l-2xl" />}

            <div className="flex items-start gap-3 flex-1">
              <span 
                className="text-3xl p-2.5 bg-white dark:bg-forest-950/60 rounded-xl border border-emerald-500/10 shadow-sm flex-shrink-0"
                role="img"
                aria-label={`${action.category} category`}
              >
                {getCategoryEmoji(action.category)}
              </span>
              <div className="space-y-1 text-left min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-sm leading-snug text-sand-950 dark:text-white">{action.title}</h3>
                  {action.completed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Check className="h-3 w-3 stroke-[3px]" /> Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-sand-700 dark:text-sand-400 leading-relaxed font-medium">{action.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-sand-900 dark:text-sand-400 pt-0.5">
                  <span className="flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                    {getCategoryIcon(action.category)} {action.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-emerald-500" /> {action.co2SavingsKg} kg CO₂
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-sand-200/50 dark:border-forest-900/50">
              <div className="text-left sm:text-right pr-2">
                <span className="block text-[9px] font-bold text-sand-700 dark:text-sand-400 uppercase tracking-wider">REWARD</span>
                <span className="text-sm font-extrabold text-emerald-500 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 fill-emerald-500/10" />
                  +{action.points} pts
                </span>
              </div>
              <AnimatePresence mode="wait">
                {action.completed ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-11 w-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0"
                  >
                    <Check className="h-5 w-5 stroke-[3px]" />
                  </motion.div>
                ) : (
                  <motion.button
                    key="log"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => onCompleteDaily(e, action.id, action.points)}
                    className="btn-premium px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/10 flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none"
                    aria-label={`Log completion of action: ${action.title}`}
                  >
                    Log It
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
