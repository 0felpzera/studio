
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Upload } from "lucide-react";

export default function ProfilePage() {
    const { user } = useUser();
    const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');

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
                                <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>}
                            <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full">
                                <Upload className="size-4" />
                                <span className="sr-only">Carregar foto</span>
                            </Button>
                        </div>
                        <div className="grid gap-1.5">
                            <h2 className="text-xl font-semibold">Jane Doe</h2>
                            <p className="text-sm text-muted-foreground">{user?.email || 'carregando...'}</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" defaultValue="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                     <Button>Salvar Alterações</Button>
                </CardContent>
            </Card>
        </div>
    );
}