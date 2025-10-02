'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChartBarIcon,
  PlusIcon,
  ShareIcon,
  UsersIcon,
  TrophyIcon,
  TableCellsIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, active: true },
  { name: 'Overview', href: '/overview', icon: TableCellsIcon, active: true },
  { name: 'Add', href: '/data-entry', icon: PlusIcon, active: true, isSpecial: true },
  { name: 'Referrals', href: '/referrals', icon: UserGroupIcon, active: true },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, active: true },
  { name: 'Leaderboards', href: '/leaderboards', icon: TrophyIcon, active: true }
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    if (href === '/girls' && pathname === '/girls') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/girls' && href !== '/dashboard' ? true : pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-cpn-dark border-t border-cpn-gray/20 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.isSpecial) {
            // Special yellow "Add" button
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center p-2"
              >
                <div className="bg-cpn-yellow text-cpn-dark rounded-full w-12 h-12 flex items-center justify-center mb-1">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-cpn-yellow font-medium">
                  {item.name}
                </span>
              </Link>
            );
          }

          if (!item.active) {
            return (
              <div
                key={item.name}
                className="mobile-nav-item opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-cpn-dark" />
    </nav>
  );
}