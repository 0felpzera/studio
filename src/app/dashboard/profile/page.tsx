
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload, Loader2, Goal as GoalIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal, GoalSchema } from "@/lib/types";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
    
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingGoals, setIsSavingGoals] = useState(false);

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    
    // Goals data fetching
    const goalsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'goals');
    }, [user, firestore]);

    const { data: goals, isLoading: isLoadingGoals } = useCollection<Goal>(goalsQuery);
    const userGoal = useMemo(() => goals?.[0], [goals]);

    // Profile form state
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Goals form state
    const goalForm = useForm<z.infer<typeof GoalSchema>>({
        resolver: zodResolver(GoalSchema),
        defaultValues: {
            niche: '',
            followerGoal: 0,
            postingFrequency: '',
        },
    });

    useEffect(() => {
        if (userGoal) {
            goalForm.reset({
                niche: userGoal.niche || '',
                followerGoal: userGoal.followerGoal || 0,
                postingFrequency: userGoal.postingFrequency || '',
            });
        }
    }, [userGoal, goalForm]);


    const handleSaveProfile = async () => {
        if (!user || !auth.currentUser) {
            toast({ title: "Erro", description: "Você não está autenticado.", variant: "destructive" });
            return;
        }

        if (displayName === user.displayName) {
            toast({ title: "Nenhuma alteração", description: "Seu nome não foi modificado." });
            return;
        }

        setIsSavingProfile(true);
        try {
            await updateProfile(auth.currentUser, { displayName });
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { name: displayName }, { merge: true });

            toast({ title: "Sucesso!", description: "Seu nome de perfil foi atualizado." });
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast({ title: "Oh não!", description: "Não foi possível atualizar seu perfil. Tente novamente.", variant: "destructive" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveGoals = async (values: z.infer<typeof GoalSchema>) => {
        if (!user || !firestore) {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            return;
        }

        setIsSavingGoals(true);
         try {
            const goalData = {
                userId: user.uid,
                ...values,
            };
            const goalDocRef = doc(firestore, 'users', user.uid, 'goals', 'user-goal');
            await setDoc(goalDocRef, goalData, { merge: true });

            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { niche: values.niche }, { merge: true });

            toast({ title: "Sucesso!", description: "Suas metas foram atualizadas." });
        } catch (error) {
            console.error("Erro ao salvar metas:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar suas metas. Tente novamente.", variant: "destructive" });
        } finally {
            setIsSavingGoals(false);
        }
    };


    return (
        <div className="space-y-6">
            <header className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Perfil & Metas</h1>
                <p className="text-muted-foreground">
                    Gerencie os detalhes da sua conta e sua estratégia de crescimento.
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
                                <AvatarImage src={user?.photoURL || avatar.imageUrl} alt={user?.displayName || "User Avatar"} />
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
                <CardFooter>
                     <Button onClick={handleSaveProfile} disabled={isSavingProfile || isUserLoading}>
                        {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <Form {...goalForm}>
                    <form onSubmit={goalForm.handleSubmit(handleSaveGoals)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GoalIcon className="size-5 text-primary"/> Suas Metas</CardTitle>
                            <CardDescription>Ajuste suas metas de crescimento e estratégia de conteúdo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingGoals || isUserLoading ? (
                                <div className="space-y-4">
                                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                                </div>
                            ) : (
                                <>
                                <FormField
                                    control={goalForm.control}
                                    name="niche"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Seu nicho principal</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione seu nicho" /></SelectTrigger>
                                            </FormControl>
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
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={goalForm.control}
                                    name="followerGoal"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Meta de seguidores</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 10000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={goalForm.control}
                                    name="postingFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Frequência de postagem</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione a frequência" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1-2 times per week">1-2 vezes por semana</SelectItem>
                                                <SelectItem value="3-5 times per week">3-5 vezes por semana</SelectItem>
                                                <SelectItem value="6-7 times per week">6-7 vezes por semana</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSavingGoals || isLoadingGoals || isUserLoading}>
                                {isSavingGoals ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Salvar Metas
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
