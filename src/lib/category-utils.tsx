/**
 * category-utils.tsx
 *
 * Shared utilities for rendering category-specific icons, emoji, and difficulty
 * badge styles across onboarding, missions, and any future pages.
 *
 * Previously each page re-defined these functions locally — this module is the
 * single source of truth.
 */
import React from "react"
import { Car, Utensils, Zap, ShoppingBag, Recycle, Leaf } from "lucide-react"

// ─────────────────────────────────────────────
// Category icon
// ─────────────────────────────────────────────

/**
 * Returns a Lucide icon for the given mission/action category.
 *
 * @param category - One of "transport" | "food" | "energy" | "shopping" | "waste"
 * @param className - Tailwind size class, defaults to "h-4 w-4"
 */
export function getCategoryIcon(
  category: string,
  className = "h-4 w-4"
): React.ReactElement {
  switch (category) {
    case "transport":
      return <Car className={className} />
    case "food":
      return <Utensils className={className} />
    case "energy":
      return <Zap className={className} />
    case "shopping":
      return <ShoppingBag className={className} />
    case "waste":
      return <Recycle className={className} />
    default:
      return <Leaf className={className} />
  }
}

// ─────────────────────────────────────────────
// Category emoji
// ─────────────────────────────────────────────

/**
 * Returns a representative emoji string for the given mission/action category.
 *
 * @param category - One of "transport" | "food" | "energy" | "shopping" | "waste"
 */
export function getCategoryEmoji(category: string): string {
  switch (category) {
    case "transport":
      return "🚲"
    case "food":
      return "🥗"
    case "energy":
      return "🔌"
    case "waste":
      return "♻️"
    case "shopping":
      return "🛍️"
    default:
      return "🌿"
  }
}

// ─────────────────────────────────────────────
// Difficulty badge CSS classes
// ─────────────────────────────────────────────

/**
 * Returns a Tailwind class string for coloring a difficulty badge.
 * Includes background, text colour, and border colour.
 *
 * @param difficulty - One of "easy" | "medium" | "hard"
 */
export function getDifficultyStyles(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
    default:
      return "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
  }
}

/**
 * Returns the inline className string used for the small difficulty pill in
 * the onboarding reveal and other compact contexts (no border, smaller font).
 *
 * @param difficulty - One of "easy" | "medium" | "hard"
 */
export function getDifficultyPillClasses(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/15 text-emerald-400"
    case "medium":
      return "bg-amber-500/15 text-amber-400"
    default:
      return "bg-red-500/15 text-red-400"
  }
}
