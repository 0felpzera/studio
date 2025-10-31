import ContentCalendar from "../content-calendar";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Meu Plano</h1>
        <p className="text-muted-foreground">
          Seu calendário de conteúdo semanal gerado por IA. Vamos criar!
        </p>
      </header>
      <ContentCalendar />
    </div>
  );
}
