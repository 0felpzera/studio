// This file defines the Genkit flow for generating sponsored content ideas based on a product and user's niche.

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
  prompt: `You are a creative marketing strategist specializing in generating sponsored content ideas for social media influencers.

  Given a product description and the content creator's niche, generate 3 creative and authentic sponsored content ideas that seamlessly integrate the product within the creator's niche.

  Also, suggest the best format for each idea based on successful sponsored content in that niche (e.g., honest review, tutorial, transformation, etc.).

  Product Description: {{{productDescription}}}
  User Niche: {{{userNiche}}}
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
