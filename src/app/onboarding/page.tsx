'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, Goal, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TrendifyLogo } from '@/components/icons';

export default function OnboardingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [niche, setNiche] = useState('');
  const [followerGoal, setFollowerGoal] = useState('');
  const [postingFrequency, setPostingFrequency] = useState('');

  const handleConnectTikTok = () => {
    const clientKey = 'sbaw8kkl7ahscrla44'; // TikTok Client Key
    const redirectUri = 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback';
    const state = '___UNIQUE_STATE_TOKEN_TIKTOK___';
    const scope = 'user.info.basic,user.info.stats,video.list';

    const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    tiktokAuthUrl.searchParams.append('client_key', clientKey);
    tiktokAuthUrl.searchParams.append('scope', scope);
    tiktokAuthUrl.searchParams.append('response_type', 'code');
    tiktokAuthUrl.searchParams.append('redirect_uri', redirectUri);
    tiktokAuthUrl.searchParams.append('state', state);

    window.location.href = tiktokAuthUrl.toString();
  };

  const handleFinishOnboarding = async () => {
    if (!user || !firestore) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    if (!niche || !followerGoal || !postingFrequency) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos de metas.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const goalData = {
        userId: user.uid,
        niche,
        followerGoal: parseInt(followerGoal, 10),
        postingFrequency,
      };

      const goalDocRef = doc(collection(firestore, 'users', user.uid, 'goals'));
      await setDoc(goalDocRef, goalData);

      // Also update the main user doc with the niche
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { niche }, { merge: true });

      toast({
        title: "Tudo pronto!",
        description: "Suas metas foram salvas. Bem-vindo ao seu dashboard!",
      });

      router.push('/dashboard');

    } catch (error) {
      console.error("Erro ao salvar metas:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas metas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <TrendifyLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo(a) ao Trendify!</CardTitle>
          <CardDescription>Vamos configurar seu perfil para começar a crescer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
            <div className="space-y-4">
                <h3 className='font-semibold text-lg flex items-center gap-2'><Goal className='size-5 text-primary'/> Defina suas Metas</h3>
                 <div className="space-y-2">
                    <Label htmlFor="niche">Qual é o seu nicho principal?</Label>
                    <Select onValueChange={setNiche} value={niche}>
                        <SelectTrigger id="niche"><SelectValue placeholder="Selecione seu nicho" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Moda">Moda</SelectItem>
                            <SelectItem value="Beleza">Beleza</SelectItem>
                            <SelectItem value="Fitness">Fitness</SelectItem>
                            <SelectItem value="Culinária">Culinária</SelectItem>
                            <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                            <SelectItem value="Viagem">Viagem</SelectItem>
                            <SelectItem value="Games">Games</SelectItem>
                            <SelectItem value="Comédia">Comédia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="followerGoal">Qual sua meta de seguidores?</Label>
                    <Input id="followerGoal" type="number" placeholder="Ex: 10000" value={followerGoal} onChange={(e) => setFollowerGoal(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postingFrequency">Com que frequência você quer postar?</Label>
                     <Select onValueChange={setPostingFrequency} value={postingFrequency}>
                        <SelectTrigger id="postingFrequency"><SelectValue placeholder="Selecione a frequência" /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="1-2 times per week">1-2 vezes por semana</SelectItem>
                          <SelectItem value="3-5 times per week">3-5 vezes por semana</SelectItem>
                          <SelectItem value="6-7 times per week">6-7 vezes por semana</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className="space-y-4">
                <h3 className='font-semibold text-lg flex items-center gap-2'><Share2 className='size-5 text-primary'/> Conecte suas Contas</h3>
                <p className="text-sm text-muted-foreground">Conecte sua conta do TikTok para importar suas métricas e obter análises mais precisas.</p>
                <Button className="w-full" variant="outline" onClick={handleConnectTikTok}>
                   Conectar TikTok
                </Button>
            </div>
          
        </CardContent>
        <CardContent>
            <Button onClick={handleFinishOnboarding} disabled={isLoading} className="w-full font-bold text-lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Check className="mr-2" /> Concluir e ir para o Dashboard</>}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
