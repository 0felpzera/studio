
"use client"

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero"
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

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
      title="Crie Fotos Incríveis Geradas por IA Instantaneamente"
      subtitle="Geração de Fotos com IA"
      description="Transforme suas ideias em visuais de tirar o fôlego com tecnologia de IA de ponta."
      ctaText="Comece a Gerar Agora"
      onCtaClick={() => router.push("/login")}
      features={demoFeatures}
    />
  )
}
