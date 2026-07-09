// src/components/layout/AdminSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useAdminMenuStore } from "./adminMenu.store";
import {
  MdiAccount,
  MdiAccountGroup,
  MdiArrowRight,
  MdiCart,
  MdiChevronLeft,
  MdiChevronRight,
  MdiClose,
  MdiCog,
  MdiCommentTextOutline,
  MdiInformation,
  MdiKeyboardReturn,
  MdiNewspaperVariantOutline,
  MdiPackageVariant,
  MdiShape,
  MdiTagMultiple,
  MdiTicketPercent,
  MdiTruckDelivery,
  MdiViewDashboard,
} from "../icons/Icons";

type MenuItem = {
  title: string;
  icon: typeof MdiViewDashboard;
  href: string;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "اصلی",
    items: [{ title: "داشبورد", icon: MdiViewDashboard, href: "/admin" }],
  },
  {
    label: "فروشگاه",
    items: [
      { title: "دسته‌بندی‌ها", icon: MdiShape, href: "/admin/categories" },
      { title: "برندها", icon: MdiTagMultiple, href: "/admin/brands" },
      { title: "محصولات", icon: MdiPackageVariant, href: "/admin/products" },
      { title: "خصوصیات", icon: MdiPackageVariant, href: "/admin/attributes" },
      { title: "تگ‌ها", icon: MdiTagMultiple, href: "/admin/tags" },
    ],
  },
  {
    label: "فروش",
    items: [
      { title: "سفارشات", icon: MdiCart, href: "/admin/orders" },
      { title: "مرسولات", icon: MdiTruckDelivery, href: "/admin/shipments" },
      { title: "تخفیف‌ها", icon: MdiTicketPercent, href: "/admin/coupons" },
      { title: "مرجوعی‌ها", icon: MdiKeyboardReturn, href: "/admin/returns" },
    ],
  },
  {
    label: "محتوا",
    items: [
      { title: "وبلاگ", icon: MdiNewspaperVariantOutline, href: "/admin/blog" },
      { title: "نظرات", icon: MdiCommentTextOutline, href: "/admin/reviews" },
    ],
  },
  {
    label: "سیستم",
    items: [
      { title: "کاربران", icon: MdiAccountGroup, href: "/admin/users" },
      { title: "تنظیمات", icon: MdiCog, href: "/admin/settings" },
      { title: "راهنما", icon: MdiInformation, href: "/admin/help" },
      { title: "کامپوننت‌ها (UI)", icon: MdiShape, href: "/admin/ui-showcase" },
    ],
  },
];

const backToSite: MenuItem = {
  title: "بازگشت به سایت",
  icon: MdiArrowRight,
  href: "/",
};

function isItemActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Shared nav row used by both the desktop sidebar and the mobile drawer. */
function NavItem({
  item,
  active,
  collapsed = false,
  onClick,
}: {
  item: MenuItem;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.title : undefined}
      aria-current={active ? "page" : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-button
        transition-colors duration-200
        ${
          active
            ? "bg-primary-light text-primary font-medium before:absolute before:inset-y-1.5 before:-right-1 before:w-1 before:rounded-full before:bg-primary"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
        }
        ${collapsed ? "justify-center" : ""}
      `}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );
}

/** Shared grouped menu body. */
function MenuGroups({
  pathname,
  collapsed = false,
  onItemClick,
}: {
  pathname: string;
  collapsed?: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      {menuGroups.map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="my-2 mx-2 border-t border-border" />
          ) : (
            <p className="px-3 pt-4 pb-1 text-xs font-medium text-text-secondary/80">
              {group.label}
            </p>
          )}
          <ul className="space-y-1 px-2">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavItem
                  item={item}
                  active={isItemActive(pathname, item.href)}
                  collapsed={collapsed}
                  onClick={onItemClick}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile drawer */}
      <div className="lg:hidden">
        <MobileAdminNav />
      </div>

      {/* Desktop sidebar — floating card below the header */}
      <aside
        className={`
          hidden lg:flex flex-col fixed z-20
          right-3 top-[calc(var(--header-h)+0.75rem)] bottom-3
          bg-surface border border-border rounded-card shadow-card
          transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
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
            className="p-2 hover:bg-surface-raised rounded-button transition-colors cursor-pointer"
            aria-label={isCollapsed ? "باز کردن" : "بستن"}
          >
            {isCollapsed ? (
              <MdiChevronLeft className="w-5 h-5 text-text-secondary" />
            ) : (
              <MdiChevronRight className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-2">
          <MenuGroups pathname={pathname} collapsed={isCollapsed} />

          {/* Back to site */}
          <div className="mt-3 px-2">
            {!isCollapsed && (
              <div className="mb-1 mx-1 border-t border-border" />
            )}
            <NavItem
              item={backToSite}
              active={false}
              collapsed={isCollapsed}
            />
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center shrink-0">
              <MdiAccount className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.full_name || "ادمین"}
                </p>
                <button
                  onClick={logout}
                  className="text-xs text-error hover:text-red-700 transition-colors cursor-pointer"
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
  const { user, logout } = useAuth();
  const { isOpen, close } = useAdminMenuStore();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      return () => document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay — always mounted so open/close transitions can play */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => close()}
        />

        {/* Drawer panel — slides in from the inline-start (right in RTL) edge */}
        <nav
          className={`
            absolute right-0 top-0 h-full w-72 max-w-[85%]
            bg-surface shadow-modal flex flex-col
            transition-transform duration-300 ease-out motion-reduce:transition-none
            ${isOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Header row */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-primary">پنل مدیریت</span>
            <button
              onClick={() => close()}
              className="p-2 hover:bg-surface-raised rounded-button transition-colors cursor-pointer"
              aria-label="بستن"
            >
              <MdiClose className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto py-2">
            <MenuGroups
              pathname={pathname}
              onItemClick={() => close()}
            />

            {/* Back to site */}
            <div className="mt-3 px-2">
              <div className="mb-1 mx-1 border-t border-border" />
              <NavItem
                item={backToSite}
                active={false}
                onClick={() => close()}
              />
            </div>
          </div>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                <MdiAccount className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.full_name || "ادمین"}
                </p>
                <button
                  onClick={logout}
                  className="text-xs text-error hover:text-red-700 transition-colors cursor-pointer"
                >
                  خروج
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
