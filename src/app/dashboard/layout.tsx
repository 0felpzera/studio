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
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  TopNav,
  TopNavLink,
  TopNavBrand,
  TopNavLinks,
} from '@/components/ui/top-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';

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
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/plan', label: 'Meu Plano', icon: <CalendarCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/ideas', label: 'Ideias', icon: <Lightbulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/trends', label: 'Tendências', icon: <Flame className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/analysis', label: 'Análise', icon: <Presentation className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/monetization', label: 'Monetização', icon: <DollarSign className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  { href: '/dashboard/sponsored-content', label: 'Publis', icon: <Star className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
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
      <TopNav>
        {/* Brand section */}
        <TopNavBrand>
          <Logo />
        </TopNavBrand>

        {/* Main links */}
        <TopNavLinks>
          {navItems.map((item, idx) => (
            <TopNavLink key={idx} link={item} />
          ))}
        </TopNavLinks>
        
        {/* Right side Actions/Profile */}
        <TopNavLinks className="max-md:mt-auto">
           <TopNavLink
              link={{
                label: "Configurações",
                href: "/dashboard/settings",
                icon: (
                  <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
             <div onClick={handleLogout} className="w-full">
              <TopNavLink
                link={{
                  label: "Sair",
                  href: "#",
                  icon: (
                    <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  ),
                }}
              />
            </div>
            <Link href="/dashboard/profile" className="flex items-center gap-2 group/topnav p-2 rounded-md hover:bg-muted transition-colors w-full">
                 {avatar && <Avatar className="size-6">
                    <AvatarImage src={user?.photoURL || avatar.imageUrl} alt={avatar.description} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                }
                <span className='text-foreground text-sm whitespace-pre overflow-hidden'>
                    {isUserLoading ? "Carregando..." : user?.displayName || "Usuário"}
                </span>
            </Link>
        </TopNavLinks>

      </TopNav>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
