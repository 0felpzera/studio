
import ContentCalendar from "../content-calendar";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plano de Conteúdo</h1>
        <p className="text-muted-foreground">
          Gere, aprove e acompanhe seu calendário de conteúdo semanal gerado por IA.
        </p>
      </header>
      <ContentCalendar />
    </div>
  );
}
