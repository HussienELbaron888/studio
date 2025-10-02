
"use client";

import type { Metadata } from 'next';
import { useEffect, useState } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/context/language-context';
import { AppHeader } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { LanguageDirector } from '@/components/layout/language-director';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <LanguageProvider>
      <html lang="ar" dir="rtl">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
            rel="stylesheet"
          />
          <title>Al-Nadi Activities Hub</title>
          <meta name="description" content="Your one-stop hub for activities, trips, and events." />
        </head>
        <body className="font-body antialiased">
          <LanguageDirector />
          <Toaster />
          <SidebarProvider>
            <AppHeader />
            <div className="flex">
              {isClient && <AppSidebar />}
              <SidebarInset className="pt-20">
                  {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}
