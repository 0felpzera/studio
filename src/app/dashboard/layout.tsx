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
import { ViralBoostLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'My Plan' },
  { href: '/dashboard/ideas', icon: Lightbulb, label: 'Video Ideas' },
  { href: '/dashboard/analysis', icon: Film, label: 'Video Analysis' },
  { href: '/dashboard/trends', icon: Flame, label: 'Trend Feed' },
];

const monetizationNavItems = [
    { href: '/dashboard/monetization', icon: DollarSign, label: 'Monetization' },
    { href: '/dashboard/sponsored-content', icon: Sparkles, label: 'Sponsored Content' },
]

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
            <ViralBoostLogo className="size-7 text-primary" />
            <h2 className="text-xl font-headline font-semibold text-primary">
              ViralBoost
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
          <SidebarGroup>
            <SidebarGroupLabel>Monetization</SidebarGroupLabel>
            <SidebarMenu>
                {monetizationNavItems.map((item) => (
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
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="#">
                        <SidebarMenuButton tooltip={{children: 'Settings', side: 'right'}}>
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: 'User Profile', side: 'right'}}>
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
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card/50 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="flex md:hidden" />
            <div className="flex-1">
                {/* Header content can go here */}
            </div>
            <Button>Upgrade Plan</Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
