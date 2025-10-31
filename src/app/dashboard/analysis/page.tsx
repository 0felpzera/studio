import VideoAnalyzer from "./video-analyzer";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Pre-Publication Video Analysis</h1>
        <p className="text-muted-foreground">
          Upload your video to get AI feedback before you post. Maximize your retention!
        </p>
      </header>
      <VideoAnalyzer />
    </div>
  );
}
