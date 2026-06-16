import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AppProvider } from "@/store/AppContext"
import { Navigation } from "@/components/shared/Navigation"
import { Toaster } from "sonner"
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
  title: "GreenPath AI — Your Personal Climate Journey",
  description: "A gamified climate companion helping you build custom carbon identities, complete missions, and grow a living carbon garden.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-sand-50 dark:bg-forest-950 text-foreground transition-colors duration-300">
        <AppProvider>
          {/* Main App Grid/Layout */}
          <div className="flex-1 flex flex-col md:flex-row relative">
            <Navigation />
            
            {/* Main Content Pane */}
            <main className="flex-1 min-h-screen px-4 pt-24 pb-20 md:px-8 flex flex-col max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
          
          {/* Custom sonner notifications toast */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "glass-panel-light dark:glass-panel-dark text-foreground border-emerald-500/20 rounded-2xl p-4 font-sans font-semibold",
              duration: 3500,
            }} 
          />
        </AppProvider>
      </body>
    </html>
  )
}
