
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function TikTokCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Idealmente, você enviaria o 'code' para o seu backend para trocar por um token.
    // Por enquanto, apenas redirecionamos de volta para a página de conexões
    // com os parâmetros para que a página possa mostrar o toast.
    if (code && state) {
      router.replace(`/dashboard/connections?code=${code}&state=${state}`);
    } else {
      // Se não houver código, redireciona para a página de conexões de qualquer maneira
      router.replace('/dashboard/connections');
    }
  }, [router, searchParams]);

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
