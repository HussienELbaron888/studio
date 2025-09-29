"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { useLanguage } from '@/context/language-context';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Globe, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { content, toggleLanguage, language } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-full max-w-7xl items-center px-4">
        <div className="flex items-center md:hidden">
          <SidebarTrigger />
        </div>

        <div className="flex-1 md:flex-grow-0" />
        
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            <Logo className="h-7 w-7" />
            <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
              Al-Nadi Hub
            </h1>
            <Logo className="h-7 w-7" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle Language">
            <Globe className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">
              <LogIn className={cn("h-4 w-4", language === 'ar' ? 'ml-2' : 'mr-2')} />
              {content.login}
            </Link>
          </Button>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/register">{content.register}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
