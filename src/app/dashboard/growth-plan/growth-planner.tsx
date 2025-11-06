
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Calendar, DollarSign, Sparkles, Target, User, Activity, Goal, TrendingUp, Users, Lightbulb, Check, AreaChart, CheckCircle2, Loader2, Info, Rocket, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthChart } from '@/components/ui/growth-chart';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateGrowthPlan } from '@/ai/flows/generate-growth-plan';
import type { GenerateGrowthPlanInput, GenerateGrowthPlanOutput, Goal as GoalType, TiktokAccount } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, doc, setDoc } from 'firebase/firestore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const formSchema = z.object({
  niche: z.string().min(1, "O nicho é obrigatório"),
  country: z.string().min(1, "O país é obrigatório"),
  followers: z.coerce.number().min(0, "O número de seguidores não pode ser negativo"),
  followerGoal: z.coerce.number().min(1, "A meta de seguidores é obrigatória"),
  reelsPerMonth: z.number().min(0).max(60),
  storiesPerMonth: z.number().min(0).max(100),
  priority: z.string().min(1, "A prioridade é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;


export function GrowthPlanner() {
  const [activePlan, setActivePlan] = useState<GenerateGrowthPlanOutput | null>(null);
  const [suggestedPlan, setSuggestedPlan] = useState<GenerateGrowthPlanOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const goalsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'goals');
  }, [user, firestore]);

  const tiktokAccountsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'tiktokAccounts'), limit(1));
  }, [user, firestore]);

  const { data: goals, isLoading: isLoadingGoals } = useCollection<GoalType>(goalsQuery);
  const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

  const goal = useMemo(() => goals?.[0], [goals]);
  const tiktokAccount = useMemo(() => tiktokAccounts?.[0], [tiktokAccounts]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: 'Brasil',
      reelsPerMonth: 8,
      storiesPerMonth: 12,
      priority: 'Alcance',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const initialData: Partial<FormData> = {
      country: 'Brasil',
      reelsPerMonth: 8,
      storiesPerMonth: 12,
      priority: 'Alcance'
    };
    if (goal) {
      initialData.niche = goal.niche;
      initialData.followerGoal = goal.followerGoal;
    }
    if (tiktokAccount) {
      initialData.followers = tiktokAccount.followerCount;
    }
    form.reset(initialData);
    setFormData(initialData);
  }, [goal, tiktokAccount, form]);


  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) {
        toast({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para gerar um plano.', variant: 'destructive'});
        return;
    }

    setIsCalculating(true);
    setSuggestedPlan(null); // Clear previous suggestion
    setFormData(data);
        
    try {
      const result = await generateGrowthPlan({
        ...data,
        followers: Number(data.followers),
        followerGoal: Number(data.followerGoal),
      });
      setSuggestedPlan(result);
      toast({
        title: "Sugestão Pronta!",
        description: "Um novo plano de crescimento foi gerado para sua análise.",
      });
    } catch (error) {
      console.error("Erro ao gerar plano de crescimento:", error);
      toast({
        title: "Erro ao Calcular",
        description: "Não foi possível gerar seu plano. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleSavePlan = async () => {
    if (!user || !firestore || !suggestedPlan || !formData) {
        toast({ title: 'Nenhum plano para salvar', description: 'Gere uma sugestão antes de salvar.', variant: 'destructive'});
        return;
    }

    // Save the goal data to Firestore
    try {
        const goalData = {
            userId: user.uid,
            niche: formData.niche,
            followerGoal: formData.followerGoal,
            postingFrequency: `${formData.reelsPerMonth} reels/mês, ${formData.storiesPerMonth} stories/mês`,
        };
        const goalDocRef = doc(firestore, 'users', user.uid, 'goals', 'user-goal');
        await setDoc(goalDocRef, goalData, { merge: true });

        // Set the suggested plan as the active plan
        setActivePlan(suggestedPlan);
        setSuggestedPlan(null); // Clear the suggestion

        toast({
            title: "Plano Salvo!",
            description: "Seu novo plano de crescimento está ativo."
        });

    } catch (e) {
        console.error("Could not save goal update", e);
        toast({ title: 'Erro ao Salvar', description: 'Não foi possível salvar suas metas no banco de dados.', variant: 'destructive'});
    }
  }
    
  if (isLoadingGoals || isLoadingTiktok) {
    return (
        <Card>
            <CardContent className='h-64 flex items-center justify-center'>
                <Loader2 className='animate-spin h-8 w-8 text-primary' />
            </CardContent>
        </Card>
    )
  }
  
  const displayPlan = suggestedPlan || activePlan;

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full" defaultValue={!activePlan ? "item-1" : ""}>
        <AccordionItem value="item-1" className="border-none">
           <AccordionTrigger className={cn("rounded-lg p-4 font-bold text-lg hover:no-underline", !activePlan ? 'hidden' : 'flex bg-card/60 border border-border/20 shadow-lg')}>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Gerar Novo Plano de Crescimento
                </div>
           </AccordionTrigger>
          <AccordionContent className="pt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Gerador de Plano de Crescimento</CardTitle>
                        <CardDescription>Ajuste suas métricas e metas para receber uma estratégia de crescimento personalizada da IA.</CardDescription>
                    </CardHeader>
                    <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <div className="space-y-1.5">
                            <Label htmlFor="followers">Seguidores Atuais</Label>
                            <Input id="followers" type="number" {...form.register('followers')} placeholder="Ex: 1500" disabled={!!tiktokAccount} />
                            {form.formState.errors.followers && <p className="text-xs font-medium text-destructive">{form.formState.errors.followers.message}</p>}
                            {tiktokAccount && <p className='text-xs text-muted-foreground'>Preenchido com dados do TikTok.</p>}
                            {!tiktokAccount && <p className='text-xs text-muted-foreground'>Conecte sua conta para preencher.</p>}
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="followerGoal">Meta de Seguidores</Label>
                            <Input id="followerGoal" type="number" {...form.register('followerGoal')} placeholder="Ex: 100000" />
                            {form.formState.errors.followerGoal && <p className="text-xs font-medium text-destructive">{form.formState.errors.followerGoal.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="niche">Nicho</Label>
                            <Select onValueChange={(value) => form.setValue('niche', value)} value={form.watch('niche')}>
                                <SelectTrigger><SelectValue placeholder="Selecione seu nicho" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Moda">Moda</SelectItem>
                                    <SelectItem value="Beleza">Beleza</SelectItem>
                                    <SelectItem value="Fitness">Fitness</SelectItem>
                                    <SelectItem value="Culinária">Culinária</SelectItem>
                                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                                    <SelectItem value="Viagem">Viagem</SelectItem>
                                    <SelectItem value="Games">Games</SelectItem>
                                    <SelectItem value="Comédia">Comédia</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.niche && <p className="text-xs font-medium text-destructive">{form.formState.errors.niche.message}</p>}
                        </div>
                         <div className="space-y-1.5">
                            <Label>Prioridade</Label>
                            <Select onValueChange={(value) => form.setValue('priority', value)} value={form.watch('priority')}>
                                <SelectTrigger><SelectValue placeholder="Selecione sua prioridade" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alcance">Alcance</SelectItem>
                                    <SelectItem value="Conversão">Conversão</SelectItem>
                                    <SelectItem value="Autoridade">Autoridade</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.priority && <p className="text-xs font-medium text-destructive">{form.formState.errors.priority.message}</p>}
                        </div>
                         <div className="space-y-3 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="reelsPerMonth" className="text-sm">Reels por Mês</Label>
                                    <span className="text-sm font-bold text-primary">{form.watch('reelsPerMonth')}</span>
                                </div>
                                <Slider id="reelsPerMonth" value={[form.watch('reelsPerMonth')]} max={60} step={1} onValueChange={([val]) => form.setValue('reelsPerMonth', val)} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="storiesPerMonth" className="text-sm">Stories com CTA por Mês</Label>
                                    <span className="text-sm font-bold text-primary">{form.watch('storiesPerMonth')}</span>
                                </div>
                                <Slider id="storiesPerMonth" value={[form.watch('storiesPerMonth')]} max={100} step={1} onValueChange={([val]) => form.setValue('storiesPerMonth', val)} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isCalculating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Gerar Plano
                        </Button>
                    </CardFooter>
                </form>
            </Card>
           </AccordionContent>
        </AccordionItem>
      </Accordion>
      
        {isCalculating && !suggestedPlan && (
            <Card className="h-96 flex items-center justify-center animate-pulse">
                <div className='text-center space-y-3'>
                    <Loader2 className='mx-auto h-8 w-8 animate-spin text-primary' />
                    <p className='text-muted-foreground'>A IA está montando sua estratégia...</p>
                </div>
            </Card>
        )}

      {displayPlan && <div id="planner-results" className="space-y-8 mt-8">
        
        {suggestedPlan && (
             <Card className="bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2"><Rocket className="size-5 text-primary"/>Sugestão de Plano Pronta!</CardTitle>
                    <CardDescription>A IA gerou o seguinte plano. Você pode salvá-lo para torná-lo seu plano ativo ou gerar um novo.</CardDescription>
                </CardHeader>
                <CardFooter className="gap-2">
                    <Button onClick={handleSavePlan}>
                        <Save className="mr-2 size-4" /> Salvar Plano e Definir como Meta
                    </Button>
                     <Button variant="outline" onClick={() => { setSuggestedPlan(null); }}>
                        Descartar Sugestão
                    </Button>
                </CardFooter>
            </Card>
        )}

        <div className="text-center">
             <h2 className="text-3xl sm:text-4xl font-serif font-bold text-balance">
                {activePlan && !suggestedPlan ? "Seu Plano de Crescimento Ativo" : "Visualização do Plano"}
             </h2>
             <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Com base nas suas metas, aqui está uma projeção realista e um plano de ação para você decolar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo para Atingir a Meta</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{displayPlan.timeToGoal}</div>
              <p className="text-xs text-muted-foreground">Projeção estimada pela IA</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Potencial de Ganhos/Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{displayPlan.potentialEarnings}</div>
              <p className="text-xs text-muted-foreground">Baseado em publis e parcerias no seu nicho</p>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plano Semanal Recomendado</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayPlan.weeklyPlan}</div>
              <p className="text-xs text-muted-foreground">Foco em consistência e {formData.priority?.toLowerCase()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-bold"><TrendingUp className="h-5 w-5 text-primary" /> Curva de Crescimento de Seguidores</CardTitle>
                <CardDescription>Projeção da IA (azul) vs. seu crescimento real (verde) para a meta de {formData.followerGoal?.toLocaleString('pt-BR')} seguidores.</CardDescription>
            </CardHeader>
             <CardContent className="h-[350px] pl-0">
                <GrowthChart 
                    initialFollowers={formData.followers} 
                    goalFollowers={formData.followerGoal} 
                    timeToGoal={displayPlan.timeToGoal}
                    realFollowersHistory={tiktokAccount?.followerHistory || []}
                />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bold"><Lightbulb className="h-5 w-5 text-amber-400"/> 3 Ganchos para seu Nicho ({formData.niche})</CardTitle>
                    <CardDescription>Ideias de inícios de vídeo para capturar a atenção imediatamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayPlan.hookIdeas.map((idea, index) => (
                    <p key={index}>{index + 1}. "{idea}"</p>
                  ))}
                </CardContent>
            </Card>
             <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bold"><Sparkles className="h-5 w-5 text-emerald-400"/> 3 Trends em Alta para {formData.niche}</CardTitle>
                     <CardDescription>Formatos e áudios que estão viralizando agora.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayPlan.trendIdeas.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary">{trend.type}</Badge> 
                      <span>{trend.description}</span>
                    </div>
                  ))}
                </CardContent>
            </Card>
        </div>

        <div className="text-center space-y-4 pt-8">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link">Ver como a IA calculou o plano <Info className='ml-2 size-4'/></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle className="font-bold">Metodologia do Plano de IA</DialogTitle>
                    <DialogDescription>
                        Nossas estimativas são baseadas em uma análise de mais de 10.000 perfis dentro do seu nicho e país. Consideramos os seguintes fatores:
                    </DialogDescription>
                    </DialogHeader>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pt-2">
                        <li><strong>Crescimento de Seguidores:</strong> Projetado com base na sua frequência de postagem, nicho e taxas de engajamento médias do setor.</li>
                        <li><strong>Potencial de Ganhos:</strong> Estimado a partir de valores de mercado para parcerias e publiposts, correlacionando o seu número de seguidores e engajamento.</li>
                        <li><strong>Plano Recomendado:</strong> Sugestões otimizadas para equilibrar a produção de conteúdo com a máxima chance de crescimento, de acordo com a sua prioridade (alcance, conversão ou autoridade).</li>
                    </ul>
                     <p className="text-xs text-center text-muted-foreground pt-4">Lembre-se: estes são dados estimados e não garantem resultados.</p>
                </DialogContent>
            </Dialog>
        </div>
      </div>
    }
    {!isCalculating && !displayPlan && (
      <Card className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <Rocket className="size-10 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mt-2">Gere seu Plano de Crescimento</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">Preencha o formulário acima e clique em "Gerar Plano" para que a nossa IA crie uma estratégia personalizada para você.</p>
        </CardContent>
      </Card>
    )}
    </div>
  );
}
