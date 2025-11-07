
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
import { InfiniteSlider } from "./infinite-slider";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";


interface ImageCarouselHeroProps {
  title: string
  description: string
  ctaText: string
  onCtaClick?: () => void
}

const icons = [
  { Component: SiYoutube, color: "#FF0000" },
  { Component: SiTiktok, color: "#000000" },
  { Component: SiInstagram, color: "url(#instagram-gradient)" },
  { Component: SiX, color: "#000000" },
  { Component: SiFacebook, color: "#1877F2" },
  { Component: SiThreads, color: "#000000" },
];

export function ImageCarouselHero({
  title,
  description,
  ctaText,
  onCtaClick,
}: ImageCarouselHeroProps) {
  const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

  return (
    <div className="relative w-full bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8 pt-40">
        <div className="relative z-20 text-center max-w-4xl">
            <motion.div
              className="mb-8 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                  <InfiniteSlider gap={60} speed={40}>
                      {icons.map(({ Component, color }, index) => (
                        <div key={index} className="flex items-center gap-2 text-muted-foreground">
                            <svg width="0" height="0" className="absolute">
                                <defs>
                                    <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#feda75' }} />
                                    <stop offset="25%" style={{ stopColor: '#fa7e1e' }} />
                                    <stop offset="50%" style={{ stopColor: '#d62976' }} />
                                    <stop offset="75%" style={{ stopColor: '#962fbf' }} />
                                    <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <Component
                                className="text-3xl"
                                style={{ fill: color.startsWith('url') ? color : 'currentColor', color: color.startsWith('url') ? undefined : color }}
                            />
                        </div>
                      ))}
                  </InfiniteSlider>
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
      
       <div className="relative z-10 container mx-auto px-4 mt-16 sm:mt-20">
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
        >
            <div className="relative aspect-[16/10] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border/10 shadow-2xl bg-black">
              {heroImage && (
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      width={1200}
                      height={800}
                      className="w-full h-full object-contain object-top"
                      priority
                  />
              )}
            </div>
        </motion.div>
      </div>
    </div>
  )
}
