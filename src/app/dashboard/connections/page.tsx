
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Share2, Settings, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, collection, deleteDoc, writeBatch } from "firebase/firestore";
import type { TiktokAccount, TiktokVideo } from "@/lib/types";
import { refreshTiktokData } from "@/ai/flows/refresh-tiktok-data";
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
import { SiTiktok } from "react-icons/si";


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
    const tiktokScope = 'user.info.profile,user.info.stats,video.list';
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const tiktokAccountsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'tiktokAccounts');
    }, [firestore, user]);

    const { data: tiktokAccounts, isLoading: isLoadingTiktok } = useCollection<TiktokAccount>(tiktokAccountsQuery);

    const isTiktokConnected = useMemo(() => tiktokAccounts && tiktokAccounts.length > 0, [tiktokAccounts]);
    const tiktokAccount = useMemo(() => tiktokAccounts?.[0], [tiktokAccounts]);

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

    const handleSyncTikTok = async () => {
        if (!user || !firestore || !tiktokAccount) {
            toast({
                title: "Erro",
                description: "Nenhuma conta do TikTok para sincronizar.",
                variant: "destructive",
            });
            return;
        }

        setIsSyncing(true);

        try {
            const result = await refreshTiktokData({ refreshToken: tiktokAccount.refreshToken });
            
            const batch = writeBatch(firestore);

            const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id);
            const accountData = {
                // ...existing data is preserved by merge
                followerCount: result.follower_count,
                followingCount: result.following_count,
                likesCount: result.likes_count,
                videoCount: result.video_count,
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                tokenExpiresAt: Date.now() + result.expires_in * 1000,
                refreshTokenExpiresAt: Date.now() + result.refresh_expires_in * 1000,
                lastSyncStatus: 'success',
                lastSyncTime: new Date().toISOString(),
                lastSyncError: '', // Clear any previous error
            };
            batch.set(tiktokAccountRef, accountData, { merge: true });

            if (result.videos && result.videos.length > 0) {
                const videosCollectionRef = collection(tiktokAccountRef, 'videos');
                result.videos.forEach(video => {
                    const videoDocRef = doc(videosCollectionRef, video.id);
                    batch.set(videoDocRef, video, { merge: true });
                });
            }

            await batch.commit();

            toast({
                title: "Sincronização Concluída!",
                description: `Seus dados do TikTok foram atualizados. ${result.videos.length} vídeos sincronizados.`,
            });

        } catch (error: any) {
            console.error("Erro ao sincronizar dados do TikTok:", error);
            const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccount.id);
            await setDoc(tiktokAccountRef, { 
                lastSyncStatus: 'error',
                lastSyncError: error.message || 'Unknown error'
            }, { merge: true });
            
            toast({
                title: "Erro na Sincronização",
                description: error.message || "Não foi possível atualizar seus dados do TikTok. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
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

        window.open(metaAuthUrl.toString(), 'instagramLogin', 'width=600,height=700');
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Conexões de API</h1>
                <p className="text-muted-foreground max-w-3xl">
                    Conecte suas contas de redes sociais para alimentar nosso sistema de IA com dados reais. Isso nos permite fornecer análises de performance precisas, gerar projeções de crescimento personalizadas e sugerir conteúdo que ressoa com seu público.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                        <SiTiktok className="h-6 w-6 text-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {isLoadingTiktok ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                                <span className="text-lg font-bold">Verificando...</span>
                            </div>
                        ) : isTiktokConnected ? (
                            <>
                                <div className="text-lg font-bold text-green-500 flex items-center gap-2"><CheckCircle className="h-5 w-5"/>Conectado</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sua conta <span className='font-bold'>{tiktokAccount?.username}</span> está sincronizada.
                                </p>
                                {tiktokAccount?.lastSyncTime && (
                                     <p className="text-xs text-muted-foreground mt-1">
                                        Última sinc: {new Date(tiktokAccount.lastSyncTime).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold">Não conectado</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Importe vídeos, métricas de seguidores e engajamento para uma análise completa.
                                </p>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        {isTiktokConnected ? (
                             <div className="w-full grid grid-cols-2 gap-2">
                                 <Button variant="outline" className="w-full" onClick={handleSyncTikTok} disabled={isSyncing}>
                                    {isSyncing ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCw className="mr-2" />}
                                    Sincronizar
                                </Button>
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
                            </div>
                        ) : (
                            <Button className="w-full" onClick={handleConnectTikTok} disabled={isUserLoading || isLoadingTiktok}>
                                <Share2 className="mr-2" /> Conectar TikTok
                            </Button>
                        )}
                        
                    </CardFooter>
                </Card>
                
                 <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                        <InstagramIcon className="h-6 w-6 text-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="text-lg font-bold">Não conectado</div>
                        <p className="text-xs text-muted-foreground mt-1">
                           Importe Reels e Stories, e analise a performance via API da Meta.
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
