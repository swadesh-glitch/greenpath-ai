"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { useAppContext } from "@/store/AppContext"

export const ResetDemoButton: React.FC = () => {
  const router = useRouter()
  const { isOnboarded, resetApp } = useAppContext()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Check if query param ?demo=true is present OR running on localhost
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (
        params.get("demo") === "true" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowButton(true)
      }
    }
  }, [])

  if (!isOnboarded || !showButton) return null

  const handleReset = () => {
    resetApp()
    router.replace("/onboarding")
  }

  return (
    <motion.button
      onClick={handleReset}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 md:right-8 z-[999] p-3 rounded-full border shadow-xl flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase tracking-wider backdrop-blur-md transition-all duration-300 bg-white/80 dark:bg-forest-950/80 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/35 shadow-red-500/5 h-[44px] mr-2"
      title="Reset Demo App State"
    >
      <RefreshCw className="h-3.5 w-3.5 shrink-0" />
      <span>Reset Demo</span>
    </motion.button>
  )
}
