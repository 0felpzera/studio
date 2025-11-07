
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Goal, Check, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function OnboardingComponent() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [niche, setNiche] = useState('');
  const [followerGoal, setFollowerGoal] = useState('');
  const [postingFrequency, setPostingFrequency] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const logo = PlaceHolderImages.find(img => img.id === 'logo');

  // Get sign-up data from URL, ensuring it's decoded.
  const signupName = useMemo(() => searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : '', [searchParams]);
  const signupEmail = useMemo(() => searchParams.get('email') ? decodeURIComponent(searchParams.get('email')!) : '', [searchParams]);
  const signupPassword = useMemo(() => searchParams.get('password') ? decodeURIComponent(searchParams.get('password')!) : '', [searchParams]);


  useEffect(() => {
    if (auth && firestore) {
      setIsAuthReady(true);
    }
  }, [auth, firestore]);

  useEffect(() => {
    // If we land on this page without signup data, something is wrong.
    if (isAuthReady && (!signupEmail || !signupName || !signupPassword)) {
        toast({
            title: "Sessão Inválida",
            description: "Por favor, inicie o processo de cadastro novamente.",
            variant: "destructive"
        });
        router.push('/signup');
    }
  }, [isAuthReady, router, signupEmail, signupName, signupPassword, toast]);


  const handleFinishOnboarding = async () => {
    if (!auth || !firestore) {
      toast({ title: "Erro", description: "Serviços de autenticação não disponíveis.", variant: "destructive" });
      return;
    }
    if (!niche || !followerGoal || !postingFrequency) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos de metas.", variant: "destructive" });
      return;
    }
    if (!signupEmail || !signupPassword || !signupName) {
        toast({ title: "Dados de Cadastro Incompletos", description: "Volte para a página de cadastro e tente novamente.", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const newUser = userCredential.user;

      // 2. Update user's profile with name
      await updateProfile(newUser, { displayName: signupName });

      // 3. Create user document in Firestore
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
          id: newUser.uid,
          email: newUser.email,
          name: signupName,
          niche,
      });

      // 4. Create goal document in Firestore
      const goalData = {
        userId: newUser.uid,
        niche,
        followerGoal: parseInt(followerGoal, 10),
        postingFrequency,
      };
      const goalDocRef = doc(firestore, 'users', newUser.uid, 'goals', 'user-goal');
      await setDoc(goalDocRef, goalData, { merge: true });

      toast({
        title: "Tudo pronto!",
        description: "Sua conta foi criada. Bem-vindo ao seu dashboard!",
      });
      
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Erro ao finalizar onboarding e criar conta:", error);
       let message = "Não foi possível criar sua conta. Tente novamente.";
        if (error.code === 'auth/email-already-in-use') {
            message = "Este e-mail já está em uso. Tente fazer login.";
        } else if (error.code === 'auth/invalid-email') {
            message = "O e-mail fornecido não é válido. Por favor, volte e verifique."
        }
      toast({
        title: "Erro ao Criar Conta",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthReady) {
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
                {logo && (
                  <Image
                    src={logo.imageUrl}
                    alt={logo.description}
                    data-ai-hint={logo.imageHint}
                    width={150}
                    height={40}
                    className="object-contain"
                  />
                )}
            </div>
          <CardTitle className="text-2xl font-bold">Quase lá, {signupName || 'Criador'}!</CardTitle>
          <CardDescription>Só mais alguns detalhes para personalizar sua experiência.</CardDescription>
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
        </CardContent>
        <CardFooter>
            <Button onClick={handleFinishOnboarding} disabled={isLoading || !isAuthReady} className="w-full font-bold text-lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <><Check className="mr-2" /> Criar Conta e ir para o Dashboard</>}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <OnboardingComponent />
        </Suspense>
    )
}
