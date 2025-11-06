
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, AppleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
            <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
    )
}

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

export default function LoginPage() {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);
    
    const handleSocialLogin = async (providerName: 'google' | 'apple') => {
        setIsLoading(true);
        try {
            const provider = providerName === 'google' ? new GoogleAuthProvider() : new AppleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                });
                 router.push('/onboarding');
            } else {
                 router.push('/dashboard');
            }

            toast({
                title: "Login bem-sucedido!",
                description: "Redirecionando...",
            });

        } catch (error: any) {
            toast({
                title: "Erro no Login",
                description: error.message || "Não foi possível fazer login. Tente novamente.",
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Login bem-sucedido!",
                description: "Redirecionando para o seu painel.",
            });
        } catch (error: any) {
             toast({
                title: "Erro no Login",
                description: "E-mail ou senha incorretos. Por favor, tente novamente.",
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    };
    
    if (isUserLoading || user) {
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
                         <div className="inline-flex justify-center items-center gap-3 mb-4">
                            <h1 className="text-3xl font-headline font-bold text-foreground">Trendify</h1>
                        </div>
                        <h1 className="text-3xl font-bold">Boas-vindas de volta!</h1>
                        <p className="text-balance text-muted-foreground">
                            Faça login para continuar a impulsionar seu conteúdo.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="criador@exemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Senha</Label>
                                <Link href="#" className="ml-auto inline-block text-sm underline">
                                    Esqueceu sua senha?
                                </Link>
                            </div>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" size="icon" className="w-full h-12" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                            <GoogleIcon className="h-6 w-6" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-full h-12" onClick={() => handleSocialLogin('apple')} disabled={isLoading}>
                            <AppleIcon className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        Não tem uma conta?{" "}
                        <Link href="/signup" className="underline">
                            Cadastre-se
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
