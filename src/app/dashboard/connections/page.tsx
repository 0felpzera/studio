
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Settings, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import type { TiktokAccount } from "@/lib/types";


function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.52.02c1.31-.02 2.61.16 3.82.54a8.65 8.65 0 0 1 4.24 4.24c.38 1.21.56 2.51.54 3.82a8.65 8.65 0 0 1-4.24 4.24c-1.21.38-2.51.56-3.82.54a8.65 8.65 0 0 1-4.24-4.24c-.38-1.21-.56-2.51-.54-3.82a8.65 8.65
 0 0 1 4.24-4.24c1.21-.38 2.51-.56 3.82-.54Z"></path>
            <path d="M10.26 8.71a4.23 4.23 0 0 1 1.4-1.4c1.47-.97 3.23-1.05 4.83-.26 1.6.79 2.72 2.22 2.91 3.85.19 1.63-.44 3.29-1.85 4.25-1.41.96-3.17 1.04-4.77.25a4.23 4.23 0 0 1-1.4-1.4"></path>
            <path d="M8.69 16.7v-5.47a2.76 2.76 0 0 1-.7-2.76 2.76 2.76 0 0 1 2.76-2.76v5.53"></path>
        </svg>
    )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    )
}


export default function ConnectionsPage() {
    const { toast } = useToast();
    const tiktokScope = 'user.info.basic'; 
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isConnecting, setIsConnecting] = useState(false);

    const tiktokAccountsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'tiktokAccounts');
    }, [firestore, user]);

    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const isTiktokConnected = useMemo(() => tiktokAccounts && tiktokAccounts.length > 0, [tiktokAccounts]);

     useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        const handleConnection = async () => {
             if (code && state && user && firestore && !isConnecting && !isTiktokConnected) {
                setIsConnecting(true);
                // Checar o 'state' para determinar a origem (TikTok ou Meta)
                if (state === '___UNIQUE_STATE_TOKEN_TIKTOK___') {
                    toast({
                        title: "Autorização do TikTok Concedida!",
                        description: "Conexão bem-sucedida. Sincronizando seus dados.",
                    });

                    // Simular a criação de uma conta no Firestore
                    try {
                        const tiktokAccountId = 'tiktok-' + user.uid; // ID de exemplo
                        const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccountId);
                        await setDoc(tiktokAccountRef, {
                            id: tiktokAccountId,
                            userId: user.uid,
                            followerCount: 25000, // Dado de exemplo
                            engagementRate: 0.05, // Dado de exemplo (5%)
                        });
                        toast({
                            title: "Conta TikTok Conectada!",
                            description: "Seus dados de exemplo foram salvos no seu perfil.",
                        });

                    } catch (error) {
                        console.error("Erro ao salvar conta do TikTok:", error);
                        toast({
                            title: "Erro ao salvar conexão",
                            description: "Não foi possível salvar os dados da sua conta TikTok.",
                            variant: "destructive",
                        });
                    } finally {
                        setIsConnecting(false);
                    }
                
                } else if (state === '___UNIQUE_STATE_TOKEN_META___') {
                    toast({
                        title: "Autorização do Instagram Concedida!",
                        description: "Conexão com a Meta bem-sucedida.",
                    });
                     // Lógica para Instagram viria aqui
                }
                
                // Limpa a URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };
        
        handleConnection();

    }, [toast, user, firestore, isConnecting, isTiktokConnected]);


    const handleConnectTikTok = () => {
        const clientKey = 'sbaw8kkl7ahscrla44'; // Client Key do TikTok
        const redirectUri = 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback';
        const state = '___UNIQUE_STATE_TOKEN_TIKTOK___';

        const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
        tiktokAuthUrl.searchParams.append('client_key', clientKey);
        tiktokAuthUrl.searchParams.append('scope', tiktokScope);
        tiktokAuthUrl.searchParams.append('response_type', 'code');
        tiktokAuthUrl.searchParams.append('redirect_uri', redirectUri);
        tiktokAuthUrl.searchParams.append('state', state);

        window.location.href = tiktokAuthUrl.toString();
    };

    const handleConnectInstagram = () => {
        const appId = 'YOUR_META_APP_ID'; // SUBSTITUA PELO SEU APP ID DA META
        const redirectUri = window.location.href;
        const scope = 'user_profile,user_media';
        const state = '___UNIQUE_STATE_TOKEN_META___';

        if (appId === 'YOUR_META_APP_ID') {
            toast({
                title: "Configuração Incompleta",
                description: "Por favor, adicione sua App ID da Meta no código para continuar.",
                variant: "destructive"
            });
            return;
        }

        const metaAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
        metaAuthUrl.searchParams.append('client_id', appId);
        metaAuthUrl.searchParams.append('redirect_uri', redirectUri);
        metaAuthUrl.searchParams.append('scope', scope);
        metaAuthUrl.searchParams.append('response_type', 'code');
        metaAuthUrl.searchParams.append('state', state);

        window.location.href = metaAuthUrl.toString();
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
                        {isLoadingTiktok || isConnecting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                                <span className="text-lg font-bold">Verificando...</span>
                            </div>
                        ) : isTiktokConnected ? (
                            <>
                                <div className="text-lg font-bold text-green-500">Conectado</div>
                                <p className="text-xs text-muted-foreground">
                                    Suas métricas do TikTok estão sendo sincronizadas.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold">Não conectado</div>
                                <p className="text-xs text-muted-foreground">
                                    Conecte sua conta para importar métricas de engajamento e seguidores.
                                </p>
                            </>
                        )}
                    </CardContent>
                    <CardContent>
                        {isTiktokConnected ? (
                             <Button className="w-full" variant="secondary">
                                <Settings className="mr-2" /> Gerenciar Conexão
                            </Button>
                        ) : (
                            <Button className="w-full" onClick={handleConnectTikTok} disabled={isUserLoading || isLoadingTiktok || isConnecting}>
                                <Share2 className="mr-2" /> Conectar TikTok
                            </Button>
                        )}
                        
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                        <InstagramIcon className="h-6 w-6 text-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">Não conectado</div>
                        <p className="text-xs text-muted-foreground">
                           Conecte para importar dados via API da Meta.
                        </p>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" onClick={handleConnectInstagram}>
                            <Share2 className="mr-2" /> Conectar Instagram
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
