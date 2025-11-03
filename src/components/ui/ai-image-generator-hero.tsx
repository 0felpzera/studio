
"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { IconType } from "react-icons";


interface IconCard {
  id: string
  Icon: IconType
  color: string
  rotation: number
}

interface ImageCarouselHeroProps {
  title: string
  description: string
  ctaText: string
  onCtaClick?: () => void
  icons: IconCard[]
}

export function ImageCarouselHero({
  title,
  description,
  ctaText,
  onCtaClick,
  icons,
}: ImageCarouselHeroProps) {

  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9ce34" />
            <stop offset="25%" stopColor="#ee2a7b" />
            <stop offset="50%" stopColor="#6228d7" />
            <stop offset="100%" stopColor="#6228d7" />
          </linearGradient>
        </defs>
      </svg>
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-32 sm:pt-24">
         {/* Text Content Section */}
        <div className="relative z-20 text-center max-w-4xl">
            {/* Static Icons */}
            <motion.div 
                className="flex justify-center items-center gap-4 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {icons.map(({ Icon, color, id }) => (
                    <div
                        key={id}
                        className={cn(
                        "relative w-12 h-12 rounded-xl flex items-center justify-center",
                        "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg",
                        "group",
                        )}
                    >
                        <Icon size="50%" className="transition-transform duration-300 group-hover:scale-110" style={{ color: color.startsWith('url') ? undefined : color, fill: color.startsWith('url') ? color : undefined }}/>
                    </div>
                ))}
            </motion.div>

            <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                {title}
            </motion.h1>

            <motion.p 
                className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {description}
            </motion.p>

            {/* CTA Button */}
            <motion.button
                onClick={onCtaClick}
                className={cn(
                "inline-flex items-center gap-2 px-8 py-3 rounded-full",
                "bg-primary text-primary-foreground font-medium",
                "hover:shadow-lg hover:scale-105 transition-all duration-300",
                "active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "group",
                )}
                 initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                {ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>
      </div>
    </div>
  )
}
