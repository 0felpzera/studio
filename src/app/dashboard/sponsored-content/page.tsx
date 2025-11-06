import SponsoredContentIdeator from "./sponsored-content-ideator";

export default function SponsoredContentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Ideias para Publis</h1>
        <p className="text-muted-foreground max-w-2xl">
          Tem uma parceria com uma marca? Descreva o produto e a IA gerará ideias de conteúdo autênticas e criativas para integrar a publicidade de forma natural.
        </p>
      </header>
      <SponsoredContentIdeator />
    </div>
  );
}
