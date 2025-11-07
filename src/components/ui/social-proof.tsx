

'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonialsData = [
  {
    id: 1,
    name: 'Julia S.',
    handle: '@juliastyle',
    avatarId: 'testimonial-1',
    description: "“A Trendify mudou o jogo pra mim. Em 3 meses, meu engajamento triplicou e fechei minha primeira grande parceria paga!”",
    title: 'Mudou o Jogo',
  },
  {
    id: 2,
    name: 'Marcos F.',
    handle: '@marcosfitness',
    avatarId: 'testimonial-2',
    description: "“Eu estava perdido, sem saber o que postar. As ideias de ganchos e trends são incríveis e super relevantes para o meu nicho de fitness.”",
    title: 'Ideias Incríveis',
  },
    {
    id: 3,
    name: 'Ana C.',
    handle: '@anacooks',
    avatarId: 'testimonial-3',
    description: "“Finalmente entendi o que o algoritmo quer. A análise de vídeo antes de postar me salvou de vários flops. Recomendo demais!”",
    title: 'Salvou meus vídeos',
  },
   {
    id: 4,
    name: 'Lucas G.',
    handle: '@lucasgamer',
    avatarId: 'testimonial-2',
    description: '“O assistente de monetização me deu a confiança pra cobrar o que meu trabalho vale. O mídia kit ficou super profissional.”',
    title: 'Profissionalizou meu perfil',
  },
  {
    id: 5,
    name: 'Mariana P.',
    handle: '@maritravels',
    avatarId: 'testimonial-1',
    description: '“Nunca foi tão fácil planejar meu conteúdo. O calendário semanal da IA é genial e economiza muito meu tempo.”',
    title: 'Economia de Tempo',
  },
  {
    id: 6,
    name: 'Carlos E.',
    handle: '@carloscomedy',
    avatarId: 'testimonial-3',
    description: '“As sugestões de roteiro são um ótimo ponto de partida. Me ajudou a superar o bloqueio criativo e a postar com mais consistência.”',
    title: 'Adeus Bloqueio Criativo',
  },
];

interface SocialProofProps {
  isMobile?: boolean;
}

export function SocialProof({ isMobile }: SocialProofProps) {

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

  const testimonialCards = testimonialsData.map((testimonial) => {
      const avatar = PlaceHolderImages.find(img => img.id === testimonial.avatarId);
      return (
          <motion.div key={testimonial.id} variants={cardVariants} className="h-full">
              <div className="h-full flex flex-col bg-card/60 rounded-2xl border border-border/20 shadow-lg backdrop-blur-md overflow-hidden">
                  <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                           <Avatar>
                              <AvatarImage src={avatar?.imageUrl} alt={testimonial.name} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-semibold text-foreground">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
                          </div>
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{testimonial.title}</h3>
                      <blockquote className="text-muted-foreground flex-grow">
                          {testimonial.description}
                      </blockquote>
                       <div className="flex items-center gap-1 mt-4 text-amber-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                      </div>
                  </div>
              </div>
          </motion.div>
      )
  });

  return (
    <section className="w-full py-20 lg:py-32">
        <div className="container mx-auto px-4 overflow-hidden">
             <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Amado por Criadores, Aprovado pelo Algoritmo</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Veja o que outros criadores estão dizendo sobre a Trendify.</p>
            </div>
            
            {isMobile ? (
                 <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                    <CarouselContent className="-ml-4">
                        {testimonialCards.map((card, index) => (
                            <CarouselItem key={index} className="pl-4 basis-4/5 md:basis-1/2">
                                <div className="mx-auto max-w-xs mb-4">{card}</div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="mt-6 flex justify-center">
                        <CarouselPrevious className="static translate-x-0 translate-y-0" />
                        <CarouselNext className="static translate-x-0 translate-y-0" />
                    </div>
                </Carousel>
            ) : (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {testimonialCards}
                </motion.div>
            )}
        </div>
    </section>
  );
}
