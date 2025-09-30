"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/language-context';

export default function LoginPage() {
  const { content } = useLanguage();

  return (
    <div className="flex flex-grow items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">{content.loginTitle}</CardTitle>
          <CardDescription>{content.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{content.emailLabel}</Label>
              <Input id="email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{content.passwordLabel}</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {content.loginButton}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {content.loginNoAccount}{' '}
            <Link href="/register" className="text-primary underline">
              {content.register}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
