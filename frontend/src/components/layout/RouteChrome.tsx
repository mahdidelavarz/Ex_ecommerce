"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/modules/cart/components/CartDrawer";
import BottomNav from "@/components/layout/bottom-nav/BottomNav";

export default function RouteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {!isLoginPage && <Header />}
      <main
        className={
          isLoginPage
            ? "flex-1 overflow-hidden"
            : "flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
        }
      >
        {children}
      </main>
      {!isLoginPage && <CartDrawer />}
      {!isLoginPage && <BottomNav />}
      {!isLoginPage && (
        <ConditionalFooter>
          <Footer />
        </ConditionalFooter>
      )}
    </>
  );
}
