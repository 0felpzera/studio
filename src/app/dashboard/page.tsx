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
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, Timestamp } from 'firebase/firestore';
import type { ContentTask } from '@/app/dashboard/content-calendar';
import type { TiktokAccount, TiktokVideo, SavedVideoIdea } from '@/lib/types';
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

    const savedIdeasQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'savedVideoIdeas'),
            orderBy('savedAt', 'desc'),
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
    
    const totalViews = useMemo(() => {
      if (!tiktokAccount || !tiktokAccount.videos) return 0;
      return tiktokAccount.videos.reduce((sum, video) => sum + (video.view_count || 0), 0);
    }, [tiktokAccount]);

    const followersData = useMemo(() => {
        if (!tiktokAccount) return [{ value: 0 }];
         if (!tiktokAccount.videos || tiktokAccount.videos.length < 2) {
             return [{ value: Math.round((tiktokAccount.followerCount || 0) * 0.95) }, { value: tiktokAccount.followerCount || 0 }];
        }
        return tiktokAccount.videos.map((_, index) => ({
            value: Math.round((tiktokAccount.followerCount || 0) - (tiktokAccount.videos.length - 1 - index) * ((tiktokAccount.followerCount || 0) * 0.01))
        }));
    }, [tiktokAccount]);

    const likesData = useMemo(() => {
      if (!tiktokAccount) return [{ value: 0 }];
      if (!tiktokAccount.videos || tiktokAccount.videos.length < 2) {
        return [{ value: Math.round((tiktokAccount.likesCount || 0) * 0.95) }, { value: tiktokAccount.likesCount || 0 }];
      }
      // This is a mock trend, in a real scenario you would have historical likes data
      return tiktokAccount.videos.map((v, index) => ({
        value: (v.like_count || 0) + (index * 100), // simulate a growing trend
      }));
    }, [tiktokAccount]);

    const viewsData = useMemo(() => {
      if (!tiktokAccount || !tiktokAccount.videos || tiktokAccount.videos.length < 2) return [{ value: 0 }];
      return tiktokAccount.videos.map(v => ({ value: v.view_count || 0 })).reverse();
    }, [tiktokAccount]);


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
            value: tiktokAccount ? formatNumber(tiktokAccount.followerCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            data: followersData.length > 0 ? followersData : [{value: 0}],
            color: getTrendColor(followersData),
            gradientId: 'followersGradient',
        },
        {
            title: 'Total de Curtidas',
            value: tiktokAccount ? formatNumber(tiktokAccount.likesCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: Heart,
            data: likesData.length > 0 ? likesData : [{value: 0}],
            color: getTrendColor(likesData),
            gradientId: 'likesGradient',
        },
        {
            title: 'Total de Views (Últimos Vídeos)',
            value: formatNumber(totalViews),
            isLoading: isLoadingTiktok,
            icon: Film,
            data: viewsData.length > 0 ? viewsData : [{value: 0}],
            color: getTrendColor(viewsData),
            gradientId: 'viewsGradient',
        },
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
                      <div className="text-sm text-muted-foreground whitespace-nowrap">Total</div>
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
              Ideias Salvas <Lightbulb className="h-5 w-5 text-yellow-400" />
            </CardTitle>
            <CardDescription>Suas próximas grandes ideias de vídeo.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoadingIdeas && <p className="text-sm text-muted-foreground">Carregando ideias...</p>}
             {!isLoadingIdeas && savedIdeas?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ideia salva. Gere novas ideias!</p>}
            <div className="space-y-2">
              {savedIdeas?.map((idea) => (
                <Link key={idea.id} href="/dashboard/ideas">
                  <div
                    className="flex items-center justify-between rounded-md p-3 hover:bg-muted cursor-pointer"
                  >
                    <p className="font-medium">{idea.title}</p>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

       {tiktokAccount && tiktokAccount.videos && tiktokAccount.videos.length > 0 && (
          <div className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">Últimos Vídeos do TikTok</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tiktokAccount.videos.map(video => (
                      <Card key={video.id} className="overflow-hidden group">
                           <a href={video.share_url} target="_blank" rel="noopener noreferrer">
                              <div className="relative aspect-[9/16]">
                                  <Image 
                                      src={video.cover_image_url || '/placeholder.png'} 
                                      alt={video.title || 'TikTok video cover'} 
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                   <div className="absolute bottom-2 left-2 right-2">
                                       <p className="text-white text-sm font-bold truncate">{video.title || 'Sem título'}</p>
                                   </div>
                              </div>
                           </a>
                          <CardContent className="p-3 text-xs text-muted-foreground flex justify-around items-center gap-2">
                              <div className="flex items-center gap-1" title="Curtidas"><Heart className="size-3" /> {formatNumber(video.like_count)}</div>
                              <div className="flex items-center gap-1" title="Comentários"><MessageCircle className="size-3" /> {formatNumber(video.comment_count)}</div>
                              <div className="flex items-center gap-1" title="Compartilhamentos"><Share className="size-3" /> {formatNumber(video.share_count)}</div>
                               <div className="flex items-center gap-1" title="Visualizações"><TrendingUp className="size-3" /> {formatNumber(video.view_count)}</div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
       )}

      {isLoadingTiktok && (
          <div className="text-center text-muted-foreground py-10">
              <Loader2 className="mx-auto animate-spin h-8 w-8" />
              <p className="mt-2">Carregando seus vídeos do TikTok...</p>
          </div>
      )}

      {tiktokAccount && (!tiktokAccount.videos || tiktokAccount.videos.length === 0) && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <Video className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum vídeo encontrado</h3>
              <p>Não conseguimos carregar seus vídeos. Isso pode acontecer se sua conta for privada ou se a sincronização ainda estiver em andamento.</p>
          </div>
      )}

    </div>
  );
}
