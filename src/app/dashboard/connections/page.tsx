
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Share2, Settings, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, collection, deleteDoc } from "firebase/firestore";
import type { TiktokAccount } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
    const tiktokScope = 'user.info.basic,user.info.stats,video.list';
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isDeleting, setIsDeleting] = useState(false);

    const tiktokAccountsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'tiktokAccounts');
    }, [firestore, user]);

    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const isTiktokConnected = useMemo(() => tiktokAccounts && tiktokAccounts.length > 0, [tiktokAccounts]);

    const handleConnectTikTok = () => {
        const clientKey = 'sbaw8kkl7ahscrla44'; // TikTok Client Key
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

    const handleDisconnectTikTok = async () => {
        if (!user || !firestore || !tiktokAccounts || tiktokAccounts.length === 0) {
            toast({
                title: "Erro",
                description: "Nenhuma conta do TikTok para desconectar.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);
        // Assuming only one TikTok account can be connected at a time.
        const tiktokAccountId = tiktokAccounts[0].id; 
        const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccountId);

        try {
            await deleteDoc(tiktokAccountRef);
            toast({
                title: "Conta Desconectada",
                description: "Sua conta do TikTok foi desconectada com sucesso.",
            });
        } catch (error) {
            console.error("Erro ao desconectar a conta do TikTok:", error);
            toast({
                title: "Erro ao Desconectar",
                description: "Não foi possível desconectar sua conta do TikTok. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };


    const handleConnectInstagram = () => {
        const appId = 'YOUR_META_APP_ID'; // REPLACE WITH YOUR META APP ID
        const redirectUri = 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback';
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
                        {isLoadingTiktok ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                                <span className="text-lg font-bold">Verificando...</span>
                            </div>
                        ) : isTiktokConnected ? (
                            <>
                                <div className="text-lg font-bold text-green-500">Conectado</div>
                                <p className="text-xs text-muted-foreground">
                                    Sua conta <span className='font-bold'>{tiktokAccounts?.[0].username}</span> está sincronizada.
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
                    <CardFooter>
                        {isTiktokConnected ? (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 animate-spin" /> : <XCircle className="mr-2" />}
                                        Desconectar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação irá desconectar sua conta do TikTok. Você precisará se conectar novamente para sincronizar seus dados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDisconnectTikTok} className="bg-destructive hover:bg-destructive/90">
                                            Sim, Desconectar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button className="w-full" onClick={handleConnectTikTok} disabled={isUserLoading || isLoadingTiktok}>
                                <Share2 className="mr-2" /> Conectar TikTok
                            </Button>
                        )}
                        
                    </CardFooter>
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
                    <CardFooter>
                        <Button className="w-full" onClick={handleConnectInstagram}>
                            <Share2 className="mr-2" /> Conectar Instagram
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
