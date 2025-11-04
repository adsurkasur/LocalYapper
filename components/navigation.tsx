"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Bot, Settings, Search } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Bots', href: '/bots', icon: Bot },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-background/70 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="main-container flex items-center justify-between gap-2 p-2">
        <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent/40 transition-colors select-none">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight brand-title">LocalYapper</span>
          <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-primary text-primary-foreground">UI v0.2</span>
        </Link>
        <div className="flex items-center gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-2 relative ${isActive ? 'shadow-sm' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.name}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--active-accent, hsl(var(--primary)))' }}
                  />
                )}
              </Button>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
