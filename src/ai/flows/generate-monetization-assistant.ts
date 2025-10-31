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
  prompt: `You are an expert in creating media kits for social media influencers.

  Based on the provided information, generate a professional media kit that highlights the influencer's key metrics and suggests pricing for various advertising opportunities.

  Follower Count: {{{followerCount}}}
  Engagement Rate: {{{engagementRate}}}
  Niche: {{{niche}}}
  Average Views: {{{averageViews}}}
  Top Posts: {{{topPosts}}}
  Demographics: {{{demographics}}}

  Create compelling media kit content and suggest pricing for:
  - One Reel
  - Three Stories
  - One TikTok Video
  - Integrated Campaign (Reel + Stories)

  Ensure the suggested pricing is appropriate for their follower count, engagement and niche.
  The media kit content should be well-formatted and easy to read, highlighting the influencer's strengths.
  Remember to include a call to action for brands to collaborate.
  The response should include the media kit content and the suggested pricing.
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
