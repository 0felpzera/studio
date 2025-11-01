
'use client';

import Link from 'next/link';
import {
  Flame,
  CalendarDays,
  Film,
  ChevronRight,
  CircleDollarSign,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

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

const businessCards = [
  {
    title: 'Seguidores',
    period: 'Últimos 28 dias',
    value: '12.5k',
    timestamp: '',
    data: revenueData,
    color: 'var(--color-emerald-500)',
    icon: UserPlus,
    gradientId: 'revenueGradient',
  },
  {
    title: 'Engajamento',
    period: 'Últimos 28 dias',
    value: '4.8%',
    timestamp: '3h atrás',
    data: customersData,
    color: 'var(--color-blue-500)',
    icon: TrendingUp,
    gradientId: 'customersGradient',
  },
  {
    title: 'Visualizações',
    period: 'Últimos 28 dias',
    value: '1.2M',
    timestamp: '1h atrás',
    data: activeUsersData,
    color: 'var(--color-violet-500)',
    icon: Film,
    gradientId: 'usersGradient',
  },
];

const upcomingPosts = [
  {
    platform: 'TikTok',
    title: 'Trend do Momento',
    time: 'Hoje, 14:00',
    icon: CalendarDays,
    color: 'text-sky-500',
  },
  {
    platform: 'Reels',
    title: 'Tutorial de Make',
    time: 'Amanhã, 10:00',
    icon: Film,
    color: 'text-rose-500',
  },
];

const trendingTopics = [
  { title: "Audio Viral: 'Summer Vibes'" },
  { title: 'Transição de Maquiagem' },
  { title: 'Desafio 30 Dias' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Olá, Criador! 👋
        </h1>
        <p className="text-muted-foreground">
          Seu painel de comando para dominar as redes sociais.
        </p>
      </header>

      <div className="@container w-full">
        <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-6">
          {businessCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i}>
                <CardContent className="space-y-5">
                  {/* Header with icon and title */}
                  <div className="flex items-center gap-2">
                    <Icon className="size-5" style={{ color: card.color }} />
                    <span className="text-base font-semibold">{card.title}</span>
                  </div>

                  <div className="flex items-end gap-2.5 justify-between">
                    {/* Details */}
                    <div className="flex flex-col gap-1">
                      {/* Period */}
                      <div className="text-sm text-muted-foreground whitespace-nowrap">{card.period}</div>

                      {/* Value */}
                      <div className="text-3xl font-bold text-foreground tracking-tight">{card.value}</div>
                    </div>

                    {/* Chart */}
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
                                const formatValue = (val: number) => {
                                  return `${(val / 1000).toFixed(1)}k`;
                                };

                                return (
                                  <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
                                    <p className="text-sm font-semibold text-foreground">{formatValue(value)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          {/* Area with gradient and enhanced shadow */}
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
                              stroke: 'white',
                              strokeWidth: 2,
                              filter: `url(#dotShadow${i})`,
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
            {upcomingPosts.map((post) => (
              <div key={post.title} className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <post.icon className={`h-6 w-6 ${post.color}`} />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">
                    {post.platform} - {post.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
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
