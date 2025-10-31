import VideoIdeasGenerator from "./video-ideas-generator";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Video Idea Generator</h1>
        <p className="text-muted-foreground">
          Never run out of content ideas. Get inspired by evergreen topics and trending hype.
        </p>
      </header>
      <VideoIdeasGenerator />
    </div>
  );
}
