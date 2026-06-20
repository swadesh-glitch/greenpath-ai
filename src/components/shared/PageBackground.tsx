"use client"

// NOTE: @keyframes kb-zoom, .animate-kb and .bg-noise-shared are defined
// in src/app/globals.css — keeping them here as JSX <style> tags caused
// SSR hydration mismatches in Next.js.
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"

interface PageBackgroundProps {
  image: string
}

export const PageBackground: React.FC<PageBackgroundProps> = ({ image }) => {
  // Must be called unconditionally (Rules of Hooks)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 20, damping: 30, mass: 1 })
  const springY = useSpring(mouseY, { stiffness: 20, damping: 30, mass: 1 })

  // Mounted guard — prevents framer-motion AnimatePresence from causing an
  // SSR hydration mismatch (it injects a <Suspense> on the client that the
  // server never emits). Returning null on SSR is safe: background is purely
  // decorative and has no effect on layout or content.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      const targetX = ((e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2)) * 3.5
      const targetY = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 3.5
      mouseX.set(targetX)
      mouseY.set(targetY)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Render nothing on server / first paint — avoids hydration mismatch
  if (!mounted) return null

  return (
    <>
      {/* Fixed background wrapper */}
      <div 
        className="fixed inset-0 pointer-events-none bg-zinc-950"
        style={{
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          overflow: "hidden"
        }}
      >
        {/* Parallax Container */}
        <motion.div 
          className="absolute inset-[-10px] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            x: springX,
            y: springY,
          }}
        >
          {/* AnimatePresence for smooth crossfades between background images */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-kb"
              style={{
                backgroundImage: `url('${image}')`,
              }}
            />
          </AnimatePresence>
          
          {/* Cinematic Duotone Grading: warm highlights in light, subtle teal in shadows */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-teal-500/10 mix-blend-color pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,rgba(6,78,59,0.12)_100%)] mix-blend-overlay pointer-events-none" />
        </motion.div>

        {/* Photographic Depth-of-Field Blur Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0) 65%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0) 65%)",
          }}
        />
        
        {/* Cinematic Scrim: lighter/warmer at the top (sky light), darker and cooler directly behind the card content */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: "linear-gradient(to bottom, rgba(254, 240, 138, 0.08) 0%, rgba(20, 184, 166, 0.02) 40%, rgba(6, 20, 16, 0.45) 100%)"
          }}
        />
        
        {/* Concentrated radial scrim centered directly behind the cards (y=55%) */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: "radial-gradient(circle at 50% 55%, rgba(4, 15, 12, 0.88) 0%, rgba(4, 15, 12, 0.5) 35%, rgba(4, 15, 12, 0) 75%)"
          }}
        />

        {/* Soft dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 pointer-events-none" />
        
        {/* Premium moving grain overlay */}
        <div className="absolute inset-0 bg-noise-shared opacity-[0.025] mix-blend-overlay pointer-events-none" />
      </div>
    </>
  )
}
