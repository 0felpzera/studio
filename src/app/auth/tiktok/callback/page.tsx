
'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDocs, query, collectionGroup, where } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { exchangeTikTokCode, ExchangeTikTokCodeOutput } from '@/ai/flows/exchange-tiktok-code';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { fetchTikTokHistory } from '@/ai/flows/fetch-tiktok-history';


function TikTokCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Analisando a resposta do TikTok...");
  const [userInfo, setUserInfo] = useState<ExchangeTikTokCodeOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const authCode = searchParams.get('code');
    const returnedError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (returnedError) {
      setError(errorDescription || "O TikTok retornou um erro desconhecido.");
      setStatus("Erro na autenticação.");
      setIsProcessing(false);
      return;
    }

    if (!authCode) {
      setError("Nenhum código de autorização encontrado na URL.");
      setStatus("Falha na autenticação.");
      setIsProcessing(false);
      return;
    }
    
    if (isUserLoading) {
      setStatus("Verificando sua sessão...");
      return;
    }

    if (!user || !firestore) {
      setError("Você precisa estar logado para conectar uma conta.");
      setStatus("Usuário não autenticado.");
      setIsProcessing(false);
      toast({
        title: "Usuário não encontrado",
        description: "Faça o login antes de conectar sua conta do TikTok.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    const processCode = async () => {
      try {
        setStatus("Trocando código por token de acesso...");
        const result = await exchangeTikTokCode({ code: authCode });
        setUserInfo(result);
        setStatus("Informações do usuário recebidas! Salvando perfil...");

        const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', result.open_id);
        
        const accountData = {
            id: result.open_id,
            userId: user.uid,
            username: result.display_name,
            avatarUrl: result.avatar_url,
            followerCount: result.follower_count,
            followingCount: result.following_count,
            likesCount: result.likes_count,
            videoCount: result.video_count,
            bioDescription: result.bio_description || '',
            isVerified: result.is_verified || false,
            profileDeepLink: result.profile_deep_link || '',
            profileWebLink: result.profile_web_link || '',
            // Do not save videos here. They will be saved in a subcollection.
            // Save tokens for background processing
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            tokenExpiresAt: Date.now() + result.expires_in * 1000,
            refreshTokenExpiresAt: Date.now() + result.refresh_expires_in * 1000,
            lastSyncStatus: 'pending',
        };

        // Save the main account data. This is a blocking operation on the callback page.
        await setDoc(tiktokAccountRef, accountData, { merge: true });
        
        setStatus("Perfil salvo. Iniciando sincronização do histórico de vídeos em segundo plano...");

        // Trigger the background history fetch, but DO NOT await it.
        fetchTikTokHistory({
            userId: user.uid,
            tiktokAccountId: result.open_id,
            accessToken: result.access_token,
        }).catch(e => {
            // This error happens in the background, so we can't show it directly to the user
            // on this page. We should log it or update the sync status in Firestore.
            console.error("Erro na sincronização de histórico em segundo plano:", e);
            const accountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', result.open_id);
            setDoc(accountRef, { lastSyncStatus: 'error', lastSyncError: e.message }, { merge: true });
        });

        toast({
            title: "Conta TikTok Conectada!",
            description: `Bem-vindo, ${result.display_name}! Estamos sincronizando seu histórico de vídeos.`,
        });

        setTimeout(() => {
            router.push('/dashboard');
        }, 3000);

      } catch (e: any) {
        console.error("Erro ao trocar o código do TikTok:", e);
        setError(e.message || "Falha ao obter o token de acesso do TikTok.");
        setStatus("Erro ao processar a autenticação.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    processCode();

  }, [searchParams, user, isUserLoading, firestore, router]);

  const renderStatus = () => {
      if (isProcessing) {
          return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5" /> {status}</div>;
      }
      if (error) {
          return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5"/> {status}</div>;
      }
      if (userInfo) {
           return <div className="flex items-center gap-2 text-green-500"><CheckCircle className="h-5 w-5"/> {status}</div>;
      }
      return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Processando Conexão TikTok
                </CardTitle>
                <div className="text-sm text-muted-foreground pt-2">
                   {renderStatus()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && (
                    <div className="flex items-start gap-3 text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertTriangle className="h-5 w-5 mt-0.5"/>
                        <div>
                            <h4 className="font-semibold">Ocorreu um Erro</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {userInfo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Usuário Conectado</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userInfo.avatar_url} alt={userInfo.display_name} />
                                <AvatarFallback>{userInfo.display_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-xl">{userInfo.display_name}</p>
                                <p className="text-sm text-muted-foreground">Seguidores: {userInfo.follower_count.toLocaleString('pt-BR')}</p>
                            </div>
                        </CardContent>
                         <CardContent>
                             <p className="text-sm text-muted-foreground">Você será redirecionado para o dashboard em breve...</p>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

export default function TikTokCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando...</p>
            </div>
        }>
            <TikTokCallback />
        </Suspense>
    )
}

    