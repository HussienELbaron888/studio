"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';

export default function RegisterPage() {
  const { content } = useLanguage();

  return (
    <div className="flex flex-grow items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">{content.registerTitle}</CardTitle>          <CardDescription>{content.registerSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{content.nameLabel}</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{content.emailLabel}</Label>
              <Input id="email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{content.passwordLabel}</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">{content.confirmPasswordLabel}</Label>
              <Input id="confirm-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {content.registerButton}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {content.registerHasAccount}{' '}
            <Link href="/login" className="text-primary underline">
              {content.login}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
