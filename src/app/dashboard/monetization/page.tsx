
import MonetizationAssistant from "./monetization-assistant";

export default function MonetizationPage() {
  return (
    <div className="w-full space-y-6">
      <header className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assistente de Monetização</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto sm:mx-0">
          Gere um texto profissional para seu Mídia Kit e receba sugestões de preços com base em suas métricas reais para propostas de parcerias.
        </p>
      </header>
      <MonetizationAssistant />
    </div>
  );
}
