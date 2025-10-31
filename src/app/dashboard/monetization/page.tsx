import MonetizationAssistant from "./monetization-assistant";

export default function MonetizationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Assistente de Monetização</h1>
        <p className="text-muted-foreground">
          Gere um media kit profissional e obtenha sugestões de preços inteligentes.
        </p>
      </header>
      <MonetizationAssistant />
    </div>
  );
}
