
"use client"

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero"
import { useRouter } from "next/navigation";
import {
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiInstagram,
  SiLinkedin,
  SiX,
} from "react-icons/si";

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
      color: "#E4405F",
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
      Icon: SiLinkedin,
      color: "#0A66C2",
      rotation: 8,
    },
  ];

  const demoFeatures = [
    {
      title: "Resultados Realistas",
      description: "Fotos que parecem criadas por profissionais.",
    },
    {
      title: "Geração Rápida",
      description: "Transforme ideias em imagens em segundos.",
    },
    {
      title: "Estilos Diversos",
      description: "Escolha entre uma vasta gama de opções artísticas.",
    },
  ]

  return (
    <ImageCarouselHero
      title="Transforme Conteúdo em Tendência"
      description="Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial."
      ctaText="Comece a Crescer Agora"
      onCtaClick={() => router.push("/login")}
      icons={demoIcons}
      features={demoFeatures}
    />
  )
}
