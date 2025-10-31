import SponsoredContentIdeator from "./sponsored-content-ideator";

export default function SponsoredContentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Idealizador de Conteúdo Patrocinado</h1>
        <p className="text-muted-foreground">
          Gere ideias autênticas e criativas para suas parcerias de marca.
        </p>
      </header>
      <SponsoredContentIdeator />
    </div>
  );
}
