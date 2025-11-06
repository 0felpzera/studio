'use client';

import React, { ReactNode, useState } from 'react';
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
    Menu,
    X,
    FileText,
    Users,
    TrendingUp,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plano de Conteúdo', href: '/dashboard/plan', icon: CalendarCheck },
  { name: 'Plano de Crescimento', href: '/dashboard/growth-plan', icon: TrendingUp },
  { name: 'Conexões', href: '/dashboard/connections', icon: Share2 },
  { name: 'Perfil', href: '/dashboard/profile', icon: Users },
];

const resourcesItems = [
    { name: 'Gerador de Ideias', href: '/dashboard/ideas', icon: Lightbulb },
    { name: 'Feed de Tendências', href: '/dashboard/trends', icon: Flame },
    { name: 'Análise de Vídeo', href: '/dashboard/analysis', icon: Presentation },
    { name: 'Monetização', href: '/dashboard/monetization', icon: DollarSign },
    { name: 'Ideias para Publis', href: '/dashboard/sponsored-content', icon: Star },
    { name: 'Prompts da IA', href: '/dashboard/prompts', icon: FileText },
];

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    const pathname = usePathname();
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            if (auth) {
                await signOut(auth);
                if (onLinkClick) onLinkClick();
                router.push('/login');
            }
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const handleLinkClick = (href: string) => {
        router.push(href);
        if (onLinkClick) {
            onLinkClick();
        }
    }

    return (
        <>
            <div className="h-20 flex items-center justify-center border-b">
                <Link href="/" className="flex items-center gap-2" onClick={onLinkClick}>
                    <span className="text-xl font-bold text-foreground font-headline">Trendify</span>
                </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className='overflow-y-auto p-4 space-y-1'>
                    <p className="px-4 py-2 text-xs font-semibold text-primary tracking-wider">Menu</p>
                    {[...navItems].map(item => (
                        <Button
                            key={item.name}
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn('w-full justify-start gap-3', 
                               pathname === item.href ? 'text-primary font-semibold' : 'text-black'
                            )}
                            onClick={() => handleLinkClick(item.href)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Button>
                    ))}
                    <p className="px-4 pt-4 pb-2 text-xs font-semibold text-primary tracking-wider">Ferramentas de IA</p>
                     {resourcesItems.map(item => (
                        <Button
                            key={item.name}
                            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                            className={cn('w-full justify-start gap-3', 
                               pathname.startsWith(item.href) ? 'text-primary font-semibold' : 'text-black'
                            )}
                            onClick={() => handleLinkClick(item.href)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Button>
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
        </>
    );
};


export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    return (
        <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
            <div className="shape-1"></div>
            <div className="shape-2"></div>
            <div className="flex h-screen w-full">
                {/* Desktop Sidebar */}
                <aside className="w-64 flex-shrink-0 flex-col z-10 hidden md:flex bg-card/60 border-r">
                    <SidebarContent />
                </aside>

                <div className="flex flex-1 flex-col">
                    {/* Mobile Header */}
                    <header className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-lg font-bold font-headline">Trendify</span>
                        </Link>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Abrir menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                                <SheetHeader>
                                    <SheetTitle className='sr-only'>Menu Principal</SheetTitle>
                                </SheetHeader>
                                <SidebarContent onLinkClick={() => setIsSheetOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    </header>

                    <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
