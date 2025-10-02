'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  TrophyIcon,
  ShareIcon,
  CreditCardIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, active: true },
  { name: 'Girls', href: '/girls', icon: UsersIcon, active: true },
  { name: 'Overview', href: '/overview', icon: TableCellsIcon, active: true },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, active: true },
  { name: 'Data Entry', href: '/data-entry', icon: PlusIcon, active: true },
  { name: 'Data Vault', href: '/data-vault', icon: GlobeAltIcon, active: true },
  { name: 'Leaderboards', href: '/leaderboards', icon: TrophyIcon, active: true },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, active: true },
  { name: 'Refer Friends', href: '/referrals', icon: UserGroupIcon, active: true },
  { name: 'Share', href: '/share', icon: ShareIcon, active: true },
  { name: 'Subscription', href: '/subscription', icon: CreditCardIcon, active: false }
];

export default function Sidebar() {
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
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-cpn-dark border-r border-cpn-gray/20">
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading text-cpn-yellow">CPN</h1>
          <p className="text-sm text-cpn-gray">Cost Per Nut Calculator</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            if (!item.active) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-cpn-gray/50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-item ${active ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-cpn-gray/20">
          <div className="text-xs text-cpn-gray">
            <p>MVP Version</p>
            <p className="mt-1">Data stored locally</p>
          </div>
        </div>
      </div>
    </aside>
  );
}