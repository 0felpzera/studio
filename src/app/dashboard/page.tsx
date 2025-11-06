
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
  Lightbulb,
  Heart,
  MessageCircle,
  Share,
  Percent,
  LayoutGrid,
  LineChart
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import type { ContentTask } from '@/app/dashboard/content-calendar';
import type { TiktokAccount, TiktokVideo, SavedVideoIdea } from '@/lib/types';
import { useMemo, useState } from 'react';
import Image from 'next/image';

function formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.', ',') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return value.toString();
}

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [timeRange, setTimeRange] = useState('total');

    // Query for the main TikTok account document
    const tiktokAccountsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'tiktokAccounts'), limit(1));
    }, [user, firestore]);

    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const tiktokAccount = useMemo(() => tiktokAccounts?.[0], [tiktokAccounts]);

    // Query for the videos sub-collection, dependent on the account ID
    const videosQuery = useMemoFirebase(() => {
        if (!firestore || !user || !tiktokAccount) return null;
        return query(collection(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id, 'videos'), orderBy('create_time', 'desc'));
    }, [firestore, user, tiktokAccount]);

    const { data: allVideos, isLoading: isLoadingVideos } = useCollection<TiktokVideo>(videosQuery);

    const filteredVideos = useMemo(() => {
        if (!allVideos) return [];
        if (timeRange === '30d') {
            const thirtyDaysAgo = (Date.now() / 1000) - (30 * 24 * 60 * 60);
            return allVideos.filter(video => (video.create_time || 0) > thirtyDaysAgo);
        }
        return allVideos;
    }, [allVideos, timeRange]);

    const upcomingTasksQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'contentTasks'),
            where('isCompleted', '==', false),
            orderBy('date', 'asc'),
            limit(2)
        );
    }, [user, firestore]);

    const savedIdeasQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'savedVideoIdeas'),
            orderBy('savedAt', 'desc'),
            limit(2)
        );
    }, [user, firestore]);

    const totalViews = useMemo(() => {
      return filteredVideos.reduce((sum, video) => sum + (video.view_count || 0), 0);
    }, [filteredVideos]);

    const totalLikes = useMemo(() => {
      return filteredVideos.reduce((sum, video) => sum + (video.like_count || 0), 0);
    }, [filteredVideos]);

    const totalComments = useMemo(() => {
      return filteredVideos.reduce((sum, video) => sum + (video.comment_count || 0), 0);
    }, [filteredVideos]);

    const totalShares = useMemo(() => {
      return filteredVideos.reduce((sum, video) => sum + (video.share_count || 0), 0);
    }, [filteredVideos]);

    const engagementRate = useMemo(() => {
        if (totalViews === 0) return 0;
        const totalEngagements = totalLikes + totalComments + totalShares;
        return (totalEngagements / totalViews) * 100;
    }, [totalLikes, totalComments, totalShares, totalViews]);


    // Follower count is a total, so it doesn't change with time range filter.
    const followerCount = tiktokAccount?.followerCount;

    const followersData = useMemo(() => {
        if (!tiktokAccount) return [{ value: 0 }];
         if (!allVideos || allVideos.length < 2) {
             return [{ value: Math.round((tiktokAccount.followerCount || 0) * 0.95) }, { value: tiktokAccount.followerCount || 0 }];
        }
        // This is a mock trend as we don't have historical follower data.
        return allVideos.map((_, index) => ({
            value: Math.round((tiktokAccount.followerCount || 0) - (allVideos.length - 1 - index) * ((tiktokAccount.followerCount || 0) * 0.01))
        }));
    }, [tiktokAccount, allVideos]);

    const likesData = useMemo(() => {
      if (filteredVideos.length < 2) return [{ value: 0 }, { value: totalLikes }];
      return filteredVideos.map(v => ({ value: v.like_count || 0 })).reverse();
    }, [filteredVideos, totalLikes]);

    const viewsData = useMemo(() => {
      if (filteredVideos.length < 2) return [{ value: 0 }, { value: totalViews }];
      return filteredVideos.map(v => ({ value: v.view_count || 0 })).reverse();
    }, [filteredVideos, totalViews]);


    const getTrendColor = (data: { value: number }[]) => {
      if (data.length < 2) return 'hsl(var(--chart-1))'; // Neutral blue color
      const first = data[0]?.value ?? 0;
      const last = data[data.length - 1]?.value ?? 0;
      return last >= first ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'; // Green for up, Red for down
    }

    const isLoading = isUserLoading || isLoadingTiktok;

    const businessCards = [
        {
            title: 'Seguidores',
            value: formatNumber(followerCount),
            description: timeRange === '30d' ? 'Total de seguidores' : 'Número total de seguidores',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            data: followersData.length > 0 ? followersData : [{value: 0}],
            color: getTrendColor(followersData),
            gradientId: 'followersGradient',
        },
        {
            title: 'Curtidas',
            value: formatNumber(totalLikes),
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : 'Total de curtidas',
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Heart,
            data: likesData.length > 0 ? likesData : [{value: 0}],
            color: getTrendColor(likesData),
            gradientId: 'likesGradient',
        },
        {
            title: 'Visualizações',
            value: formatNumber(totalViews),
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : 'Total de visualizações',
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Film,
            data: viewsData.length > 0 ? viewsData : [{value: 0}],
            color: getTrendColor(viewsData),
            gradientId: 'viewsGradient',
        },
        {
            title: 'Taxa de Engajamento',
            value: `${engagementRate.toFixed(2).replace('.', ',')}%`,
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : 'Engajamento total',
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Percent,
            data: viewsData.length > 0 ? viewsData : [{value: 0}], // Mock data, can be improved
            color: 'hsl(var(--chart-4))',
            gradientId: 'engagementGradient',
        }
    ];

    const { data: upcomingPosts, isLoading: isLoadingTasks } = useCollection<ContentTask>(upcomingTasksQuery);
    const { data: savedIdeas, isLoading: isLoadingIdeas } = useCollection<SavedVideoIdea>(savedIdeasQuery);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Olá, {user ? user.displayName?.split(' ')[0] : 'Criador'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Seu painel de comando para dominar as redes sociais.
        </p>
      </header>

       {!isLoading && !tiktokAccount && (
        <Card className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-200">
          <CardHeader className="flex-row gap-4 items-center">
            <AlertTriangle className="size-8 flex-shrink-0" />
            <div>
              <CardTitle className="text-amber-950 dark:text-amber-100">Conecte sua conta TikTok</CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-300/80">Para ver seu dashboard completo, você precisa conectar sua conta do TikTok.</CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="default" className="bg-amber-900 hover:bg-amber-950 text-white dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-amber-950">
              <Link href="/dashboard/connections">Conectar Agora</Link>
            </Button>
          </CardFooter>
        </Card>
       )}

        {(isLoadingTiktok || isLoadingVideos) && !tiktokAccount && (
          <div className="text-center text-muted-foreground py-10">
              <Loader2 className="mx-auto animate-spin h-8 w-8" />
              <p className="mt-2">Carregando seus dados do TikTok...</p>
          </div>
        )}

      {tiktokAccount && (
      <Tabs defaultValue="overview">
        <div className="flex justify-between items-center">
            <TabsList>
                <TabsTrigger value="overview"><LineChart className='w-4 h-4 mr-2'/>Visão Geral</TabsTrigger>
                <TabsTrigger value="videos"><LayoutGrid className='w-4 h-4 mr-2'/>Vídeos Recentes</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
                <TabsTrigger value="total" onClick={() => setTimeRange('total')}>Total</TabsTrigger>
                <TabsTrigger value="30d" onClick={() => setTimeRange('30d')}>Últimos 30 Dias</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="overview" className='mt-6 space-y-6'>
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                    <Card key={i}>
                        <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                            <Icon className="size-5" style={{ color: card.color }} />
                        </div>
                        </CardHeader>
                        <CardContent>
                        <div className="flex items-end gap-2.5 justify-between">
                            <div className="flex flex-col gap-1">
                            {card.isLoading ? (
                                    <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                                ) : (
                                    <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
                                )}
                            <div className="text-xs text-muted-foreground whitespace-nowrap">{card.description}</div>
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
                                            <p className="text-sm font-semibold text-foreground">{card.title === 'Taxa de Engajamento' ? `${value.toFixed(2)}%` : formatNumber(value)}</p>
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
                                    activeDot={{ r: 4, fill: card.color, stroke: 'var(--background)', strokeWidth: 1 }}
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                <CardHeader>
                    <CardTitle className="font-bold">Próximos Posts</CardTitle>
                    <CardDescription>Suas próximas tarefas agendadas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingTasks && (
                        <div className="space-y-3">
                            <div className="h-12 bg-muted rounded-lg animate-pulse" />
                            <div className="h-12 bg-muted rounded-lg animate-pulse" />
                        </div>
                    )}
                    {!isLoadingTasks && upcomingPosts?.length === 0 && (
                        <div className="text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                            <CalendarDays className="mx-auto h-8 w-8" />
                            <h3 className="mt-2 font-semibold">Nenhum post futuro</h3>
                            <p className="text-sm">Gere um plano de conteúdo para começar.</p>
                        </div>
                    )}
                    {upcomingPosts?.map((post) => (
                    <div key={post.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="rounded-lg bg-background p-3 border">
                        {post.platform.toLowerCase().includes('tiktok') ? <Video className="h-6 w-6 text-sky-500" /> : <Film className="h-6 w-6 text-rose-500" />}
                        </div>
                        <div className="flex-grow">
                        <p className="font-semibold">
                            {post.description}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                            {post.platform} &middot; {post.date ? new Date(post.date.toDate()).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit' }) : 'Data pendente'}
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
                    Ideias Salvas <Lightbulb className="h-5 w-5 text-yellow-400" />
                    </CardTitle>
                    <CardDescription>Suas próximas grandes ideias de vídeo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingIdeas && (
                        <div className="space-y-3">
                            <div className="h-10 bg-muted rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted rounded-lg animate-pulse" />
                        </div>
                    )}
                    {!isLoadingIdeas && savedIdeas?.length === 0 && (
                        <div className="text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                            <Lightbulb className="mx-auto h-8 w-8" />
                            <h3 className="mt-2 font-semibold">Nenhuma ideia salva</h3>
                            <p className="text-sm">Gere novas ideias para o seu conteúdo.</p>
                        </div>
                    )}
                    <div className="space-y-2">
                    {savedIdeas?.map((idea) => (
                        <Link key={idea.id} href="/dashboard/ideas">
                        <div
                            className="flex items-center justify-between rounded-md p-3 hover:bg-muted cursor-pointer"
                        >
                            <p className="font-medium truncate">{idea.title}</p>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                        </Link>
                    ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="secondary" className="w-full">
                    <Link href="/dashboard/ideas">Ver Todas as Ideias</Link>
                    </Button>
                </CardFooter>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="videos" className='mt-6'>
            {filteredVideos && filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredVideos.map(video => (
                        <Card key={video.id} className="overflow-hidden group">
                            <a href={video.share_url} target="_blank" rel="noopener noreferrer">
                                <div className="relative aspect-[9/16]">
                                    <Image 
                                        src={video.cover_image_url || '/placeholder.png'} 
                                        alt={video.title || 'TikTok video cover'} 
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <p className="text-white text-sm font-bold truncate">{video.title || 'Sem título'}</p>
                                    </div>
                                </div>
                            </a>
                            <CardContent className="p-3 text-xs text-muted-foreground flex justify-around items-center gap-2 border-t">
                                <div className="flex items-center gap-1" title={`${formatNumber(video.like_count)} Curtidas`}><Heart className="size-3.5" /> {formatNumber(video.like_count)}</div>
                                <div className="flex items-center gap-1" title={`${formatNumber(video.comment_count)} Comentários`}><MessageCircle className="size-3.5" /> {formatNumber(video.comment_count)}</div>
                                <div className="flex items-center gap-1" title={`${formatNumber(video.share_count)} Compartilhamentos`}><Share className="size-3.5" /> {formatNumber(video.share_count)}</div>
                                <div className="flex items-center gap-1" title={`${formatNumber(video.view_count)} Visualizações`}><TrendingUp className="size-3.5" /> {formatNumber(video.view_count)}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <Video className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum vídeo encontrado</h3>
                    <p>Não há vídeos para exibir no período de tempo selecionado.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
      )}

    </div>
  );
}
