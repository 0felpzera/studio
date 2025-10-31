'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
import {
  Sidebar,
  SidebarBody,
  SidebarLink
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <TrendifyLogo className="h-7 w-7 text-primary" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-foreground dark:text-white whitespace-pre"
      >
        Trendify
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <TrendifyLogo className="h-7 w-7 text-primary" />
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
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/login');
    });
  };

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 h-screen mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navItems.map((item, idx) => (
                <SidebarLink key={idx} link={item} />
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <SidebarLink
              link={{
                label: "Configurações",
                href: "/dashboard/settings",
                icon: (
                  <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
             <div onClick={handleLogout} className="cursor-pointer">
              <SidebarLink
                link={{
                  label: "Sair",
                  href: "#",
                  icon: (
                    <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  ),
                }}
              />
            </div>
            <SidebarLink
              link={{
                label: isUserLoading ? "Carregando..." : user?.displayName || "Usuário",
                href: "/dashboard/profile",
                icon: (
                   avatar && <Avatar className="size-5">
                    <AvatarImage src={user?.photoURL || avatar.imageUrl} alt={avatar.description} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex flex-col flex-1 h-full w-full">
         <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6 sticky top-0 z-30 md:hidden">
            <Logo/>
         </header>
         <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {children}
         </div>
      </main>
    </div>
  );
}
