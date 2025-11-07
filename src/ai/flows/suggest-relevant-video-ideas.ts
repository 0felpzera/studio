
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
  niche: z.string().describe("O nicho principal do criador de conteúdo (por exemplo, Moda, Beleza, Jogos)."),
  currentTrends: z.string().describe('Uma lista de tendências atuais nas plataformas de mídia social.'),
  excludedIdeas: z.array(z.string()).optional().describe('Uma lista de títulos de vídeos recentes para excluir e evitar repetição.'),
});

export type VideoIdeasInput = z.infer<typeof VideoIdeasInputSchema>;

const VideoIdeasOutputSchema = z.object({
  videoIdeas: z.array(
    z.object({
      title: z.string().describe('O título da ideia de vídeo.'),
      description: z.string().describe('Uma breve descrição da ideia de vídeo.'),
      scriptOutline: z.string().describe('Um esboço básico do roteiro, incluindo Gancho, Desenvolvimento e CTA.'),
      type: z.enum(['Evergreen', 'Trending']).describe('O tipo de ideia de vídeo (Perene ou Tendência).'),
    })
  ).describe('Um array de ideias de vídeo sugeridas.'),
});

export type VideoIdeasOutput = z.infer<typeof VideoIdeasOutputSchema>;

export async function suggestRelevantVideoIdeas(input: VideoIdeasInput): Promise<VideoIdeasOutput> {
  return suggestRelevantVideoIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantVideoIdeasPrompt',
  input: {schema: VideoIdeasInputSchema},
  output: {schema: VideoIdeasOutputSchema},
  prompt: `Você é um estrategista criativo de IA, aprendendo constantemente com o que está viralizando atualmente para gerar ideias de vídeo novas e práticas. Seu objetivo é fornecer uma mistura de conteúdo atemporal (Perene) e ideias que exploram o momento cultural atual (Tendência). Sua resposta deve ser em português do Brasil.

Informações do Criador:
- Nicho: {{{niche}}}
- Tendências Observadas: {{{currentTrends}}}
{{#if excludedIdeas}}
- Ideias Excluídas: NÃO sugira ideias semelhantes a estes títulos recentes:
  {{#each excludedIdeas}}
  - "{{{this}}}"
  {{/each}}
{{/if}}

Para cada ideia gerada, forneça:
1.  **Título:** Um título cativante e moderno.
2.  **Descrição:** Um resumo breve e envolvente.
3.  **Esboço do Roteiro:** Uma estrutura simples (Gancho, Desenvolvimento, CTA) que seja fácil de seguir.
4.  **Tipo:** Classifique como 'Perene' ou 'Tendência'.

Formate a saída como um array JSON de ideias de vídeo, garantindo que sejam relevantes, novas e imediatamente utilizáveis.`,
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

    