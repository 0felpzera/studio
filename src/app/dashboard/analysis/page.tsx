
import VideoAnalyzer from "./video-analyzer";

export default function AnalysisPage() {
  return (
    <div className="space-y-6 w-full">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Análise de Vídeo</h1>
        <p className="text-muted-foreground max-w-2xl">
          Receba feedback instantâneo sobre seu vídeo antes de postar. A IA analisa o gancho, a qualidade técnica, o ritmo e sugere melhorias para maximizar a retenção e o engajamento.
        </p>
      </header>
      <VideoAnalyzer />
    </div>
  );
}
