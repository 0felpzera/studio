
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
import React from "react";


export default function LandingPage() {
  const router = useRouter();

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
      icon: Presentation,
      title: "Diagnóstico de Vídeo",
      description: "Análise com IA para otimizar seu conteúdo antes de postar.",
      benefits: [
        "Analise ganchos, ritmo e qualidade técnica.",
        "Receba legendas e hashtags otimizadas."
      ],
      mockup: {
        title: "Relatório Rápido:",
        items: [
          { text: "Gancho:", value: "Forte", icon: <CheckCircle2 className="size-3 text-green-500"/> },
          { text: "Qualidade Técnica:", value: "Excelente", icon: <CheckCircle2 className="size-3 text-green-500"/> }
        ]
      }
    },
    {
      id: 1,
      icon: Lightbulb,
      title: "Gerador de Ideias",
      description: "Gere ideias perenes e de tendência para nunca ficar sem inspiração.",
      benefits: [
        "Combine seu nicho com o que está em alta.",
        "Receba esboços de roteiro para cada ideia."
      ],
      mockup: {
        title: "Ideias Sugeridas:",
        items: [
          { value: "1. Unboxing ASMR de produtos de beleza." },
          { value: "2. Rotina matinal \"arrume-se comigo\"." }
        ],
        isList: true,
      }
    },
    {
      id: 2,
      icon: BrainCircuit,
      title: "IA Coach",
      description: "Seu treinador pessoal de IA para crescimento acelerado.",
      benefits: [
        "Receba insights personalizados com base em suas métricas.",
        "Entenda o que fazer para atingir suas metas mais rápido."
      ],
      mockup: {
        title: "Conselho da IA:",
        items: [
          { value: "\"Seu engajamento aumentaria em ~15% se você fizesse perguntas no final dos seus vídeos.\"" }
        ]
      }
    },
    {
      id: 3,
      icon: DollarSign,
      title: "Mídia Kit Pro",
      description: "Crie um mídia kit profissional com sugestões de preços.",
      benefits: [
        "Gere um texto de apresentação para marcas.",
        "Obtenha uma tabela de preços sugeridos."
      ],
      mockup: {
        title: "Preços Sugeridos:",
        items: [
          { text: "1 Reel:", value: <span className="font-mono">R$ 800</span> },
          { text: "3 Stories:", value: <span className="font-mono">R$ 550</span> }
        ],
        isKeyValue: true,
      }
    },
    {
      id: 4,
      icon: Star,
      title: "Ideias para Publis",
      description: "Receba ideias criativas e autênticas para suas parcerias.",
      benefits: [
        "Integre produtos de forma natural no seu conteúdo.",
        "Sugestões de formatos que mais convertem."
      ],
      mockup: {
        title: "Formatos Sugeridos:",
        items: [
          { value: <span className="bg-background px-2 py-1 rounded">Review Honesto</span> },
          { value: <span className="bg-background px-2 py-1 rounded">Tutorial Criativo</span> }
        ],
        isBadge: true
      }
    },
    {
        id: 5,
        icon: CalendarDays,
        title: "Calendário de Conteúdo",
        description: "Gere e gerencie um plano semanal de postagens com IA.",
        benefits: [
            "Planeje sua semana em minutos, não em horas.",
            "Mantenha a consistência e vença o algoritmo."
        ],
        mockup: {
          title: "Checklist da Semana:",
          items: [
            { value: <div className="flex items-center gap-2"><input type="checkbox" checked readOnly className="size-3.5 accent-primary" /> <span>Postar "3 mitos sobre moda".</span></div> },
            { value: <div className="flex items-center gap-2"><input type="checkbox" readOnly className="size-3.5 accent-primary" /> <span>Gravar tutorial de maquiagem.</span></div> }
          ]
        }
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };


  const timelineData = [
    {
      title: "Recursos",
      description: "Ferramentas de IA para cada etapa do seu processo criativo.",
      content: (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.id} variants={cardVariants}>
                <div className="flex flex-col text-left p-6 h-full bg-card/50 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm">
                  <div className="mb-4"><Icon className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">{card.description}</p>
                  <ul className="space-y-2 text-sm text-left mb-6">
                    {card.benefits.map((benefit, i) => (
                       <li key={i} className="flex items-start gap-2"><CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" /><span>{benefit}</span></li>
                    ))}
                  </ul>
                  {card.mockup && (
                    <div className="mt-auto bg-muted/50 p-4 rounded-lg border border-border/50 text-xs space-y-2">
                        <p className="font-semibold mb-2">{card.mockup.title}</p>
                        <div className={card.mockup.isBadge ? 'flex flex-wrap gap-2' : card.mockup.isList ? 'space-y-1' : ''}>
                          {card.mockup.items.map((item, i) => (
                              <div key={i} className={card.mockup.isKeyValue ? 'flex justify-between' : card.mockup.isList ? 'p-2 bg-background rounded-md' : ''}>
                                  {item.icon}
                                  {item.text && <span>{item.text}</span>}
                                  {item.value}
                              </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )
    },
    {
        title: "Calculadora",
        description: "Simule seu crescimento e veja o potencial do seu perfil.",
        content: (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div variants={cardVariants}>
                <GrowthCalculator />
              </motion.div>
            </motion.div>
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
