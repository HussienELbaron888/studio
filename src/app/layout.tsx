import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Al-Nadi Activities Hub',
  description: 'Your one-stop hub for activities, trips, and events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <LanguageDirector />
      <html lang="ar" dir="rtl">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-body antialiased">
          <Toaster />
          <SidebarProvider>
            <AppHeader />
            <div className="flex">
              <AppSidebar />
              <SidebarInset>
                  {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}
