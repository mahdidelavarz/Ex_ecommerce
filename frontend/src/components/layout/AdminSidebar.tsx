// src/components/layout/AdminSidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useAdminMenuStore } from "./adminMenu.store";
import {
  LucideLogOut,
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
        group relative flex min-h-11 items-center gap-3 rounded-button px-3 py-2.5
        text-sm transition-all duration-200
        ${
          active
            ? "bg-primary-light text-primary shadow-[inset_0_0_0_1px_rgb(142_74_123/0.10)] before:absolute before:inset-y-2 before:-right-1 before:w-1 before:rounded-full before:bg-primary"
            : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
        }
        ${collapsed ? "justify-center" : ""}
      `}
    >
      <item.icon
        className={`h-5 w-5 shrink-0 transition-colors ${
          active ? "text-primary" : "text-text-muted group-hover:text-primary"
        }`}
      />
      {!collapsed && <span className="truncate font-medium">{item.title}</span>}
    </Link>
  );
}

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
    <div className="space-y-1.5">
      {menuGroups.map((group) => (
        <div key={group.label}>
          {collapsed ? (
            <div className="mx-3 my-3 border-t border-border/80" />
          ) : (
            <p className="px-3 pb-1 pt-4 text-[11px] font-bold text-text-muted">
              {group.label}
            </p>
          )}
          <ul className="space-y-1 px-2.5">
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

function LogoutButton({
  collapsed = false,
  onLogout,
}: {
  collapsed?: boolean;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      title={collapsed ? "خروج" : undefined}
      className={`
        flex w-full min-h-10 items-center gap-2.5 rounded-button border border-error/10
        bg-error-light/70 px-3 py-2 text-sm font-semibold text-error
        transition-colors hover:border-error/25 hover:bg-error-light cursor-pointer
        ${collapsed ? "justify-center" : "justify-start"}
      `}
      aria-label="خروج"
    >
      <LucideLogOut className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>خروج</span>}
    </button>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, toggleCollapsed } = useAdminMenuStore();

  return (
    <>
      <div className="lg:hidden">
        <MobileAdminNav />
      </div>

      <aside
        className={`
          hidden lg:flex fixed z-20 flex-col
          right-3 top-[calc(var(--header-h)+0.75rem)] bottom-3
          overflow-hidden rounded-card border border-border/80
          bg-surface/95 shadow-card backdrop-blur
          transition-all duration-300 ease-out
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border/80 px-3.5">
          {!isCollapsed && (
            <Link href="/admin" className="min-w-0">
              <span className="block truncate text-base font-extrabold text-text-primary">
                پنل مدیریت
              </span>
              <span className="block truncate text-xs font-medium text-text-muted">
                مدیریت فروشگاه
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary cursor-pointer ${
              isCollapsed ? "mx-auto" : ""
            }`}
            aria-label={isCollapsed ? "باز کردن" : "بستن"}
          >
            {isCollapsed ? (
              <MdiChevronLeft className="h-5 w-5" />
            ) : (
              <MdiChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <MenuGroups pathname={pathname} collapsed={isCollapsed} />

          <div className="mt-3 px-2.5">
            {!isCollapsed && (
              <div className="mx-1 mb-2 border-t border-border/80" />
            )}
            <NavItem item={backToSite} active={false} collapsed={isCollapsed} />
          </div>
        </nav>

        <div className="border-t border-border/80 p-2.5">
          <LogoutButton collapsed={isCollapsed} onLogout={logout} />
        </div>
      </aside>
    </>
  );
}

function MobileAdminNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isOpen, close } = useAdminMenuStore();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      return () => document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[70] lg:hidden transition-opacity duration-300 motion-reduce:transition-none ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-text-primary/45" onClick={close} />

      <nav
        className={`
          absolute right-0 top-0 flex h-dvh w-[19rem] max-w-[88vw] flex-col
          overflow-hidden border-l border-border/80 bg-surface shadow-modal
          transition-transform duration-300 ease-out motion-reduce:transition-none
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border/80 px-4">
          <div className="min-w-0">
            <span className="block truncate text-base font-extrabold text-text-primary">
              پنل مدیریت
            </span>
            <span className="block truncate text-xs font-medium text-text-muted">
              منوی دسترسی
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-button text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary cursor-pointer"
            aria-label="بستن"
          >
            <MdiClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <MenuGroups pathname={pathname} onItemClick={close} />

          <div className="mt-3 px-2.5">
            <div className="mx-1 mb-2 border-t border-border/80" />
            <NavItem item={backToSite} active={false} onClick={close} />
          </div>
        </div>

        <div className="border-t border-border/80 p-2.5">
          <LogoutButton
            onLogout={async () => {
              close();
              await logout();
            }}
          />
        </div>
      </nav>
    </div>
  );
}
