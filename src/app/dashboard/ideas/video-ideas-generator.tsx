"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wand2 } from "lucide-react";
import { suggestRelevantVideoIdeas, VideoIdeasOutput } from "@/ai/flows/suggest-relevant-video-ideas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  niche: z.string().min(2, "O nicho é obrigatório."),
  currentTrends: z.string().min(10, "Por favor, descreva algumas tendências atuais."),
});

export default function VideoIdeasGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoIdeas, setVideoIdeas] = useState<VideoIdeasOutput['videoIdeas']>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "Estilo de Vida e Produtividade",
      currentTrends: "Unboxing ASMR, rotinas matinais 'arrume-se comigo', áudios em alta com cortes rápidos.",
    },
  });

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

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">Inspire-se</CardTitle>
            <CardDescription>Diga à IA sobre o que você fala.</CardDescription>
          </CardHeader>
          <CardContent>
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
