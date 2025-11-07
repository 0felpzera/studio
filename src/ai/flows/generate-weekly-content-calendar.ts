
'use server';

/**
 * @fileOverview Generates a weekly content calendar based on user preferences.
 *
 * - generateWeeklyContentCalendar - A function that generates the content calendar.
 * - GenerateWeeklyContentCalendarInput - The input type for the generateWeeklyContentCalendar function.
 * - GenerateWeeklyContentCalendarOutput - The return type for the generateWeeklyContentCalendar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyContentCalendarInputSchema = z.object({
  niche: z.string().describe('O nicho do criador de conteúdo (por exemplo, moda, beleza, jogos).'),
  goals: z.string().describe('Os objetivos do criador de conteúdo (por exemplo, aumentar seguidores, engajamento).'),
  postingFrequency: z
    .string()
    .describe('A frequência de postagem desejada (por exemplo, 3-5 vezes por semana).'),
});
export type GenerateWeeklyContentCalendarInput = z.infer<
  typeof GenerateWeeklyContentCalendarInputSchema
>;

const ContentIdeaSchema = z.object({
    day: z.string().describe('O dia da semana para a ideia de conteúdo (por exemplo, "Segunda-feira").'),
    title: z.string().describe('Um título cativante para a ideia de conteúdo.'),
    description: z.string().describe('Uma breve descrição do vídeo ou postagem.'),
    platform: z.string().describe('A(s) plataforma(s) sugerida(s) para este conteúdo (por exemplo, "TikTok, Reels").')
});

const GenerateWeeklyContentCalendarOutputSchema = z.object({
  calendar: z.array(ContentIdeaSchema).describe('Uma lista de ideias de conteúdo estruturadas para a semana.'),
});
export type GenerateWeeklyContentCalendarOutput = z.infer<
  typeof GenerateWeeklyContentCalendarOutputSchema
>;

export async function generateWeeklyContentCalendar(
  input: GenerateWeeklyContentCalendarInput
): Promise<GenerateWeeklyContentCalendarOutput> {
  return generateWeeklyContentCalendarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyContentCalendarPrompt',
  input: {schema: GenerateWeeklyContentCalendarInputSchema},
  output: {schema: GenerateWeeklyContentCalendarOutputSchema},
  prompt: `Você é um estrategista de mídia social de IA, analisando continuamente o que está em alta para criar planos de conteúdo relevantes e eficazes. Sua resposta deve ser em português do Brasil.

Sua tarefa é gerar um calendário de conteúdo semanal para um criador, otimizado para seus objetivos e para o comportamento do público de hoje.

Informações do Criador:
- Nicho: {{{niche}}}
- Objetivos: {{{goals}}}
- Frequência de Postagem: {{{postingFrequency}}}

Para cada sugestão, forneça:
- Um dia da semana.
- Um título moderno e cativante para a ideia.
- Uma breve e envolvente descrição do conteúdo.
- A plataforma ideal (por exemplo, TikTok, Reels) para aquele dia, considerando as preferências atuais do algoritmo e a atividade do usuário.

Retorne o calendário como um array JSON estruturado, garantindo que as ideias sejam novas, relevantes e acionáveis para *agora*.`,
});

const generateWeeklyContentCalendarFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentCalendarFlow',
    inputSchema: GenerateWeeklyContentCalendarInputSchema,
    outputSchema: GenerateWeeklyContentCalendarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    