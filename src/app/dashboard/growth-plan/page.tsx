
import { GrowthPlanner } from './growth-planner';

export default function GrowthPlanPage() {
  return (
    <div className="space-y-6 w-full">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Plano de Crescimento</h1>
        <p className="text-muted-foreground max-w-3xl">
          Gere um plano de crescimento personalizado com IA, compare sua performance e descubra como atingir suas metas mais rápido.
        </p>
      </header>
      <GrowthPlanner />
    </div>
  );
}
