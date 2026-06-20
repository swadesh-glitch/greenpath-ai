"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sprout, Award, Menu, X, Compass, BarChart2, User, HelpCircle, Target, Flame } from "lucide-react"
import { useAppContext } from "@/store/AppContext"
import { cn } from "@/lib/utils"
import { Counter } from "@/components/shared/Counter"
import { LEVEL_THRESHOLDS } from "@/lib/constants"

function calcProgress(points: number): number {
  const curIdx = LEVEL_THRESHOLDS.reduce((best, t, i) => (points >= t ? i : best), 0)
  const nextThreshold = LEVEL_THRESHOLDS[curIdx + 1]
  if (!nextThreshold) return 100
  const pct = ((points - LEVEL_THRESHOLDS[curIdx]) / (nextThreshold - LEVEL_THRESHOLDS[curIdx])) * 100
  return Math.min(100, Math.round(pct))
}

export const Navigation: React.FC = () => {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const { isOnboarded, points, gardenLevel, currentStreak } = useAppContext()
  const progressPct = calcProgress(points)

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeQuery, setActiveQuery] = useState("")

  // Scroll detection for sticky nav appearance changes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Poll / check query string changes client-side safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateQuery = () => setActiveQuery(window.location.search)
      const timer = setTimeout(updateQuery, 0)
      const interval = setInterval(() => {
        if (window.location.search !== activeQuery) {
          setActiveQuery(window.location.search)
        }
      }, 200)
      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    }
  }, [activeQuery, pathname])

  if (pathname === "/onboarding" || !mounted) return null

  const isLandingPage = pathname === "/"

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle anchor link click elegantly
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault()
      const id = href.split("#")[1]
      scrollToSection(id)
    } else {
      setMobileMenuOpen(false)
    }
  }

  // Navigation items mapping based on onboarding status
  const getNavLinks = (): { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[] => {
    if (!isOnboarded) {
      return [
        { name: "How It Works", href: "/#scene-2", icon: HelpCircle },
        { name: "About", href: "/#about-section", icon: Compass },
      ]
    }

    return [
      { name: "Climate Identity", href: "/identity", icon: User },
      { name: "Carbon Story", href: "/analysis", icon: BarChart2 },
      { name: "Climate Twin", href: "/analysis?tab=twin", icon: Compass },
      { name: "Carbon Garden", href: "/garden", icon: Sprout },
      { name: "AI Missions", href: "/missions", icon: Target },
      { name: "About", href: "/#about-section", icon: HelpCircle },
    ]
  }

  const links = getNavLinks()

  return (
    <>
      {/* Floating Sticky Top Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4",
          isScrolled ? "top-2" : "top-0"
        )}
      >
        <div
          className={cn(
            "max-w-6xl mx-auto h-16 rounded-full flex items-center justify-between px-6 transition-all duration-350",
            isScrolled
              ? isLandingPage
                ? "glass-panel-dark shadow-lg backdrop-blur-md border border-emerald-500/15"
                : "glass-panel-light dark:glass-panel-dark shadow-lg backdrop-blur-md border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          )}
        >
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="text-white h-4.5 w-4.5" />
            </div>
            <span className={cn(
              "font-extrabold text-md tracking-tight",
              isLandingPage ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              GreenPath
            </span>
          </Link>

          {/* Links (Center) */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              // Custom active state checking for query parameters
              let isActive = false
              if (!link.href.startsWith("/#")) {
                if (link.href.includes("?")) {
                  const [basePath, queryStr] = link.href.split("?")
                  isActive = pathname === basePath && activeQuery.includes(queryStr)
                } else {
                  if (link.href === "/analysis") {
                    isActive = pathname === "/analysis" && !activeQuery.includes("tab=twin")
                  } else {
                    isActive = pathname === link.href
                  }
                }
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                    isActive
                      ? isLandingPage
                        ? "text-emerald-400"
                        : "text-emerald-600 dark:text-emerald-400"
                      : isLandingPage
                        ? "text-sand-200 opacity-75 hover:opacity-100"
                        : "text-sand-800 dark:text-sand-200 opacity-75 hover:opacity-100"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-top"
                      className={cn(
                        "absolute inset-0 rounded-full -z-10 border",
                        isLandingPage
                          ? "bg-emerald-500/15 border-emerald-500/20"
                          : "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/10"
                      )}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.icon && <link.icon className="h-3.5 w-3.5" />}
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right: Garden Badge or CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isOnboarded ? (
              <Link href="/garden" className="group">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "flex items-center gap-2.5 border px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                    isLandingPage
                      ? "bg-forest-900/40 border-forest-800/40 text-sand-200 hover:border-emerald-500/30"
                      : "bg-sand-100/50 dark:bg-forest-900/40 border-sand-200/50 dark:border-forest-800/40 text-sand-800 dark:text-sand-200 hover:border-emerald-500/30"
                  )}
                >
                  {/* Level pill */}
                  <div className="flex items-center gap-1">
                    <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">Lv.{gardenLevel}</span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="w-14 h-1.5 bg-sand-200 dark:bg-forest-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  {/* Streak flame */}
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 text-orange-500 dark:text-orange-400">
                      <Flame className="h-3.5 w-3.5 fill-orange-500/20" />
                      <span className="font-black text-[10px]">{currentStreak}</span>
                    </div>
                  )}

                  {/* Points */}
                  <div className="flex items-center gap-1" title="Green Points">
                    <Award className="text-accent-yellow h-3.5 w-3.5 fill-accent-yellow/10" />
                    <Counter value={points} />
                  </div>
                </motion.div>
              </Link>
            ) : (
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-premium px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  Start Journey
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburguer Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={cn(
              "md:hidden p-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
              isLandingPage
                ? "text-sand-200 hover:bg-forest-900/40"
                : "text-sand-800 dark:text-sand-200 hover:bg-sand-100 dark:hover:bg-forest-900/40"
            )}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "fixed top-20 left-6 right-6 z-40 rounded-3xl p-6 border shadow-2xl flex flex-col gap-4 md:hidden backdrop-blur-lg",
              isLandingPage
                ? "glass-panel-dark border-emerald-500/15"
                : "glass-panel-light dark:glass-panel-dark border-emerald-500/10"
            )}
          >
            {links.map((link) => {
              // Custom active state checking for query parameters
              let isActive = false
              if (!link.href.startsWith("/#")) {
                if (link.href.includes("?")) {
                  const [basePath, queryStr] = link.href.split("?")
                  isActive = pathname === basePath && activeQuery.includes(queryStr)
                } else {
                  if (link.href === "/analysis") {
                    isActive = pathname === "/analysis" && !activeQuery.includes("tab=twin")
                  } else {
                    isActive = pathname === link.href
                  }
                }
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "w-full py-2 text-sm font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-lg px-2",
                    isLandingPage 
                      ? isActive ? "text-emerald-400" : "text-sand-200 hover:text-emerald-400" 
                      : isActive ? "text-emerald-600 dark:text-emerald-400" : "text-sand-800 dark:text-sand-200"
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4 opacity-70" />}
                  {link.name}
                </Link>
              )
            })}
            
            <div className={cn("h-[1px] my-1", isLandingPage ? "bg-white/10" : "bg-sand-200 dark:bg-forest-800/80")} />

            {isOnboarded ? (
              <div className={cn(
                "flex justify-around items-center py-2 text-sm font-bold",
                isLandingPage ? "text-sand-200" : "text-sand-800 dark:text-sand-200"
              )}>
                <Link href="/garden" className="flex items-center gap-2 w-full justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <Sprout className="h-4 w-4 text-emerald-500" />
                  <span>Level {gardenLevel}</span>
                  {currentStreak > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-500">
                      <Flame className="h-4 w-4 fill-orange-500/20" />
                      {currentStreak}
                    </span>
                  )}
                  <Award className="text-accent-yellow h-4 w-4 fill-accent-yellow/10 ml-1" />
                  <Counter value={points} suffix=" pts" />
                </Link>
              </div>
            ) : (
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none">
                  Start Journey
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
