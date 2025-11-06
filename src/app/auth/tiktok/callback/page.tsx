
'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { exchangeTikTokCode, ExchangeTikTokCodeOutput } from '@/ai/flows/exchange-tiktok-code';
import { collection } from 'firebase/firestore';

function TikTokCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Analisando a resposta do TikTok...");
  const [apiResponse, setApiResponse] = useState<ExchangeTikTokCodeOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // This effect should only run when the user's auth state is determined.
    if (isUserLoading) {
      setStatus("Verificando sua sessão...");
      return;
    }

    const authCode = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const returnedError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle initial errors from TikTok redirect
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

    if (!returnedState) {
        setError("Nenhuma validação de segurança (state) retornada pelo TikTok.");
        setStatus("Falha na validação de segurança.");
        setIsProcessing(false);
        return;
    }
    
    // Auth check: Ensure a Firebase user is logged in
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

    // All checks passed, proceed to exchange code
    const processCode = async () => {
      try {
        setStatus("Trocando código, buscando perfil e vídeos...");
        
        const redirectUri = "https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback";
        
        const result = await exchangeTikTokCode({ code: authCode, redirect_uri: redirectUri, state: returnedState });
        
        // Final security check: ensure the user ID from the decoded state matches the logged-in user
        if (result.decodedStateUserId !== user.uid) {
            setError("A sessão do usuário mudou durante a autenticação. Por segurança, o processo foi cancelado. Por favor, tente novamente.");
            setStatus("Conflito de sessão.");
            setIsProcessing(false);
            return;
        }

        setApiResponse(result);
        setStatus("Informações recebidas! Salvando tudo no banco de dados...");

        const batch = writeBatch(firestore);

        // 1. Set the main TikTok account document
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
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            tokenExpiresAt: Date.now() + result.expires_in * 1000,
            refreshTokenExpiresAt: Date.now() + result.refresh_expires_in * 1000,
            lastSyncStatus: 'success', // Sync is done in one go
            lastSyncTime: new Date().toISOString(),
        };
        batch.set(tiktokAccountRef, accountData, { merge: true });

        // 2. Set the video documents in the subcollection
        if (result.videos && result.videos.length > 0) {
            const videosCollectionRef = collection(tiktokAccountRef, 'videos');
            result.videos.forEach(video => {
                const videoDocRef = doc(videosCollectionRef, video.id);
                batch.set(videoDocRef, video);
            });
        }
        
        // 3. Commit the batch
        await batch.commit();

        toast({
            title: "Conta TikTok Conectada!",
            description: `Bem-vindo, ${result.display_name}! Sincronizamos ${result.videos.length} vídeos.`,
        });

        setStatus("Conexão bem-sucedida! Redirecionando...");
        setIsProcessing(false);

        setTimeout(() => {
            router.push('/dashboard');
        }, 3000);

      } catch (e: any) {
        console.error("Erro ao processar o código do TikTok:", e);
        setError(e.message || "Falha ao obter dados do TikTok.");
        setStatus("Erro ao processar a autenticação.");
        setIsProcessing(false);
      }
    };
    
    // Only call processCode if it hasn't been run yet (isProcessing is true)
    if (isProcessing) {
      processCode();
    }

  }, [isUserLoading, user, firestore, router, searchParams, toast]);

  const renderStatus = () => {
      if (isProcessing) {
          return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-5 w-5" /> {status}</div>;
      }
      if (error) {
          return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5"/> {status}</div>;
      }
      if (apiResponse) {
           return <div className="flex items-center gap-2 text-green-500"><CheckCircle className="h-5 w-5"/> {status}</div>;
      }
      return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl">
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
                {apiResponse && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Resposta da API do TikTok</CardTitle>
                            {!error && <CardDescription>Sincronização concluída. Redirecionando para o dashboard em 3 segundos...</CardDescription>}
                        </CardHeader>
                        <CardContent>
                           <pre className="mt-2 w-full overflow-auto text-sm bg-muted p-4 rounded-lg">
                                {JSON.stringify(apiResponse, null, 2)}
                           </pre>
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
