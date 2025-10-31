"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, Circle } from "lucide-react";
import { generateWeeklyContentCalendar, GenerateWeeklyContentCalendarOutput } from "@/ai/flows/generate-weekly-content-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  niche: z.string().min(2, "O nicho é obrigatório."),
  goals: z.string().min(10, "Por favor, descreva seus objetivos com mais detalhes."),
  postingFrequency: z.string({ required_error: "A frequência de postagem é obrigatória." }),
});

type DayPlan = {
  day: string;
  platform: string;
  idea: string;
  completed: boolean;
};

const parseCalendarString = (calendarString: string): DayPlan[] => {
  const lines = calendarString.trim().split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
    const [dayPart, ...rest] = line.split(':');
    const day = dayPart.replace(/\*/g, '').trim();
    const restString = rest.join(':').trim();
    
    const platformMatch = restString.match(/\((.*?)\)/);
    const platform = platformMatch ? platformMatch[1] : 'Desconhecido';
    
    const idea = restString.replace(/\(.*?\)\s*-\s*/, '').trim();

    return { day, platform, idea, completed: false };
  });
};

export default function ContentCalendar() {
  const [isLoading, setIsLoading] = useState(false);
  const [calendar, setCalendar] = useState<DayPlan[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "Moda Sustentável",
      goals: "Alcançar 10.000 seguidores e aumentar o engajamento em 5%",
      postingFrequency: "3-5 times per week",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setCalendar([]);
    try {
      const result: GenerateWeeklyContentCalendarOutput = await generateWeeklyContentCalendar(values);
      const parsedCalendar = parseCalendarString(result.calendar);
      setCalendar(parsedCalendar);
      toast({
        title: "Sucesso!",
        description: "Seu novo plano de conteúdo está pronto.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao gerar o calendário de conteúdo:", error);
      toast({
        title: "Oh não! Algo deu errado.",
        description: "Não foi possível gerar seu plano de conteúdo. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTaskCompletion = (index: number) => {
    setCalendar(prev => 
      prev.map((task, i) => 
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedTasks = calendar.filter(task => task.completed).length;
  const totalTasks = calendar.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Defina Sua Estratégia</CardTitle>
            <CardDescription>Diga à IA o que você quer alcançar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nicho Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rotinas de skincare, esquetes de comédia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seus Objetivos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Atingir 10k seguidores em 3 meses" 
                          className="resize-none"
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onFocus={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de Postagem</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência de postagem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-2 times per week">1-2 vezes por semana</SelectItem>
                          <SelectItem value="3-5 times per week">3-5 vezes por semana</SelectItem>
                          <SelectItem value="6-7 times per week">6-7 vezes por semana</SelectItem>
                          <SelectItem value="Daily">Diariamente</SelectItem>
                          <SelectItem value="Twice a day">2 vezes ao dia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Gerar Meu Plano"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        {calendar.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-headline">Progresso Semanal</CardTitle>
              <CardDescription>Você completou {completedTasks} de {totalTasks} tarefas esta semana.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-12 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && calendar.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border-2 border-dashed">
                <h3 className="text-xl font-semibold">Seu plano aparecerá aqui</h3>
                <p className="text-muted-foreground">Preencha o formulário para começar!</p>
            </div>
          )}
          {calendar.map((plan, index) => (
            <Card key={index} className={`transition-all ${plan.completed ? 'bg-muted' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="font-headline flex items-center gap-2">
                    {plan.day}
                    <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{plan.platform}</span>
                  </CardTitle>
                  <CardDescription className={plan.completed ? 'line-through' : ''}>{plan.idea}</CardDescription>
                </div>
                 <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background transition-colors cursor-pointer" onClick={() => toggleTaskCompletion(index)}>
                    <Checkbox id={`task-${index}`} checked={plan.completed} onCheckedChange={() => toggleTaskCompletion(index)} />
                    <label htmlFor={`task-${index}`} className="text-sm font-medium leading-none cursor-pointer">
                      Feito
                    </label>
                  </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
