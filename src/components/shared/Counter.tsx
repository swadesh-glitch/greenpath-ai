"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export const Counter: React.FC<CounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startVal = displayValue
    const duration = 400

    setPulse(true)
    const pulseTimer = setTimeout(() => setPulse(false), 250)

    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = progress * (2 - progress) // easeOutQuad
      const current = startVal + (value - startVal) * easeProgress
      
      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }

    animationFrameId = window.requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(pulseTimer)
    }
  }, [value])

  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.15, 1], filter: "brightness(1.3)" } : {}}
      transition={{ duration: 0.25 }}
      className={`inline-block ${className}`}
    >
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </motion.span>
  )
}
