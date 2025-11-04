
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <header className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configurações</h1>
                <p className="text-muted-foreground">
                    Personalize as configurações da sua conta e notificações.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Escolha como você quer ser notificado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="notifications-email" className="text-base">Notificações por E-mail</Label>
                            <p className="text-sm text-muted-foreground">
                                Receba um resumo semanal das suas tarefas e progresso.
                            </p>
                        </div>
                        <Switch id="notifications-email" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="notifications-trending" className="text-base">Alertas de Tendências</Label>
                            <p className="text-sm text-muted-foreground">
                                Seja avisado sobre novas tendências relevantes para o seu nicho.
                            </p>
                        </div>
                        <Switch id="notifications-trending" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select defaultValue="system">
                            <SelectTrigger id="theme" className="max-w-xs">
                                <SelectValue placeholder="Selecione um tema" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Claro</SelectItem>
                                <SelectItem value="dark">Escuro</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Excluir Conta</CardTitle>
                    <CardDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="destructive">Excluir minha conta</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
