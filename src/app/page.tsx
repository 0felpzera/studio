import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, BarChart2, Lightbulb, Video, Bot, Star } from "lucide-react";
import { TrendifyLogo } from "@/components/icons";

const features = [
    { name: "Diagnóstico de Conteúdo", icon: BarChart2 },
    { name: "Ideias de Vídeos", icon: Lightbulb },
    { name: "IA Coach", icon: Bot },
    { name: "Mídia Kit Inteligente", icon: Star },
    { name: "Publis Inteligentes", icon: Video },
];

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link href="#" className="flex items-center justify-center" prefetch={false}>
                    <TrendifyLogo className="h-6 w-6 text-primary" />
                    <span className="ml-2 text-lg font-semibold">Trendify</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Ferramentas
                    </Link>
                    <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Login
                    </Link>
                </nav>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <section className="space-y-6 pb-12 pt-16 md:pt-24 lg:pt-32">
                    <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                            Transforme conteúdo em <span className="text-primary">tendência</span>
                        </h1>
                        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                           A Trendify entende o que o algoritmo quer — e o que o seu público ama. Menos ruído, mais clareza para você crescer.
                        </p>
                        <div className="space-x-4 mt-6">
                            <Link href="/login">
                                <Button size="lg" className="font-bold text-lg px-8 py-6">Comece grátis</Button>
                            </Link>
                        </div>
                    </div>
                </section>
                <section id="features" className="container space-y-8 bg-muted/50 py-12 md:py-16 lg:py-24 rounded-2xl">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                           Ferramentas para Criadores
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                           Tudo que você precisa para otimizar, criar e monetizar seu conteúdo em um só lugar.
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        {features.map(feature => (
                             <div key={feature.name} className="relative overflow-hidden rounded-lg border bg-card p-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                    <feature.icon className="h-12 w-12 text-primary" />
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">{feature.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                 <section className="w-full py-24 md:py-32 lg:py-40 bg-accent mt-24">
                    <div className="container max-w-[58rem] mx-auto text-center">
                         <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-accent-foreground">
                           Todo criador tem potencial pra ser tendência.
                        </h2>
                         <p className="max-w-[85%] mx-auto mt-4 leading-normal text-accent-foreground/80 sm:text-lg sm:leading-7">
                            A Trendify te mostra o caminho.
                        </p>
                    </div>
                </section>
            </main>
            <footer className="py-6 md:px-8 md:py-4 border-t">
                <div className="container flex items-center justify-between">
                     <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Trendify. Todos os direitos reservados.</p>
                      <Link href="#" className="flex items-center justify-center" prefetch={false}>
                        <TrendifyLogo className="h-6 w-6 text-foreground" />
                        <span className="sr-only">Trendify</span>
                    </Link>
                </div>
            </footer>
        </div>
    )
}
