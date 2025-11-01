
"use client"

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero"
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
import { Home, LogIn, UserPlus, Lightbulb, Bot, Star, DollarSign, Presentation, AppWindow } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";


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
      icon: <Presentation className="size-8 text-primary" />,
      title: "Diagnóstico",
      description: "Análise de vídeo com IA para otimizar seu conteúdo antes de postar.",
    },
    {
      icon: <Lightbulb className="size-8 text-primary" />,
      title: "Ideias de Vídeos",
      description: "Gere ideias perenes e de tendência para nunca ficar sem inspiração.",
    },
    {
      icon: <Bot className="size-8 text-primary" />,
      title: "IA Coach",
      description: "Seu treinador pessoal de IA para crescimento acelerado.",
    },
    {
      icon: <DollarSign className="size-8 text-primary" />,
      title: "Mídia Kit",
      description: "Crie um mídia kit profissional com sugestões de preços.",
    },
    {
      icon: <Star className="size-8 text-primary" />,
      title: "Publis Inteligentes",
      description: "Receba ideias criativas e autênticas para suas parcerias.",
    },
  ];

  const navItems = [
    { name: 'Início', url: '/', icon: Home },
    { name: 'Recursos', url: '#features', icon: Star },
    { name: 'Demo', url: '#demo', icon: AppWindow }
  ];

  const demoImage = PlaceHolderImages.find(img => img.id === "demo-1");


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

      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-muted transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-xl shadow-2xl overflow-hidden">
                 {demoImage && (
                    <Image
                      src={demoImage.imageUrl}
                      alt={demoImage.description}
                      data-ai-hint={demoImage.imageHint}
                      fill
                      className="object-cover"
                    />
                  )}
            </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
              A Trendify entende o que o algoritmo quer — e o que o seu público ama.
            </h2>
             <Button onClick={() => router.push('/login')} size="lg">Ver Demonstração</Button>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 bg-accent/30 text-accent-foreground">
          <div className="container mx-auto px-4 text-center">
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">
                “Todo criador tem potencial pra ser tendência. A Trendify te mostra o caminho.”
              </h2>
          </div>
      </section>
    </div>
  )
}
