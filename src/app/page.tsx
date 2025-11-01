
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
import { Timeline } from "@/components/ui/timeline";
import { GrowthCalculator } from "@/components/ui/growth-calculator";
import { SocialProof } from "@/components/ui/social-proof";

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

  const timelineData = [
    {
      title: "Diagnóstico",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
            Análise de vídeo com IA para otimizar seu conteúdo antes de postar,
            melhorando a retenção e o engajamento.
          </p>
          <Image
            src="https://assets.aceternity.com/templates/startup-1.webp"
            alt="Diagnóstico de vídeo"
            width={500}
            height={500}
            className="rounded-lg object-cover h-44 md:h-60 lg:h-80 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      title: "Ideias",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
            Gere ideias perenes e de tendência para nunca ficar sem inspiração.
            Mantenha seu conteúdo fresco e relevante.
          </p>
          <Image
            src="https://assets.aceternity.com/pro/bento-grids.png"
            alt="Geração de ideias"
            width={500}
            height={500}
            className="rounded-lg object-cover h-44 md:h-60 lg:h-80 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      title: "IA Coach",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
            Seu treinador pessoal de IA para crescimento acelerado, oferecendo
            insights e estratégias personalizadas.
          </p>
          <Image
            src="https://assets.aceternity.com/features-section.png"
            alt="IA Coach"
            width={500}
            height={500}
            className="rounded-lg object-cover h-44 md:h-60 lg:h-80 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      title: "Mídia Kit",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
            Crie um mídia kit profissional com sugestões de preços para
            apresentar a marcas e monetizar sua influência.
          </p>
          <Image
            src="https://assets.aceternity.com/cards.png"
            alt="Mídia Kit"
            width={500}
            height={500}
            className="rounded-lg object-cover h-44 md:h-60 lg:h-80 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      title: "Publis",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-sm md:text-base font-normal mb-8">
            Receba ideias criativas e autênticas para suas parcerias, garantindo
            que suas publis ressoem com seu público.
          </p>
          <Image
            src="https://assets.aceternity.com/templates/startup-2.webp"
            alt="Publis Inteligentes"
            width={500}
            height={500}
            className="rounded-lg object-cover h-44 md:h-60 lg:h-80 w-full shadow-lg"
          />
        </div>
      ),
    },
  ];

  const navItems = [
    { name: "Início", url: "#", icon: Home },
    { name: "Recursos", url: "#features", icon: Star },
  ];

  return (
    <div className="bg-background text-foreground">
      <NavBar items={navItems} />
      <ImageCarouselHero
        title="Transforme Conteúdo em Tendência"
        description="Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial."
        ctaText="Comece a Crescer Agora"
        onCtaClick={() => router.push("/login")}
        icons={demoIcons}
      />
      <div id="features">
        <Timeline data={timelineData} />
      </div>

       <GrowthCalculator />
       <SocialProof />

       <section className="py-20 sm:py-32 bg-accent/30 text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">
                “Todo criador tem potencial pra ser tendência. A Trendify te mostra o caminho.”
              </h2>
          </div>
      </section>
    </div>
  );
}
