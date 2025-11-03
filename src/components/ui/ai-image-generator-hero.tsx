
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
  SiX,
  SiThreads,
} from "react-icons/si";
import type { IconType } from "react-icons";


interface IconCard {
  id: string
  Icon: IconType
  color: string
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
  
  const arcRadius = 180;
  const totalAngle = 120;
  const angleStep = totalAngle / (demoIcons.length - 1);


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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-24 sm:pt-20">
         {/* Text Content Section */}
        <div className="relative z-20 text-center max-w-4xl">
            {/* Arc Icons */}
            <div className="relative h-40 mb-8 flex justify-center items-center">
              {demoIcons.map(({ Icon, color, id }, index) => {
                const angle = -totalAngle / 2 + index * angleStep;
                const radian = (angle * Math.PI) / 180;
                const x = arcRadius * Math.sin(radian);
                const y = arcRadius - arcRadius * Math.cos(radian);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 0, rotate: angle }}
                    animate={{ opacity: 1, x: x, y: y, rotate: angle }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="absolute"
                  >
                    <div
                      className={cn(
                        "relative w-20 h-20 rounded-2xl flex items-center justify-center",
                        "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg",
                        "group"
                      )}
                       style={{
                        transform: `rotate(${-angle}deg)`
                      }}
                    >
                      <Icon
                        size="60%"
                        className="transition-transform duration-300 group-hover:scale-110"
                        style={{
                          color: color.startsWith("url") ? undefined : color,
                          fill: color.startsWith("url") ? color : undefined,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

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
