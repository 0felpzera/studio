
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
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import type { ContentTask } from '@/app/dashboard/content-calendar';
import type { TiktokAccount, TiktokVideo } from '@/lib/types';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

const trendingTopics = [
  { title: "Audio Viral: 'Summer Vibes'" },
  { title: 'Transição de Maquiagem' },
  { title: 'Desafio 30 Dias' },
];

type FilterPeriod = 'today' | '7d' | '15d' | '30d' | 'all';

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [filter, setFilter] = useState<FilterPeriod>('all');

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
    
    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const tiktokAccount = useMemo(() => {
        if (tiktokAccounts && tiktokAccounts.length > 0) {
            return tiktokAccounts[0];
        }
        return null;
    }, [tiktokAccounts]);
    
    const videosQuery = useMemoFirebase(() => {
        if (!user || !firestore || !tiktokAccount) return null;
        return query(
            collection(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id, 'videos'),
            orderBy('create_time', 'desc'),
            limit(10)
        );
    }, [user, firestore, tiktokAccount]);

    const { data: upcomingPosts, isLoading: isLoadingTasks } = useCollection<ContentTask>(upcomingTasksQuery);
    const { data: allVideos, isLoading: isLoadingVideos } = useCollection<TiktokVideo>(videosQuery);


    const filteredVideos = useMemo(() => {
        if (!allVideos) return [];
        const sortedVideos = [...allVideos].sort((a, b) => (a.create_time || 0) - (b.create_time || 0));

        if (filter === 'all') {
            return sortedVideos;
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTodayTimestamp = today.getTime() / 1000;

        let periodInSeconds;
        switch (filter) {
            case 'today':
                return sortedVideos.filter(video => video.create_time && video.create_time >= startOfTodayTimestamp);
            case '7d':
                periodInSeconds = 7 * 24 * 60 * 60;
                break;
            case '15d':
                periodInSeconds = 15 * 24 * 60 * 60;
                break;
            case '30d':
                periodInSeconds = 30 * 24 * 60 * 60;
                break;
            default:
                return sortedVideos;
        }
        
        const cutoffTimestamp = (Date.now() / 1000) - periodInSeconds;
        return sortedVideos.filter(video => video.create_time && video.create_time >= cutoffTimestamp);
    }, [allVideos, filter]);

    const totalViews = useMemo(() => {
      if (!filteredVideos) return 0;
      return filteredVideos.reduce((sum, video) => sum + (video.view_count || 0), 0);
    }, [filteredVideos]);

    const followersData = useMemo(() => {
        if (!tiktokAccount) return [{ value: 0 }];
         if (!allVideos || allVideos.length < 2) {
             return [{ value: Math.round((tiktokAccount.followerCount || 0) * 0.95) }, { value: tiktokAccount.followerCount || 0 }];
        }
        return allVideos.map((_, index) => ({
            value: Math.round((tiktokAccount.followerCount || 0) - (allVideos.length - 1 - index) * ((tiktokAccount.followerCount || 0) * 0.01))
        }));
    }, [tiktokAccount, allVideos]);

    const videoCountData = useMemo(() => {
        if (filteredVideos.length === 1) {
            return [{ value: 0 }, { value: 1 }];
        }
        return filteredVideos.map((_, index) => ({ value: index + 1 }));
    }, [filteredVideos]);

    const viewsData = useMemo(() => {
        if (filteredVideos.length === 1) {
            return [{ value: 0 }, { value: filteredVideos[0].view_count || 0 }];
        }
        return filteredVideos.map(video => ({ value: video.view_count || 0 }));
    }, [filteredVideos]);

    const getTrendColor = (data: { value: number }[]) => {
      if (data.length < 2) return 'hsl(var(--chart-1))'; // Neutral blue color
      const first = data[0]?.value ?? 0;
      const last = data[data.length - 1]?.value ?? 0;
      return last >= first ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'; // Green for up, Red for down
    }
    
    const filterButtons: { label: string; value: FilterPeriod }[] = [
        { label: 'Hoje', value: 'today' },
        { label: 'Últimos 7 dias', value: '7d' },
        { label: 'Últimos 15 dias', value: '15d' },
        { label: 'Últimos 30 dias', value: '30d' },
        { label: 'Todo o Período', value: 'all' },
    ];

    const getPeriodLabel = (filterValue: FilterPeriod) => {
        const button = filterButtons.find(b => b.value === filterValue);
        return button ? button.label : 'Total';
    };

    const isLoading = isUserLoading || isLoadingTiktok || isLoadingVideos;

    const businessCards = [
        {
            title: 'Seguidores',
            period: 'Total',
            value: tiktokAccount ? formatNumber(tiktokAccount.followerCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            data: followersData.length > 0 ? followersData : [{value: 0}],
            color: getTrendColor(followersData),
            gradientId: 'followersGradient',
        },
        {
            title: 'Vídeos no Período',
            period: getPeriodLabel(filter),
            value: formatNumber(filteredVideos.length),
            isLoading: isLoadingVideos,
            icon: Video,
            data: videoCountData.length > 0 ? videoCountData : [{value: 0}],
            color: getTrendColor(videoCountData),
            gradientId: 'videoCountGradient',
        },
        {
            title: 'Visualizações no Período',
            period: getPeriodLabel(filter),
            value: formatNumber(totalViews),
            isLoading: isLoadingVideos,
            icon: Film,
            data: viewsData.length > 0 ? viewsData : [{value: 0}],
            color: getTrendColor(viewsData),
            gradientId: 'viewsGradient',
        },
    ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className='space-y-1.5'>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Olá, {user ? user.displayName?.split(' ')[0] : 'Criador'}! 👋
            </h1>
            <p className="text-muted-foreground">
            Seu painel de comando para dominar as redes sociais.
            </p>
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto" disabled={!tiktokAccount}>
                    <Filter className="mr-2 h-4 w-4" />
                    {getPeriodLabel(filter)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as FilterPeriod)}>
                    {filterButtons.map(({label, value}) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>

      </header>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {businessCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
                    <Icon className="size-5" style={{ color: card.color }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2.5 justify-between">
                    <div className="flex flex-col gap-1">
                       {card.isLoading ? (
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
                        )}
                        <div className="text-sm text-muted-foreground whitespace-nowrap">{card.period}</div>
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
      
       {isLoading && (
          <Card>
              <CardHeader>
                <CardTitle className="font-bold">Carregando seus vídeos...</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-48">
                  <Loader2 className="size-12 animate-spin text-primary" />
              </CardContent>
          </Card>
      )}

       {!isLoading && !tiktokAccount && (
        <Card className="bg-amber-50 border-amber-200 text-amber-900">
          <CardHeader className="flex-row gap-4 items-center">
            <AlertTriangle className="size-8" />
            <div>
              <CardTitle>Conecte sua conta TikTok</CardTitle>
              <CardDescription className="text-amber-800">Para ver seu dashboard completo, você precisa conectar sua conta do TikTok.</CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="default" className="bg-amber-900 hover:bg-amber-950 text-white">
              <Link href="/dashboard/connections">Conectar Agora</Link>
            </Button>
          </CardFooter>
        </Card>
       )}

      {tiktokAccount && filteredVideos && filteredVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Últimos Vídeos do TikTok</CardTitle>
             <CardDescription>Mostrando vídeos do período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredVideos.map((video) => (
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
           {filteredVideos.length > 10 && (
            <CardFooter>
                <Button variant="secondary" className="w-full">Ver todos os vídeos do período</Button>
            </CardFooter>
          )}
        </Card>
      )}
       {tiktokAccount && filteredVideos.length === 0 && !isLoading && (
         <Card>
             <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                 <Video className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Nenhum vídeo encontrado</h3>
                <p className="text-muted-foreground">Não há vídeos para o período selecionado.</p>
             </CardContent>
         </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Próximos Posts</CardTitle>
            <CardDescription>Suas próximas tarefas agendadas.</CardDescription>
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
            <Button asChild variant="secondary" className="w-full">
              <Link href="/dashboard/plan">Ver Calendário Completo</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2">
              Tendências em Alta <Flame className="h-5 w-5 text-orange-400" />
            </CardTitle>
            <CardDescription>Sons e formatos que estão bombando.</CardDescription>
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
            <Button asChild variant="secondary" className="w-full">
              <Link href="/dashboard/trends">Ver Todas as Tendências</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

    