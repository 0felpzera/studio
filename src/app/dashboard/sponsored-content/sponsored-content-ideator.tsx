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
  productDescription: z.string().min(10, "Please describe the product in more detail."),
  userNiche: z.string().min(2, "Your niche is required."),
});

export default function SponsoredContentIdeator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateSponsoredContentIdeasOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: "A new chocolate-flavored protein supplement from Brand X.",
      userNiche: "Fitness and Healthy Recipes",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateSponsoredContentIdeas(values);
      setResult(response);
      toast({
        title: "Ideas Generated!",
        description: "Here are some creative concepts for your sponsored post.",
      });
    } catch (error) {
      console.error("Error generating sponsored content ideas:", error);
      toast({
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate ideas. Please try again.",
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
            <CardTitle className="font-headline">Partnership Details</CardTitle>
            <CardDescription>Describe the product you're promoting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A new vegan moisturizer from..." {...field} />
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
                      <FormLabel>Your Niche</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fitness, Gaming, Beauty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Generate Ideas</>}
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
            <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed">
                <Sparkles className="size-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Your sponsored content ideas will appear here</h3>
                <p className="text-muted-foreground">Fill out the form to get started.</p>
            </div>
          )}
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Creative Content Ideas</CardTitle>
                  <CardDescription>Here are 3 authentic ways to feature the product.</CardDescription>
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
                  <CardTitle className="font-headline">Suggested Formats</CardTitle>
                  <CardDescription>These formats perform well for your niche.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.formatSuggestions.map((format, index) => (
                      <Badge key={index} variant="outline" className="text-base px-3 py-1">{format}</Badge>
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
