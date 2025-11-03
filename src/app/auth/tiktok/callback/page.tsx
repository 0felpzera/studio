'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function TikTokCallback() {
  const searchParams = useSearchParams();
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [authState, setAuthState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Analisando a resposta do TikTok...");

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const returnedError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (returnedError) {
        setError(errorDescription || "O TikTok retornou um erro desconhecido.");
        setStatusMessage("Erro na autenticação.");
        return;
    }

    if (code && state) {
        setAuthCode(code);
        setAuthState(state);
        setStatusMessage("Código de autorização recebido com sucesso.");
    } else {
        setStatusMessage("Nenhum código de autorização encontrado na URL.");
        setError("O TikTok não retornou um código. Isso pode acontecer se a autorização for negada.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Resposta da Autenticação TikTok
                </CardTitle>
                <CardDescription>
                   {statusMessage}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold">Dados Recebidos na URL</h4>
                    <p className="text-sm text-muted-foreground">Estes são os parâmetros que o TikTok retornou ao seu navegador.</p>
                    <div className="pt-2">
                        {authCode ? (
                            <p className="text-sm font-mono break-all">
                                <span className="font-semibold">Código (code): </span> {authCode}
                            </p>
                        ) : (
                             <p className="text-sm text-muted-foreground">Nenhum código de autorização recebido.</p>
                        )}
                        {authState && (
                            <p className="text-sm font-mono break-all mt-2">
                                 <span className="font-semibold">Estado (state): </span> {authState}
                            </p>
                        )}
                    </div>
                </div>
                
                 <div className="flex items-start gap-3 text-sky-600 bg-sky-500/10 p-4 rounded-lg">
                    <Info className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold">Próximos Passos (Backend)</h4>
                        <p className="text-sm">
                            Este <span className="font-bold">código de autorização</span> é temporário e de uso único. Para obter os dados reais do usuário (nome, avatar, etc.), seu servidor (backend) precisaria trocar este código por um `access_token` usando sua Client Secret.
                        </p>
                    </div>
                </div>

                 {error && (
                    <div className="flex items-start gap-3 text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertTriangle className="h-5 w-5 mt-0.5"/>
                        <div>
                            <h4 className="font-semibold">Ocorreu um Erro</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardContent>
                 <Button asChild>
                    <Link href="/dashboard/connections">Voltar para Conexões</Link>
                </Button>
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
