'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, Circle } from 'lucide-react';
import {
  generateWeeklyContentCalendar,
  GenerateWeeklyContentCalendarOutput,
} from '@/ai/flows/generate-weekly-content-calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  niche: z.string().min(2, 'O nicho é obrigatório.'),
  goals: z.string().min(10, 'Por favor, descreva seus objetivos com mais detalhes.'),
  postingFrequency: z.string({
    required_error: 'A frequência de postagem é obrigatória.',
  }),
});

type ContentTask = {
  id: string;
  userId: string;
  date: Timestamp;
  platform: string;
  description: string;
  isCompleted: boolean;
};

const parseCalendarString = (
  calendarString: string,
  userId: string
): Omit<ContentTask, 'id' | 'date'>[] => {
  const lines = calendarString
    .trim()
    .split('\n')
    .filter((line) => line.trim() !== '' && line.includes(':'));
  return lines.map((line) => {
    const [dayPart, ...rest] = line.split(':');
    const idea = rest.join(':').trim();
    const platformMatch = idea.match(/\((.*?)\)/);
    const platform = platformMatch ? platformMatch[1] : 'Reels';
    const description = idea.replace(/\(.*?\)\s*-\s*/, '').trim();

    return {
      userId,
      platform,
      description,
      isCompleted: false,
    };
  });
};

export default function ContentCalendar() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const contentTasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Allow reading of empty collections by applying rules to the path, not the resource
    const contentTasksCollection = collection(firestore, 'users', user.uid, 'contentTasks');
    return query(contentTasksCollection);
  }, [firestore, user]);

  const { data: calendar, isLoading: isLoadingTasks } =
    useCollection<ContentTask>(contentTasksQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: 'Moda Sustentável',
      goals: 'Alcançar 10.000 seguidores e aumentar o engajamento em 5%',
      postingFrequency: '3-5 times per week',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para gerar um plano.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result: GenerateWeeklyContentCalendarOutput =
        await generateWeeklyContentCalendar(values);
      const newTasks = parseCalendarString(result.calendar, user.uid);

      const batch = writeBatch(firestore);
      newTasks.forEach((task) => {
        const docRef = doc(
          collection(firestore, 'users', user.uid, 'contentTasks')
        );
        // Add timestamp here when creating the task object for the batch
        batch.set(docRef, { ...task, date: serverTimestamp() });
      });
      await batch.commit();

      toast({
        title: 'Sucesso!',
        description: 'Seu novo plano de conteúdo está pronto e salvo.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Erro ao gerar o calendário de conteúdo:', error);
      let description =
        'Não foi possível gerar seu plano de conteúdo. Por favor, tente novamente.';
      if (typeof error.message === 'string' && error.message.includes('503')) {
        description =
          'O serviço de IA está sobrecarregado. Por favor, tente novamente em alguns minutos.';
      }
      toast({
        title: 'Oh não! Algo deu errado.',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTaskCompletion = (taskId: string, currentStatus: boolean) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'contentTasks', taskId);
    updateDocumentNonBlocking(taskRef, { isCompleted: !currentStatus });
  };
  
  // Sort tasks by date client-side
  const sortedCalendar = useMemo(() => {
    if (!calendar) return [];
    return [...calendar].sort((a, b) => {
        const dateA = a.date?.toDate() ?? new Date(0);
        const dateB = b.date?.toDate() ?? new Date(0);
        return dateA.getTime() - dateB.getTime();
    });
  }, [calendar]);

  const completedTasks = calendar?.filter((task) => task.isCompleted).length || 0;
  const totalTasks = calendar?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Defina Sua Estratégia</CardTitle>
            <CardDescription>Diga à IA o que você quer alcançar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nicho Principal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Rotinas de skincare, esquetes de comédia"
                          {...field}
                        />
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
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência de postagem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-2 times per week">
                            1-2 vezes por semana
                          </SelectItem>
                          <SelectItem value="3-5 times per week">
                            3-5 vezes por semana
                          </SelectItem>
                          <SelectItem value="6-7 times per week">
                            6-7 vezes por semana
                          </SelectItem>
                          <SelectItem value="Daily">Diariamente</SelectItem>
                          <SelectItem value="Twice a day">2 vezes ao dia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading || isUserLoading}
                  className="w-full font-bold"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Gerar Meu Plano'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        {totalTasks > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-bold">Progresso Semanal</CardTitle>
              <CardDescription>
                Você completou {completedTasks} de {totalTasks} tarefas esta
                semana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          {(isLoading || isLoadingTasks) && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="size-12 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && !isLoadingTasks && totalTasks === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border-2 border-dashed">
              <h3 className="text-xl font-semibold">
                Seu plano aparecerá aqui
              </h3>
              <p className="text-muted-foreground">
                Preencha o formulário para começar!
              </p>
            </div>
          )}
          {sortedCalendar.map((plan) => (
            <Card
              key={plan.id}
              className={`transition-all ${
                plan.isCompleted ? 'bg-muted/50' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="font-bold flex items-center gap-2">
                    <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {plan.platform}
                    </span>
                  </CardTitle>
                  <CardDescription
                    className={
                      plan.isCompleted
                        ? 'line-through text-muted-foreground/80'
                        : ''
                    }
                  >
                    {plan.description}
                  </CardDescription>
                </div>
                <div
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background transition-colors cursor-pointer"
                  onClick={() =>
                    toggleTaskCompletion(plan.id, plan.isCompleted)
                  }
                >
                  <Checkbox
                    id={`task-${plan.id}`}
                    checked={plan.isCompleted}
                  />
                  <label
                    htmlFor={`task-${plan.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
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
