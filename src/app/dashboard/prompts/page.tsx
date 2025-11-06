
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prompts } from "@/lib/prompts-data";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Prompts da IA</h1>
        <p className="text-muted-foreground max-w-3xl">
          Aqui estão todos os prompts que alimentam a inteligência artificial do Trendify. Eles são a base para todas as sugestões e análises que você recebe.
        </p>
      </header>

      <div className="space-y-8">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {prompt.title}
                <Badge variant="secondary">{prompt.flow}</Badge>
              </CardTitle>
              <CardDescription>{prompt.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full rounded-md border bg-muted/50">
                <pre className="p-6 text-sm whitespace-pre-wrap font-mono text-foreground">
                  {prompt.promptText}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
