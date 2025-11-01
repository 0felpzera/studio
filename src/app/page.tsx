
"use client"

import { ImageCarouselHero } from "@/components/ui/ai-image-generator-hero"
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const demoImages = [
    {
      id: "1",
      src: "https://images.unsplash.com/photo-1684369176170-463e84248b70?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Mountain landscape",
      rotation: -15,
    },
    {
      id: "2",
      src: "https://plus.unsplash.com/premium_photo-1677269465314-d5d2247a0b0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Abstract art",
      rotation: -8,
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1524673360092-e07b7ae58845?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "City skyline",
      rotation: 5,
    },
    {
      id: "4",
      src: "https://plus.unsplash.com/premium_photo-1680610653084-6e4886519caf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Nature photography",
      rotation: 12,
    },
    {
      id: "5",
      src: "https://plus.unsplash.com/premium_photo-1680608979589-e9349ed066d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8QWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Digital art",
      rotation: -12,
    },
    {
      id: "6",
      src: "https://images.unsplash.com/photo-1562575214-da9fcf59b907?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Tropical leaves",
      rotation: 8,
    },
    {
      id: "7",
      src: "https://plus.unsplash.com/premium_photo-1676637656210-390da73f4951?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Tropical leaves",
      rotation: 8,
    },
    {
      id: "8",
      src: "https://images.unsplash.com/photo-1664448003794-2d446c53dcae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fGFpfGVufDB8MXwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900",
      alt: "Tropical leaves",
      rotation: 8,
    },
  ]

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
      images={demoImages}
      features={demoFeatures}
    />
  )
}
