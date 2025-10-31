import ContentCalendar from "./content-calendar";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-headline font-bold tracking-tight">My Plan</h1>
        <p className="text-muted-foreground">
          Your AI-generated weekly content calendar. Let&apos;s get creating!
        </p>
      </header>
      <ContentCalendar />
    </div>
  );
}
