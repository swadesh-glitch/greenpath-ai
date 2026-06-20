"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MainContentWrapperProps {
  children: React.ReactNode
}

export const MainContentWrapper: React.FC<MainContentWrapperProps> = ({ children }) => {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const isOnboarding = pathname === "/onboarding"
  const isGarden = pathname === "/garden"
  const isIdentity = pathname === "/identity"
  
  const isBgPage = ["/onboarding", "/identity", "/analysis", "/missions"].includes(pathname)

  const initialAnimation = isBgPage ? { opacity: 0 } : { opacity: 0, y: 12 }
  const animateAnimation = isBgPage ? { opacity: 1 } : { opacity: 1, y: 0 }
  const exitAnimation = isBgPage ? { opacity: 0 } : { opacity: 0, y: -12 }

  return (
    <main 
      className={cn(
        "flex-1 flex flex-col w-full min-h-screen transition-all duration-300",
        (isLandingPage || isOnboarding || isGarden || isIdentity)
          ? "p-0 max-w-none" // Full bleed edge-to-edge
          : "px-4 pt-28 pb-20 md:px-8 max-w-7xl mx-auto" // Standard padded layout for other pages
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={initialAnimation}
          animate={animateAnimation}
          exit={exitAnimation}
          transition={{ 
            duration: isBgPage ? 0.35 : 0.5, 
            ease: isBgPage ? "easeInOut" : [0.16, 1, 0.3, 1] 
          }}
          className="flex-1 flex flex-col w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
