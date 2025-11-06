'use server';

/**
 * @fileOverview Generates a weekly content calendar based on user preferences.
 *
 * - generateWeeklyContentCalendar - A function that generates the content calendar.
 * - GenerateWeeklyContentCalendarInput - The input type for the generateWeeklyContentCalendar function.
 * - GenerateWeeklyContentCalendarOutput - The return type for the generateWeeklyContentCalendar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyContentCalendarInputSchema = z.object({
  niche: z.string().describe('The content creator\'s niche (e.g., fashion, beauty, gaming).'),
  goals: z.string().describe('The content creator\'s goals (e.g., increase followers, engagement).'),
  postingFrequency: z
    .string()
    .describe('The desired posting frequency (e.g., 3-5 times per week).'),
});
export type GenerateWeeklyContentCalendarInput = z.infer<
  typeof GenerateWeeklyContentCalendarInputSchema
>;

const ContentIdeaSchema = z.object({
    day: z.string().describe('The day of the week for the content idea (e.g., "Segunda-feira").'),
    title: z.string().describe('A catchy title for the content idea.'),
    description: z.string().describe('A brief description of the video or post.'),
    platform: z.string().describe('The suggested platform(s) for this content (e.g., "TikTok, Reels").')
});

const GenerateWeeklyContentCalendarOutputSchema = z.object({
  calendar: z.array(ContentIdeaSchema).describe('A list of structured content ideas for the week.'),
});
export type GenerateWeeklyContentCalendarOutput = z.infer<
  typeof GenerateWeeklyContentCalendarOutputSchema
>;

export async function generateWeeklyContentCalendar(
  input: GenerateWeeklyContentCalendarInput
): Promise<GenerateWeeklyContentCalendarOutput> {
  return generateWeeklyContentCalendarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyContentCalendarPrompt',
  input: {schema: GenerateWeeklyContentCalendarInputSchema},
  output: {schema: GenerateWeeklyContentCalendarOutputSchema},
  prompt: `You are an AI social media strategist, continuously analyzing what's trending to create relevant and effective content plans.

Your task is to generate a weekly content calendar for a creator, optimized for their goals and today's audience behavior.

Creator Info:
- Niche: {{{niche}}}
- Goals: {{{goals}}}
- Posting Frequency: {{{postingFrequency}}}

For each suggestion, provide:
- A day of the week.
- A catchy, modern title for the idea.
- A brief, engaging description of the content.
- The optimal platform (e.g., TikTok, Reels) for that day, considering current algorithm preferences and user activity.

Return the calendar as a structured JSON array, ensuring the ideas are fresh, relevant, and actionable for *right now*.`,
});

const generateWeeklyContentCalendarFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentCalendarFlow',
    inputSchema: GenerateWeeklyContentCalendarInputSchema,
    outputSchema: GenerateWeeklyContentCalendarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
