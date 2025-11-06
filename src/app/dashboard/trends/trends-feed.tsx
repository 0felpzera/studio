
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayCircle } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const allTrends = [
  { id: 1, title: 'Desafio de Dança Viral #1', category: 'Dança', views: '2.1M', imageId: 'trend-1' },
  { id: 2, title: 'GRWM: Edição Manhã', category: 'Moda', views: '1.5M', imageId: 'trend-2' },
  { id: 3, title: 'Receita de Jantar em Uma Panela', category: 'Estilo de Vida', views: '980K', imageId: 'trend-3' },
  { id: 4, title: 'Treino HIIT de 10 Minutos', category: 'Fitness', views: '1.2M', imageId: 'trend-4' },
  { id: 5, title: 'Tutorial Pele de Vidro', category: 'Beleza', views: '850K', imageId: 'trend-5' },
  { id: 6, title: 'Novo Glitch Descoberto no Jogo', category: 'Games', views: '3.2M', imageId: 'trend-6' },
  { id: 7, title: 'Lip Sync com Áudio em Alta', category: 'Comédia', views: '4.5M', imageId: 'trend-1' },
  { id: 8, title: 'Inspiração de Looks de Outono', category: 'Moda', views: '1.8M', imageId: 'trend-2' },
];

const niches = ['Todos', 'Moda', 'Beleza', 'Estilo de Vida', 'Fitness', 'Games', 'Dança', 'Comédia'];

export default function TrendsFeed() {
  const [selectedNiche, setSelectedNiche] = useState('Todos');

  const filteredTrends = selectedNiche === 'Todos'
    ? allTrends
    : allTrends.filter(trend => trend.category === selectedNiche);

  return (
    <div className="w-full">
      <Tabs defaultValue="Todos" onValueChange={setSelectedNiche} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
            <TabsList>
            {niches.map(niche => (
                <TabsTrigger key={niche} value={niche}>{niche}</TabsTrigger>
            ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      
        <div className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTrends.map(trend => {
                const image = PlaceHolderImages.find(img => img.id === trend.imageId);
                return (
                <Card key={trend.id} className="overflow-hidden group relative">
                    <CardContent className="p-0">
                    {image && (
                        <Image
                        src={image.imageUrl}
                        alt={image.description}
                        data-ai-hint={image.imageHint}
                        width={300}
                        height={400}
                        className="object-cover aspect-[3/4] w-full transition-transform duration-300 group-hover:scale-105"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="font-semibold text-white">{trend.title}</h3>
                            <p className="text-sm text-white/80">{trend.views} visualizações</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayCircle className="size-12 text-white/80" />
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        </div>
      </Tabs>
    </div>
  );
}
