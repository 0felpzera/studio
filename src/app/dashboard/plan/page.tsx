

import ContentCalendar from "../content-calendar";

export default function PlanPage() {
  return (
    <div className="space-y-6 w-full">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plano de Conteúdo</h1>
        <p className="text-muted-foreground max-w-2xl">
          Gere um plano de conteúdo com a IA, adicione suas próprias tarefas e acompanhe seu progresso para manter a consistência.
        </p>
      </header>
      <ContentCalendar />
    </div>
  );
}
