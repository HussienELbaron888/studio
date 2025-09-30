"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInput,
  SidebarContent,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  Home,
  LayoutGrid,
  ImageIcon,
  Mail,
  Shield,
  LogIn,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    href: '/',
    icon: Home,
    key: 'navHome',
  },
  {
    href: '/activities',
    icon: LayoutGrid,
    key: 'navActivities',
  },
  {
    href: '/gallery',
    icon: ImageIcon,
    key: 'navGallery',
  },
  {
    href: '/contact',
    icon: Mail,
    key: 'navContact',
  },
  {
    href: '/dashboard',
    icon: Shield,
    key: 'navDashboard',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { content, language } = useLanguage();

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      side={language === 'ar' ? 'right' : 'left'}
    >
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <Logo className="size-7 text-primary" />
          <div className="flex flex-col items-start">
            <h2 className="font-headline text-lg font-semibold tracking-tight text-primary">
              Al-Nadi Hub
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                <SidebarInput placeholder="Search..." className="pl-9 rtl:pl-0 rtl:pr-9" />
            </div>
        </div>
        <SidebarMenu className="flex-1 p-2 pt-0">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={content[item.key as keyof typeof content]}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{content[item.key as keyof typeof content]}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="block sm:hidden">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/login">
              <LogIn
                className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              {content.login}
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
