'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized growth plan for social media creators.
 *
 * - generateGrowthPlan - A function that generates the growth plan.
 */

import { ai } from '@/ai/genkit';
import { GenerateGrowthPlanInputSchema, GenerateGrowthPlanOutputSchema, type GenerateGrowthPlanInput, type GenerateGrowthPlanOutput } from '@/lib/types';


export async function generateGrowthPlan(
  input: GenerateGrowthPlanInput
): Promise<GenerateGrowthPlanOutput> {
  return generateGrowthPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrowthPlanPrompt',
  input: { schema: GenerateGrowthPlanInputSchema },
  output: { schema: GenerateGrowthPlanOutputSchema },
  prompt: `You are an expert AI growth strategist, specializing in the Brazilian social media landscape. Your goal is to provide an actionable, modern, and realistic growth plan. All your responses MUST be in Brazilian Portuguese.

Creator Data:
- Niche: {{{niche}}}
- Country: {{{country}}}
- Current Followers: {{{followers}}}
- Follower Goal: {{{followerGoal}}}
- Posting Cadence: {{{reelsPerMonth}}} Reels/month, {{{storiesPerMonth}}} Stories/month.
- Priority: {{{priority}}}

Your Task is to generate a plan optimized for *today's* algorithm and audience behavior in Brazil:
1.  **Estimate Time to Goal**: Calculate a realistic timeframe to reach the follower goal (e.g., '~8 meses', '~1.5 anos').
2.  **Estimate Earnings**: Based on current market rates for the niche in Brazil, estimate a potential monthly income range from brand deals (e.g., 'R$2.000-R$6.000').
3.  **Recommend Weekly Plan**: Suggest a simple, effective weekly posting schedule (e.g., '3 Reels, 5 Stories com CTA').

Your entire output MUST conform to the JSON schema. Do not add any extra text or explanation.`,
});

const generateGrowthPlanFlow = ai.defineFlow(
  {
    name: 'generateGrowthPlanFlow',
    inputSchema: GenerateGrowthPlanInputSchema,
    outputSchema: GenerateGrowthPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
