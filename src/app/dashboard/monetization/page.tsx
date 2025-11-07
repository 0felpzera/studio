
import MonetizationAssistant from "./monetization-assistant";

export default function MonetizationPage() {
  return (
    <div className="space-y-6 w-full">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assistente de Monetização</h1>
        <p className="text-muted-foreground max-w-2xl">
          Gere um texto profissional para seu Mídia Kit e receba sugestões de preços com base em suas métricas reais para propostas de parcerias.
        </p>
      </header>
      <MonetizationAssistant />
    </div>
  );
}
