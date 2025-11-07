
import TrendsFeed from "./trends-feed";

export default function TrendsPage() {
  return (
    <div className="w-full space-y-6">
      <header className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Feed de Tendências</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto sm:mx-0">
          Descubra áudios, danças e formatos em alta relevantes para o seu nicho.
        </p>
      </header>
      <TrendsFeed />
    </div>
  );
}
