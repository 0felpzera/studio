import TrendsFeed from "./trends-feed";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Feed de Tendências</h1>
        <p className="text-muted-foreground">
          Descubra áudios, danças e formatos em alta relevantes para o seu nicho.
        </p>
      </header>
      <TrendsFeed />
    </div>
  );
}
