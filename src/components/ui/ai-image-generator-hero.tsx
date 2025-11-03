
"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiInstagram,
  SiThreads,
  SiX,
} from "react-icons/si";

interface ImageCarouselHeroProps {
  title: string
  description: string
  ctaText: string
  onCtaClick?: () => void
}


export function ImageCarouselHero({
  title,
  description,
  ctaText,
  onCtaClick,
}: ImageCarouselHeroProps) {

  const demoIcons = [
    {
      id: "1",
      Icon: SiYoutube,
      color: "#FF0000",
    },
    {
      id: "2",
      Icon: SiTiktok,
      color: "#000000",
    },
    {
      id: "3",
      Icon: SiInstagram,
      color: "url(#instagram-gradient)",
    },
    {
      id: "4",
      Icon: SiX,
      color: "#000000",
    },
    {
      id: "5",
      Icon: SiFacebook,
      color: "#1877F2",
    },
    {
      id: "6",
      Icon: SiThreads,
      color: "#000000",
    },
  ];


  return (
    <div className="relative w-full bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="relative z-20 text-center max-w-4xl">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-6 p-3 rounded-full bg-card/10 backdrop-blur-lg border border-white/10 shadow-lg">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#feda75', stopOpacity: 1 }} />
                      <stop offset="25%" style={{ stopColor: '#fa7e1e', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#d62976', stopOpacity: 1 }} />
                      <stop offset="75%" style={{ stopColor: '#962fbf', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#4f5bd5', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>
                {demoIcons.map(({ Icon, id, color }) => (
                  <Icon
                    key={id}
                    className="text-2xl text-white/80"
                    style={{ color: color.startsWith("url") ? color : undefined, fill: color.startsWith("url") ? "" : color }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                {title}
            </motion.h1>

            <motion.p 
                className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                {description}
            </motion.p>

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
                transition={{ duration: 0.5, delay: 1 }}
            >
                {ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>
      </div>
    </div>
  )
}
