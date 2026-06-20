import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AppProvider } from "@/store/AppContext"
import { Navigation } from "@/components/shared/Navigation"
import { MainContentWrapper } from "@/components/shared/MainContentWrapper"
import { Toaster } from "sonner"
import { ResetDemoButton } from "@/components/shared/ResetDemoButton"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "GreenPath AI — Track. Reduce. Grow.",
    template: "%s | GreenPath AI",
  },
  description: "Your AI-powered climate coach. Track your carbon footprint, complete eco missions, and grow a living Carbon Garden.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "GreenPath AI — Track. Reduce. Grow.",
    description: "Your AI-powered climate coach. Track your carbon footprint, complete eco missions, and grow a living Carbon Garden.",
    url: "https://greenpath-ai.dev",
    siteName: "GreenPath AI",
    images: [
      {
        url: "/bg_forest.png",
        width: 1200,
        height: 630,
        alt: "GreenPath AI — Your Climate Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenPath AI — Track. Reduce. Grow.",
    description: "Your AI-powered climate coach. Track your carbon footprint, complete eco missions, and grow a living Carbon Garden.",
    images: ["/bg_forest.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-sand-50 dark:bg-forest-950 text-foreground transition-colors duration-300">
        <AppProvider>
          {/* Main App Grid/Layout */}
          <div className="flex-1 flex flex-col md:flex-row relative">
            <Navigation />
            
            <MainContentWrapper>
              {children}
            </MainContentWrapper>
          </div>
          
          {/* Custom sonner notifications toast */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "glass-panel-light dark:glass-panel-dark text-foreground border-emerald-500/20 rounded-2xl p-4 font-sans font-semibold",
              duration: 3500,
            }} 
          />
          <ResetDemoButton />
        </AppProvider>
      </body>
    </html>
  )
}
