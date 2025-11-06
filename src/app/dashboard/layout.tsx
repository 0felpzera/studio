'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    CalendarCheck,
    Lightbulb,
    Flame,
    Presentation,
    DollarSign,
    Star,
    Share2,
} from 'lucide-react';
import { ViralBoostLogo } from '@/components/icons';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plano de Conteúdo', href: '/dashboard/plan', icon: CalendarCheck },
  { name: 'Conexões', href: '/dashboard/connections', icon: Share2 },
];

const resourcesItems = [
    { name: 'Gerador de Ideias', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Feed de Tendências', href: '/dashboard/trends', icon: Flame },
    { name: 'Análise de Vídeo', href: '/dashboard/analysis', icon: Presentation },
    { name: 'Monetização', href: '/dashboard/monetization', icon: DollarSign },
    { name: 'Ideias para Publis', href: '/dashboard/sponsored-content', icon: Star },
];

const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();

    return (
        <aside className="glass-effect w-64 flex-shrink-0 flex-col z-10 hidden md:flex">
            <div className="h-20 flex items-center justify-center border-b border-white/10">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <ViralBoostLogo className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold text-white font-headline">ViralBoost</span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="px-4 py-2 text-xs font-semibold text-gray-300 tracking-wider">Menu</p>
                {[...navItems].map(item => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn('nav-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 transition-colors hover:bg-white/5',
                           pathname === item.href ? 'active' : ''
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
                <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-300 tracking-wider">Ferramentas de IA</p>
                 {resourcesItems.map(item => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn('nav-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 transition-colors hover:bg-white/5',
                           pathname.startsWith(item.href) ? 'active' : ''
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/avatar/100/100"} alt={user?.displayName || "User Avatar"} />
                        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-white">{user?.displayName}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
            <div className="shape-1"></div>
            <div className="shape-2"></div>
            <div className="flex h-screen w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
