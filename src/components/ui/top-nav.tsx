"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface TopNavContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopNavContext = createContext<TopNavContextProps | undefined>(
  undefined
);

export const useTopNav = () => {
  const context = useContext(TopNavContext);
  if (!context) {
    throw new Error("useTopNav must be used within a TopNavProvider");
  }
  return context;
};

export const TopNav = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  props?: React.ComponentProps<"div">;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <TopNavContext.Provider value={{ open, setOpen }}>
        <div className={cn("md:hidden", className)} {...props}>
            <MobileTopNav>{children}</MobileTopNav>
        </div>
        <div className={cn("hidden md:block", className)} {...props}>
            <DesktopTopNav>{children}</DesktopTopNav>
        </div>
    </TopNavContext.Provider>
  );
};

export const DesktopTopNav = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { setOpen } = useTopNav();
  return (
    <motion.nav
      className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
        "flex items-center justify-between p-2 transition-all duration-300",
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.nav>
  );
};

export const MobileTopNav = ({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) => {
    const { open, setOpen } = useTopNav();
    return (
        <div className={cn("flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6 sticky top-0 z-40", className)} {...props}>
            {children}
            <div className="flex items-center gap-2">
                <Menu
                    className="text-foreground cursor-pointer"
                    onClick={() => setOpen(!open)}
                />
            </div>
            <AnimatePresence>
                {open && (
                <motion.div
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                    }}
                    className={cn(
                        "fixed h-screen w-full inset-0 bg-background p-6 z-[100] flex flex-col"
                    )}
                >
                    <div className="flex justify-between items-center mb-8">
                         {children}
                        <X
                            className="text-foreground cursor-pointer"
                            onClick={() => setOpen(!open)}
                        />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                         {children}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const TopNavBrand = ({
    className,
    children
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    const { open } = useTopNav();
    return <div className={cn(
        "flex items-center gap-2",
        !open && "md:w-[44px] md:overflow-hidden",
        className
    )}>{children}</div>
}

export const TopNavLinks = ({
    className,
    children
}: {
    className?: string;
    children: React.ReactNode;
}) => (
    <div className={cn(
        "flex items-center gap-2",
        "md:flex",
        "max-md:flex-col max-md:items-start max-md:gap-4",
        className
    )}>{children}</div>
)


export const TopNavLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open } = useTopNav();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2 group/topnav p-2 rounded-md hover:bg-muted transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">{link.icon}</div>
      <motion.span
        animate={{
          width: open ? "auto" : 0,
          opacity: open ? 1 : 0,
          display: open ? 'inline-block' : 'none'
        }}
        transition={{
            duration: 0.2,
            ease: 'linear'
        }}
        className={cn(
            "text-foreground text-sm whitespace-pre overflow-hidden",
            "max-md:inline-block max-md:w-auto max-md:opacity-100"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
