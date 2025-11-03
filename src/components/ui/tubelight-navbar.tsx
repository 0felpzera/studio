
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LucideIcon, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

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

  // Find the initial active index based on the current path or default to first item
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


  // Update indicator position when active changes or on resize
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

    // Initial update
    updateIndicator();
    
    // Update on resize
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [active]);


  return (
    <div className={cn("fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6", className)}>
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

        {/* Sliding Active Indicator */}
        <motion.div
          className="absolute h-[calc(100%-0.5rem)] rounded-full bg-primary/10"
          style={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <div className="hidden sm:flex items-center gap-1 pl-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Entrar
            </Button>
            <Button size="sm" onClick={() => router.push('/signup')}>
                Cadastre-se
            </Button>
        </div>
        <div className="flex sm:hidden pl-1 pr-1">
             <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/login')}>
                <LogIn className="size-4" />
             </Button>
        </div>
      </div>
    </div>
  );
}
