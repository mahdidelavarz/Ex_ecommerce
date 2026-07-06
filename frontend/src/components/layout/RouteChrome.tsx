"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/modules/cart/components/CartDrawer";
import BottomNav from "@/components/layout/bottom-nav/BottomNav";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function RouteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const isLoginPage = pathname === "/login";
  const isCompleteProfilePage =
    pathname === "/profile" && isAuthenticated && user?.profile_completed === false;
  const shouldHideChrome = isLoginPage || isCompleteProfilePage;
  const isLandingPage = pathname === "/";

  return (
    <>
      {!shouldHideChrome && <Header isOnLanding={isLandingPage} />}
      <main
        className={
          shouldHideChrome
            ? "h-dvh overflow-hidden"
            : "flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
        }
      >
        {children}
      </main>
      {!shouldHideChrome && <CartDrawer />}
      {!shouldHideChrome && <BottomNav />}
      {!shouldHideChrome && (
        <ConditionalFooter>
          <Footer />
        </ConditionalFooter>
      )}
    </>
  );
}
