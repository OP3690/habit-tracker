'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FlagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ScaleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import Logo from '@/components/Logo';

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Goals', href: '/dashboard/goals', icon: FlagIcon },
    { name: 'Progress', href: '/dashboard/progress', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    {
      name: 'Weight Management',
      href: '/dashboard/weight',
      icon: ScaleIcon,
    },
  ];

  const isActivePath = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hamburger for mobile only */}
      <button
        className="absolute top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-lg lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <div className="flex items-center gap-6 ml--0">
              <Logo size={32} />
              <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut({ callbackUrl: 'http://localhost:3000/' })}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
          {/* Sidebar panel */}
          <aside className="relative w-64 bg-white border-r border-gray-200 flex flex-col h-full z-50">
            <button
              className="absolute top-4 right-4 p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <div className="flex items-center gap-3 ml-4">
                <Logo size={32} />
                <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        isActive ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => { setSidebarOpen(false); signOut({ callbackUrl: 'http://localhost:3000/' }); }}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="ml-0 lg:ml-64">
        <div className="max-w-6xl mx-auto px-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 