'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const { user } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSaveChanges = async () => {
        if (!user || !auth.currentUser) {
            toast({
                title: "Erro",
                description: "Você não está autenticado.",
                variant: "destructive",
            });
            return;
        }

        if (displayName === user.displayName) {
             toast({
                title: "Nenhuma alteração",
                description: "Seu nome não foi modificado.",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, { displayName });

            // Update/Create Firestore document
            const userDocRef = doc(firestore, 'users', user.uid);
            // Use setDoc with merge:true to create or update the document
            await setDoc(userDocRef, { name: displayName }, { merge: true });

            toast({
                title: "Sucesso!",
                description: "Seu perfil foi atualizado.",
            });
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast({
                title: "Oh não! Algo deu errado.",
                description: "Não foi possível atualizar seu perfil. Por favor, tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <header className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Perfil</h1>
                <p className="text-muted-foreground">
                    Gerencie os detalhes da sua conta e preferências.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>Atualize seu nome, e-mail e foto de perfil.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {avatar && <Avatar className="size-20">
                                <AvatarImage src={user?.photoURL || avatar.imageUrl} alt={avatar.description} />
                                <AvatarFallback>{displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>}
                            <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full">
                                <Upload className="size-4" />
                                <span className="sr-only">Carregar foto</span>
                            </Button>
                        </div>
                        <div className="grid gap-1.5">
                            <h2 className="text-xl font-semibold">{displayName || 'Carregando...'}</h2>
                            <p className="text-sm text-muted-foreground">{email || 'carregando...'}</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={email} disabled />
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                     <Button onClick={handleSaveChanges} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : null}
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
