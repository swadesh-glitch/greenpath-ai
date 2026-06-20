"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAppContext } from "@/store/AppContext"
import { User, Calendar, Sparkles, RefreshCw, Sprout, Zap, Bike, Utensils, Shield, Leaf } from "lucide-react"
import { PageBackground } from "@/components/shared/PageBackground"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14
    }
  }
}

const cardContainerVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 85,
      damping: 15,
      staggerChildren: 0.08,
      delayChildren: 0.25,
    }
  }
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
}

export default function ClimateIdentityDashboard() {
  const router = useRouter()
  const { isOnboarded, selectedIdentity, generatedIdentity, resetApp } = useAppContext()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOnboarded) {
      router.replace("/onboarding")
    }
  }, [isOnboarded, router])

  const handleReset = () => {
    resetApp()
    router.push("/")
  }

  // Dynamic icon helper using clean line-icons instead of simple emojis
  const getIdentityIcon = () => {
    let iconName = "leaf"
    if (selectedIdentity) {
      if (selectedIdentity.icon === "Bike") iconName = "bike"
      else if (selectedIdentity.icon === "Leaf") iconName = "leaf"
      else if (selectedIdentity.icon === "Zap") iconName = "zap"
      else if (selectedIdentity.icon === "ShieldAlert") iconName = "shield"
    } else if (generatedIdentity) {
      const name = (generatedIdentity.name || "").toLowerCase()
      if (name.includes("transit") || name.includes("commuter") || name.includes("commute") || name.includes("travel") || name.includes("pathfinder")) iconName = "bike"
      else if (name.includes("kitchen") || name.includes("food") || name.includes("diet") || name.includes("curator") || name.includes("dining")) iconName = "utensils"
      else if (name.includes("heat") || name.includes("energy") || name.includes("grid") || name.includes("optimizer") || name.includes("solar")) iconName = "zap"
    }

    const iconClass = "h-8 w-8 text-emerald-700 filter drop-shadow-[0_2px_4px_rgba(4,120,87,0.15)]"
    if (iconName === "bike") return <Bike className={iconClass} />
    if (iconName === "utensils") return <Utensils className={iconClass} />
    if (iconName === "zap") return <Zap className={iconClass} />
    if (iconName === "shield") return <Shield className={iconClass} />
    return <Leaf className={iconClass} />
  }

  // Empty State if not onboarded or not mounted yet
  if (!mounted || !isOnboarded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-forest-950">
        <div className="flex flex-col items-center gap-3 animate-pulse text-emerald-500 font-bold uppercase text-xs tracking-wider">
          <Sprout className="h-8 w-8 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. Animated Atmospheric Background Styles */}
      <style>
        {`
          @keyframes blob1-move {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(60px, -40px) scale(1.12); }
            66% { transform: translate(-40px, 50px) scale(0.9); }
          }
          @keyframes blob2-move {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-70px, 45px) scale(1.15); }
          }
          @keyframes blob3-move {
            0%, 100% { transform: translate(0, 0) scale(1); }
            40% { transform: translate(50px, -60px) scale(0.95); }
          }
          @keyframes float-mote {
            0% { transform: translateY(110vh) translateX(0) scale(1); opacity: 0; }
            10% { opacity: 0.35; }
            90% { opacity: 0.35; }
            100% { transform: translateY(-10vh) translateX(40px) scale(0.7); opacity: 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.45; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-blob1 {
            animation: blob1-move 20s ease-in-out infinite alternate;
          }
          .animate-blob2 {
            animation: blob2-move 26s ease-in-out infinite alternate;
          }
          .animate-blob3 {
            animation: blob3-move 23s ease-in-out infinite alternate;
          }
          .animate-spin-slow {
            animation: spin-slow 35s linear infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 3.5s ease-in-out infinite;
          }
          @keyframes shimmer-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-shimmer-text {
            background-size: 200% auto;
            animation: shimmer-gradient 8s linear infinite;
          }
          @keyframes orbit-dot-1 {
            0% { transform: rotate(0deg) translateX(54px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(54px) rotate(-360deg); }
          }
          @keyframes orbit-dot-2 {
            0% { transform: rotate(120deg) translateX(54px) rotate(-120deg); }
            100% { transform: rotate(480deg) translateX(54px) rotate(-480deg); }
          }
          @keyframes orbit-dot-3 {
            0% { transform: rotate(240deg) translateX(54px) rotate(-240deg); }
            100% { transform: rotate(600deg) translateX(54px) rotate(-600deg); }
          }
          .orbit-particle-1 {
            animation: orbit-dot-1 6s linear infinite;
          }
          .orbit-particle-2 {
            animation: orbit-dot-2 7s linear infinite;
          }
          .orbit-particle-3 {
            animation: orbit-dot-3 5.5s linear infinite;
          }
          @keyframes wind-sway {
            0%, 100% { transform: scale(1.03) translate(0, 0) rotate(0deg); }
            50% { transform: scale(1.05) translate(3px, -2px) rotate(0.08deg); }
          }
          @keyframes wind-drift {
            0% { transform: translate(-20px, 0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.65; }
            90% { opacity: 0.65; }
            100% { transform: translate(105vw, -60px) rotate(180deg); opacity: 0; }
          }
          @keyframes petal-flutter {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(12px) rotate(45deg); }
          }
          @keyframes sway-grass {
            0%, 100% { transform: rotate(0deg) skewX(0deg); }
            50% { transform: rotate(7deg) skewX(3deg); }
          }
          @keyframes sway-flower {
            0%, 100% { transform: rotate(0deg) translate(0, 0); }
            50% { transform: rotate(-6deg) translate(-3px, 1px); }
          }
          .animate-sway-grass {
            animation: sway-grass 4.8s ease-in-out infinite alternate;
            transform-origin: bottom center;
          }
          .animate-sway-flower {
            animation: sway-flower 6.2s ease-in-out infinite alternate;
            transform-origin: bottom center;
          }
          .animate-wind {
            animation: wind-sway 25s ease-in-out infinite;
          }
          .bg-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          }
        `}
      </style>

      {/* Background Container using Shared PageBackground */}
      <PageBackground image="/backgrounds/identity-bg.jpg" />

      {/* Wind Particles (Dandelion seeds / flower pollen drifting horizontally) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(20)].map((_, i) => {
          const rSeed = Math.sin(i + 4.5) * 12345
          const randomVal = rSeed - Math.floor(rSeed)
          const delay = randomVal * 16
          const duration = 12 + randomVal * 10
          const startY = 10 + randomVal * 80
          const size = 3 + randomVal * 4
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white/75"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${startY}%`,
                left: `-20px`,
                filter: "blur(0.4px)",
                animation: `wind-drift ${duration}s linear infinite, petal-flutter 3.5s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                boxShadow: "0 0 6px rgba(255, 255, 255, 0.45)",
              }}
            />
          )
        })}
      </div>

      {/* MAIN CONTAINER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex-1 space-y-5 pt-20 pb-6 px-4 max-w-2xl mx-auto w-full flex flex-col items-center justify-center"
      >
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="space-y-1.5 text-center filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
          <h1 
            className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)" }}
          >
            Your Climate Identity
          </h1>
          <p 
            className="text-xs font-bold text-zinc-100 opacity-95 flex items-center justify-center gap-1.5"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)" }}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-400/80" /> Customized sustainability footprint identity
          </p>
        </motion.div>

        {/* CLIMATE IDENTITY CENTER CARD */}
        <motion.div
          variants={cardContainerVariants}
          className="w-full max-w-md rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65),0_0_50px_rgba(52,211,153,0.05)] glass-panel"
        >
          {/* Top inner glint highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          
          <motion.div variants={cardItemVariants} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[8px] tracking-widest uppercase border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-emerald-400" />
            Active Climate Identity
          </motion.div>

          {/* Upgraded Avatar/Icon presentation with bouncing spring entry */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 10,
              mass: 1,
              delay: 0.35
            }}
            className="relative mx-auto h-24 w-24 flex items-center justify-center mt-1"
          >
            {/* Pulsing, rotating glow ring behind */}
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-amber-500/25 blur-md animate-spin-slow" />
            <div className="absolute inset-[-4px] rounded-full border border-emerald-500/20 animate-pulse-glow" />
            
            {/* Orbiting particles */}
            <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] orbit-particle-1 z-20" />
            <div className="absolute h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] orbit-particle-2 z-20" />
            <div className="absolute h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] orbit-particle-3 z-20" />
            
            <div 
              className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-md z-10"
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                backgroundColor: "rgba(10, 20, 15, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {getIdentityIcon()}
            </div>
          </motion.div>

          <motion.div variants={cardItemVariants} className="space-y-1 relative py-1">
            {/* Glow Halo behind title */}
            <div className="absolute inset-0 mx-auto w-[85%] h-12 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 blur-xl rounded-full animate-pulse-glow pointer-events-none -z-10" />
            
            <h2 className="font-black text-2xl sm:text-3xl bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-shimmer-text">
              {generatedIdentity?.name || selectedIdentity?.title || "Eco Pathfinder"}
            </h2>
            <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase block">GreenPath Citizen</span>
          </motion.div>

          <motion.p variants={cardItemVariants} className="text-xs text-zinc-200 leading-relaxed font-semibold">
            {generatedIdentity?.description || selectedIdentity?.description || "A dedicated carbon neutral advocate optimizing urban footprints."}
          </motion.p>

          <motion.div variants={cardItemVariants} className="h-[1px] bg-white/10" />

          {generatedIdentity ? (
            <div className="space-y-2.5 text-left">
              {/* STRENGTH CARD (Elevated Glass Panel) */}
              <motion.div 
                variants={cardItemVariants}
                className="p-3 rounded-2xl border-l-[3px] border-l-emerald-500 flex flex-col gap-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:bg-white/[0.04] hover:border-l-emerald-400 glass-panel relative overflow-hidden"
              >
                {/* Soft left-edge glow bleeding in */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-emerald-500/15 to-transparent pointer-events-none" />
                
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 z-10 relative">
                  <motion.span
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    <Sprout className="h-3 w-3 text-emerald-400" />
                  </motion.span>
                  Biggest Strength
                  
                  {/* Micro-trending arrow indicators */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="h-3 w-3 rounded-full bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-[7px] text-emerald-400 font-black ml-auto"
                  >
                    ▲
                  </motion.div>
                </span>
                <p className="text-[11px] font-semibold leading-normal text-zinc-100 z-10 relative pl-4">
                  {generatedIdentity.strength}
                </p>
              </motion.div>
              
              {/* OPPORTUNITY CARD (Elevated Glass Panel) */}
              <motion.div 
                variants={cardItemVariants}
                className="p-3 rounded-2xl border-l-[3px] border-l-amber-500 flex flex-col gap-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:bg-white/[0.04] hover:border-l-amber-400 glass-panel relative overflow-hidden"
              >
                {/* Soft left-edge glow bleeding in */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-amber-500/15 to-transparent pointer-events-none" />
                
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 z-10 relative">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    <Zap className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                  </motion.span>
                  Biggest Opportunity
                </span>
                <p className="text-[11px] font-semibold leading-normal text-zinc-100 z-10 relative pl-4">
                  {generatedIdentity.opportunity}
                </p>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              variants={cardItemVariants}
              className="text-left space-y-1 p-3 rounded-2xl border-l-[3px] border-l-emerald-500 shadow-[0_4px_12px_rgba(0,0,0,0.15)] glass-panel"
            >
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                Passive Perk
              </span>
              <p className="text-xs font-semibold leading-normal text-zinc-200">
                {selectedIdentity?.startingBonus || "Green Start: Gain 50 starting bonus points."}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* RESET APP CONTROL PANEL */}
        <motion.div variants={itemVariants} className="pt-3.5 border-t border-white/10 flex justify-center w-full max-w-md">
          {!showResetConfirm ? (
            <motion.button
              onClick={() => setShowResetConfirm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black text-red-400 bg-zinc-950 hover:bg-zinc-900 hover:text-red-300 border border-red-500/25 hover:border-red-500/40 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              aria-label="Restart Onboarding Demo"
            >
              <RefreshCw className="h-3 w-3" /> Restart Onboarding Demo
            </motion.button>
          ) : (
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-900 border border-red-500/20 max-w-sm backdrop-blur-md shadow-lg">
              <p className="text-[11px] font-bold text-red-300 text-center">
                Are you sure you want to reset all your points, garden levels, and climate identity settings?
              </p>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 outline-none"
                >
                  Yes, Reset Everything
                </motion.button>
                <motion.button
                  onClick={() => setShowResetConfirm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-forest-800 font-bold rounded-lg text-xs text-sand-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 outline-none"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
