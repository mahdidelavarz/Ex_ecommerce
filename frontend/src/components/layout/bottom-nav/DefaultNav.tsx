// src/components/layout/bottom-nav/DefaultNav.tsx
'use client';

import { type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/modules/cart/hooks/useCart';
import { useWishlist } from '@/modules/wishlist/hooks/useWishlist';
import { useMobileMenuStore } from '../mobileMenu.store';
import {
  MdiHome,
  MdiHomeOutline,
  MdiViewGrid,
  MdiViewGridOutline,
  LucideSearch,
  MdiCart,
  MdiCartOutline,
  MdiHeart,
  MdiHeartOutline,
} from '@/components/icons/Icons';

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

/** Small count pill. Keyed on `count` so a change remounts the node and the
 *  CSS bounce animation replays — no effect/state needed. */
function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      className="absolute -top-1.5 -inset-e-2 min-w-[1.05rem] h-[1.05rem] px-1 bg-error text-white
        text-[0.6rem] leading-none rounded-full flex items-center justify-center font-bold animate-badge-bounce"
    >
      {count > 99 ? '۹۹+' : count.toLocaleString('fa-IR')}
    </span>
  );
}

interface ItemProps {
  label: string;
  icon: IconCmp;
  activeIcon: IconCmp;
  active: boolean;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

function NavItem({ label, icon: Icon, activeIcon: ActiveIcon, active, badge, href, onClick }: ItemProps) {
  const Glyph = active ? ActiveIcon : Icon;

  const inner = (
    <>
      {/* active indicator pill */}
      <span
        className={`absolute -top-px h-1 rounded-full bg-primary transition-all duration-300
          ${active ? 'w-6 opacity-100' : 'w-0 opacity-0'}`}
      />
      <span className="relative">
        <Glyph
          className={`w-6 h-6 transition-colors duration-200 ${active ? 'text-primary animate-nav-pop' : 'text-text-secondary'}`}
        />
        {badge !== undefined && <Badge count={badge} />}
      </span>
      <span
        className={`text-[0.65rem] leading-none font-medium transition-colors duration-200
          ${active ? 'text-primary' : 'text-text-muted'}`}
      >
        {label}
      </span>
    </>
  );

  const cls =
    'relative flex flex-col items-center justify-center gap-1 flex-1 h-full pt-1 select-none';

  if (href) {
    return (
      <Link href={href} className={cls} aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {inner}
    </button>
  );
}

export default function DefaultNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { data: wishlist } = useWishlist();
  const openMenu = useMobileMenuStore((s) => s.open);

  const cartCount = cart?.total_items ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  const isHome = pathname === '/';
  const isSearch = pathname === '/search';
  const isCart = pathname?.startsWith('/cart') ?? false;
  const isWishlist = pathname?.startsWith('/wishlist') ?? false;

  return (
    <nav className="flex items-stretch h-16 px-1">
      <NavItem label="خانه" icon={MdiHomeOutline} activeIcon={MdiHome} active={isHome} href="/" />
      <NavItem
        label="دسته‌ها"
        icon={MdiViewGridOutline}
        activeIcon={MdiViewGrid}
        active={false}
        onClick={openMenu}
      />
      <NavItem
        label="جستجو"
        icon={LucideSearch}
        activeIcon={LucideSearch}
        active={isSearch}
        href="/search"
      />
      <NavItem
        label="سبد"
        icon={MdiCartOutline}
        activeIcon={MdiCart}
        active={isCart}
        badge={cartCount}
        href="/cart"
      />
      <NavItem
        label="علاقه‌ها"
        icon={MdiHeartOutline}
        activeIcon={MdiHeart}
        active={isWishlist}
        badge={wishlistCount}
        href="/wishlist"
      />
    </nav>
  );
}
