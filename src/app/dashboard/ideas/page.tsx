import VideoIdeasGenerator from "./video-ideas-generator";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Gerador de Ideias</h1>
        <p className="text-muted-foreground">
          Nunca fique sem ideias. Inspire-se com tópicos perenes e tendências.
        </p>
      </header>
      <VideoIdeasGenerator />
    </div>
  );
}
