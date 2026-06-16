"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sprout, Flame, Award, Menu, X, Compass, BarChart2, User, Home } from "lucide-react"
import { useAppContext } from "@/store/AppContext"
import { cn } from "@/lib/utils"

export const Navigation: React.FC = () => {
  const pathname = usePathname()
  const { isOnboarded, points, streakDays } = useAppContext()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const isLandingPage = pathname === "/"

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Navigation items mapping
  const getNavLinks = () => {
    if (isLandingPage && !isOnboarded) {
      return [
        { name: "Climate Story", href: "problem-section", isAnchor: true },
        { name: "How It Works", href: "possibility-section", isAnchor: true },
        { name: "Garden", href: "preview-section", isAnchor: true },
        { name: "About", href: "about-section", isAnchor: true },
      ]
    } else {
      // Onboarded internal dashboard navigation
      return [
        { name: "Home", href: "/", icon: Home },
        { name: "Garden", href: "/garden", icon: Sprout },
        { name: "Missions", href: "/missions", icon: Compass },
        { name: "Climate Story", href: "/analysis", icon: BarChart2 },
        { name: "Profile", href: "/profile", icon: User },
      ]
    }
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
              ? "glass-panel-light dark:glass-panel-dark shadow-lg backdrop-blur-md border border-emerald-500/10"
              : "bg-transparent border border-transparent"
          )}
        >
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="text-white h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-md tracking-tight text-emerald-600 dark:text-emerald-400">
              GreenPath
            </span>
          </Link>

          {/* Links (Center) */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isAnchor = "isAnchor" in link && link.isAnchor
              const isActive = pathname === link.href

              return isAnchor ? (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-xs font-bold text-sand-800 dark:text-sand-200 hover:text-emerald-500 dark:hover:text-emerald-400 opacity-80 hover:opacity-100 transition-all cursor-pointer"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-xs font-bold rounded-full transition-all duration-200",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-sand-800 dark:text-sand-200 opacity-75 hover:opacity-100"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill-top"
                      className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full -z-10 border border-emerald-500/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Call To Action / User Stats (Right) */}
          <div className="hidden md:flex items-center gap-4">
            {isOnboarded ? (
              <div className="flex items-center gap-3 bg-sand-100/50 dark:bg-forest-900/40 border border-sand-200/50 dark:border-forest-800/40 px-4 py-1.5 rounded-full text-xs font-bold">
                <div className="flex items-center gap-1" title="Streak Days">
                  <Flame className="text-orange-500 h-4.5 w-4.5 fill-orange-500 animate-pulse" />
                  <span>{streakDays}d</span>
                </div>
                <div className="h-3.5 w-[1px] bg-sand-300 dark:bg-forest-800" />
                <div className="flex items-center gap-1" title="Green Points">
                  <Award className="text-accent-yellow h-4.5 w-4.5 fill-accent-yellow/10" />
                  <span>{points} pts</span>
                </div>
              </div>
            ) : (
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-premium px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/10"
                >
                  Start Journey
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburguer Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-sand-100 dark:hover:bg-forest-900/40 transition-colors"
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
            className="fixed top-20 left-6 right-6 z-40 glass-panel-light dark:glass-panel-dark rounded-3xl p-6 border border-emerald-500/10 shadow-2xl flex flex-col gap-4 md:hidden backdrop-blur-lg"
          >
            {links.map((link) => {
              const isAnchor = "isAnchor" in link && link.isAnchor
              return isAnchor ? (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full text-left py-2 text-sm font-bold text-sand-800 dark:text-sand-200 opacity-80"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-sm font-bold text-sand-800 dark:text-sand-200"
                >
                  {link.name}
                </Link>
              )
            })}
            
            <div className="h-[1px] bg-sand-200 dark:bg-forest-800/80 my-1" />

            {isOnboarded ? (
              <div className="flex justify-around items-center py-2 text-sm font-bold">
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-500 h-5 w-5 fill-orange-500" />
                  <span>{streakDays} Days Streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="text-accent-yellow h-5 w-5 fill-accent-yellow/10" />
                  <span>{points} Green Points</span>
                </div>
              </div>
            ) : (
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-md">
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
