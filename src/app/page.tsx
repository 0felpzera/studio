
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
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { GrowthCalculator } from "@/components/ui/growth-calculator";
import { SocialProof } from "@/components/ui/social-proof";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


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
      Icon: SiThreads,
      color: "#000000",
      rotation: 8,
    },
  ];

    const features = [
    {
      icon: <Presentation className="w-8 h-8 text-primary" />,
      title: "Diagnóstico de Vídeo",
      description: "Análise com IA para otimizar seu conteúdo antes de postar, melhorando retenção e engajamento.",
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-primary" />,
      title: "Gerador de Ideias",
      description: "Gere ideias perenes e de tendência para nunca ficar sem inspiração. Mantenha seu conteúdo fresco.",
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "IA Coach",
      description: "Seu treinador pessoal de IA para crescimento acelerado, oferecendo insights e estratégias personalizadas.",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Mídia Kit Pro",
      description: "Crie um mídia kit profissional com sugestões de preços para apresentar a marcas e monetizar sua influência.",
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: "Ideias para Publis",
      description: "Receba ideias criativas e autênticas para suas parcerias, garantindo que suas publis ressoem com seu público.",
    },
  ];


  const navItems = [
    { name: "Início", url: "#", icon: Home },
    { name: "Recursos", url: "#features", icon: Star },
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-background text-foreground">
      <NavBar items={navItems} />
      <ImageCarouselHero
        title="Transforme Conteúdo em Tendência"
        description="Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial."
        ctaText="Comece a Crescer Agora"
        onCtaClick={() => router.push("/signup")}
        icons={demoIcons}
      />
      
      <motion.section 
        id="features"
        className="py-20 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
       >
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Ferramentas para o seu Sucesso</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore como cada recurso da Trendify pode impulsionar seu conteúdo e acelerar seu crescimento.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
                <Card key={index} className="bg-card text-card-foreground flex flex-col items-center text-center p-6 lg:col-span-1 even:lg:col-span-2 odd:lg:col-span-1">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                </Card>
            ))}
            </div>
        </div>
      </motion.section>

       <motion.div
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.2 }}
         variants={sectionVariants}
       >
         <GrowthCalculator />
       </motion.div>
       <motion.div
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.2 }}
         variants={sectionVariants}
       >
         <SocialProof />
       </motion.div>

       <motion.section 
         className="py-20 sm:py-32 bg-accent/30 text-accent-foreground"
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.5 }}
         variants={sectionVariants}
       >
          <div className="container mx-auto px-4 text-center">
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">
                “Todo criador tem potencial pra ser tendência. A Trendify te mostra o caminho.”
              </h2>
          </div>
      </motion.section>
    </div>
  );
}
