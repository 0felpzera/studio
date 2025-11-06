'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a professional media kit with suggested pricing for advertising opportunities.
 *
 * - generateMediaKit - A function that generates a media kit with pricing suggestions.
 * - GenerateMediaKitInput - The input type for the generateMediaKit function.
 * - GenerateMediaKitOutput - The return type for the generateMediaKit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMediaKitInputSchema = z.object({
  followerCount: z.number().describe('The number of followers the user has.'),
  engagementRate: z.number().describe('The engagement rate of the user (e.g., 0.05 for 5%).'),
  niche: z.string().describe('The niche of the user (e.g., "fashion", "beauty").'),
  averageViews: z.number().describe('The average views per post.'),
  topPosts: z.array(z.string()).describe('URLs of the user\'s top performing posts.'),
  demographics: z.string().describe('A description of the user\'s audience demographics.'),
});
export type GenerateMediaKitInput = z.infer<typeof GenerateMediaKitInputSchema>;

const GenerateMediaKitOutputSchema = z.object({
  mediaKitContent: z.string().describe('The generated media kit content in a readable format.'),
  suggestedPricing: z.string().describe('Suggested pricing for different advertising opportunities.'),
});
export type GenerateMediaKitOutput = z.infer<typeof GenerateMediaKitOutputSchema>;

export async function generateMediaKit(input: GenerateMediaKitInput): Promise<GenerateMediaKitOutput> {
  return generateMediaKitFlow(input);
}

const generateMediaKitPrompt = ai.definePrompt({
  name: 'generateMediaKitPrompt',
  input: {schema: GenerateMediaKitInputSchema},
  output: {schema: GenerateMediaKitOutputSchema},
  prompt: `You are an AI expert in influencer marketing, always up-to-date with current market rates and what brands are looking for *now*.

Based on the provided data, generate a professional, compelling media kit and suggest pricing that reflects current market value.

Influencer Data:
- Follower Count: {{{followerCount}}}
- Engagement Rate: {{{engagementRate}}}
- Niche: {{{niche}}}
- Average Views: {{{averageViews}}}
- Top Posts (as social proof): {{{topPosts}}}
- Demographics: {{{demographics}}}

Your Tasks:
1.  **Generate Media Kit Content:** Write a concise, powerful bio and highlight the creator's strengths. Use modern, professional language that appeals to brands.
2.  **Suggest Pricing:** Provide a realistic pricing table for the following packages, based on *current* industry standards for this creator's metrics and niche:
    - One Reel
    - Three Stories
    - One TikTok Video
    - Integrated Campaign (1 Reel + 3 Stories)

Ensure the media kit content is well-formatted and includes a clear call to action for collaboration. The entire response must conform to the output schema.
  `,
});

const generateMediaKitFlow = ai.defineFlow(
  {
    name: 'generateMediaKitFlow',
    inputSchema: GenerateMediaKitInputSchema,
    outputSchema: GenerateMediaKitOutputSchema,
  },
  async input => {
    const {output} = await generateMediaKitPrompt(input);
    return output!;
  }
);
