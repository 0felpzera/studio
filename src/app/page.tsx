
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
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
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
        <div className="flex flex-col text-left p-6 h-full">
          <div className="mb-4"><Presentation className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Diagnóstico de Vídeo</h3>
          <p className="text-muted-foreground text-sm mb-4">Análise com IA para otimizar seu conteúdo antes de postar.</p>
          <ul className="space-y-2 text-sm text-left mb-6">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Analise ganchos, ritmo e qualidade técnica.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Receba legendas e hashtags otimizadas.</span></li>
          </ul>
          <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs">
              <p className="font-semibold mb-2">Relatório Rápido:</p>
              <div className="flex items-center gap-2"><CheckCircle2 className="size-3 text-green-500"/> Gancho: <span className="font-medium">Forte</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="size-3 text-green-500"/> Qualidade Técnica: <span className="font-medium">Excelente</span></div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      content: (
        <div className="flex flex-col text-left p-6 h-full">
          <div className="mb-4"><Lightbulb className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Gerador de Ideias</h3>
          <p className="text-muted-foreground text-sm mb-4">Gere ideias perenes e de tendência para nunca ficar sem inspiração.</p>
          <ul className="space-y-2 text-sm text-left mb-6">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Combine seu nicho com o que está em alta.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Receba esboços de roteiro para cada ideia.</span></li>
          </ul>
           <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
              <p className="font-semibold">Ideias Sugeridas:</p>
              <div className="p-2 bg-background rounded-md">1. Unboxing ASMR de produtos de beleza.</div>
              <div className="p-2 bg-background rounded-md">2. Rotina matinal "arrume-se comigo".</div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="flex flex-col text-left p-6 h-full">
          <div className="mb-4"><BrainCircuit className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">IA Coach</h3>
          <p className="text-muted-foreground text-sm mb-4">Seu treinador pessoal de IA para crescimento acelerado.</p>
           <ul className="space-y-2 text-sm text-left mb-6">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Receba insights personalizados com base em suas métricas.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Entenda o que fazer para atingir suas metas mais rápido.</span></li>
          </ul>
          <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs">
              <p className="font-semibold mb-2">Conselho da IA:</p>
              <p>"Seu engajamento aumentaria em ~15% se você fizesse perguntas no final dos seus vídeos."</p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="flex flex-col text-left p-6 h-full">
          <div className="mb-4"><DollarSign className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Mídia Kit Pro</h3>
          <p className="text-muted-foreground text-sm mb-4">Crie um mídia kit profissional com sugestões de preços.</p>
           <ul className="space-y-2 text-sm text-left mb-6">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Gere um texto de apresentação para marcas.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Obtenha uma tabela de preços sugeridos.</span></li>
          </ul>
           <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
              <p className="font-semibold">Preços Sugeridos:</p>
              <div className="flex justify-between"><span>1 Reel:</span> <span className="font-mono">R$ 800</span></div>
              <div className="flex justify-between"><span>3 Stories:</span> <span className="font-mono">R$ 550</span></div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div className="flex flex-col text-left p-6 h-full">
          <div className="mb-4"><Star className="w-8 h-8 text-primary" /></div>
          <h3 className="text-xl font-bold mb-2">Ideias para Publis</h3>
          <p className="text-muted-foreground text-sm mb-4">Receba ideias criativas e autênticas para suas parcerias.</p>
           <ul className="space-y-2 text-sm text-left mb-6">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Integre produtos de forma natural no seu conteúdo.</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Sugestões de formatos que mais convertem.</span></li>
          </ul>
           <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
              <p className="font-semibold">Formatos Sugeridos:</p>
              <div className="flex flex-wrap gap-2">
                  <span className="bg-background px-2 py-1 rounded">Review Honesto</span>
                  <span className="bg-background px-2 py-1 rounded">Tutorial Criativo</span>
              </div>
          </div>
        </div>
      ),
    },
    {
        id: 5,
        content: (
            <div className="flex flex-col text-left p-6 h-full">
                <div className="mb-4"><CalendarDays className="w-8 h-8 text-primary" /></div>
                <h3 className="text-xl font-bold mb-2">Calendário de Conteúdo</h3>
                <p className="text-muted-foreground text-sm mb-4">Gere e gerencie um plano semanal de postagens com IA.</p>
                 <ul className="space-y-2 text-sm text-left mb-6">
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Planeje sua semana em minutos, não em horas.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>Mantenha a consistência e vença o algoritmo.</span></li>
                </ul>
                 <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
                    <p className="font-semibold">Checklist da Semana:</p>
                    <div className="flex items-center gap-2"><input type="checkbox" checked readOnly className="size-3.5 accent-primary" /> <span>Postar "3 mitos sobre moda".</span></div>
                    <div className="flex items-center gap-2"><input type="checkbox" readOnly className="size-3.5 accent-primary" /> <span>Gravar tutorial de maquiagem.</span></div>
                </div>
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
