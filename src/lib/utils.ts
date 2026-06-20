/**
 * @file utils.ts
 * @responsibility Utility helpers for styling and classname concatenation inside GreenPath AI.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility helper to conditionally combine and merge Tailwind CSS classes cleanly.
 *
 * Runs `clsx` to join classes and resolves overrides using `twMerge`.
 *
 * @param inputs - Any variable-length list of class names or conditional style configurations.
 * @returns Concatenated, resolved class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
