'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant video ideas
 * to content creators, incorporating both evergreen niche content and trending topics.
 *
 * - suggestRelevantVideoIdeas - The main function to generate video ideas.
 * - VideoIdeasInput - The input type for the suggestRelevantVideoIdeas function.
 * - VideoIdeasOutput - The output type for the suggestRelevantVideoIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoIdeasInputSchema = z.object({
  niche: z.string().describe('The content creator\'s primary niche (e.g., Fashion, Beauty, Gaming).'),
  currentTrends: z.string().describe('A list of current trends on social media platforms.'),
});

export type VideoIdeasInput = z.infer<typeof VideoIdeasInputSchema>;

const VideoIdeasOutputSchema = z.object({
  videoIdeas: z.array(
    z.object({
      title: z.string().describe('The title of the video idea.'),
      description: z.string().describe('A brief description of the video idea.'),
      scriptOutline: z.string().describe('A basic script outline including Hook, Development, and CTA.'),
      type: z.enum(['Evergreen', 'Trending']).describe('The type of video idea (Evergreen or Trending).'),
    })
  ).describe('An array of suggested video ideas.'),
});

export type VideoIdeasOutput = z.infer<typeof VideoIdeasOutputSchema>;

export async function suggestRelevantVideoIdeas(input: VideoIdeasInput): Promise<VideoIdeasOutput> {
  return suggestRelevantVideoIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantVideoIdeasPrompt',
  input: {schema: VideoIdeasInputSchema},
  output: {schema: VideoIdeasOutputSchema},
  prompt: `You are a creative content strategist for social media.
  Generate a list of video ideas based on the content creator's niche and current trends.
  Provide a title, brief description, basic script outline (Hook, Development, CTA), and type (Evergreen or Trending) for each idea.

  Niche: {{{niche}}}
  Current Trends: {{{currentTrends}}}

  Format the output as a JSON array of video ideas.
  `,
});

const suggestRelevantVideoIdeasFlow = ai.defineFlow(
  {
    name: 'suggestRelevantVideoIdeasFlow',
    inputSchema: VideoIdeasInputSchema,
    outputSchema: VideoIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
