
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';

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
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true); // Start loading to handle redirect
    const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

    // Centralized handler for Google redirect result
    useEffect(() => {
        if (!auth || !firestore || isUserLoading) {
            // Wait for dependencies to be ready
            return;
        }

        // Only process redirect result if there's no user logged in yet.
        if (!user) {
            getRedirectResult(auth)
                .then(async (result) => {
                    if (result) {
                        // User has successfully signed in via redirect.
                        const user = result.user;
                        const userDocRef = doc(firestore, 'users', user.uid);
                        const userDoc = await getDoc(userDocRef);

                        // If user document doesn't exist, it's a new user.
                        if (!userDoc.exists()) {
                            await setDoc(userDocRef, {
                                id: user.uid,
                                email: user.email,
                                name: user.displayName,
                            });
                            toast({ title: "Cadastro bem-sucedido!", description: "Vamos configurar seu perfil." });
                            // The next effect will redirect to onboarding.
                        }
                        // If user exists, the next effect will handle the redirect to dashboard.
                    } else {
                        // No redirect result, user is on the login page normally.
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Redirect result error:", error);
                    toast({
                        title: "Erro no Login",
                        description: "Não foi possível completar o login com Google.",
                        variant: 'destructive'
                    });
                    setIsLoading(false);
                });
        }
    }, [auth, firestore, isUserLoading, user, router, toast]);

    // Handles redirection for already logged-in users.
    useEffect(() => {
        if (!isUserLoading && user) {
            const checkUserDoc = async () => {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    router.push('/dashboard');
                } else {
                    router.push('/onboarding');
                }
            };
            checkUserDoc();
        } else if (!isUserLoading && !user) {
             // If after all checks, there's no user and not loading, show the page.
             setIsLoading(false);
        }
    }, [user, isUserLoading, router, firestore]);

    const handleSocialLogin = async () => {
        if (!auth) return;
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
                        <h1 className="text-3xl font-bold">Boas-vindas de volta!</h1>
                        <p className="text-balance text-muted-foreground">
                            Faça login para continuar a impulsionar seu conteúdo.
                        </p>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={handleSocialLogin} disabled={isLoading}>
                        <GoogleIcon className="mr-2 h-6 w-6" /> Google
                    </Button>

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
                            style={{ objectFit: 'cover' }}
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
