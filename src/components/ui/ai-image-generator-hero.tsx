
"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LogoCloud } from "./logo-cloud-3";
import { ContainerScroll } from "./container-scroll-animation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRouter } from "next/navigation";


interface ImageCarouselHeroProps {
  title: string
  description: string
  ctaText: string
  onCtaClick?: () => void
}

const logos = [
    {
        src: "https://svgl.app/library/tiktok-wordmark-light.svg",
        alt: "TikTok Logo",
    },
    {
        src: "https://svgl.app/library/instagram-wordmark-light.svg",
        alt: "Instagram Logo",
    },
    {
        src: "https://svgl.app/library/youtube-wordmark-light.svg",
        alt: "YouTube Logo",
    },
    {
        src: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.svg",
        alt: "X Logo",
    },
    {
        src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Facebook_wordmark_%282023%29.svg",
        alt: "Facebook Logo",
    },
    {
        src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Threads_%28app%29_logo.svg",
        alt: "Threads Logo",
    },
];

export function ImageCarouselHero({
  title,
  description,
  ctaText,
  onCtaClick,
}: ImageCarouselHeroProps) {
  const router = useRouter();
  const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

  return (
    <div className="relative w-full bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="relative z-20 text-center max-w-4xl">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LogoCloud logos={logos} />
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
