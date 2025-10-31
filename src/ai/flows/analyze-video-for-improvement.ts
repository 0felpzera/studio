'use server';

/**
 * @fileOverview Analyzes a video for potential improvements to increase audience retention.
 *
 * - analyzeVideoForImprovement - A function that handles the video analysis process.
 * - AnalyzeVideoInput - The input type for the analyzeVideoForImprovement function.
 * - AnalyzeVideoOutput - The return type for the analyzeVideoForImprovement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVideoInput = z.infer<typeof AnalyzeVideoInputSchema>;

const AnalyzeVideoOutputSchema = z.object({
  hookAnalysis: z.object({
    effectiveness: z
      .string()
      .describe('An analysis of the effectiveness of the video hook.'),
    suggestions: z.array(z.string()).describe('Suggestions for alternative hooks.'),
  }),
  technicalQuality: z.object({
    lighting: z.string().describe('Assessment of the video lighting.'),
    audio: z.string().describe('Assessment of the video audio quality.'),
    framing: z.string().describe('Assessment of the video framing.'),
    suggestions: z.array(z.string()).describe('Suggestions for improving technical quality.'),
  }),
  pacing: z.object({
    assessment: z.string().describe('Overall assessment of the video pacing.'),
    suggestions: z
      .array(z.string())
      .describe('Suggestions for improving the video pacing, like faster cuts or dynamic captions.'),
  }),
  captionSuggestions: z.string().describe('A suggested caption for the video.'),
  hashtagSuggestions: z.array(z.string()).describe('A list of suggested hashtags for the video.'),
});
export type AnalyzeVideoOutput = z.infer<typeof AnalyzeVideoOutputSchema>;

export async function analyzeVideoForImprovement(
  input: AnalyzeVideoInput
): Promise<AnalyzeVideoOutput> {
  return analyzeVideoFlow(input);
}

const analyzeVideoPrompt = ai.definePrompt({
  name: 'analyzeVideoPrompt',
  input: {schema: AnalyzeVideoInputSchema},
  output: {schema: AnalyzeVideoOutputSchema},
  prompt: `You are an AI video analyst who will give suggestions for video improvement. 

Analyze the video provided, paying attention to the following aspects:

*   Hook Effectiveness: Analyze the first 3 seconds of the video to determine the effectiveness of the hook. Provide specific suggestions for alternative hooks if the current one is weak.
*   Technical Quality: Assess the video for lighting, audio quality and framing issues. Provide specific suggestions for improvement.
*   Pacing: Evaluate the overall pacing of the video. Suggest faster cuts or the addition of dynamic captions if the video seems slow.

Also, generate an optimized caption and a set of relevant hashtags for the video.

Video: {{media url=videoDataUri}}
`,
});

const analyzeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeVideoFlow',
    inputSchema: AnalyzeVideoInputSchema,
    outputSchema: AnalyzeVideoOutputSchema,
  },
  async input => {
    const {output} = await analyzeVideoPrompt(input);
    return output!;
  }
);
