
import ContentCalendar from "../content-calendar";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plano de Conteúdo</h1>
        <p className="text-muted-foreground max-w-2xl">
          Gere um calendário de conteúdo para a semana toda com base em suas metas, aprove as sugestões da IA e acompanhe suas tarefas para manter a consistência.
        </p>
      </header>
      <ContentCalendar />
    </div>
  );
}
