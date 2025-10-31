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
  niche: z.string().min(2, "Niche is required."),
  currentTrends: z.string().min(10, "Please describe some current trends."),
});

export default function VideoIdeasGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoIdeas, setVideoIdeas] = useState<VideoIdeasOutput['videoIdeas']>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "Lifestyle and Productivity",
      currentTrends: "ASMR unboxing, 'get ready with me' morning routines, trending audio with quick cuts.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setVideoIdeas([]);
    try {
      const result: VideoIdeasOutput = await suggestRelevantVideoIdeas(values);
      setVideoIdeas(result.videoIdeas);
      toast({
        title: "Ideas are flowing!",
        description: "Here are some fresh video concepts for you.",
      });
    } catch (error) {
      console.error("Error generating video ideas:", error);
      toast({
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate video ideas. Please try again.",
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
            <CardTitle className="font-headline">Get Inspired</CardTitle>
            <CardDescription>Tell the AI what you're about.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Niche</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fitness, Gaming, Beauty" {...field} />
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
                      <FormLabel>Current Trends You've Noticed</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Specific audios, challenges, video formats" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" />Suggest Ideas</>}
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
            <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border-2 border-dashed">
                <Wand2 className="size-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Your video ideas will appear here</h3>
                <p className="text-muted-foreground">Fill out the form to brainstorm with AI!</p>
            </div>
          )}
          {videoIdeas.length > 0 && (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {videoIdeas.map((idea, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card">
                  <AccordionTrigger className="p-6 text-left hover:no-underline">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{idea.title}</h3>
                            <Badge variant={idea.type === 'Trending' ? 'default' : 'secondary'} className={idea.type === 'Trending' ? 'bg-accent text-accent-foreground' : ''}>
                                {idea.type}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground bg-background/50 p-4 rounded-md">
                        <h4 className="font-semibold">Script Outline:</h4>
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
