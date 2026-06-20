/**
 * @file WordReveal.tsx
 * @responsibility Animates individual words of a text block sequentially to create
 * a typing/typewriter effect for conversational Clover questions.
 */
import React, { useEffect } from "react"
import { motion } from "framer-motion"

interface WordRevealProps {
  /** The full text string to split and animate. */
  text: string
  /** Callback fired once all words have completed their entrance animation. */
  onComplete: () => void
}

/**
 * Splits the input text by spaces and renders each word inside a staggered
 * motion.span wrapper. Includes a fallback timer that automatically triggers
 * `onComplete` based on word count.
 *
 * @param props - {@link WordRevealProps}
 */
export function WordReveal({ text, onComplete }: WordRevealProps) {
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
