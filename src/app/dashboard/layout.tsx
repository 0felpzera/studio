
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
  Share2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { useAuth, useUser } from '@/firebase';
import { FloatingNav } from '@/components/ui/floating-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  { name: 'Dashboard', link: '/dashboard', icon: <LayoutDashboard className="size-4" /> },
  { name: 'Plano', link: '/dashboard/plan', icon: <CalendarCheck className="size-4" /> },
  { name: 'Ideias', link: '/dashboard/ideas', icon: <Lightbulb className="size-4" /> },
  { name: 'Tendências', link: '/dashboard/trends', icon: <Flame className="size-4" /> },
  { name: 'Análise', link: '/dashboard/analysis', icon: <Presentation className="size-4" /> },
  { name: 'Monetização', link: '/dashboard/monetization', icon: <DollarSign className="size-4" /> },
  { name: 'Publis', link: '/dashboard/sponsored-content', icon: <Star className="size-4" /> },
  { name: 'Conexões', link: '/dashboard/connections', icon: <Share2 className="size-4" /> },
];

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
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-20 items-center justify-between gap-4 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Logo />

        <div className="absolute left-1/2 -translate-x-1/2">
            <FloatingNav navItems={navItems} />
        </div>

        <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="size-8">
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
