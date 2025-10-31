"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, DollarSign } from "lucide-react";
import { generateMediaKit, GenerateMediaKitOutput } from "@/ai/flows/generate-monetization-assistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  followerCount: z.coerce.number().min(1, "O número de seguidores é obrigatório."),
  engagementRate: z.coerce.number().min(0.01, "A taxa de engajamento deve ser de pelo menos 0.01."),
  niche: z.string().min(2, "O nicho é obrigatório."),
  averageViews: z.coerce.number().min(1, "A média de visualizações é obrigatória."),
  demographics: z.string().min(10, "A descrição da demografia é obrigatória."),
  topPosts: z.string().min(10, "Forneça links para seus posts principais, separados por vírgulas.")
});

export default function MonetizationAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateMediaKitOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      followerCount: 25000,
      engagementRate: 0.05,
      niche: "Beleza e Skincare",
      averageViews: 50000,
      demographics: "Mulheres, 18-24 anos, localizadas no Brasil, interessadas em produtos cruelty-free.",
      topPosts: "https://tiktok.com/post1, https://instagram.com/post2",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const formattedInput = {
        ...values,
        topPosts: values.topPosts.split(',').map(s => s.trim()),
      };
      const response: GenerateMediaKitOutput = await generateMediaKit(formattedInput);
      setResult(response);
      toast({
        title: "Mídia Kit Pronto!",
        description: "Seu mídia kit profissional e preços foram gerados.",
      });
    } catch (error) {
      console.error("Erro ao gerar mídia kit:", error);
      toast({
        title: "Oh não! Algo deu errado.",
        description: "Não foi possível gerar seu mídia kit. Por favor, tente novamente.",
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
            <CardTitle className="font-bold">Suas Métricas</CardTitle>
            <CardDescription>Forneça suas estatísticas mais recentes para um mídia kit preciso.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="followerCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Seguidores</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="engagementRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Engajamento (ex: 0.05 para 5%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="niche" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nicho</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="averageViews" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Média de Visualizações por Post</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="demographics" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demografia do Público</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="topPosts" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posts Principais (URLs, separadas por vírgula)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <> <DollarSign className="mr-2" />Gerar Mídia Kit</>}
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
                    <div className="h-20 w-full bg-muted rounded"></div>
                    <div className="h-20 w-full bg-muted rounded"></div>
                </CardContent>
            </Card>
          )}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed">
                <DollarSign className="size-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Seu mídia kit aparecerá aqui</h3>
                <p className="text-muted-foreground">Preencha suas métricas para gerar seu kit.</p>
            </div>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Preços Sugeridos</CardTitle>
                  <CardDescription>Com base em suas métricas e nicho, aqui estão alguns pontos de partida.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap font-sans">
                     {result.suggestedPricing}
                   </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-bold">Conteúdo do Mídia Kit</CardTitle>
                  <CardDescription>Copie este conteúdo para o seu mídia kit profissional.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap font-sans bg-muted p-4 rounded-md">
                     {result.mediaKitContent}
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
