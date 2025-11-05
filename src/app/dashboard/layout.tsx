
'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Settings,
  CalendarCheck,
  Star,
  Presentation,
  LogOut,
  User,
  Share2,
  ChevronDown,
  Wand2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { useAuth, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <TrendifyLogo className="h-7 w-7 text-primary" />
      <span className="font-semibold text-foreground dark:text-white whitespace-pre">
        Trendify
      </span>
    </Link>
  );
};

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plano', href: '/dashboard/plan', icon: CalendarCheck },
  { name: 'Conexões', href: '/dashboard/connections', icon: Share2 },
];

const resourcesItems = [
    { name: 'Gerador de Ideias', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Feed de Tendências', href: '/dashboard/trends', icon: Flame },
    { name: 'Análise de Vídeo', href: '/dashboard/analysis', icon: Presentation },
    { name: 'Assistente de Monetização', href: '/dashboard/monetization', icon: DollarSign },
    { name: 'Ideias para Publis', href: '/dashboard/sponsored-content', icon: Star },
];

const MainNav = () => {
  const pathname = usePathname();

  return (
    <nav 
      className="relative flex items-center justify-center bg-card/60 shadow-lg rounded-full p-1 border border-border/20 backdrop-blur-sm"
    >
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            'relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            pathname === item.href
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn('relative z-10 px-4 py-2 text-sm font-medium transition-colors rounded-full',
               resourcesItems.some(item => pathname.startsWith(item.href))
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Recursos
            <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
            <DropdownMenuGroup>
                {resourcesItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                         <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
       {/* Active indicator logic can be added here if needed */}
    </nav>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/login');
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center">
            <Logo />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <MainNav />
        </div>

        <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="size-10 border-2 border-border/20">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 -mt-4">
        {children}
      </main>
    </div>
  );
}
