"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { generateSponsoredContentIdeas, GenerateSponsoredContentIdeasOutput } from "@/ai/flows/generate-sponsored-content-ideas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  productDescription: z.string().min(10, "Por favor, descreva o produto com mais detalhes."),
  userNiche: z.string().min(2, "Seu nicho é obrigatório."),
});

export default function SponsoredContentIdeator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateSponsoredContentIdeasOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: "Um novo suplemento de proteína sabor chocolate da Marca X.",
      userNiche: "Fitness e Receitas Saudáveis",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateSponsoredContentIdeas(values);
      setResult(response);
      toast({
        title: "Ideias Geradas!",
        description: "Aqui estão alguns conceitos criativos para seu post patrocinado.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar ideias de conteúdo patrocinado:", error);
      
      let description = "Não foi possível gerar ideias. Por favor, tente novamente.";
      if (typeof error.message === 'string' && error.message.includes('503')) {
        description = "O serviço de IA está sobrecarregado. Por favor, tente novamente em alguns minutos.";
      }

      toast({
        title: "Oh não! Algo deu errado.",
        description: description,
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
            <CardTitle className="font-bold">Detalhes da Parceria</CardTitle>
            <CardDescription>Descreva o produto que você está promovendo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Produto</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Um novo hidratante vegano da..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userNiche"
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
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Gerar Ideias</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <div className="space-y-6">
          {isLoading && (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-16 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                </CardContent>
            </Card>
          )}
          {!isLoading && !result && (
             <Card className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                <CardHeader>
                    <div className="mx-auto bg-secondary p-3 rounded-full">
                        <Sparkles className="size-8 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-semibold mt-2">Suas ideias de conteúdo patrocinado aparecerão aqui</h3>
                    <p className="text-muted-foreground mt-2">Preencha o formulário para começar.</p>
                </CardContent>
             </Card>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Ideias de Conteúdo Criativas</CardTitle>
                  <CardDescription>Aqui estão 3 maneiras autênticas de apresentar o produto.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 list-decimal list-inside">
                    {result.contentIdeas.map((idea, index) => (
                      <li key={index} className="pl-2">{idea}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Formatos Sugeridos</CardTitle>
                  <CardDescription>Esses formatos têm bom desempenho para o seu nicho.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.formatSuggestions.map((format, index) => (
                      <Badge key={index} variant="secondary" appearance='light' className="text-base px-3 py-1">{format}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
