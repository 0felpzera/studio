import SponsoredContentIdeator from "./sponsored-content-ideator";

export default function SponsoredContentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Sponsored Content Ideator</h1>
        <p className="text-muted-foreground">
          Generate authentic & creative ideas for your brand partnerships.
        </p>
      </header>
      <SponsoredContentIdeator />
    </div>
  );
}
