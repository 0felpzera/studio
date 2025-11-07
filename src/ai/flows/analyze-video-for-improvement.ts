
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
      .describe('Uma análise da eficácia do gancho de vídeo em formato Markdown. Use títulos (###) e listas com marcadores (*).'),
    suggestions: z.array(z.string()).describe('Sugestões para ganchos alternativos.'),
  }),
  technicalQuality: z.object({
    lighting: z.string().describe('Avaliação da iluminação do vídeo.'),
    audio: z.string().describe('Avaliação da qualidade de áudio do vídeo.'),
    framing: z.string().describe('Avaliação do enquadramento do vídeo.'),
    suggestions: z.array(z.string()).describe('Sugestões para melhorar a qualidade técnica.'),
  }),
  pacing: z.object({
    assessment: z.string().describe('Avaliação geral do ritmo do vídeo.'),
    suggestions: z
      .array(z.string())
      .describe('Sugestões para melhorar o ritmo do vídeo, como cortes mais rápidos ou legendas dinâmicas.'),
  }),
  captionSuggestions: z.string().describe('Uma legenda sugerida para o vídeo.'),
  hashtagSuggestions: z.array(z.string()).describe('Uma lista de hashtags sugeridas para o vídeo.'),
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
  prompt: `Você é um analista de vídeo de IA, aprendendo constantemente com as tendências virais atuais para fornecer o feedback mais atualizado e impactante. Sua resposta deve ser em português do Brasil e usar formatação Markdown (títulos com '###' e listas com '*').

Analise o vídeo fornecido, focando em elementos que impulsionam a retenção e o engajamento no cenário atual das redes sociais.

1.  **Análise do Gancho (Primeiros 3 Segundos):** O gancho é imediatamente cativante? Ele se alinha com a capacidade de atenção atual e os formatos de tendência? Forneça uma análise em texto simples. Depois, forneça três alternativas específicas e mais incisivas que estão em alta no momento, em uma lista com marcadores.
2.  **Qualidade Técnica:** Avalie a iluminação, o áudio e o enquadramento. Eles estão limpos e claros, atendendo às expectativas atuais do espectador? Forneça dicas de melhoria práticas.
3.  **Ritmo e Cadência:** O ritmo do vídeo corresponde às tendências atuais (por exemplo, cortes rápidos, legendas dinâmicas, B-roll envolvente)? É muito lento ou muito rápido? Sugira edições específicas para melhorar o fluxo e manter a atenção.
4.  **Legenda e Hashtags:** Gere uma legenda atraente e amigável ao algoritmo que incentive a interação. Sugira uma mistura de hashtags relevantes, de alto tráfego e de nicho que estejam atualmente com bom desempenho.

Vídeo: {{media url=videoDataUri}}
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
