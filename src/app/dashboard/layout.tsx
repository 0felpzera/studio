
'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser } from '@/firebase';
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
    LogOut,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';

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
    const auth = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            if (auth) {
                await signOut(auth);
                router.push('/login');
            }
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <aside className="w-64 flex-shrink-0 flex-col z-10 hidden md:flex bg-card/60">
            <div className="h-20 flex items-center justify-center border-b">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-black font-headline">Trendify</span>
                </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className='overflow-y-auto p-4'>
                    <p className="px-4 py-2 text-xs font-semibold text-black tracking-wider">Menu</p>
                    {[...navItems].map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn('flex items-center gap-3 px-4 py-2.5 rounded-lg text-black transition-colors hover:bg-white/5',
                               pathname === item.href ? 'bg-primary/10 text-primary font-semibold' : 'font-medium'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-black tracking-wider">Ferramentas de IA</p>
                     {resourcesItems.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn('flex items-center gap-3 px-4 py-2.5 rounded-lg text-black transition-colors hover:bg-white/5',
                               pathname.startsWith(item.href) ? 'bg-primary/10 text-primary font-semibold' : 'font-medium'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/avatar/100/100"} alt={user?.displayName || "User Avatar"} />
                        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                        <p className="font-semibold text-foreground truncate">{user?.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                     <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                        <LogOut className="w-5 h-5" />
                    </Button>
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
