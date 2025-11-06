
"use client";

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { useRouter } from "next/navigation";
import {
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiInstagram,
  SiThreads,
  SiX,
} from "react-icons/si";
import {
  Home,
  Star,
  AppWindow,
  Presentation,
  Lightbulb,
  Bot,
  DollarSign,
  Calculator,
  MessageSquareQuote,
  LogIn,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { GrowthCalculator } from "@/components/ui/growth-calculator";
import { SocialProof } from "@/components/ui/social-proof";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timeline } from "@/components/ui/timeline";
import { Footer } from "@/components/ui/footer";
import { CardStack } from "@/components/ui/card-stack";
import React from "react";


export default function LandingPage() {
  const router = useRouter();
  const targetRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"],
  });

  const step = useTransform(scrollYProgress, (pos) => {
    if (pos <= 0.2) return 0;
    if (pos <= 0.4) return 1;
    if (pos <= 0.6) return 2;
    if (pos <= 0.8) return 3;
    if (pos <= 1) return 4;
    return 5;
  });


  const demoIcons = [
    {
      id: "1",
      Icon: SiYoutube,
      color: "#FF0000",
      rotation: -15,
    },
    {
      id: "2",
      Icon: SiTiktok,
      color: "#000000",
      rotation: -8,
    },
    {
      id: "3",
      Icon: SiInstagram,
      color: "url(#instagram-gradient)",
      rotation: 5,
    },
    {
      id: "4",
      Icon: SiX,
      color: "#000000",
      rotation: 12,
    },
    {
      id: "5",
      Icon: SiFacebook,
      color: "#1877F2",
      rotation: -12,
    },
    {
      id: "6",
      Icon: SiFacebook,
      color: "#1877F2",
      rotation: 8,
    },
  ];
  
    const featureCards = [
    {
      id: 0,
      content: (
        <div className="flex flex-col items-center text-center p-6">
          <div className="mb-4"><Presentation className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Diagnóstico de Vídeo</h3>
          <p className="text-muted-foreground">Análise com IA para otimizar seu conteúdo antes de postar.</p>
        </div>
      ),
    },
    {
      id: 1,
      content: (
        <div className="flex flex-col items-center text-center p-6">
          <div className="mb-4"><Lightbulb className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Gerador de Ideias</h3>
          <p className="text-muted-foreground">Gere ideias perenes e de tendência para nunca ficar sem inspiração.</p>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="flex flex-col items-center text-center p-6">
          <div className="mb-4"><Bot className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">IA Coach</h3>
          <p className="text-muted-foreground">Seu treinador pessoal de IA para crescimento acelerado.</p>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="flex flex-col items-center text-center p-6">
          <div className="mb-4"><DollarSign className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Mídia Kit Pro</h3>
          <p className="text-muted-foreground">Crie um mídia kit profissional com sugestões de preços.</p>
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="flex flex-col items-center text-center p-6">
          <div className="mb-4"><Star className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Ideias para Publis</h3>
          <p className="text-muted-foreground">Receba ideias criativas e autênticas para suas parcerias.</p>
        </div>
      ),
    },
    {
        id: 5,
        content: (
            <div className="flex flex-col items-center text-center p-6">
                <div className="mb-4"><CalendarDays className="w-8 h-8 text-primary" /></div>
                <h3 className="text-xl font-bold mb-2">Calendário de Conteúdo</h3>
                <p className="text-muted-foreground">Gere e gerencie um plano semanal de postagens com IA.</p>
            </div>
        )
    }
  ];

  const timelineData = [
    {
      title: "Recursos",
      description: "Ferramentas de IA para cada etapa do seu processo criativo.",
      content: (
        <div ref={targetRef} className="h-[250vh]">
          <div className="sticky top-1/4 h-[30rem]">
            <CardStack items={featureCards} currentStep={step} />
          </div>
        </div>
      )
    },
    {
        title: "Calculadora",
        description: "Simule seu crescimento e veja o potencial do seu perfil.",
        content: (
            <GrowthCalculator />
        )
    },
    {
        title: "Depoimentos",
        description: "Veja o que outros criadores estão dizendo sobre a Trendify.",
        content: (
            <SocialProof />
        )
    }
  ]

  const navItems = [
    { name: "Início", url: "#", icon: Home },
    { name: "Recursos", url: "#features", icon: Star },
    { name: "Calculadora", url: "#calculator", icon: Calculator },
    { name: "Depoimentos", url: "#testimonials", icon: MessageSquareQuote },
  ];

  return (
    <div className="text-foreground bg-background">
      <NavBar items={navItems} />
      <ImageCarouselHero
        title="Transforme Conteúdo em Tendência"
        description="Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial."
        ctaText="Comece a Crescer Agora"
        onCtaClick={() => router.push("/signup")}
        icons={demoIcons}
      />
      
      <div className="bg-background rounded-t-[50px]">
        <Timeline data={timelineData} />

         <motion.section 
           className="py-20 sm:py-32 text-accent-foreground"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }}
           viewport={{ once: true, amount: 0.5 }}
         >
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">
                  “Todo criador tem potencial pra ser tendência. A Trendify te mostra o caminho.”
                </h2>
            </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
