
import VideoIdeasGenerator from "./video-ideas-generator";

export default function IdeasPage() {
  return (
    <div className="w-full space-y-6">
      <header className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Gerador de Ideias</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto sm:mx-0">
          Use o poder da IA para ter um brainstorm de ideias de vídeo. A ferramenta sugere tanto conteúdo perene (que dura para sempre) quanto tópicos que estão em alta agora.
        </p>
      </header>
      <VideoIdeasGenerator />
    </div>
  );
}
