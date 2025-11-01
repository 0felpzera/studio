
'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TestimonialCarousel, type Testimonial } from '@/components/ui/testimonial';

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


export function SocialProof() {

  const mappedTestimonials: Testimonial[] = testimonialsData.map(t => {
    const avatar = PlaceHolderImages.find(img => img.id === t.avatarId);
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      avatar: avatar?.imageUrl || '',
    };
  });

  return (
    <section className="w-full py-20 lg:py-32">
        <div className="container mx-auto px-4 overflow-hidden">
             <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Amado por Criadores, Aprovado pelo Algoritmo</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Veja o que outros criadores estão dizendo sobre a Trendify.</p>
            </div>
          
            <TestimonialCarousel 
              testimonials={mappedTestimonials}
              className="max-w-2xl mx-auto"
            />
        </div>
    </section>
  );
}
