import TrendsFeed from "./trends-feed";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Trend Feed</h1>
        <p className="text-muted-foreground">
          Discover rising audios, dances, and formats relevant to your niche.
        </p>
      </header>
      <TrendsFeed />
    </div>
  );
}
