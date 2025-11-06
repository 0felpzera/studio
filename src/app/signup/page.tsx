
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.223 0-9.655-3.449-11.303-8H6.306C9.656 39.663 16.318 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.598 33.355 48 27.435 48 20c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
    )
}

export default function SignUpPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Start as true to handle redirect
    const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

    // Effect to handle existing users or redirect after signup
    useEffect(() => {
        if (!isUserLoading) {
            if (user) {
                // If a user is logged in, they should be in onboarding or dashboard.
                // Redirecting to onboarding is safer.
                router.push('/onboarding');
            } else {
                // No user, ready to sign up.
                setIsLoading(false);
            }
        }
    }, [user, isUserLoading, router]);

    // Effect to handle the result of Google's redirect
    useEffect(() => {
        if (!auth || isUserLoading || user) return;

        getRedirectResult(auth)
            .then(async (result) => {
                if (result) {
                    setIsLoading(true); // Process the result
                    const user = result.user;
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    // Create user doc only if it's their first time
                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, {
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                        });
                    }
                    toast({ title: "Cadastro bem-sucedido!", description: "Vamos configurar seu perfil." });
                    // Redirect is handled by the other useEffect
                } else {
                    // This can be null if the page is loaded without a redirect flow in progress.
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error("Redirect result error:", error);
                toast({
                    title: "Erro no Cadastro",
                    description: "Não foi possível criar sua conta com o Google.",
                    variant: 'destructive'
                });
                setIsLoading(false);
            });
    }, [auth, firestore, router, toast, isUserLoading, user]);


    const handleSocialSignUp = async (providerName: 'google') => {
        setIsLoading(true);
        try {
            let provider;
            if (providerName === 'google') {
                provider = new GoogleAuthProvider();
            } else {
                throw new Error('Provedor de cadastro desconhecido');
            }
            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            toast({
                title: "Erro no Cadastro",
                description: "Não foi possível iniciar o cadastro. Tente novamente.",
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await updateProfile(newUser, { displayName: name });
            
            const userDocRef = doc(firestore, 'users', newUser.uid);
            await setDoc(userDocRef, {
                id: newUser.uid,
                email: newUser.email,
                name: name,
            });

            // On success, the main useEffect will redirect to onboarding
        } catch (error: any) {
             toast({
                title: "Erro no Cadastro",
                description: error.message || "Não foi possível criar sua conta.",
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    };
    
    if (isUserLoading || isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
       <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                         <Link href="/" className="inline-flex justify-center items-center gap-3 mb-4">
                            <h1 className="text-3xl font-headline font-bold text-foreground">Trendify</h1>
                        </Link>
                        <h1 className="text-3xl font-bold">Crie sua conta</h1>
                        <p className="text-balance text-muted-foreground">
                            Comece a transformar sua estratégia de conteúdo hoje mesmo.
                        </p>
                    </div>
                    <form onSubmit={handleSignUp} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" placeholder="Seu nome" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="criador@exemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                             {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </Button>
                    </form>
                     <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou cadastre-se com</span>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 gap-4">
                        <Button variant="outline" className="w-full" onClick={() => handleSocialSignUp('google')} disabled={isLoading}>
                            <GoogleIcon className="mr-2 h-6 w-6" />
                            Google
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="underline">
                            Faça login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block">
                {heroImage && (
                    <div className="relative h-full w-full">
                         <Image
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            data-ai-hint={heroImage.imageHint}
                            fill
                            objectFit="cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-10 left-10 text-white max-w-md">
                            <h2 className="text-3xl font-serif font-bold">"A criatividade é a inteligência se divertindo."</h2>
                            <p className="mt-2 text-lg font-light">- Albert Einstein (atribuído)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
