
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wand2, Save, Bookmark, Trash2 } from "lucide-react";
import { suggestRelevantVideoIdeas, VideoIdeasOutput } from "@/ai/flows/suggest-relevant-video-ideas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import type { SavedVideoIdea } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  niche: z.string().min(2, "O nicho é obrigatório."),
  currentTrends: z.string().min(10, "Por favor, descreva algumas tendências atuais."),
});

type VideoIdea = VideoIdeasOutput['videoIdeas'][0];

export default function VideoIdeasGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [savingId, setSavingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "Estilo de Vida e Produtividade",
      currentTrends: "Unboxing ASMR, rotinas matinais 'arrume-se comigo', áudios em alta com cortes rápidos.",
    },
  });

  const savedIdeasQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'savedVideoIdeas'), orderBy('savedAt', 'desc'));
  }, [user, firestore]);

  const { data: savedIdeas, isLoading: isLoadingSaved } = useCollection<SavedVideoIdea>(savedIdeasQuery);
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setVideoIdeas([]);
    try {
      const result: VideoIdeasOutput = await suggestRelevantVideoIdeas(values);
      setVideoIdeas(result.videoIdeas);
      toast({
        title: "As ideias estão fluindo!",
        description: "Aqui estão alguns conceitos de vídeo fresquinhos para você.",
      });
    } catch (error) {
      console.error("Erro ao gerar ideias de vídeo:", error);
      toast({
        title: "Oh não! Algo deu errado.",
        description: "Não foi possível gerar ideias de vídeo. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveIdea = async (idea: VideoIdea) => {
    if (!user || !firestore) {
        toast({ title: "Erro", description: "Você precisa estar logado para salvar ideias.", variant: "destructive" });
        return;
    }
    setSavingId(idea.title); 
    try {
        const ideasCollection = collection(firestore, 'users', user.uid, 'savedVideoIdeas');
        await addDoc(ideasCollection, {
            ...idea,
            userId: user.uid,
            savedAt: serverTimestamp(),
        });
        toast({
            title: "Ideia Salva!",
            description: `"${idea.title}" foi adicionada ao seu banco de ideias.`,
        });
    } catch (error) {
        console.error("Erro ao salvar ideia:", error);
        toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar a ideia. Tente novamente.",
            variant: "destructive",
        });
    } finally {
        setSavingId(null);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!user || !firestore) return;
    setIsDeleting(ideaId);
    try {
      const ideaRef = doc(firestore, 'users', user.uid, 'savedVideoIdeas', ideaId);
      await deleteDoc(ideaRef);
      toast({
        title: "Ideia Removida",
        description: "A ideia foi removida do seu banco de ideias."
      });
    } catch (error) {
      console.error("Erro ao remover ideia:", error);
      toast({
        title: "Erro ao Remover",
        description: "Não foi possível remover a ideia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };


  return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Inspire-se</h3>
                <p className="text-sm text-muted-foreground">Diga à IA sobre o que você fala.</p>
              </div>
               <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary" size="icon" className="relative">
                      <Bookmark className="h-4 w-4" />
                      {savedIdeas && savedIdeas.length > 0 && (
                          <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                      )}
                       <span className="sr-only">Ver ideias salvas</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                      <SheetTitle>Suas Ideias Salvas</SheetTitle>
                      <SheetDescription>
                        Seu banco de ideias para nunca mais sofrer com bloqueio criativo.
                      </SheetDescription>
                    </SheetHeader>
                    <Dialog>
                    <div className="flex-1 overflow-y-auto pr-4">
                      {isLoadingSaved && (
                         <div className="space-y-4 mt-4">
                           {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="p-4 rounded-lg border bg-muted/50 space-y-2 animate-pulse">
                               <div className="h-4 w-3/4 bg-muted-foreground/20 rounded"></div>
                               <div className="h-3 w-full bg-muted-foreground/20 rounded"></div>
                             </div>
                           ))}
                         </div>
                      )}
                      {!isLoadingSaved && savedIdeas && savedIdeas.length > 0 ? (
                        <div className="space-y-4 mt-4">
                          {savedIdeas.map((idea) => (
                            <div key={idea.id} className="p-4 rounded-lg border bg-muted/50 group hover:bg-muted/80 transition-colors relative">
                                <DialogTrigger asChild>
                                  <div className="cursor-pointer">
                                      <h4 className="font-semibold text-foreground">{idea.title}</h4>
                                      <p className="text-sm text-muted-foreground line-clamp-1">{idea.description}</p>
                                  </div>
                                </DialogTrigger>
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100"
                                      >
                                        <Trash2 className="size-4 text-destructive" />
                                      </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente esta ideia salva.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteIdea(idea.id)} disabled={isDeleting === idea.id}>
                                         {isDeleting === idea.id ? <Loader2 className="size-4 animate-spin"/> : "Continuar"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Badge variant={idea.type === 'Trending' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-primary/20">
                                            {idea.type === 'Trending' ? 'Tendência' : 'Perene'}
                                        </Badge>
                                        {idea.title}
                                    </DialogTitle>
                                    <DialogDescription>{idea.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground bg-muted/50 p-4 rounded-md mt-4">
                                        <h4 className="font-semibold">Esboço do Roteiro:</h4>
                                        <pre className="whitespace-pre-wrap font-sans text-sm">{idea.scriptOutline}</pre>
                                    </div>
                                </DialogContent>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Bookmark className="size-12 text-muted-foreground/50" />
                          <h3 className="text-lg font-semibold mt-4">Nenhuma Ideia Salva</h3>
                          <p className="text-sm text-muted-foreground mt-1">Clique em "Salvar Ideia" para começar a construir seu banco.</p>
                        </div>
                      )}
                    </div>
                    </Dialog>
                  </SheetContent>
                </Sheet>
            </div>
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nicho</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Fitness, Games, Beleza" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentTrends"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tendências Atuais que Você Notou</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ex: Áudios específicos, desafios, formatos de vídeo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full font-bold">
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" />Sugerir Ideias</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-4">
            {isLoading && (
               Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                      <CardHeader>
                          <div className="h-6 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                      </CardHeader>
                  </Card>
              ))
            )}
            {!isLoading && videoIdeas.length === 0 && (
               <Card className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                  <CardHeader>
                      <div className="mx-auto bg-secondary p-3 rounded-full">
                          <Wand2 className="size-8 text-muted-foreground" />
                      </div>
                  </CardHeader>
                  <CardContent>
                      <h3 className="text-xl font-semibold mt-2">Suas ideias de vídeo aparecerão aqui</h3>
                      <p className="text-muted-foreground mt-2">Preencha o formulário para ter um brainstorm com a IA!</p>
                  </CardContent>
               </Card>
            )}
            {videoIdeas.length > 0 && (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {videoIdeas.map((idea, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card/80">
                    <AccordionTrigger className="p-6 text-left hover:no-underline">
                      <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{idea.title}</h3>
                              <Badge variant={idea.type === 'Trending' ? 'default' : 'secondary'} className="bg-primary/10 text-primary border-primary/20">
                                  {idea.type === 'Trending' ? 'Tendência' : 'Perene'}
                              </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{idea.description}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground bg-muted/50 p-4 rounded-md">
                          <h4 className="font-semibold">Esboço do Roteiro:</h4>
                          <pre className="whitespace-pre-wrap font-sans text-sm">{idea.scriptOutline}</pre>
                      </div>
                      <div className="mt-4 text-right">
                          <Button
                              size="sm"
                              onClick={() => handleSaveIdea(idea)}
                              disabled={savingId === idea.title}
                          >
                              {savingId === idea.title ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <Save className="mr-2 h-4 w-4" />
                              )}
                              Salvar Ideia
                          </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>
  );
}
