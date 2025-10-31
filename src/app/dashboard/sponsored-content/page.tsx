import SponsoredContentIdeator from "./sponsored-content-ideator";

export default function SponsoredContentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ideias para Publis</h1>
        <p className="text-muted-foreground">
          Gere ideias autênticas e criativas para suas parcerias de marca.
        </p>
      </header>
      <SponsoredContentIdeator />
    </div>
  );
}
