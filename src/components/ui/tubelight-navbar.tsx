
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LucideIcon, LogIn, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useUser } from "@/firebase";
import { Skeleton } from "./skeleton";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const initialActiveIndex = items.findIndex((item) => item.url === pathname || (item.url === '#' && pathname === '/'));
  const [active, setActive] = useState(initialActiveIndex !== -1 ? initialActiveIndex : 0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const newActiveIndex = items.findIndex((item) => item.url === pathname || (item.url === '#' && pathname === '/'));
    if (newActiveIndex !== -1) {
      setActive(newActiveIndex);
    }
  }, [pathname, items]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeItem = itemRefs.current[active];
      if (activeItem && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        setIndicatorStyle({
          width: itemRect.width,
          left: itemRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active]);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 pt-6 px-4 flex items-center justify-between", className)}>
      <div className="flex-1"></div>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center bg-card shadow-lg rounded-full p-1 border border-border"
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              ref={(el) => (itemRefs.current[index] = el)}
              href={item.url}
              onClick={() => setActive(index)}
              className={cn(
                "relative z-10 flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                 active === index ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4 md:mr-2" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}

        <motion.div
          className="absolute h-[calc(100%-0.5rem)] rounded-full bg-primary/10"
          style={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex justify-end">
        {isUserLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
            </div>
        ) : user ? (
           <Button size="sm" onClick={() => router.push('/dashboard')} className="whitespace-nowrap">
                <ArrowLeft className="size-4 mr-2" />
                Voltar ao App
            </Button>
        ) : (
            <div className="hidden sm:flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')} className="whitespace-nowrap">
                    Entrar
                </Button>
                <Button size="sm" onClick={() => router.push('/signup')} className="whitespace-nowrap">
                    Cadastre-se
                </Button>
            </div>
        )}
         <div className="flex sm:hidden">
            { !isUserLoading && !user && (
                 <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/login')}>
                    <LogIn className="size-4" />
                 </Button>
            )}
        </div>
      </div>
    </div>
  );
}
