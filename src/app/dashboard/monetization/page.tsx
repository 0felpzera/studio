import MonetizationAssistant from "./monetization-assistant";

export default function MonetizationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Assistente de Monetização</h1>
        <p className="text-muted-foreground">
          Gere um mídia kit profissional e obtenha sugestões de preços.
        </p>
      </header>
      <MonetizationAssistant />
    </div>
  );
}
