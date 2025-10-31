"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const FloatingNav = ({ navItems, className }: { navItems: { name: string; link: string; icon?: JSX.Element; }[]; className?: string; }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Find the initial active index based on the current path
  const initialActiveIndex = navItems.findIndex((item) => item.link === pathname);
  const [active, setActive] = useState(initialActiveIndex !== -1 ? initialActiveIndex : 0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const newActiveIndex = navItems.findIndex((item) => item.link === pathname);
    if (newActiveIndex !== -1) {
      setActive(newActiveIndex);
    }
  }, [pathname, navItems]);


  // Update indicator position when active changes or resize
  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[active] && containerRef.current) {
        const btn = btnRefs.current[active];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    // Add a small delay to allow for layout shifts
    const timeoutId = setTimeout(updateIndicator, 100);

    window.addEventListener("resize", updateIndicator);
    return () => {
        window.removeEventListener("resize", updateIndicator);
        clearTimeout(timeoutId);
    }
  }, [active]);

  const handleItemClick = (index: number, link: string) => {
    setActive(index);
    router.push(link);
  }

  return (
    <div className={cn("relative w-full max-w-fit mx-auto z-50", className)}>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center bg-card shadow-lg rounded-full p-1 border border-border"
      >
        {navItems.map((item, index) => (
          <button
            key={item.link}
            ref={(el) => (btnRefs.current[index] = el)}
            onClick={() => handleItemClick(index, item.link)}
            className={cn(
                "relative flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-full",
                active === index ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="z-10 flex items-center gap-2">
                {item.icon}
                <span className="hidden sm:block">{item.name}</span>
            </div>
          </button>
        ))}

        {/* Sliding Active Indicator */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute h-[calc(100%-0.5rem)] rounded-full bg-primary/10"
        />
      </div>
    </div>
  );
};
