'use client';

import React from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
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
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/plan', label: 'Meu Plano', icon: <CalendarCheck className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/ideas', label: 'Ideias', icon: <Lightbulb className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/trends', label: 'Tendências', icon: <Flame className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/analysis', label: 'Análise', icon: <Presentation className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/monetization', label: 'Monetização', icon: <DollarSign className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
  { href: '/dashboard/sponsored-content', label: 'Publis', icon: <Star className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
];

const rightNavItems = [
  { href: '/dashboard/settings', label: 'Configurações', icon: <Settings className="h-full w-full text-neutral-600 dark:text-neutral-300" /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/login');
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <Logo />

        <div className="flex-1 flex justify-center">
            <Dock className="items-end pb-2 bg-transparent dark:bg-transparent">
              {navItems.map((item) => (
                <DockItem key={item.href} className="aspect-square rounded-full bg-gray-200/50 dark:bg-neutral-800/50">
                  <Link href={item.href}>
                    <DockLabel>{item.label}</DockLabel>
                    <DockIcon>{item.icon}</DockIcon>
                  </Link>
                </DockItem>
              ))}
            </Dock>
        </div>

        <div className="flex items-center gap-2">
            <Dock className="items-end pb-2 bg-transparent dark:bg-transparent">
                {rightNavItems.map((item) => (
                    <DockItem key={item.href} className="aspect-square rounded-full bg-gray-200/50 dark:bg-neutral-800/50">
                        <Link href={item.href}>
                            <DockLabel>{item.label}</DockLabel>
                            <DockIcon>{item.icon}</DockIcon>
                        </Link>
                    </DockItem>
                ))}
                 <DockItem className="aspect-square rounded-full bg-gray-200/50 dark:bg-neutral-800/50" onClick={handleLogout}>
                    <DockLabel>Sair</DockLabel>
                    <DockIcon><LogOut className="h-full w-full text-neutral-600 dark:text-neutral-300" /></DockIcon>
                </DockItem>
            </Dock>
            <Link href="/dashboard/profile">
                 {avatar && <Avatar className="size-8">
                    <AvatarImage src={user?.photoURL || avatar.imageUrl} alt={avatar.description} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                }
            </Link>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
