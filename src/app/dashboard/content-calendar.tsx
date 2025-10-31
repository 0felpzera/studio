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

const formSchema = z.object({
  niche: z.string().min(2, "Niche is required."),
  goals: z.string().min(10, "Please describe your goals in more detail."),
  postingFrequency: z.string({ required_error: "Posting frequency is required." }),
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
    const platform = platformMatch ? platformMatch[1] : 'Unknown';
    
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
      niche: "Sustainable Fashion",
      goals: "Reach 10,000 followers and increase engagement by 5%",
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
        title: "Success!",
        description: "Your new content plan is ready.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating content calendar:", error);
      toast({
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate your content plan. Please try again.",
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
            <CardTitle className="font-headline">Define Your Strategy</CardTitle>
            <CardDescription>Tell the AI what you want to achieve.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Niche</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Skincare routines, Comedy skits" {...field} />
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
                      <FormLabel>Your Goals</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hit 10k followers in 3 months" {...field} />
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
                      <FormLabel>Posting Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select how often you'll post" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-2 times per week">1-2 times per week</SelectItem>
                          <SelectItem value="3-5 times per week">3-5 times per week</SelectItem>
                          <SelectItem value="Daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Generate My Plan"}
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
              <CardTitle className="font-headline">Weekly Progress</CardTitle>
              <CardDescription>You've completed {completedTasks} of {totalTasks} tasks this week.</CardDescription>
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
                <h3 className="text-xl font-semibold">Your plan will appear here</h3>
                <p className="text-muted-foreground">Fill out the form to get started!</p>
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
                      Done
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
