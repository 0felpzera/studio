
'use server';

/**
 * @fileOverview A sponsored content idea generator AI agent.
 *
 * - generateSponsoredContentIdeas - A function that handles the generation of sponsored content ideas.
 * - GenerateSponsoredContentIdeasInput - The input type for the generateSponsoredContentIdeas function.
 * - GenerateSponsoredContentIdeasOutput - The return type for the generateSponsoredContentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSponsoredContentIdeasInputSchema = z.object({
  productDescription: z
    .string()
    .describe('Description of the product to be featured in the sponsored content.'),
  userNiche: z.string().describe('The content creator\'s primary niche or area of focus.'),
});
export type GenerateSponsoredContentIdeasInput = z.infer<
  typeof GenerateSponsoredContentIdeasInputSchema
>;

const GenerateSponsoredContentIdeasOutputSchema = z.object({
  contentIdeas: z
    .array(z.string())
    .describe('An array of creative and authentic sponsored content ideas.'),
  formatSuggestions: z
    .array(z.string())
    .describe('Suggested formats for the sponsored content, such as review, tutorial, etc.'),
});
export type GenerateSponsoredContentIdeasOutput = z.infer<
  typeof GenerateSponsoredContentIdeasOutputSchema
>;

export async function generateSponsoredContentIdeas(
  input: GenerateSponsoredContentIdeasInput
): Promise<GenerateSponsoredContentIdeasOutput> {
  return generateSponsoredContentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSponsoredContentIdeasPrompt',
  input: {schema: GenerateSponsoredContentIdeasInputSchema},
  output: {schema: GenerateSponsoredContentIdeasOutputSchema},
  prompt: `You are an AI creative strategist, an expert in the Brazilian social media market, who is constantly learning from current trends to generate authentic and engaging sponsored content ideas. Your response must be in Brazilian Portuguese.

Your goal is to seamlessly integrate the product into the creator's niche, avoiding the feel of a traditional ad.

Product Description: {{{productDescription}}}
User Niche: {{{userNiche}}}

Your tasks:
1.  **Generate 3 Creative Content Ideas:** Brainstorm three specific, authentic ideas that feel native to the creator's content style and resonate with their audience *today*.
2.  **Suggest Optimal Formats:** For each idea, suggest the best video format (e.g., 'Review Honesto', 'Um Dia na Vida', 'Problema/Solução') based on what is currently performing well and converting for sponsored content in this niche.

The output must conform to the specified JSON schema.
  `,
});

const generateSponsoredContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateSponsoredContentIdeasFlow',
    inputSchema: GenerateSponsoredContentIdeasInputSchema,
    outputSchema: GenerateSponsoredContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
