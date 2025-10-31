'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DollarSign,
  Film,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  CalendarCheck,
  Star,
  Users,
  BarChart2,
  ListVideo,
  ThumbsUp,
  Presentation,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendifyLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/plan', icon: CalendarCheck, label: 'Meu Plano' },
  { href: '/dashboard/ideas', icon: Lightbulb, label: 'Ideias' },
  { href: '/dashboard/trends', icon: Flame, label: 'Tendências' },
  { href: '/dashboard/analysis', icon: Presentation, label: 'Análise' },
  { href: '/dashboard/monetization', icon: DollarSign, label: 'Monetização' },
  { href: '/dashboard/sponsored-content', icon: Star, label: 'Publis' },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-1');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <TrendifyLogo className="size-7 text-primary" />
            <h2 className="text-lg font-headline font-semibold">
              Trendify
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side:'right' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="#">
                        <SidebarMenuButton tooltip={{children: 'Configurações', side: 'right'}}>
                            <Settings />
                            <span>Configurações</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: 'Perfil do Usuário', side: 'right'}}>
                        {avatar && <Avatar className="size-7">
                            <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>}
                        <span>Jane Doe</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="flex md:hidden" />
            <div className="flex-1">
                {/* Header content can go here */}
            </div>
            <Button variant="outline">Melhorar Plano</Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
