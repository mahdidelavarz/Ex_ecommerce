// src/components/layout/AdminSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const menuItems = [
  {
    title: 'داشبورد',
    icon: 'mdi:view-dashboard',
    href: '/admin',
  },
  {
    title: 'دسته‌بندی‌ها',
    icon: 'mdi:shape',
    href: '/admin/categories',
  },
  {
    title: 'برندها',
    icon: 'mdi:tag',
    href: '/admin/brands',
  },
  {
    title: 'محصولات',
    icon: 'mdi:package-variant',
    href: '/admin/products',
  },
  {
    title: 'سفارشات',
    icon: 'mdi:cart',
    href: '/admin/orders',
  },
  {
    title: 'کاربران',
    icon: 'mdi:account-group',
    href: '/admin/users',
  },
  {
    title: 'تخفیف‌ها',
    icon: 'mdi:ticket-percent',
    href: '/admin/coupons',
  },
  {
    title: 'بازگشت به سایت',
    icon: 'mdi:arrow-right',
    href: '/',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden">
        <MobileAdminNav />
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed right-0 top-0 h-full
          bg-surface border-l border-border shadow-sm z-20
          transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <Link href="/admin" className="text-lg font-bold text-primary">
              پنل مدیریت
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface-raised rounded-button transition-colors"
            aria-label={isCollapsed ? 'باز کردن' : 'بستن'}
          >
            <Icon
              icon={isCollapsed ? 'mdi:chevron-left' : 'mdi:chevron-right'}
              className="w-5 h-5 text-text-secondary"
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-button transition-colors duration-200
                      ${isActive
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                      }
                    `}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:account" className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.full_name || 'ادمین'}
                </p>
                <button
                  onClick={logout}
                  className="text-xs text-error hover:text-red-700 transition-colors"
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileAdminNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-30 p-2 bg-surface rounded-button shadow-card lg:hidden"
        aria-label="منوی ادمین"
      >
        <Icon icon="mdi:menu" className="w-6 h-6 text-text-primary" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <nav className="absolute right-0 top-0 h-full w-64 bg-surface shadow-modal p-4 overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-2 hover:bg-surface-raised rounded-button"
              aria-label="بستن"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>

            <ul className="mt-12 space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-button transition-colors
                      ${pathname === item.href
                        ? 'bg-primary-light text-primary'
                        : 'text-text-secondary hover:bg-surface-raised'
                      }
                    `}
                  >
                    <Icon icon={item.icon} className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}