
'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { exchangeTikTokCode, ExchangeTikTokCodeOutput } from '@/ai/flows/exchange-tiktok-code';

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
    if (isUserLoading) {
      setStatus("Verificando sua sessão...");
      return;
    }

    const authCode = searchParams.get('code');
    const returnedState = searchParams.get('state');
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

    if (!returnedState) {
        setError("Nenhuma validação de segurança (state) retornada pelo TikTok.");
        setStatus("Falha na validação de segurança.");
        setIsProcessing(false);
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
        setStatus("Trocando código, buscando perfil e vídeos...");
        
        // This must match the URI registered in the TikTok Developer portal
        const redirectUri = new URL(window.location.href);
        redirectUri.search = ''; // Remove query params to get the base callback URL
        
        const result = await exchangeTikTokCode({ code: authCode, redirect_uri: redirectUri.toString(), state: returnedState });
        
        let decodedState: { userId: string; random: string; from: string };
        try {
            decodedState = JSON.parse(Buffer.from(returnedState, 'base64').toString('utf8'));
        } catch (e) {
            throw new Error("Falha ao decodificar o parâmetro 'state' de segurança.");
        }

        if (decodedState.userId !== user.uid) {
            setError("A sessão do usuário mudou durante a autenticação. Por segurança, o processo foi cancelado. Por favor, tente novamente.");
            setStatus("Conflito de sessão.");
            setIsProcessing(false);
            return;
        }

        setApiResponse(result);
        setStatus("Informações recebidas! Salvando tudo no banco de dados...");

        const batch = writeBatch(firestore);

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
            lastSyncStatus: 'success',
            lastSyncTime: new Date().toISOString(),
        };
        batch.set(tiktokAccountRef, accountData, { merge: true });

        if (result.videos && result.videos.length > 0) {
            const videosCollectionRef = collection(tiktokAccountRef, 'videos');
            result.videos.forEach(video => {
                const videoDocRef = doc(videosCollectionRef, video.id);
                batch.set(videoDocRef, video);
            });
        }
        
        await batch.commit();

        toast({
            title: "Conta TikTok Conectada!",
            description: `Bem-vindo, ${result.display_name}! Sincronizamos ${result.videos.length} vídeos.`,
        });

        setStatus("Conexão bem-sucedida! Redirecionando...");
        setIsProcessing(false);

        const destination = decodedState.from === 'onboarding' ? '/onboarding?tiktokConnected=true' : '/dashboard';

        setTimeout(() => {
            router.push(destination);
        }, 1500);

      } catch (e: any) {
        console.error("Erro ao processar o código do TikTok:", e);
        setError(e.message || "Falha ao obter dados do TikTok.");
        setStatus("Erro ao processar a autenticação.");
        setIsProcessing(false);
      }
    };
    
    if (isProcessing) {
      processCode();
    }

  }, [isUserLoading, user, firestore, router, searchParams, toast, isProcessing]);

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
                {apiResponse && !error && (
                    <div className="flex items-start gap-3 text-green-600 bg-green-500/10 p-3 rounded-lg">
                        <CheckCircle className="h-5 w-5 mt-0.5"/>
                        <div>
                            <h4 className="font-semibold">Sucesso!</h4>
                            <p className="text-sm">Redirecionando em breve...</p>
                        </div>
                    </div>
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

    