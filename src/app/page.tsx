

"use client";

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero";
import { Header } from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import {
  Presentation,
  Lightbulb,
  BrainCircuit,
  DollarSign,
  Star,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthCalculator } from "@/components/ui/growth-calculator";
import { SocialProof } from "@/components/ui/social-proof";
import { motion } from "framer-motion";
import { Timeline } from "@/components/ui/timeline";
import { Footer } from "@/components/ui/footer";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function LandingPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  
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
          { value: <Badge variant="secondary">Review Honesto</Badge> },
          { value: <Badge variant="secondary">Tutorial Criativo</Badge> }
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

const renderFeatureCards = () => {
    const cardContent = featureCards.map((card) => {
        const Icon = card.icon;
        return (
            <motion.div key={card.id} variants={cardVariants} className="h-full">
            <div className="flex flex-col text-left h-full bg-card/60 rounded-2xl border border-border/20 shadow-lg backdrop-blur-md overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border/20">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{card.description}</p>
                </div>

                {/* Benefits */}
                <div className="p-6 flex-grow">
                  <ul className="space-y-3 text-sm">
                    {card.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
            </motion.div>
        );
    });

    if (isMobile) {
        return (
            <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                <CarouselContent className="-ml-4">
                    {cardContent.map((card, index) => (
                        <CarouselItem key={index} className="pl-4 basis-4/5 md:basis-1/2">
                            {card}
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="mt-6 flex justify-center">
                    <CarouselPrevious className="static translate-x-0 translate-y-0" />
                    <CarouselNext className="static translate-x-0 translate-y-0" />
                </div>
            </Carousel>
        );
    }
    
    return (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            {cardContent}
        </motion.div>
    );
};

  const timelineData = [
    {
      title: "Recursos",
      description: "Ferramentas de IA para cada etapa do seu processo criativo.",
      content: renderFeatureCards()
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
            <SocialProof isMobile={isMobile}/>
        )
    }
  ]

  return (
    <div className="text-foreground bg-background">
      <Header />
      <ImageCarouselHero
        title="Transforme Conteúdo em Tendência"
        description="Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial."
        ctaText="Comece a Crescer Agora"
        onCtaClick={() => router.push("/signup")}
      />
      
      <div className="bg-background rounded-t-[50px] mt-[-40px] relative z-10 pt-10">
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
