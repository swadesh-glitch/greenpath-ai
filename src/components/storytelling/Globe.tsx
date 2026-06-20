/**
 * @file Globe.tsx
 * @responsibility Renders an interactive 3D-looking planet simulation on the landing page
 * using 2D gradients, CSS shadows, and a scrolling cylinder map projection.
 * Animates polluted, awareness, recovery, and thriving states dynamically.
 */
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Renders a twinkling grid of background stars that fade behind the planet.
 */
const StarField: React.FC = () => {
  return (
    <div className="absolute inset-[-80px] pointer-events-none -z-20">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: `${1.5 + (i % 3) * 0.5}px`,
            height: `${1.5 + (i % 3) * 0.5}px`,
            left: `${15 + (i * 17) % 75}%`,
            top: `${10 + (i * 23) % 80}%`,
            animation: `twinkling ${2 + (i % 3)}s infinite ease-in-out`,
            animationDelay: `${(i % 4) * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Conic-gradient rotating Sunlight Rays overlay.
 * Renders only in the "thriving" stage to represent ecological recovery.
 */
const SunlightRays: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-15 mix-blend-screen opacity-25"
      style={{
        background: "conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.08) 20deg, transparent 40deg, rgba(253,224,71,0.08) 80deg, transparent 100deg, rgba(253,224,71,0.08) 140deg, transparent 160deg, rgba(253,224,71,0.08) 220deg, transparent 240deg, rgba(253,224,71,0.08) 280deg, transparent 300deg)",
        animation: "spin 90s linear infinite",
      }}
    />
  )
}

/** Props for rendering a single 2D pulsing hotspot. */
interface PulseHotspot2DProps {
  /** Left CSS position percentage (e.g. "45%"). */
  left: string
  /** Top CSS position percentage (e.g. "60%"). */
  top: string
  /** Descriptive textual label for the hotspot capsule. */
  label: string
  /** Dynamic opacity factor based on Earth rotation and scroll visibility. */
  opacity: number
}

/**
 * Renders a single 2D pulsing hotspot dot on the surface of the cylinder Earth map.
 * Used to draw attention to specific carbon impact vectors during the scroll path.
 */
const PulseHotspot2D: React.FC<PulseHotspot2DProps> = ({ left, top, label, opacity }) => {
  return (
    <>
      {/* 1. Pulsing Orange Dot centered exactly at (left, top) */}
      <div 
        style={{ left, top, opacity, transform: "translate(-50%, -50%)" }}
        className="absolute z-35 pointer-events-none transition-opacity duration-300"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_8px_#ea580c] z-10" />
          <div className="absolute w-full h-full bg-orange-500 rounded-full animate-ping opacity-60" />
        </div>
      </div>

      {/* 2. Label capsule centered exactly under the dot */}
      <div 
        style={{ left, top: `calc(${top} + 10px)`, opacity, transform: "translateX(-50%)" }}
        className="absolute z-30 pointer-events-none transition-opacity duration-300 text-center"
      >
        <div className="px-1.5 py-0.5 rounded bg-black/90 border border-orange-500/30 text-orange-400 font-black text-[7px] tracking-wider uppercase whitespace-nowrap shadow-md">
          {label}
        </div>
      </div>
    </>
  )
}

/** Props for the hotspots connector container overlay. */
interface Hotspots2DProps {
  /** Page scroll progress factor [0, 1]. */
  progress: number
  /** The derived rotation angle of the Earth map. */
  earthAngle: number
}

/**
 * Computes, positions, and draws quadratic SVG Bezier curve connectors between
 * the active lifestyle category hotspots on the spinning planet. Renders only
 * during the awareness scroll phase.
 *
 * @param props - {@link Hotspots2DProps}
 */
const Hotspots2D: React.FC<Hotspots2DProps> = ({ progress, earthAngle }) => {
  const isVisible = progress >= 0.25 && progress <= 0.55

  if (!isVisible) return null

  let baseOpacity = 0
  if (progress >= 0.25 && progress < 0.32) {
    baseOpacity = (progress - 0.25) / 0.07
  } else if (progress >= 0.32 && progress < 0.48) {
    baseOpacity = 1.0
  } else if (progress >= 0.48 && progress <= 0.55) {
    baseOpacity = (0.55 - progress) / 0.07
  }

  const getPinProps = (theta0: number, topPercent: number) => {
    // Sync the pin rotation with the Earth's rotation
    const angle = theta0 + earthAngle
    const cosAngle = Math.cos(angle)
    
    // The pin is visible on the front side (cosAngle > 0)
    // Fade out near the edges (where cosAngle is close to 0)
    const visibilityGlow = Math.max(0, Math.min(1.0, cosAngle * 4.0))
    const opacity = baseOpacity * visibilityGlow
    
    // Center is 50%, radius is 42.5%
    const x = 50 + 42.5 * Math.sin(angle)
    const y = topPercent
    
    return {
      x,
      y,
      left: `${x}%`,
      top: `${y}%`,
      opacity
    }
  }

  // Calculate numeric coordinates and properties for each hotspot
  const transportProps = getPinProps(-0.44, 35)
  const foodDietProps = getPinProps(-0.24, 68)
  const energyProps = getPinProps(0.05, 30)
  const shoppingProps = getPinProps(0.55, 42)

  // Helper to generate SVG path and label position for a quadratic Bezier curve bending outward from the center
  const getArcData = (
    p1: { x: number; y: number; opacity: number },
    p2: { x: number; y: number; opacity: number },
    label: string
  ) => {
    const x1 = p1.x
    const y1 = p1.y
    const x2 = p2.x
    const y2 = p2.y

    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2

    // Vector from center (50, 50) to midpoint
    const ux = mx - 50
    const uy = my - 50
    const dist = Math.sqrt(ux * ux + uy * uy)

    // Outward normal vector
    const nx = dist > 0 ? ux / dist : 0
    const ny = dist > 0 ? uy / dist : -1

    // Arc height relative to the distance between endpoints (hugs the earth)
    const dx = x2 - x1
    const dy = y2 - y1
    const pointsDist = Math.sqrt(dx * dx + dy * dy)
    const arcHeight = Math.max(4, pointsDist * 0.12)

    const cx = mx + nx * arcHeight
    const cy = my + ny * arcHeight

    // Path string for quadratic bezier
    const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`

    // Midpoint on the curve at t = 0.5
    const tx = 0.25 * x1 + 0.5 * cx + 0.25 * x2
    const ty = 0.25 * y1 + 0.5 * cy + 0.25 * y2

    // Opacity is the minimum of both endpoints to ensure it fades when either is on the backside
    const opacity = Math.min(p1.opacity, p2.opacity)

    return { path, tx, ty, opacity, label }
  }

  // Create connecting arcs matching actual hotspot categories
  const arcs = [
    getArcData(transportProps, energyProps, "TRANSPORT → ENERGY"),
    getArcData(energyProps, shoppingProps, "ENERGY → SHOPPING"),
    getArcData(shoppingProps, foodDietProps, "SHOPPING → DIET")
  ]

  return (
    <>
      {/* SVG Arcs Container */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-15"
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {arcs.map((arc, index) => (
          <g key={index}>
            {/* Soft Glow Under-line */}
            <path
              d={arc.path}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.8"
              strokeLinecap="round"
              style={{
                opacity: arc.opacity * 0.22,
                transition: "opacity 0.2s ease"
              }}
            />
            {/* Technical Flow Core Dash Line */}
            <path
              d={arc.path}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.45"
              strokeLinecap="round"
              strokeDasharray="4 3"
              style={{
                opacity: arc.opacity * 0.9,
                transition: "opacity 0.2s ease",
                animation: "flow 2s linear infinite"
              } as React.CSSProperties}
            />
          </g>
        ))}
      </svg>

      {/* Floating Premium Dark Forest Glassmorphic Connection Labels */}
      {arcs.map((arc, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${arc.tx}%`,
            top: `${arc.ty}%`,
            transform: "translate(-50%, -100%)",
            marginTop: -6,
            opacity: arc.opacity,
            transition: "opacity 0.2s ease",
          }}
          className="px-2 py-0.5 rounded bg-[#0a1812]/90 text-emerald-400 font-mono text-[6px] sm:text-[7px] font-black tracking-wider uppercase whitespace-nowrap shadow-lg border border-emerald-500/20 backdrop-blur-[4px] select-none z-20 pointer-events-none"
        >
          {arc.label}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translate3d(-50%, -1px, 0)",
              border: "4px solid transparent",
              borderTopColor: "rgba(10, 24, 18, 0.9)",
            }}
          />
        </div>
      ))}

      {/* Hotspots Pins */}
      <PulseHotspot2D {...transportProps} label="🚗 transport" />
      <PulseHotspot2D {...foodDietProps} label="🍔 food diet" />
      <PulseHotspot2D {...energyProps} label="⚡ energy" />
      <PulseHotspot2D {...shoppingProps} label="🛍 shopping" />
    </>
  )
}

/** Props for the storytelling Globe component. */
interface GlobeProps {
  /** The current storytelling phase driving planetary visuals. */
  stage: "polluted" | "awareness" | "recovery" | "thriving"
  /** Relative landing page scroll progress [0, 1]. */
  progress?: number
  /** Unused zoom scaling factor reserved for future viewport configurations. */
  zoom?: number
}

/**
 * Renders the photorealistic 3D-looking Earth sphere overlay.
 *
 * Utilizes scrolling flat textures (base map + cloud layer) to simulate
 * constant dynamic spin, overlaid with radial lighting gradients and
 * reactive CSS drop-shadows that change color based on ecological progression.
 *
 * @param props - {@link GlobeProps}
 */
export const Globe: React.FC<GlobeProps> = ({ stage, progress = 0.0 }) => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let animFrame: number
    const startTime = performance.now()
    const update = () => {
      setTime((performance.now() - startTime) / 1000)
      animFrame = requestAnimationFrame(update)
    }
    animFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  const isHealthy = stage === "recovery" || stage === "thriving"
  const isThriving = stage === "thriving"

  // Unified scroll-based rotation + time-based spin (in radians)
  const earthAngle = -(time * (2 * Math.PI / 36) + progress * (2 * Math.PI * 1.5))
  const cloudsAngle = -(time * (2 * Math.PI / 28) + progress * (2 * Math.PI * 2.0))

  // Convert angles to background position percentages (since size is 200% 100%)
  const mapPositionX = (earthAngle / (2 * Math.PI)) * 200
  const cloudsPositionX = (cloudsAngle / (2 * Math.PI)) * 200

  // Map progress (0 to 1) smoothly to continuous visual parameters
  const grayscale = Math.max(0, 60 - progress * 60)
  const sepia = Math.max(0, 20 - progress * 20)
  const saturate = 60 + progress * 80
  const brightness = 0.7 + progress * 0.4
  const contrast = 0.95 + progress * 0.15
  const filterVal = `grayscale(${grayscale}%) sepia(${sepia}%) saturate(${saturate}%) brightness(${brightness}) contrast(${contrast})`

  // 2. Dynamic inset shadow transitions simulating sphere 3D lighting
  // Polluted (orange/brown shadow) -> Thriving (emerald/cyan shadow)
  const glowR = Math.round(234 - progress * 220)
  const glowG = Math.round(88 + progress * 97)
  const glowB = Math.round(12 + progress * 220) // orange to teal
  
  const shadowVal = `
    0 0 ${30 + progress * 30}px rgba(${glowR}, ${glowG}, ${glowB}, ${0.4 + progress * 0.3}),
    0 0 ${60 + progress * 60}px rgba(${glowR}, ${glowG}, ${glowB}, ${0.15 + progress * 0.15})
  `

  return (
    <>
      <style>
        {`
          @keyframes twinkling {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          @keyframes flow {
            to { stroke-dashoffset: -20; }
          }
        `}
      </style>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Star backdrop */}
        <StarField />

        {/* Spinning, Pulsing Holographic/Atmospheric Gradient Ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.03, 1],
          }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            background: `linear-gradient(to right, rgba(${glowR}, ${glowG}, ${glowB}, 0.08), transparent, rgba(${glowR}, ${glowG}, ${glowB}, 0.08))`,
            border: `1.5px dashed rgba(${glowR}, ${glowG}, ${glowB}, 0.25)`,
          }}
          className="absolute w-[98%] h-[98%] rounded-full pointer-events-none -z-15 transition-all duration-700"
        />

        {/* Outer Atmosphere Glow Shield */}
        <motion.div
          animate={{
            scale: [1, 1.015, 1],
            opacity: [0.65, 0.8, 0.65],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            borderColor: `rgba(${glowR}, ${glowG}, ${glowB}, 0.25)`,
            boxShadow: shadowVal,
          }}
          className="absolute w-[94%] h-[94%] rounded-full border pointer-events-none -z-10 transition-all duration-700"
        />

        {/* 2D Spherical Globe container */}
        <div
          className="relative w-[85%] h-[85%] rounded-full overflow-hidden transition-all duration-700 shadow-2xl"
          style={{
            boxShadow: `0 0 45px rgba(${glowR}, ${glowG}, ${glowB}, ${0.15 + progress * 0.15})`,
          }}
        >
          {/* 1. Map texture background layer */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              backgroundImage: "url('/earth/globe_base.jpg')",
              backgroundSize: "200% 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: `${mapPositionX}% center`,
              filter: filterVal,
            }}
          />

          {/* 2. Clouds Layer overlay */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-1000"
            style={{
              backgroundImage: "url('/earth/earth_clouds.png')",
              backgroundSize: "200% 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: `${cloudsPositionX}% center`,
              opacity: stage === "polluted" ? 0.35 : 0.65,
              filter: stage === "polluted" ? "brightness(0.5) sepia(0.3)" : "brightness(1.1)",
            }}
          />

          {/* 3. Sunlight Rays overlay in thriving stage */}
          {isThriving && <SunlightRays />}

          {/* 4. Responsive 3D Spherical Shading & Lighting Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-full z-10 mix-blend-multiply"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1) 0%, rgba(220, 220, 220, 0.95) 25%, rgba(100, 100, 100, 0.55) 55%, rgba(0, 0, 0, 0.95) 82%, rgba(0, 0, 0, 1) 100%)",
            }}
          />

          {/* 5. Rim highlight / Atmosphere boundary glow overlay */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-full z-20 transition-all duration-700"
            style={{
              boxShadow: `
                inset 0 0 ${25 + progress * 15}px rgba(${glowR}, ${glowG}, ${glowB}, 0.5),
                inset -5px 0 15px rgba(${glowR}, ${glowG}, ${glowB}, 0.4)
              `,
            }}
          />
        </div>

        {/* Pulsing Hotspots (Scene 2) */}
        <Hotspots2D progress={progress} earthAngle={earthAngle} />

        {/* Floating Leaves HTML Overlay */}
        <AnimatePresence>
          {isHealthy && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {[...Array(6)].map((_, i) => {
                const initialX = 15 + ((i * 17) % 70)
                const targetX = 10 + ((i * 23) % 80)
                const duration = 6 + ((i * 7) % 5)
                return (
                  <motion.div
                    key={i}
                    initial={{ y: "110%", x: `${initialX}%`, opacity: 0, scale: 0.6 }}
                    animate={{
                      y: ["110%", "-10%"],
                      x: [`${initialX}%`, `${targetX}%`],
                      opacity: [0, 0.8, 0.8, 0],
                      scale: [0.6, 1.2, 0.6],
                      rotate: [0, 360],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.8,
                    }}
                    className="absolute text-emerald-500/50 text-xl font-bold"
                  >
                    🍃
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
