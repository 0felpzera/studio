
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, Sparkles, Wand2, X } from 'lucide-react';
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
  Timestamp,
  query,
  updateDoc,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { ContentTask } from '@/lib/types';


const formSchema = z.object({
  niche: z.string().min(2, 'O nicho é obrigatório.'),
  goals: z.string().min(10, 'Por favor, descreva seus objetivos com mais detalhes.'),
  postingFrequency: z.string({
    required_error: 'A frequência de postagem é obrigatória.',
  }),
});

type PendingTask = Omit<ContentTask, 'id' | 'date'> & { date?: Timestamp };

const parseCalendarResponse = (
  response: GenerateWeeklyContentCalendarOutput,
  userId: string
): PendingTask[] => {
  return response.calendar.map((idea) => {
    return {
      userId,
      platform: idea.platform,
      description: `${idea.title} - ${idea.description}`,
      isCompleted: false,
      status: 'pending',
    };
  });
};

export default function ContentCalendar() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PendingTask[] | null>(null);

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const contentTasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'contentTasks'));
  }, [firestore, user]);

  const { data: calendar, isLoading: isLoadingTasks } =
    useCollection<ContentTask>(contentTasksQuery);

  const activeTasks = useMemo(() => calendar?.filter(t => t.status !== 'pending') || [], [calendar]);
  const pendingTasksFromDB = useMemo(() => calendar?.filter(t => t.status === 'pending') || [], [calendar]);

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
      toast({ title: 'Erro', description: 'Você precisa estar logado.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setPendingPlan(null);

    try {
      // Clear any previous pending tasks from DB before generating a new plan
      const pendingQuery = query(collection(firestore, 'users', user.uid, 'contentTasks'), where('status', '==', 'pending'));
      const pendingDocs = await getDocs(pendingQuery);
      if (!pendingDocs.empty) {
        const batch = writeBatch(firestore);
        pendingDocs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      
      const result: GenerateWeeklyContentCalendarOutput =
        await generateWeeklyContentCalendar(values);
      const newTasks = parseCalendarResponse(result, user.uid);
      setPendingPlan(newTasks);

      toast({
        title: 'Sugestão Pronta!',
        description: 'Um novo plano de conteúdo foi gerado. Revise e aprove.',
      });
    } catch (error: any) {
      console.error('Erro ao gerar o calendário de conteúdo:', error);
      toast({
        title: 'Oh não! Algo deu errado.',
        description: 'Não foi possível gerar seu plano. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const acceptPlan = async () => {
    const planToSave = pendingPlan || (pendingTasksFromDB.length > 0 ? pendingTasksFromDB : null);
    if (!user || !firestore || !planToSave || planToSave.length === 0) {
      toast({ title: "Erro", description: "Nenhum plano pendente para salvar.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
        const batch = writeBatch(firestore);
        
        // Clear any existing active tasks
        const existingTasksQuery = query(collection(firestore, 'users', user.uid, 'contentTasks'), where('status', '==', 'active'));
        const existingDocs = await getDocs(existingTasksQuery);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        // Add new tasks
        planToSave.forEach((task, index) => {
            const docRef = doc(collection(firestore, 'users', user.uid, 'contentTasks'));
            const taskDate = new Date();
            taskDate.setDate(taskDate.getDate() + index); // Stagger dates
            
            batch.set(docRef, { ...task, date: Timestamp.fromDate(taskDate), status: 'active' });
        });
        
        await batch.commit();
        setPendingPlan(null);
        toast({ title: "Sucesso!", description: "Seu novo plano de conteúdo foi salvo e está ativo!" });
    } catch (error) {
        console.error("Erro ao aceitar o plano:", error);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o plano. Tente novamente.", variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  };

  const dismissPlan = () => {
      setPendingPlan(null);
      // The pending tasks in the DB will be cleared the next time a new plan is generated.
      // This provides a simpler UX.
      toast({ title: "Plano Dispensado", description: "A sugestão de plano foi removida." });
  }

  const toggleTaskCompletion = (taskId: string, currentStatus: boolean) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, 'users', user.uid, 'contentTasks', taskId);
    updateDoc(taskRef, { isCompleted: !currentStatus });
  };
  
  const sortedCalendar = useMemo(() => {
    if (!activeTasks) return [];
    return [...activeTasks].sort((a, b) => {
        const dateA = a.date?.toDate() ?? new Date(0);
        const dateB = b.date?.toDate() ?? new Date(0);
        return dateA.getTime() - dateB.getTime();
    });
  }, [activeTasks]);

  const completedTasks = activeTasks?.filter((task) => task.isCompleted).length || 0;
  const totalTasks = activeTasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const displayPlan = pendingPlan || (pendingTasksFromDB.length > 0 ? pendingTasksFromDB : null);


  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Defina Sua Estratégia</CardTitle>
            <CardDescription>Diga à IA o que você quer alcançar.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
            <CardContent>
              <div className="space-y-6">
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
              </div>
            </CardContent>
            <CardFooter>
                 <Button
                  type="submit"
                  disabled={isLoading || isUserLoading}
                  className="w-full font-bold"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className='mr-2' /> Gerar Novo Plano</> }
                </Button>
            </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <div className="md:col-span-2">
        
        {displayPlan ? (
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-bold flex items-center gap-2"><Sparkles className='text-primary'/> Sugestão de Plano Semanal</CardTitle>
                    <CardDescription>A IA gerou o seguinte plano de conteúdo para você. O que acha?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {displayPlan.map((task, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg border">
                           <div className="flex-1">
                                <p className="font-medium">{task.description}</p>
                           </div>
                           <Badge variant="secondary">{task.platform}</Badge>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={acceptPlan} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Check className="mr-2" />}
                        Aceitar e Salvar Plano
                    </Button>
                    <Button variant="ghost" onClick={dismissPlan} disabled={isSaving}>
                        <X className="mr-2" /> Dispensar
                    </Button>
                </CardFooter>
            </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold">Checklist da Semana</CardTitle>
                    <CardDescription>
                        {totalTasks > 0 ? `Você completou ${completedTasks} de ${totalTasks} tarefas esta semana.` : "Nenhuma tarefa ativa. Gere um plano para começar!"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {totalTasks > 0 && <Progress value={progress} className="mb-6" />}
                    {(isLoading || isLoadingTasks) && !displayPlan && (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="size-12 animate-spin text-primary" />
                      </div>
                    )}
                    {!isLoading && !isLoadingTasks && totalTasks === 0 && !displayPlan && (
                      <div className="flex flex-col items-center justify-center h-48 text-center rounded-lg border-2 border-dashed">
                        <h3 className="text-xl font-semibold">
                          Seu plano aparecerá aqui
                        </h3>
                        <p className="text-muted-foreground">
                          Preencha o formulário para começar!
                        </p>
                      </div>
                    )}
                    {sortedCalendar.length > 0 && (
                         <div className="space-y-4">
                            {sortedCalendar.map((task) => (
                              <div
                                key={task.id}
                                className={`transition-all flex items-center gap-4 p-4 rounded-lg border ${
                                  task.isCompleted ? 'bg-muted/50' : 'bg-background'
                                }`}
                              >
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.isCompleted}
                                    onCheckedChange={() => toggleTaskCompletion(task.id, task.isCompleted)}
                                    className="size-5"
                                />
                                <div className="grid gap-1.5 flex-1">
                                  <label
                                    htmlFor={`task-${task.id}`}
                                    className={`font-medium cursor-pointer ${
                                      task.isCompleted
                                        ? 'line-through text-muted-foreground/80'
                                        : ''
                                    }`}
                                  >
                                    {task.description}
                                  </label>
                                  <div className="flex items-center gap-2">
                                     <Badge variant="outline">{task.platform}</Badge>
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {task.date ? new Date(task.date.toDate()).toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Data pendente'}
                                      </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                         </div>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
