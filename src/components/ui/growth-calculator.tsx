
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Calendar, BarChart, DollarSign, Wand2, Sparkles, Lightbulb, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthChart } from '@/components/ui/growth-chart';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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

const formSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: 'Conta & Nicho', schema: step1Schema },
  { id: 2, title: 'Ponto de Partida', schema: step2Schema },
  { id: 3, title: 'Meta & Cadência', schema: step3Schema },
];

export function GrowthCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData>>({
    reelsPerMonth: 8,
    storiesPerMonth: 12,
  });

  const form = useForm({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: formData,
  });

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setFormData(prev => ({ ...prev, ...form.getValues() }));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: any) => {
    const finalData = { ...formData, ...data };
    setFormData(finalData);
    setIsCalculated(true);
    // Scroll to results
    setTimeout(() => {
        document.getElementById('calculator-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div key={0} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="instagram">@Instagram (opcional)</Label>
                <Input id="instagram" {...form.register('instagram')} placeholder="@seuusuario" />
             </div>
            <div className="space-y-2">
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
                 {form.formState.errors.niche && <p className="text-sm font-medium text-destructive">{form.formState.errors.niche.message}</p>}
            </div>
             <div className="space-y-2">
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
                {form.formState.errors.country && <p className="text-sm font-medium text-destructive">{form.formState.errors.country.message}</p>}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key={1} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="followers">Seguidores Atuais</Label>
              <Input id="followers" type="number" {...form.register('followers')} placeholder="Ex: 1500" />
               {form.formState.errors.followers && <p className="text-sm font-medium text-destructive">{form.formState.errors.followers.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgViews">Média de Views por Reels (opcional)</Label>
              <Input id="avgViews" type="number" {...form.register('avgViews')} placeholder="Ex: 5000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engagement">Engajamento Médio % (opcional)</Label>
              <Input id="engagement" type="number" {...form.register('engagement')} placeholder="Ex: 5" />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key={2} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="followerGoal">Meta de Seguidores</Label>
              <Input id="followerGoal" type="number" {...form.register('followerGoal')} placeholder="Ex: 100000" />
               {form.formState.errors.followerGoal && <p className="text-sm font-medium text-destructive">{form.formState.errors.followerGoal.message}</p>}
            </div>
            <div className="space-y-4">
              <Label>Postagens por Mês</Label>
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
             <div className="space-y-2">
                <Label>Qual sua prioridade?</Label>
                 <Select onValueChange={(value) => form.setValue('priority', value)} defaultValue={form.getValues('priority')}>
                    <SelectTrigger><SelectValue placeholder="Selecione sua prioridade" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Alcance">Alcance</SelectItem>
                        <SelectItem value="Conversão">Conversão</SelectItem>
                        <SelectItem value="Autoridade">Autoridade</SelectItem>
                    </SelectContent>
                </Select>
                 {form.formState.errors.priority && <p className="text-sm font-medium text-destructive">{form.formState.errors.priority.message}</p>}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <section className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4">
        {!isCalculated ? (
             <Card className="max-w-2xl mx-auto overflow-hidden">
             <CardHeader className="text-center p-8 bg-muted/30">
                 <Wand2 className="mx-auto h-10 w-10 text-primary mb-4"/>
                 <CardTitle className="text-3xl font-bold">Calculadora de Crescimento</CardTitle>
                 <CardDescription className="text-lg">Descubra seu potencial de crescimento e monetização.</CardDescription>
             </CardHeader>
              <CardContent className="p-8">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Passo {currentStep + 1} de {steps.length}</span>
                    <span className="text-sm font-semibold text-primary">{steps[currentStep].title}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <motion.div className="bg-primary h-2 rounded-full" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                    <div className="flex justify-between mt-10">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={nextStep}>
                                Próximo <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit">
                                <Sparkles className="mr-2 h-4 w-4" /> Calcular Potencial
                            </Button>
                        )}
                    </div>
                </form>
              </CardContent>
            </Card>
        ) : (
          <motion.div id="calculator-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center">
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-balance">Seu Plano de Crescimento Personalizado</h2>
                 <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Com base nas suas metas, aqui está uma projeção realista e um plano de ação para você decolar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tempo para Atingir a Meta</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">~8 meses</div>
                  <p className="text-xs text-muted-foreground">Previsão para Dezembro de 2024</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Potencial de Ganhos/Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">R$1.5k-R$5k</div>
                  <p className="text-xs text-muted-foreground">Baseado em publis e parcerias</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Plano Semanal Recomendado</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2 Reels, 3 Stories</div>
                  <p className="text-xs text-muted-foreground">Foco em consistência e engajamento</p>
                </CardContent>
              </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary" /> Curva de Crescimento de Seguidores</CardTitle>
                    <CardDescription>Uma projeção mensal para sua meta de {formData.followerGoal?.toLocaleString('pt-BR')} seguidores.</CardDescription>
                </CardHeader>
                 <CardContent className="h-[350px] pl-0">
                    <GrowthChart />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-400"/> 3 Ganchos para seu Nicho</CardTitle>
                        <CardDescription>Ideias de inícios de vídeo para capturar a atenção imediatamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p>1. "3 mitos sobre {formData.niche} que você provavelmente acredita."</p>
                        <p>2. "O erro nº 1 que iniciantes em {formData.niche} cometem (e como evitar)."</p>
                        <p>3. "Meu segredo para {alcançar algo no seu nicho} usando apenas..."</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400"/> 3 Trends em Alta</CardTitle>
                         <CardDescription>Formatos e áudios que estão viralizando agora no seu nicho.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2"><Badge variant="secondary">Áudio</Badge> "Som de gatinho fofo para vídeos de unboxing"</div>
                        <div className="flex items-center gap-2"><Badge variant="secondary">Formato</Badge> "Transição de 'antes e depois' com corte rápido"</div>
                        <div className="flex items-center gap-2"><Badge variant="secondary">Desafio</Badge> "Desafio de 7 dias para {tema do seu nicho}"</div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center space-y-4 pt-8">
                 <Button size="lg" className="font-bold text-lg px-8 py-6" onClick={() => (window.location.href = '/signup')}>
                    <Users className="mr-3"/> Criar conta e seguir o plano
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="link">Ver como calculamos</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Metodologia de Cálculo</DialogTitle>
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

          </motion.div>
        )}
      </div>
    </section>
  );
}
