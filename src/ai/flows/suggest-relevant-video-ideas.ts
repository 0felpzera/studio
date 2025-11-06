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
  niche: z.string().describe("The content creator's primary niche (e.g., Fashion, Beauty, Gaming)."),
  currentTrends: z.string().describe('A list of current trends on social media platforms.'),
  excludedIdeas: z.array(z.string()).optional().describe('A list of recent video titles to exclude to avoid repetition.'),
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
  prompt: `You are an AI creative strategist, constantly learning from what's currently viral to generate fresh, actionable video ideas. Your goal is to provide a mix of timeless (Evergreen) content and ideas that tap into the current cultural moment (Trending).

Creator Info:
- Niche: {{{niche}}}
- Observed Trends: {{{currentTrends}}}
{{#if excludedIdeas}}
- Excluded Ideas: Do NOT suggest ideas similar to these recent titles:
  {{#each excludedIdeas}}
  - "{{{this}}}"
  {{/each}}
{{/if}}

For each generated idea, provide:
1.  **Title:** A catchy, modern title.
2.  **Description:** A brief, engaging summary.
3.  **Script Outline:** A simple structure (Hook, Development, CTA) that is easy to follow.
4.  **Type:** Classify as 'Evergreen' or 'Trending'.

Format the output as a JSON array of video ideas, ensuring they are relevant, new, and immediately usable.`,
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
