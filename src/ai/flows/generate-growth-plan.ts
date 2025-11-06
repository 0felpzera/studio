
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
  prompt: `You are a world-class social media growth strategist. Based on the creator's data, generate a realistic and actionable growth plan.

Creator Data:
- Niche: {{{niche}}}
- Country: {{{country}}}
- Current Followers: {{{followers}}}
- Follower Goal: {{{followerGoal}}}
- Posting Cadence: {{{reelsPerMonth}}} Reels/month, {{{storiesPerMonth}}} Stories/month.
- Priority: {{{priority}}}

Your Task:
1.  **Estimate Time to Goal**: Calculate a realistic timeframe to reach the follower goal. Be concise (e.g., '~8 months').
2.  **Estimate Earnings**: Based on the niche, country, and goal followers, estimate a potential monthly income range from brand deals (e.g., 'R$2k-R$6k', '$800-$2k').
3.  **Recommend Weekly Plan**: Suggest a simple, effective weekly posting schedule (e.g., '3 Reels, 5 Stories').
4.  **Generate 3 Hook Ideas**: Create three compelling, specific video hook ideas tailored to the creator's niche.
5.  **Generate 3 Trend Ideas**: Provide three current, actionable trends (Audio, Format, or Challenge) relevant to the niche.

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
