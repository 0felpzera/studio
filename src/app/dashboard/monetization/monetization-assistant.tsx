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
  followerCount: z.coerce.number().min(1, "Follower count is required."),
  engagementRate: z.coerce.number().min(0.01, "Engagement rate must be at least 0.01."),
  niche: z.string().min(2, "Niche is required."),
  averageViews: z.coerce.number().min(1, "Average views are required."),
  demographics: z.string().min(10, "Demographics description is required."),
  topPosts: z.string().min(10, "Please provide links to your top posts, separated by commas.")
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
      niche: "Beauty and Skincare",
      averageViews: 50000,
      demographics: "Female, 18-24, located in the US, interested in cruelty-free products.",
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
        title: "Media Kit Ready!",
        description: "Your professional media kit and pricing are generated.",
      });
    } catch (error) {
      console.error("Error generating media kit:", error);
      toast({
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate your media kit. Please try again.",
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
            <CardTitle className="font-headline">Your Metrics</CardTitle>
            <CardDescription>Provide your latest stats for an accurate media kit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="followerCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follower Count</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="engagementRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement Rate (e.g., 0.05 for 5%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="niche" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niche</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="averageViews" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Views per Post</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="demographics" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audience Demographics</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="topPosts" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Top Posts (URLs, comma separated)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <> <DollarSign className="mr-2" />Generate Media Kit</>}
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
                <h3 className="text-xl font-semibold mt-4">Your media kit will appear here</h3>
                <p className="text-muted-foreground">Fill out your metrics to generate your kit.</p>
            </div>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Suggested Pricing</CardTitle>
                  <CardDescription>Based on your metrics and niche, here are some starting points.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap font-sans">
                     {result.suggestedPricing}
                   </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Media Kit Content</CardTitle>
                  <CardDescription>Copy this content for your professional media kit.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap font-sans bg-background/50 p-4 rounded-md">
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
