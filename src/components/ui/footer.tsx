
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-lg">Trendify</span>
            </Link>
            <p className="text-muted-foreground text-sm">
                Sua plataforma de IA para viralizar nas redes sociais. Analise, crie e monetize com o poder da inteligência artificial.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Twitter className="h-5 w-5" /></Link>
              </Button>
               <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Instagram className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Github className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Recursos</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Preços</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Entrar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Sobre nós</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Carreiras</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Imprensa</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Termos de Serviço</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Política de Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-3">Receba dicas e tendências no seu e-mail.</p>
              <form className="flex w-full">
                <Input type="email" placeholder="seu@email.com" className="rounded-r-none" />
                <Button type="submit" className="rounded-l-none">Inscrever</Button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Trendify. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
