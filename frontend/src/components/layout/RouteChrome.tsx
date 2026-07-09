"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import CartDrawer from "@/modules/cart/components/CartDrawer";
import BottomNav from "@/components/layout/bottom-nav/BottomNav";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function RouteChrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const isLoginPage = pathname === "/login";
  const isCompleteProfilePage =
    pathname === "/profile" && isAuthenticated && user?.profile_completed === false;
  const shouldHideChrome = isLoginPage || isCompleteProfilePage;
  const isAdminPage = pathname?.startsWith("/admin") ?? false;
  const isLandingPage = pathname === "/";

  return (
    <>
      {!shouldHideChrome && <Header isOnLanding={isLandingPage} />}
      <main
        className={
          shouldHideChrome
            ? "h-dvh overflow-hidden"
            : isAdminPage
              ? "flex-1 min-h-0 overflow-hidden"
            : "flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
        }
      >
        {children}
      </main>
      {!shouldHideChrome && <CartDrawer />}
      {!shouldHideChrome && <BottomNav />}
      {!shouldHideChrome && footer && (
        <ConditionalFooter>
          {footer}
        </ConditionalFooter>
      )}
    </>
  );
}
