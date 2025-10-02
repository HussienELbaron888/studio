
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/language-context';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Globe, LogIn, LogOut, User as UserIcon, LayoutDashboard, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

function UserNav() {
  const { user } = useAuth();
  const { content } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
         <DropdownMenuItem onClick={() => router.push('/my-subscriptions')}>
          <ListChecks className="mr-2 h-4 w-4" />
          <span>{content.mySubscriptions}</span>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{content.navDashboard}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{content.login}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function AppHeader() {
  const { content, toggleLanguage, language } = useLanguage();
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-full max-w-7xl items-center px-4">
        <div className="flex items-center md:hidden">
          <SidebarTrigger />
        </div>

        <div className="flex-1 md:flex-grow-0" />
        
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
            <Image src="/AGS LOGO.png" alt="AGS Logo" width={110} height={110} priority style={{ height: 'auto', width: 'auto' }} />
            <Image src="/ACTIVITY.png" alt="Activity Logo" width={110} height={110} style={{ height: 'auto', width: 'auto' }} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle Language">
            <Globe className="h-5 w-5" />
          </Button>
          {!loading && (
            <>
              {user ? (
                <UserNav />
              ) : (
                <>
                  <Button asChild variant="ghost" className="hidden sm:inline-flex">
                    <Link href="/login">
                      <LogIn className={cn("h-4 w-4", language === 'ar' ? 'ml-2' : 'mr-2')} />
                      {content.login}
                    </Link>
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/register">{content.register}</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
