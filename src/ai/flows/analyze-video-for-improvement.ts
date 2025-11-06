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
  prompt: `You are an AI video analyst, constantly learning from current viral trends to provide the most up-to-date and impactful feedback. Your goal is to make this video perform better *now*.

Analyze the provided video, focusing on elements that drive retention and engagement in today's social media landscape.

1.  **Hook Analysis (First 3 Seconds):** Is the hook immediately captivating? Does it align with current attention spans and trending formats? If not, provide three specific, punchier alternatives that are trending right now.
2.  **Technical Quality:** Assess lighting, audio, and framing. Are they clean and clear, meeting current viewer expectations? Provide actionable improvement tips.
3.  **Pacing & Rhythm:** Does the video's pace match current trends (e.g., fast cuts, dynamic captions, engaging B-roll)? Is it too slow or too fast? Suggest specific edits to improve flow and hold attention.
4.  **Caption & Hashtags:** Generate a compelling, algorithm-friendly caption that encourages interaction. Suggest a mix of relevant, high-traffic, and niche hashtags that are currently performing well.

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
