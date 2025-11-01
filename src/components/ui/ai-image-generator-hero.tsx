"use client"

import type React from "react"
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  SiYoutube, 
  SiTiktok, 
  SiInstagram, 
  SiFacebook, 
  SiThreads,
  SiX
} from "react-icons/si";

interface SocialIcon {
  Icon: React.ElementType;
  color: string;
}

const socialIcons: SocialIcon[] = [
  { Icon: SiYoutube, color: "#FF0000" },
  { Icon: SiTiktok, color: "#000000" },
  { Icon: SiInstagram, color: "#E4405F" },
  { Icon: SiX, color: "#000000" },
  { Icon: SiFacebook, color: "#1877F2" },
  { Icon: SiThreads, color: "#000000" },
];

interface ImageCarouselHeroProps {
  title: string
  subtitle: string
  description: string
  ctaText: string
  onCtaClick?: () => void
  features?: Array<{
    title: string
    description: string
  }>
}

export function ImageCarouselHero({
  title,
  subtitle,
  description,
  ctaText,
  onCtaClick,
  features = [
    {
      title: "Realistic Results",
      description: "Realistic Results Photos that look professionally crafted",
    },
    {
      title: "Fast Generation",
      description: "Turn ideas into images in seconds.",
    },
    {
      title: "Diverse Styles",
      description: "Choose from a wide range of artistic options.",
    },
  ],
}: ImageCarouselHeroProps) {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-background via-background to-background overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 w-full max-w-6xl items-center">
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
            {/* Social Icons Section */}
            <div
            className="relative w-full h-96 sm:h-[500px] flex items-center justify-center"
            >
              <div className="grid grid-cols-3 gap-6">
                {socialIcons.map(({ Icon, color }, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -15, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex justify-center items-center bg-card p-6 rounded-2xl shadow-lg border border-border/10 cursor-pointer"
                  >
                    <Icon size={60} style={{ color }} />
                  </motion.div>
                ))}
              </div>
            </div>
        </div>

        {/* Features Section */}
        <div className="relative z-20 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "text-center p-6 rounded-xl",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "hover:bg-card/80 hover:border-border transition-all duration-300",
                "group",
              )}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
