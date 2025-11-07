
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
  followerCount: z.number().describe('O número de seguidores que o usuário possui.'),
  engagementRate: z.number().describe('A taxa de engajamento do usuário (por exemplo, 0.05 para 5%).'),
  niche: z.string().describe('O nicho do usuário (por exemplo, "moda", "beleza").'),
  averageViews: z.number().describe('A média de visualizações por postagem.'),
  topPosts: z.array(z.string()).describe('URLs das postagens de melhor desempenho do usuário.'),
  demographics: z.string().describe('Uma descrição da demografia do público do usuário.'),
});
export type GenerateMediaKitInput = z.infer<typeof GenerateMediaKitInputSchema>;

const GenerateMediaKitOutputSchema = z.object({
  mediaKitContent: z.string().describe('O conteúdo do media kit gerado em um formato legível, usando Markdown para estrutura (cabeçalhos, listas, etc.).'),
  suggestedPricing: z.string().describe('Preços sugeridos para diferentes oportunidades de publicidade, formatados como uma string legível.'),
});
export type GenerateMediaKitOutput = z.infer<typeof GenerateMediaKitOutputSchema>;

export async function generateMediaKit(input: GenerateMediaKitInput): Promise<GenerateMediaKitOutput> {
  return generateMediaKitFlow(input);
}

const generateMediaKitPrompt = ai.definePrompt({
  name: 'generateMediaKitPrompt',
  input: {schema: GenerateMediaKitInputSchema},
  output: {schema: GenerateMediaKitOutputSchema},
  prompt: `Você é um especialista em IA em marketing de influenciadores, sempre atualizado com as taxas de mercado atuais e o que as marcas procuram *agora*. Sua resposta deve ser em português do Brasil.

Com base nos dados fornecidos, gere um media kit profissional e atraente e sugira preços que reflitam o valor de mercado atual.

Dados do Influenciador:
- Contagem de Seguidores: {{{followerCount}}}
- Taxa de Engajamento: {{{engagementRate}}}
- Nicho: {{{niche}}}
- Média de Visualizações: {{{averageViews}}}
- Posts Principais (como prova social): {{{topPosts}}}
- Demografia: {{{demographics}}}

Suas Tarefas:
1.  **Gerar Conteúdo do Media Kit:** Escreva um texto conciso e poderoso para um media kit. Use Markdown para uma formatação clara. Inclua seções para:
    - Uma biografia/introdução poderosa.
    - Estatísticas chave (seguidores, engajamento, visualizações).
    - Demografia do público.
    - Uma chamada para ação clara para colaboração.
    Garanta que haja espaçamentos claros entre as seções.

2.  **Sugerir Preços:** Forneça uma tabela de preços realista para os seguintes pacotes, com base nos padrões *atuais* da indústria para as métricas e nicho deste criador:
    - Um Reel
    - Três Stories
    - Um Vídeo no TikTok
    - Campanha Integrada (1 Reel + 3 Stories)

A resposta inteira deve estar em conformidade com o esquema de saída.
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

    