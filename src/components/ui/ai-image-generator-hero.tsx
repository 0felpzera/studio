
"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  const [rotatingCards, setRotatingCards] = useState<number[]>([])
  const [radius, setRadius] = useState(180);

  // Set radius based on screen size
  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerWidth < 768 ? 120 : 180);
    };
    
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingCards((prev) => prev.map((_, i) => (prev[i] + 0.5) % 360))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Initialize rotating cards
  useEffect(() => {
    setRotatingCards(icons.map((_, i) => i * (360 / icons.length)))
  }, [icons.length])


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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-24 sm:pt-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 w-full max-w-7xl items-center">
            {/* Carousel Container - Order changed for mobile */}
            <div
                className="relative w-full h-96 sm:h-[500px] lg:order-last"
            >
                {/* Rotating Icon Cards */}
                <div className="absolute inset-0 flex items-center justify-center perspective">
                    {icons.map(({ Icon, color, rotation }, index) => {
                    const totalCards = icons.length
                    const angle = (rotatingCards[index] || 0) * (Math.PI / 180)
                    const x = Math.cos(angle) * radius
                    const y = Math.sin(angle) * radius

                    return (
                        <motion.div
                        key={index}
                        className="absolute w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 transition-all duration-300"
                        style={{
                            transform: `
                            translate(${x}px, ${y}px)
                            rotateZ(${rotation}deg)
                            `,
                            transformStyle: "preserve-3d",
                        }}
                        >
                        <div
                            className={cn(
                            "relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center",
                            "bg-card/80 backdrop-blur-sm border border-border/50",
                            "transition-all duration-300 hover:shadow-3xl hover:scale-110",
                            "cursor-pointer group",
                            )}
                            style={{
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <Icon size="50%" className="transition-transform duration-500 group-hover:scale-110" style={{ color: color.startsWith('url') ? undefined : color, fill: color.startsWith('url') ? color : undefined }}/>
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        </motion.div>
                    )
                    })}
                </div>
            </div>
            
            {/* Text Content Section */}
            <div className="relative z-20 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
                    {title}
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance">{description}</p>

                {/* CTA Button */}
                <button
                    onClick={onCtaClick}
                    className={cn(
                    "inline-flex items-center gap-2 px-8 py-3 rounded-full",
                    "bg-primary text-primary-foreground font-medium",
                    "hover:shadow-lg hover:scale-105 transition-all duration-300",
                    "active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "group",
                    )}
                >
                    {ctaText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
