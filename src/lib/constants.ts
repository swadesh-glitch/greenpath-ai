// Constants for GreenPath AI application

export const APP_NAME = "GreenPath AI"
export const APP_DESCRIPTION = "Gamified Carbon Footprint Tracker & Eco-Action Hub"

// ─────────────────────────────────────────────
// Garden Level Thresholds (single source of truth)
// ─────────────────────────────────────────────
/** Point thresholds that define each garden level (index = level number). */
export const LEVEL_THRESHOLDS: readonly number[] = [0, 50, 120, 200, 300, 450]

/** Human-readable name for each garden level (parallel array to LEVEL_THRESHOLDS). */
export const LEVEL_NAMES = [
  "Empty Land",
  "Lush Grass",
  "Small Sprout",
  "Mature Tree",
  "Young Forest",
  "Thriving Ecosystem",
] as const
