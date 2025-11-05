
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
    
    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const tiktokAccount = useMemo(() => {
        if (tiktokAccounts && tiktokAccounts.length > 0) {
            return tiktokAccounts[0];
        }
        return null;
    }, [tiktokAccounts]);
    
    /*
    const videosQuery = useMemoFirebase(() => {
        if (!user || !firestore || !tiktokAccount || !tiktokAccount.videoCount || tiktokAccount.videoCount === 0) return null;
        return query(
            collection(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id, 'videos'),
            orderBy('create_time', 'desc'),
            limit(10)
        );
    }, [user, firestore, tiktokAccount]);

    const { data: videos, isLoading: isLoadingVideos } = useCollection<TiktokVideo>(videosQuery);


    const totalViews = useMemo(() => {
      if (!videos) return 0;
      return videos.reduce((sum, video) => sum + (video.view_count || 0), 0);
    }, [videos]);
    */
   const videos: TiktokVideo[] = [];
   const isLoadingVideos = false;
   const totalViews = 0;


    const followersData = useMemo(() => {
        if (!tiktokAccount) return [{ value: 0 }];
         if (!videos || videos.length < 2) {
             return [{ value: Math.round((tiktokAccount.followerCount || 0) * 0.95) }, { value: tiktokAccount.followerCount || 0 }];
        }
        return videos.map((_, index) => ({
            value: Math.round((tiktokAccount.followerCount || 0) - (videos.length - 1 - index) * ((tiktokAccount.followerCount || 0) * 0.01))
        }));
    }, [tiktokAccount, videos]);

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
            title: 'Vídeos',
            value: formatNumber(tiktokAccount?.videoCount),
            isLoading: isLoadingTiktok,
            icon: Video,
            data: videos ? videos.map((_, index) => ({ value: index })) : [{value: 0}],
            color: getTrendColor(videos ? videos.map((_, index) => ({ value: index })) : []),
            gradientId: 'videoCountGradient',
        },
        {
            title: 'Total de Views',
            value: formatNumber(totalViews),
            isLoading: isLoadingVideos,
            icon: Film,
            data: videos ? videos.map(v => ({ value: v.view_count || 0 })) : [{value: 0}],
            color: getTrendColor(videos ? videos.map(v => ({ value: v.view_count || 0 })) : []),
            gradientId: 'viewsGradient',
        },
    ];

    const { data: upcomingPosts, isLoading: isLoadingTasks } = useCollection<ContentTask>(upcomingTasksQuery);

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
}
