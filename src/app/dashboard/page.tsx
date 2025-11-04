
'use client';

import Link from 'next/link';
import {
  Flame,
  CalendarDays,
  Film,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Loader2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import type { ContentTask } from '@/app/dashboard/content-calendar';
import type { TiktokAccount, TiktokVideo } from '@/lib/types';
import { useMemo } from 'react';
import Image from 'next/image';

function formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
}

function formatPercentage(value: number): string {
    if (value === 0) return 'N/A';
    return (value * 100).toFixed(1) + '%';
}

const trendingTopics = [
  { title: "Audio Viral: 'Summer Vibes'" },
  { title: 'Transição de Maquiagem' },
  { title: 'Desafio 30 Dias' },
];

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const upcomingTasksQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'contentTasks'),
            where('isCompleted', '==', false),
            orderBy('date', 'asc'),
            limit(2)
        );
    }, [user, firestore]);
    
    const tiktokAccountsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'tiktokAccounts');
    }, [user, firestore]);


    const { data: upcomingPosts, isLoading: isLoadingTasks } = useCollection<ContentTask>(upcomingTasksQuery);
    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const tiktokAccount = useMemo(() => {
        if (tiktokAccounts && tiktokAccounts.length > 0) {
            return tiktokAccounts[0];
        }
        return null;
    }, [tiktokAccounts]);
    
    const sortedVideos = useMemo(() => {
        if (!tiktokAccount || !tiktokAccount.videos) return [];
        return [...tiktokAccount.videos].sort((a, b) => (a.create_time || 0) - (b.create_time || 0));
    }, [tiktokAccount]);

    const totalViews = useMemo(() => {
      if (!tiktokAccount || !tiktokAccount.videos) return 0;
      return tiktokAccount.videos.reduce((sum, video) => sum + (video.view_count || 0), 0);
    }, [tiktokAccount]);

    const followersData = useMemo(() => {
        if (!tiktokAccount) return [{ value: 0 }];
        if (sortedVideos.length === 1) {
            return [{ value: Math.round((tiktokAccount.followerCount || 0) * 0.95) }, { value: tiktokAccount.followerCount || 0 }];
        }
        // This is a simplified trend. A real implementation might store historical follower counts.
        return sortedVideos.map((_, index) => ({
            value: Math.round((tiktokAccount.followerCount || 0) - (sortedVideos.length - 1 - index) * (tiktokAccount.followerCount || 0) * 0.01)
        }));
    }, [tiktokAccount, sortedVideos]);

    const videoCountData = useMemo(() => {
        if (sortedVideos.length === 1) {
            return [{ value: 0 }, { value: 1 }];
        }
        return sortedVideos.map((_, index) => ({ value: index + 1 }));
    }, [sortedVideos]);

    const viewsData = useMemo(() => {
        if (sortedVideos.length === 1) {
            return [{ value: 0 }, { value: sortedVideos[0].view_count || 0 }];
        }
        return sortedVideos.map(video => ({ value: video.view_count || 0 }));
    }, [sortedVideos]);

    const businessCards = [
        {
            title: 'Seguidores',
            period: 'Total',
            value: tiktokAccount ? formatNumber(tiktokAccount.followerCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            data: followersData.length > 0 ? followersData : [{value: 0}],
            color: 'var(--color-emerald-500)',
            gradientId: 'revenueGradient',
        },
        {
            title: 'Total de Vídeos',
            period: 'Total',
            value: tiktokAccount ? formatNumber(tiktokAccount.videoCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: Video,
            data: videoCountData.length > 0 ? videoCountData : [{value: 0}],
            color: 'var(--color-blue-500)',
            gradientId: 'customersGradient',
        },
        {
            title: 'Visualizações',
            period: 'Últimos vídeos',
            value: tiktokAccount ? formatNumber(totalViews) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: Film,
            data: viewsData.length > 0 ? viewsData : [{value: 0}],
            color: 'var(--color-violet-500)',
            gradientId: 'usersGradient',
        },
    ];

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Olá, {user ? user.displayName?.split(' ')[0] : 'Criador'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Seu painel de comando para dominar as redes sociais.
        </p>
      </header>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {businessCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i}>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5" style={{ color: card.color }} />
                    <span className="text-base font-semibold">{card.title}</span>
                  </div>

                  <div className="flex items-end gap-2.5 justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-muted-foreground whitespace-nowrap">{card.period}</div>
                       {card.isLoading ? (
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
                        )}
                    </div>

                    <div className="max-w-40 h-16 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={card.data}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>

                          <Tooltip
                            cursor={{ stroke: card.color, strokeWidth: 1, strokeDasharray: '2 2' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const value = payload[0].value as number;
                                return (
                                  <div className="bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                    <p className="text-sm font-semibold text-foreground">{formatNumber(value)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={card.color}
                            fill={`url(#${card.gradientId})`}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: card.color, stroke: 'var(--background)', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {isLoadingTiktok && (
          <Card>
              <CardHeader>
                <CardTitle className="font-bold">Carregando seus vídeos...</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-48">
                  <Loader2 className="size-12 animate-spin text-primary" />
              </CardContent>
          </Card>
      )}

      {tiktokAccount && tiktokAccount.videos && tiktokAccount.videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Últimos Vídeos do TikTok</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedVideos.map((video) => (
              <Link href={video.share_url} key={video.id} target="_blank" rel="noopener noreferrer" className="group">
                 <Card className="overflow-hidden">
                    <div className="relative aspect-[9/16]">
                      <Image 
                        src={video.cover_image_url || '/placeholder.png'} 
                        alt={video.title || 'TikTok Video'} 
                        fill 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-semibold truncate">{video.title || 'Sem título'}</p>
                        <p className="text-white/80 text-xs">{formatNumber(video.view_count)} views</p>
                      </div>
                    </div>
                 </Card>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Próximos Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {isLoadingTasks && <p className="text-sm text-muted-foreground">Carregando tarefas...</p>}
             {!isLoadingTasks && upcomingPosts?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum post futuro agendado. Gere um plano!</p>}
            {upcomingPosts?.map((post) => (
              <div key={post.id} className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  {post.platform.toLowerCase() === 'tiktok' ? <CalendarDays className="h-6 w-6 text-sky-500" /> : <Film className="h-6 w-6 text-rose-500" />}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">
                    {post.platform} - {post.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {post.date ? new Date(post.date.toDate()).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }) : 'Data pendente'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/plan">Ver Calendário Completo</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2">
              Tendências em Alta <Flame className="h-5 w-5 text-orange-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendingTopics.map((trend) => (
                <Link key={trend.title} href="/dashboard/trends">
                  <div
                    className="flex items-center justify-between rounded-md p-3 hover:bg-muted cursor-pointer"
                  >
                    <p className="font-medium">{trend.title}</p>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/trends">Ver Todas as Tendências</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    

    
