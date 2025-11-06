
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
  LineChart,
  Check,
  Rocket,
  Goal,
  Calendar,
  Repeat,
  RefreshCw,
  PlayCircle,
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
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, Timestamp, updateDoc, doc, writeBatch, setDoc } from 'firebase/firestore';
import type { ContentTask } from '@/lib/types';
import type { TiktokAccount, TiktokVideo, SavedVideoIdea, Goal as GoalType } from '@/lib/types';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { refreshTiktokData } from '@/ai/flows/refresh-tiktok-data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-lg p-3 text-sm">
        <p className="label font-bold text-foreground">{`Mês: ${label}`}</p>
        {payload.map((pld: any) => {
            const value = pld.dataKey === 'Engajamento' 
                ? `${pld.value.toFixed(2).replace('.', ',')}%`
                : formatNumber(pld.value);
            return (
              <p key={pld.dataKey} style={{ color: pld.color }}>
                {`${pld.name}: ${value}`}
              </p>
            )
        })}
      </div>
    );
  }

  return null;
};


export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [timeRange, setTimeRange] = useState('total');
    const [activeContentTab, setActiveContentTab] = useState('overview');
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());


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
    
    // Query for user goals
    const goalsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'goals'), limit(1));
    }, [user, firestore]);

    const { data: goals, isLoading: isLoadingGoals } = useCollection<GoalType>(goalsQuery);
    const goal = useMemo(() => goals?.[0], [goals]);

    const availableYears = useMemo(() => {
        if (!allVideos) return [new Date().getFullYear()];
        const years = new Set(allVideos.map(v => new Date((v.create_time || 0) * 1000).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [allVideos]);

    const filteredVideos = useMemo(() => {
        if (!allVideos) return [];
        
        const yearFiltered = allVideos.filter(video => {
            const videoYear = new Date((video.create_time || 0) * 1000).getFullYear();
            return videoYear === selectedYear;
        });

        if (timeRange === '30d') {
            const thirtyDaysAgo = (Date.now() / 1000) - (30 * 24 * 60 * 60);
            return yearFiltered.filter(video => (video.create_time || 0) > thirtyDaysAgo);
        }
        return yearFiltered;
    }, [allVideos, timeRange, selectedYear]);
    
    const chartData = useMemo(() => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const dataByMonth: { [key: string]: { views: number; likes: number; comments: number; shares: number; count: number } } = {};
        
        months.forEach(m => {
            dataByMonth[m] = { views: 0, likes: 0, comments: 0, shares: 0, count: 0 };
        });

        if (filteredVideos && filteredVideos.length > 0) {
            filteredVideos.forEach(video => {
                if (video.create_time) {
                    const date = new Date(video.create_time * 1000);
                    const month = months[date.getMonth()];
                    if (month) {
                        dataByMonth[month].views += video.view_count || 0;
                        dataByMonth[month].likes += video.like_count || 0;
                        dataByMonth[month].comments += video.comment_count || 0;
                        dataByMonth[month].shares += video.share_count || 0;
                        dataByMonth[month].count += 1;
                    }
                }
            });
        }
        
        return months.map((month) => {
            const monthData = dataByMonth[month];
            const totalEngagements = monthData.likes + monthData.comments + monthData.shares;
            const engagementRate = monthData.views > 0 ? (totalEngagements / monthData.views) * 100 : 0;
            
            return {
                month,
                Visualizações: monthData.views,
                Curtidas: monthData.likes,
                Engajamento: engagementRate,
            };
        });

    }, [filteredVideos]);


    const contentTasksQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'contentTasks'),
            orderBy('date', 'asc')
        );
    }, [user, firestore]);

    const { data: allTasks, isLoading: isLoadingTasks } = useCollection<ContentTask>(contentTasksQuery);

    const pendingTasks = useMemo(() => allTasks?.filter(task => !task.isCompleted).slice(0, 3) || [], [allTasks]);
    const isPlanPending = useMemo(() => allTasks?.some(task => task.status === 'pending'), [allTasks]);


    const savedIdeasQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'savedVideoIdeas'),
            orderBy('savedAt', 'desc'),
            limit(2)
        );
    }, [user, firestore]);
    
    const handleSyncTikTok = async () => {
        if (!user || !firestore || !tiktokAccount) {
            toast({
                title: "Erro",
                description: "Nenhuma conta do TikTok para sincronizar.",
                variant: "destructive",
            });
            return;
        }

        setIsSyncing(true);

        try {
            const result = await refreshTiktokData({ refreshToken: tiktokAccount.refreshToken });
            
            const batch = writeBatch(firestore);

            const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id);
            const accountData = {
                // ...existing data is preserved by merge
                followerCount: result.follower_count,
                followingCount: result.following_count,
                likesCount: result.likes_count,
                videoCount: result.video_count,
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                tokenExpiresAt: Date.now() + result.expires_in * 1000,
                refreshTokenExpiresAt: Date.now() + result.refresh_expires_in * 1000,
                lastSyncStatus: 'success',
                lastSyncTime: new Date().toISOString(),
                lastSyncError: '', // Clear any previous error
            };
            batch.set(tiktokAccountRef, accountData, { merge: true });

            if (result.videos && result.videos.length > 0) {
                const videosCollectionRef = collection(tiktokAccountRef, 'videos');
                result.videos.forEach(video => {
                    const videoDocRef = doc(videosCollectionRef, video.id);
                    batch.set(videoDocRef, video, { merge: true });
                });
            }

            await batch.commit();

            toast({
                title: "Sincronização Concluída!",
                description: `Seus dados do TikTok foram atualizados. ${result.videos.length} vídeos sincronizados.`,
            });

        } catch (error: any) {
            console.error("Erro ao sincronizar dados do TikTok:", error);
            const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id);
            await setDoc(tiktokAccountRef, { 
                lastSyncStatus: 'error',
                lastSyncError: error.message || 'Unknown error'
            }, { merge: true });
            
            toast({
                title: "Erro na Sincronização",
                description: error.message || "Não foi possível atualizar seus dados do TikTok. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };


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
    
    const isLoading = isUserLoading || isLoadingTiktok;

    const businessCards = [
        {
            title: 'Seguidores',
            value: formatNumber(followerCount),
            description: 'Número total de seguidores',
            isLoading: isLoadingTiktok,
            icon: UserPlus,
            color: 'text-sky-500',
            bgColor: 'bg-sky-500/10'
        },
        {
            title: 'Curtidas',
            value: formatNumber(totalLikes),
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : `Total em ${selectedYear}`,
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Heart,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10'
        },
        {
            title: 'Visualizações',
            value: formatNumber(totalViews),
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : `Total em ${selectedYear}`,
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Film,
            color: 'text-violet-500',
            bgColor: 'bg-violet-500/10'
        },
        {
            title: 'Taxa de Engajamento',
            value: `${engagementRate.toFixed(2).replace('.', ',')}%`,
            description: timeRange === '30d' ? 'Nos últimos 30 dias' : `Média em ${selectedYear}`,
            isLoading: isLoadingTiktok || isLoadingVideos,
            icon: Percent,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        }
    ];

    const { data: savedIdeas, isLoading: isLoadingIdeas } = useCollection<SavedVideoIdea>(savedIdeasQuery);
    
    const toggleTaskCompletion = (taskId: string, currentStatus: boolean) => {
        if (!user || !firestore) return;
        const taskRef = doc(firestore, 'users', user.uid, 'contentTasks', taskId);
        updateDoc(taskRef, { isCompleted: !currentStatus });
    };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Olá, {user ? user.displayName?.split(' ')[0] : 'Criador'}! 👋
          </h1>
          <p className="text-muted-foreground">
             {tiktokAccount?.lastSyncTime ? `Última sincronização: ${new Date(tiktokAccount.lastSyncTime).toLocaleString('pt-BR')}` : 'Seu painel de comando para dominar as redes sociais.'}
          </p>
        </div>
        {tiktokAccount && (
            <Button onClick={handleSyncTikTok} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </Button>
        )}
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
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className='w-full sm:w-auto'>
                <TabsList>
                    <TabsTrigger value="overview"><LineChart className='w-4 h-4 mr-2'/>Visão Geral</TabsTrigger>
                    <TabsTrigger value="videos"><LayoutGrid className='w-4 h-4 mr-2'/>Vídeos Recentes</TabsTrigger>
                </TabsList>
            </Tabs>
             {activeContentTab === 'overview' && (
                <div className="flex items-center gap-2">
                     <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Tabs value={timeRange} onValueChange={setTimeRange}>
                        <TabsList className="grid w-full sm:w-auto grid-cols-2">
                            <TabsTrigger value="total">Anual</TabsTrigger>
                            <TabsTrigger value="30d">30 Dias</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            )}
        </div>

        {activeContentTab === 'overview' && (
            <div className='mt-6 space-y-6'>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {businessCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className='flex-1 space-y-1'>
                                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                     {card.isLoading ? (
                                        <div className="h-8 w-2/3 bg-muted animate-pulse rounded-md" />
                                    ) : (
                                        <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                    )}
                                </div>
                                <div className={`flex items-center justify-center rounded-full size-12 ${card.bgColor}`}>
                                   <Icon className={`size-6 ${card.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className='font-bold'>Visão Geral da Performance</CardTitle>
                        <CardDescription>Visualizações, curtidas e engajamento dos seus vídeos ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pl-0">
                        <ResponsiveContainer width="100%" height="100%">
                             <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatNumber(value)}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                    </linearGradient>
                                     <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Bar yAxisId="left" dataKey="Visualizações" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                <Area yAxisId="left" type="monotone" dataKey="Curtidas" stroke="hsl(var(--chart-2))" fill="url(#colorLikes)" />
                                <Line yAxisId="right" type="monotone" dataKey="Engajamento" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} activeDot={{ r: 6 }}/>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {isPlanPending ? (
                    <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-bold flex items-center gap-2"><Rocket className="size-5 text-primary"/>Plano de Conteúdo Sugerido!</CardTitle>
                        <CardDescription>A IA preparou um novo plano semanal para você. Que tal dar uma olhada?</CardDescription>
                    </CardHeader>
                        <CardContent>
                        <p className="text-sm text-muted-foreground">Revise as ideias de vídeo e aceite o plano para adicioná-las ao seu checklist semanal.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/dashboard/plan">Revisar e Aprovar</Link>
                        </Button>
                    </CardFooter>
                </Card>
                ) : (
                <Accordion type="single" collapsible className="w-full space-y-6" defaultValue='item-1'>
                     <AccordionItem value="item-0" className="border rounded-lg bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-left hover:no-underline data-[state=open]:border-b">
                            <div className="flex-1 space-y-1.5">
                                <CardTitle className="font-bold">Suas Metas Atuais</CardTitle>
                                <CardDescription>Seus objetivos principais definidos no onboarding.</CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                           {isLoadingGoals ? (
                               <div className='pt-4'><Loader2 className="animate-spin text-muted-foreground"/></div>
                           ) : goal ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-1"><Goal className="size-4"/>Nicho</div>
                                    <p className="font-bold text-lg">{goal.niche}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-1"><TrendingUp className="size-4"/>Meta de Seguidores</div>
                                    <p className="font-bold text-lg">{goal.followerGoal.toLocaleString('pt-BR')}</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-1"><Repeat className="size-4"/>Frequência</div>
                                    <p className="font-bold text-lg">{goal.postingFrequency}</p>
                                </div>
                            </div>
                           ) : (
                            <div className="text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                                <Goal className="mx-auto h-8 w-8" />
                                <h3 className="mt-2 font-semibold">Nenhuma meta definida</h3>
                                <p className="text-sm">Vá para o onboarding para definir suas metas.</p>
                            </div>
                           )}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-1" className="border rounded-lg bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-left hover:no-underline data-[state=open]:border-b">
                            <div className="flex-1 space-y-1.5">
                                <CardTitle className="font-bold">Checklist da Semana</CardTitle>
                                <CardDescription>Suas próximas tarefas para manter a consistência.</CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-3 pt-4">
                                {isLoadingTasks && (
                                    <div className="space-y-3">
                                        <div className="h-10 bg-muted rounded-lg animate-pulse" />
                                        <div className="h-10 bg-muted rounded-lg animate-pulse" />
                                    </div>
                                )}
                                {!isLoadingTasks && pendingTasks?.length === 0 && (
                                    <div className="text-center text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                                        <CalendarDays className="mx-auto h-8 w-8" />
                                        <h3 className="mt-2 font-semibold">Tudo em dia!</h3>
                                        <p className="text-sm">Gere um novo plano de conteúdo para a semana.</p>
                                    </div>
                                )}
                                {pendingTasks?.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                     <Checkbox
                                        id={`task-${task.id}`}
                                        checked={task.isCompleted}
                                        onCheckedChange={() => toggleTaskCompletion(task.id, task.isCompleted)}
                                    />
                                    <div className="grid gap-1.5 flex-1">
                                         <label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">
                                            {task.description}
                                         </label>
                                         <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{task.platform}</Badge>
                                             <p className="text-xs text-muted-foreground capitalize">
                                                {task.date ? new Date(task.date.toDate()).toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Data pendente'}
                                            </p>
                                         </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <Button asChild variant="secondary" className="w-full">
                                <Link href="/dashboard/plan">Ver Calendário Completo</Link>
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2" className="border rounded-lg bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-left hover:no-underline data-[state=open]:border-b">
                             <div className="flex-1 space-y-1.5">
                                <CardTitle className="font-bold flex items-center gap-2">
                                Ideias Salvas <Lightbulb className="h-5 w-5 text-yellow-400" />
                                </CardTitle>
                                <CardDescription>Suas próximas grandes ideias de vídeo.</CardDescription>
                            </div>
                        </AccordionTrigger>
                         <AccordionContent className="px-6 pb-6">
                            <div className="pt-4">
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
                            </div>
                            <div className="mt-6">
                                <Button asChild variant="secondary" className="w-full">
                                <Link href="/dashboard/ideas">Ver Todas as Ideias</Link>
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                )}
            </div>
        )}
        
        {activeContentTab === 'videos' && (
            <div className='mt-6'>
                {filteredVideos && filteredVideos.length > 0 ? (
                    <TooltipProvider>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredVideos.map(video => {
                             const videoDate = video.create_time ? new Date(video.create_time * 1000).toLocaleDateString('pt-BR') : 'Data Indisponível';
                             return (
                            <a key={video.id} href={video.share_url} target="_blank" rel="noopener noreferrer" className="block group">
                                <Card className="overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-[9/16]">
                                        <Image 
                                            src={video.cover_image_url || '/placeholder.png'} 
                                            alt={video.title || 'TikTok video cover'} 
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-colors group-hover:from-black/80" />
                                        
                                        <Badge variant="secondary" className="absolute top-2 right-2 text-xs bg-black/50 text-white border-white/20">
                                            {videoDate}
                                        </Badge>
                                        
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <PlayCircle className="size-12 text-white/80" />
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-white text-sm font-bold truncate">{video.title || 'Sem título'}</p>
                                        </div>
                                    </div>
                                    <CardContent className="p-3 text-xs text-muted-foreground flex justify-around items-center gap-2 border-t mt-auto">
                                        <UITooltip>
                                            <TooltipTrigger className="flex items-center gap-1"><Heart className="size-3.5" /> {formatNumber(video.like_count)}</TooltipTrigger>
                                            <TooltipContent>{(video.like_count || 0).toLocaleString('pt-BR')} Curtidas</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                            <TooltipTrigger className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {formatNumber(video.comment_count)}</TooltipTrigger>
                                            <TooltipContent>{(video.comment_count || 0).toLocaleString('pt-BR')} Comentários</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                            <TooltipTrigger className="flex items-center gap-1"><Share className="size-3.5" /> {formatNumber(video.share_count)}</TooltipTrigger>
                                            <TooltipContent>{(video.share_count || 0).toLocaleString('pt-BR')} Compartilhamentos</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                            <TooltipTrigger className="flex items-center gap-1"><TrendingUp className="size-3.5" /> {formatNumber(video.view_count)}</TooltipTrigger>
                                            <TooltipContent>{(video.view_count || 0).toLocaleString('pt-BR')} Visualizações</TooltipContent>
                                        </UITooltip>
                                    </CardContent>
                                </Card>
                            </a>
                             )
                        })}
                    </div>
                    </TooltipProvider>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-6">
                        <Video className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">Nenhum vídeo encontrado</h3>
                        <p>Não há vídeos para exibir no período de tempo selecionado.</p>
                    </div>
                )}
            </div>
        )}
      </div>
      )}

    </div>
  );
}
