import VideoIdeasGenerator from "./video-ideas-generator";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Gerador de Ideias de Vídeo</h1>
        <p className="text-muted-foreground">
          Nunca fique sem ideias de conteúdo. Inspire-se com tópicos perenes e tendências do momento.
        </p>
      </header>
      <VideoIdeasGenerator />
    </div>
  );
}
