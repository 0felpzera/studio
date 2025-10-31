import MonetizationAssistant from "./monetization-assistant";

export default function MonetizationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Monetization Assistant</h1>
        <p className="text-muted-foreground">
          Generate a professional media kit and get smart pricing suggestions.
        p>
      </header>
      <MonetizationAssistant />
    </div>
  );
}
