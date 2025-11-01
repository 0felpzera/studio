
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.52.02c1.31-.02 2.61.16 3.82.54a8.65 8.65 0 0 1 4.24 4.24c.38 1.21.56 2.51.54 3.82a8.65 8.65 0 0 1-4.24 4.24c-1.21.38-2.51.56-3.82.54a8.65 8.65 0 0 1-4.24-4.24c-.38-1.21-.56-2.51-.54-3.82a8.65 8.65 0 0 1 4.24-4.24c1.21-.38 2.51-.56 3.82-.54Z"></path>
            <path d="M10.26 8.71a4.23 4.23 0 0 1 1.4-1.4c1.47-.97 3.23-1.05 4.83-.26 1.6.79 2.72 2.22 2.91 3.85.19 1.63-.44 3.29-1.85 4.25-1.41.96-3.17 1.04-4.77.25a4.23 4.23 0 0 1-1.4-1.4"></path>
            <path d="M8.69 16.7v-5.47a2.76 2.76 0 0 1-.7-2.76 2.76 2.76 0 0 1 2.76-2.76v5.53"></path>
        </svg>
    )
}

export default function ConnectionsPage() {
    const { toast } = useToast();

     useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code) {
            // Aqui você trocaria o código por um token de acesso
            // Por enquanto, apenas exibimos uma notificação de sucesso
            toast({
                title: "Autorização do TikTok Concedida!",
                description: "Conexão bem-sucedida. Em breve seus dados serão sincronizados.",
            });
            // Limpa a URL dos parâmetros do TikTok
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [toast]);


    const handleConnectTikTok = () => {
        const clientKey = 'sbaw9edcigqvur1dsw';
        const redirectUri = 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/dashboard/connections';
        const scope = 'user.info.basic'; // Solicita acesso às informações básicas do usuário
        const state = '___UNIQUE_STATE_TOKEN___'; // Um token único para previnir ataques CSRF

        const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
        tiktokAuthUrl.searchParams.append('client_key', clientKey);
        tiktokAuthUrl.searchParams.append('scope', scope);
        tiktokAuthUrl.searchParams.append('response_type', 'code');
        tiktokAuthUrl.searchParams.append('redirect_uri', redirectUri);
        tiktokAuthUrl.searchParams.append('state', state);

        window.location.href = tiktokAuthUrl.toString();
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Conexões</h1>
                <p className="text-muted-foreground">
                    Conecte suas contas de redes sociais para acompanhar seus dados reais e otimizar sua estratégia.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                        <TiktokIcon className="h-6 w-6 text-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">Não conectado</div>
                        <p className="text-xs text-muted-foreground">
                            Conecte sua conta para importar métricas de engajamento e seguidores.
                        </p>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" onClick={handleConnectTikTok}>
                            <Share2 className="mr-2" /> Conectar TikTok
                        </Button>
                    </CardContent>
                </Card>
                {/* Futuros cards de conexão (Meta, etc.) podem ser adicionados aqui */}
                 <Card className="border-dashed">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Instagram</CardTitle>
                        <svg className="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-muted-foreground">Em breve</div>
                        <p className="text-xs text-muted-foreground">
                           Aguarde a integração com a API da Meta.
                        </p>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" variant="secondary" disabled>
                            <Share2 className="mr-2" /> Conectar Instagram
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
