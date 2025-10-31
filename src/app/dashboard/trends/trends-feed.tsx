"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayCircle } from 'lucide-react';

const allTrends = [
  { id: 1, title: 'Viral Dance Challenge #1', category: 'Dance', views: '2.1M', imageId: 'trend-1' },
  { id: 2, title: 'GRWM: Morning Edition', category: 'Fashion', views: '1.5M', imageId: 'trend-2' },
  { id: 3, title: 'One-Pan Dinner Recipe', category: 'Lifestyle', views: '980K', imageId: 'trend-3' },
  { id: 4, title' '10-Min HIIT Workout', category: 'Fitness', views: '1.2M', imageId: 'trend-4' },
  { id: 5, title: 'Glass Skin Tutorial', category: 'Beauty', views: '850K', imageId: 'trend-5' },
  { id: 6, title: 'New Game Glitch Found', category: 'Gaming', views: '3.2M', imageId: 'trend-6' },
  { id: 7, title: 'Trending Audio Lip Sync', category: 'Comedy', views: '4.5M', imageId: 'trend-1' },
  { id: 8, title: 'Fall Outfit Inspo', category: 'Fashion', views: '1.8M', imageId: 'trend-2' },
];

const niches = ['All', 'Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Gaming', 'Dance', 'Comedy'];

export default function TrendsFeed() {
  const [selectedNiche, setSelectedNiche] = useState('All');

  const filteredTrends = selectedNiche === 'All'
    ? allTrends
    : allTrends.filter(trend => trend.category === selectedNiche);

  return (
    <Tabs defaultValue="All" onValueChange={setSelectedNiche} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {niches.map(niche => (
          <TabsTrigger key={niche} value={niche}>{niche}</TabsTrigger>
        ))}
      </TabsList>
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
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                   <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="font-semibold text-white">{trend.title}</h3>
                        <p className="text-sm text-white/80">{trend.views} views</p>
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
  );
}
