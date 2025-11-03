
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
import type { TiktokAccount } from '@/lib/types';
import { useMemo } from 'react';

const revenueData = [
  { value: 1000 },
  { value: 4500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1500 },
  { value: 6100 },
  { value: 3000 },
  { value: 6800 },
  { value: 2000 },
  { value: 1000 },
  { value: 4000 },
  { value: 2000 },
  { value: 3000 },
  { value: 2000 },
  { value: 6238 },
];

const customersData = [
  { value: 2000 },
  { value: 4500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1500 },
  { value: 5100 },
  { value: 2500 },
  { value: 6800 },
  { value: 1800 },
  { value: 1000 },
  { value: 3000 },
  { value: 2000 },
  { value: 2700 },
  { value: 2000 },
  { value: 4238 },
];

const activeUsersData = [
  { value: 2000 },
  { value: 3500 },
  { value: 2000 },
  { value: 5200 },
  { value: 1200 },
  { value: 4100 },
  { value: 3500 },
  { value: 5800 },
  { value: 2000 },
  { value: 800 },
  { value: 3000 },
  { value: 1000 },
  { value: 4000 },
  { value: 2000 },
  { value: 4238 },
];


const trendingTopics = [
  { title: "Audio Viral: 'Summer Vibes'" },
  { title: 'Transição de Maquiagem' },
  { title: 'Desafio 30 Dias' },
];

function formatNumber(value: number): string {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
}

function formatPercentage(value: number): string {
    return (value * 100).toFixed(1) + '%';
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
    

    const businessCards = [
        {
            title: 'Seguidores',
            period: 'Total',
            value: tiktokAccount ? formatNumber(tiktokAccount.followerCount) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            data: revenueData,
            color: 'var(--color-emerald-500)',
            gradientId: 'revenueGradient',
        },
        {
            title: 'Engajamento',
            period: 'Últimos 28 dias',
            value: tiktokAccount ? formatPercentage(tiktokAccount.engagementRate) : 'N/A',
            isLoading: isLoadingTiktok,
            icon: TrendingUp,
            data: customersData,
            color: 'var(--color-blue-500)',
            gradientId: 'customersGradient',
        },
        {
            title: 'Visualizações',
            period: 'Últimos 28 dias',
            value: 'N/A', // Placeholder - no data in schema yet
            isLoading: false,
            icon: Film,
            data: activeUsersData,
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
                          margin={{
                            top: 5,
                            right: 5,
                            left: 5,
                            bottom: 5,
                          }}
                        >
                          <defs>
                            <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
                            </linearGradient>
                            <filter id={`dotShadow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                            </filter>
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
                            activeDot={{
                              r: 6,
                              fill: card.color,
                              stroke: 'var(--background)',
                              strokeWidth: 2,
                            }}
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
