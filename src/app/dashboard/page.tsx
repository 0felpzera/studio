'use client';

import Link from 'next/link';
import {
  Users,
  BarChart2,
  ListVideo,
  ThumbsUp,
  Flame,
  CalendarDays,
  Film,
  ChevronRight,
  Sparkles,
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

const stats = [
  {
    name: 'Seguidores Totais',
    value: '12.5K',
    change: '+2.5K este mês',
    icon: Users,
  },
  {
    name: 'Taxa de Engajamento',
    value: '4.8%',
    change: '+0.8% vs. último mês',
    icon: ThumbsUp,
  },
  {
    name: 'Posts Planejados',
    value: '15',
    change: 'Esta semana',
    icon: ListVideo,
  },
  {
    name: 'Ideias Salvas',
    value: '23',
    change: 'Prontas para usar',
    icon: Sparkles,
  },
];

const upcomingPosts = [
  {
    platform: 'TikTok',
    title: 'Trend do Momento',
    time: 'Hoje, 14:00',
    icon: CalendarDays,
    color: 'text-sky-400',
  },
  {
    platform: 'Reels',
    title: 'Tutorial de Make',
    time: 'Amanhã, 10:00',
    icon: Film,
    color: 'text-rose-400',
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
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Olá, Criador! 👋
        </h1>
        <p className="text-muted-foreground">
          Seu painel de comando para dominar as redes sociais
        </p>
      </header>

      <Card className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Conecte suas redes sociais</CardTitle>
            <CardDescription>
              Sincronize Instagram e TikTok para análises personalizadas.
            </CardDescription>
          </div>
          <Button>Conectar Agora</Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Próximos Posts</CardTitle>
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
            <Button variant="outline" className="w-full">
              <Link href="/dashboard/plan">Ver Calendário Completo</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              Tendências em Alta <Flame className="h-5 w-5 text-orange-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendingTopics.map((trend) => (
                <div
                  key={trend.title}
                  className="flex items-center justify-between rounded-md p-3 hover:bg-muted"
                >
                  <p className="font-medium">{trend.title}</p>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Link href="/dashboard/trends">Ver Todas as Tendências</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
