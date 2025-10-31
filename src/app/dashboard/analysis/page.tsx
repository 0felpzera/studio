import VideoAnalyzer from "./video-analyzer";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Análise de Vídeo</h1>
        <p className="text-muted-foreground">
          Envie seu vídeo para receber feedback da IA antes de postar. Maximize sua retenção!
        </p>
      </header>
      <VideoAnalyzer />
    </div>
  );
}
