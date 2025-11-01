
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from './card';

const testimonials = [
  {
    id: 1,
    name: 'Julia S.',
    handle: '@juliastyle',
    avatarId: 'testimonial-1',
    testimonial: "“A Trendify mudou o jogo pra mim. Em 3 meses, meu engajamento triplicou e fechei minha primeira grande parceria paga!”",
    title: 'Mudou o Jogo',
  },
  {
    id: 2,
    name: 'Marcos F.',
    handle: '@marcosfitness',
    avatarId: 'testimonial-2',
    testimonial: "“Eu estava perdido, sem saber o que postar. As ideias de ganchos e trends são incríveis e super relevantes para o meu nicho de fitness.”",
    title: 'Ideias Incríveis',
  },
    {
    id: 3,
    name: 'Ana C.',
    handle: '@anacooks',
    avatarId: 'testimonial-3',
    testimonial: "“Finalmente entendi o que o algoritmo quer. A análise de vídeo antes de postar me salvou de vários flops. Recomendo demais!”",
    title: 'Salvou meus vídeos',
  },
];


export function SocialProof() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
        return;
        }

        const autoScroll = setTimeout(() => {
        if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
            setCurrent(0);
            api.scrollTo(0);
        } else {
            api.scrollNext();
            setCurrent(current + 1);
        }
        }, 4000);
        
        return () => clearTimeout(autoScroll);
    }, [api, current]);


  return (
    <section className="w-full py-20 lg:py-32">
        <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Amado por Criadores, Aprovado pelo Algoritmo</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Veja o que outros criadores estão dizendo sobre a Trendify.</p>
            </div>
          
            <Carousel setApi={setApi} className="w-full" opts={{
                align: "start",
                loop: true,
            }}>
                <CarouselContent>
                {testimonials.map((item, index) => {
                    const avatar = PlaceHolderImages.find(img => img.id === item.avatarId);
                    return (
                        <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={index}>
                            <div className='p-1'>
                                <Card className="h-full">
                                    <CardContent className="p-6 flex flex-col justify-between h-full">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col">
                                                <h3 className="text-xl tracking-tight font-semibold">{item.title}</h3>
                                                <p className="text-muted-foreground text-base mt-2">
                                                    {item.testimonial}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row gap-3 text-sm items-center mt-6">
                                            {avatar && <Avatar className="h-10 w-10">
                                            <AvatarImage src={avatar.imageUrl} alt={item.name} />
                                            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                            </Avatar>}
                                            <div className='flex flex-col'>
                                                <span className='font-semibold'>{item.name}</span>
                                                <span className="text-muted-foreground">{item.handle}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    )
                })}
                </CarouselContent>
            </Carousel>
        </div>
    </section>
  );
}

