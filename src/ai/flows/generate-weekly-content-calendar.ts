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

const GenerateWeeklyContentCalendarOutputSchema = z.object({
  calendar: z
    .string()
    .describe(
      'A weekly content calendar with suggested platforms (TikTok, Reels, etc.) for each day.'
    ),
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
  prompt: `You are an expert social media strategist. Generate a weekly content calendar for a content creator, taking into account their niche, goals, and desired posting frequency. Suggest the optimal platform (e.g., TikTok, Reels, YouTube) for each day to maximize engagement and growth. Return the calendar as a simple string.

Niche: {{{niche}}}
Goals: {{{goals}}}
Posting Frequency: {{{postingFrequency}}}`,
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
