'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, signInWithRedirect, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doc, setDoc } from 'firebase/firestore';


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
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const heroImage = PlaceHolderImages.find(img => img.id === 'demo-1');

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/onboarding');
        }
    }, [user, isUserLoading, router]);

    const handleGoogleSignUp = async () => {
        if (!auth) return;
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        // Redirect to login page, which will handle the result
        await signInWithRedirect(auth, provider);
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore || !email || !password || !name) return;
        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });
            
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, {
                id: user.uid,
                email: user.email,
                name: name,
            });

            // The useEffect will handle the redirect to /onboarding
        } catch (error: any) {
            console.error("Email sign up error:", error);
            let message = "Não foi possível criar sua conta. Tente novamente.";
            if (error.code === 'auth/email-already-in-use') {
                message = "Este e-mail já está em uso. Tente fazer login.";
            }
            toast({
                title: "Erro no Cadastro",
                description: message,
                variant: 'destructive',
            });
            setIsSubmitting(false);
        }
    };
    
    if (isUserLoading || isSubmitting || user) {
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
                        <h1 className="text-3xl font-bold">Crie sua conta</h1>
                        <p className="text-balance text-muted-foreground">
                            Comece a transformar sua estratégia de conteúdo hoje mesmo.
                        </p>
                    </div>

                    <form onSubmit={handleEmailSignUp} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" type="text" placeholder="Seu nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Conta
                        </Button>
                    </form>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">OU CONTINUE COM</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isSubmitting}>
                        <GoogleIcon className="mr-2 h-6 w-6" />
                        Cadastre-se com o Google
                    </Button>

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
