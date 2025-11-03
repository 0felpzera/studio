'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function TikTokCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Não faça nada até que o usuário seja carregado
    if (isUserLoading) {
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const processCallback = async () => {
      // Se não houver usuário após o carregamento, redirecione para o login
      if (!user) {
        toast({
            title: "Usuário não encontrado",
            description: "Você precisa estar logado para conectar sua conta.",
            variant: "destructive"
        });
        router.replace('/login');
        return;
      }
      
      // Se houver código e estado, processe a conexão
      if (code && state && firestore) {
        if (state === '___UNIQUE_STATE_TOKEN_TIKTOK___') {
          try {
            // Simular a criação de uma conta no Firestore
            const tiktokAccountId = 'tiktok-' + user.uid;
            const tiktokAccountRef = doc(firestore, 'users', user.uid, 'tiktokAccounts', tiktokAccountId);
            
            await setDoc(tiktokAccountRef, {
              id: tiktokAccountId,
              userId: user.uid,
              followerCount: 25000, // Dado de exemplo
              engagementRate: 0.05, // Dado de exemplo (5%)
            });

            toast({
              title: "Conta TikTok Conectada!",
              description: "Seus dados foram sincronizados com sucesso.",
            });

          } catch (error) {
            console.error("Erro ao salvar conta do TikTok:", error);
            toast({
              title: "Erro ao salvar conexão",
              description: "Não foi possível salvar os dados da sua conta TikTok.",
              variant: "destructive",
            });
          }
        }
      }
      
      // Após o processamento (ou se não houver código), redireciona para a página de conexões
      router.replace('/dashboard/connections');
    };

    processCallback();

  }, [user, isUserLoading, firestore, router, searchParams, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Finalizando conexão com o TikTok...</p>
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
