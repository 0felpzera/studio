
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Julia S.',
    handle: '@juliastyle',
    avatarId: 'testimonial-1',
    testimonial: "“A Trendify mudou o jogo pra mim. Em 3 meses, meu engajamento triplicou e fechei minha primeira grande parceria paga!”",
  },
  {
    id: 2,
    name: 'Marcos F.',
    handle: '@marcosfitness',
    avatarId: 'testimonial-2',
    testimonial: "“Eu estava perdido, sem saber o que postar. As ideias de ganchos e trends são incríveis e super relevantes para o meu nicho de fitness.”",
  },
    {
    id: 3,
    name: 'Ana C.',
    handle: '@anacooks',
    avatarId: 'testimonial-3',
    testimonial: "“Finalmente entendi o que o algoritmo quer. A análise de vídeo antes de postar me salvou de vários flops. Recomendo demais!”",
  },
];

export function SocialProof() {
    const renderStars = () => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
        ));
    };

  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Amado por Criadores, Aprovado pelo Algoritmo</h2>
           <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Veja o que outros criadores estão dizendo sobre a Trendify.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => {
            const avatar = PlaceHolderImages.find(img => img.id === item.avatarId);
            return (
              <Card key={item.id} className="flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex mb-4">{renderStars()}</div>
                    <p className="text-muted-foreground flex-grow mb-6">{item.testimonial}</p>
                    <div className="flex items-center gap-4 mt-auto">
                        {avatar && <Image src={avatar.imageUrl} alt={item.name} width={48} height={48} className="rounded-full" />}
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.handle}</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
            <Badge variant="outline">Estimativas — não garantem resultado</Badge>
        </div>
      </div>
    </section>
  );
}
