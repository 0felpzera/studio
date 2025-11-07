
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Calendar, DollarSign, Sparkles, Target, User, Activity, Goal, TrendingUp, Users, Lightbulb, Check, AreaChart, CheckCircle2, Loader2 } from 'lucide-react';
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
import type { GenerateGrowthPlanInput, GenerateGrowthPlanOutput } from '@/lib/types';


const step1Schema = z.object({
  niche: z.string().min(1, "O nicho é obrigatório"),
  country: z.string().min(1, "O país é obrigatório"),
  instagram: z.string().optional(),
});

const step2Schema = z.object({
  followers: z.coerce.number().min(0, "O número de seguidores não pode ser negativo"),
  avgViews: z.coerce.number().min(0, "A média de views não pode ser negativa").optional(),
  engagement: z.coerce.number().min(0).max(100).optional(),
});

const step3Schema = z.object({
  followerGoal: z.coerce.number().min(1, "A meta de seguidores é obrigatória"),
  reelsPerMonth: z.number().min(0).max(60),
  storiesPerMonth: z.number().min(0).max(100),
  priority: z.string().min(1, "A prioridade é obrigatória"),
});

const allSchemas = [step1Schema, step2Schema, step3Schema];

const formSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: 'Conta & Nicho', schema: step1Schema, icon: User, description: 'Nos diga sobre seu perfil.' },
  { id: 2, title: 'Ponto de Partida', schema: step2Schema, icon: Activity, description: 'Quais suas métricas atuais?' },
  { id: 3, title: 'Meta & Cadência', schema: step3Schema, icon: Goal, description: 'Quais seus objetivos?' },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function GrowthCalculator() {
  const [[currentStep, direction], setStep] = useState([0, 0]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [highestStep, setHighestStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({
    niche: 'Moda',
    country: 'Brasil',
    followers: 1500,
    followerGoal: 100000,
    reelsPerMonth: 8,
    storiesPerMonth: 12,
    priority: 'Alcance'
  });
  const [plan, setPlan] = useState<GenerateGrowthPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(allSchemas[currentStep]),
    defaultValues: formData,
    mode: 'onChange',
  });
  
  const paginate = (newDirection: number) => {
    setStep([currentStep + newDirection, newDirection]);
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setStep([stepIndex, -1]);
      return;
    }
    
    const isValid = await form.trigger();
    if (isValid && stepIndex > currentStep) {
      setStep([stepIndex, 1]);
      setHighestStep(Math.max(highestStep, stepIndex));
    }
  };


   const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const currentValues = form.getValues();
      const updatedFormData = { ...formData, ...currentValues };
      setFormData(updatedFormData);
      
      if (currentStep < steps.length - 1) {
        paginate(1);
        setHighestStep(Math.max(highestStep, currentStep + 1));
        form.reset(updatedFormData);
      } else {
        onSubmit(updatedFormData as FormData);
      }
    } else {
         toast({
            title: "Campos Incompletos",
            description: "Por favor, preencha todos os campos obrigatórios antes de avançar.",
            variant: "destructive"
        });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const currentValues = form.getValues();
      const updatedFormData = { ...formData, ...currentValues };
      setFormData(updatedFormData);
      
      paginate(-1);
      form.reset(updatedFormData);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    setFormData(data);
    try {
      const result = await generateGrowthPlan({
        ...data,
        followers: Number(data.followers),
        followerGoal: Number(data.followerGoal),
      });
      setPlan(result);
      setIsCalculated(true);
      setTimeout(() => {
        document.getElementById('calculator-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
    
  
  const renderStepContent = () => {
    const contentKey = steps[currentStep].id;
    return (
       <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={contentKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          {
            currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="instagram">@Instagram (opcional)</Label>
                    <Input id="instagram" {...form.register('instagram')} placeholder="@seuusuario" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="niche">Nicho</Label>
                      <Select onValueChange={(value) => form.setValue('niche', value)} defaultValue={form.getValues('niche')}>
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
                    <Label htmlFor="country">País/Região</Label>
                      <Select onValueChange={(value) => form.setValue('country', value)} defaultValue={form.getValues('country')}>
                        <SelectTrigger><SelectValue placeholder="Selecione seu país" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Brasil">Brasil</SelectItem>
                            <SelectItem value="Portugal">Portugal</SelectItem>
                            <SelectItem value="EUA">EUA</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.country && <p className="text-xs font-medium text-destructive">{form.formState.errors.country.message}</p>}
                </div>
              </div>
            )
          }
          {
            currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="followers">Seguidores Atuais</Label>
                  <Input id="followers" type="number" {...form.register('followers')} placeholder="Ex: 1500" />
                    {form.formState.errors.followers && <p className="text-xs font-medium text-destructive">{form.formState.errors.followers.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avgViews">Média de Views por Reels (opcional)</Label>
                  <Input id="avgViews" type="number" {...form.register('avgViews')} placeholder="Ex: 5000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="engagement">Engajamento Médio % (opcional)</Label>
                  <Input id="engagement" type="number" {...form.register('engagement')} placeholder="Ex: 5" />
                </div>
              </div>
            )
          }
          {
            currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="followerGoal">Meta de Seguidores</Label>
                  <Input id="followerGoal" type="number" {...form.register('followerGoal')} placeholder="Ex: 100000" />
                    {form.formState.errors.followerGoal && <p className="text-xs font-medium text-destructive">{form.formState.errors.followerGoal.message}</p>}
                </div>
                <div className="space-y-3">
                  <Label className="font-medium">Postagens por Mês</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="reelsPerMonth" className="text-sm">Reels</Label>
                        <span className="text-sm font-bold text-primary">{form.watch('reelsPerMonth')}</span>
                    </div>
                    <Slider id="reelsPerMonth" defaultValue={[formData.reelsPerMonth || 8]} max={60} step={1} onValueChange={([val]) => form.setValue('reelsPerMonth', val)} />
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="storiesPerMonth" className="text-sm">Stories com CTA</Label>
                        <span className="text-sm font-bold text-primary">{form.watch('storiesPerMonth')}</span>
                      </div>
                    <Slider id="storiesPerMonth" defaultValue={[formData.storiesPerMonth || 12]} max={100} step={1} onValueChange={([val]) => form.setValue('storiesPerMonth', val)} />
                  </div>
                </div>
                  <div className="space-y-1.5">
                    <Label>Qual sua prioridade?</Label>
                      <Select onValueChange={(value) => form.setValue('priority', value)} defaultValue={form.getValues('priority')}>
                        <SelectTrigger><SelectValue placeholder="Selecione sua prioridade" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Alcance">Alcance</SelectItem>
                            <SelectItem value="Conversão">Conversão</SelectItem>
                            <SelectItem value="Autoridade">Autoridade</SelectItem>
                        </SelectContent>
                    </Select>
                      {form.formState.errors.priority && <p className="text-xs font-medium text-destructive">{form.formState.errors.priority.message}</p>}
                </div>
              </div>
            )
          }
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <section className="py-20 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="bg-card/60 p-4 sm:p-8 rounded-2xl border border-border/20 shadow-lg backdrop-blur-md">
          {!isCalculated ? (
            <motion.div 
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.2 }}
              }}
            >
              <motion.div 
                className="space-y-6"
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" }}
                }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance text-foreground">
                  Descubra seu Potencial de Crescimento
                </h2>
                <p className="text-lg text-muted-foreground">
                  Nossa calculadora de IA analisa seu perfil e metas para criar uma projeção de crescimento e monetização realista. Preencha os campos para receber um plano personalizado.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Visualize seu crescimento</span> com um gráfico de projeção mensal.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Estime seu potencial de ganhos</span> com parcerias e publicidade.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary mt-1 flex-shrink-0" />
                    <span><span className="font-semibold text-foreground">Receba um plano de ação semanal</span> com ideias de conteúdo para seu nicho.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                className="relative"
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" }}
                }}
              >
                 <div className="absolute -inset-4 opacity-50 dark:opacity-20 pointer-events-none">
                  <div className="w-full h-full blur-2xl [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
                    <GrowthChart initialFollowers={2500} goalFollowers={50000} />
                  </div>
                 </div>

                <Card className="relative bg-card/60 backdrop-blur-lg border border-border/20 shadow-2xl">
                    <CardHeader className="border-b border-border/20">
                       <ul className="flex justify-around">
                        {steps.map((step, index) => {
                          const isCompleted = index < currentStep;
                          const isCurrent = currentStep === index;
                          const Icon = step.icon;
                          
                          return (
                            <li key={step.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => handleStepClick(index)}>
                              <div className={cn("size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                                isCompleted ? 'bg-primary text-primary-foreground' : 
                                isCurrent ? 'bg-primary/10 border-2 border-primary text-primary scale-110' :
                                'bg-muted text-muted-foreground group-hover:bg-muted/80'
                              )}>
                                {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
                              </div>
                              <h3 className={cn("text-sm font-semibold transition-colors text-center", isCurrent ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>{step.title}</h3>
                            </li>
                          )
                        })}
                       </ul>
                  </CardHeader>

                  <form>
                        <CardContent className="p-6 min-h-[350px] flex items-center justify-center overflow-hidden relative">
                           {renderStepContent()}
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 bg-muted/30 border-t border-border/20">
                            <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0 || isCalculating}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            <Button type="button" onClick={nextStep} disabled={isCalculating}>
                                {isCalculating ? <Loader2 className="animate-spin mr-2" /> : null}
                                {isCalculating ? 'Calculando...' : currentStep < steps.length - 1 ? 'Próximo' : 'Calcular Potencial'} 
                                {!isCalculating && (currentStep < steps.length - 1 ? <ArrowRight className="ml-2 h-4 w-4" /> : <Sparkles className="ml-2 h-4 w-4" />)}
                            </Button>
                        </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </motion.div>
        ) : (
          plan && <div id="calculator-results" className="space-y-12">
            <div className="text-center">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Seu Plano de Crescimento Personalizado</h2>
                 <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Com base nas suas metas, aqui está uma projeção realista e um plano de ação para você decolar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tempo para Atingir a Meta</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{plan.timeToGoal}</div>
                  <p className="text-xs text-muted-foreground">Projeção estimada pela IA</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Potencial de Ganhos/Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{plan.potentialEarnings}</div>
                  <p className="text-xs text-muted-foreground">Baseado em publis e parcerias no seu nicho</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Plano Semanal Recomendado</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{plan.weeklyPlan}</div>
                  <p className="text-xs text-muted-foreground">Foco em consistência e {formData.priority?.toLowerCase()}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/60 backdrop-blur-lg border border-border/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bold"><TrendingUp className="h-5 w-5 text-primary" /> Curva de Crescimento de Seguidores</CardTitle>
                    <CardDescription>Uma projeção para sua meta de {formData.followerGoal?.toLocaleString('pt-BR')} seguidores em {plan.timeToGoal}.</CardDescription>
                </CardHeader>
                 <CardContent className="h-[350px] pl-0">
                    <GrowthChart 
                        initialFollowers={formData.followers} 
                        goalFollowers={formData.followerGoal} 
                        timeToGoal={plan.timeToGoal}
                    />
                </CardContent>
            </Card>

            <div className="text-center space-y-4 pt-8">
                 <Button size="lg" className="font-bold text-lg px-8 py-6" onClick={() => (window.location.href = '/signup')}>
                    <Users className="mr-3"/> crie sua conta e faça seu plano
                </Button>
                <div className='flex items-center justify-center gap-4'>
                    <Button variant="outline" onClick={() => { setIsCalculated(false); setPlan(null); }}>Refazer cálculo</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link">Ver como calculamos</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle className="font-bold">Metodologia de Cálculo</DialogTitle>
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
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
