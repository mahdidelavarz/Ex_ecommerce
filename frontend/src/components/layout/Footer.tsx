// src/components/layout/Footer.tsx
import Link from "next/link";
import {
  MdiEmail,
  MdiInstagram,
  MdiMapMarker,
  MdiPhone,
  MdiTelegram,
  MdiWhatsapp,
} from "../icons/Icons";

export default function Footer() {
  return (
    <footer className="bg-surface-raised border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">نازی شاپ</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              فروشگاه اینترنتی نازی شاپ، بهترین مقصد برای خرید آنلاین با
              قیمت‌های رقابتی و ارسال سریع.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-primary text-sm transition-colors"
                >
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-text-secondary hover:text-primary text-sm transition-colors"
                >
                  محصولات
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-text-secondary hover:text-primary text-sm transition-colors"
                >
                  درباره ما
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-secondary hover:text-primary text-sm transition-colors"
                >
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">اطلاعات تماس</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <MdiPhone className="w-4 h-4" />
                ۰۲۱-۱۲۳۴۵۶۷۸
              </li>
              <li className="flex items-center gap-2">
                <MdiEmail className="w-4 h-4" />
                info@nazishop.ir
              </li>
              <li className="flex items-center gap-2">
                <MdiMapMarker className="w-4 h-4" />
                تهران، ایران
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">
              شبکه‌های اجتماعی
            </h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-surface rounded-button hover:bg-primary hover:text-white transition-colors"
                aria-label="اینستاگرام"
              >
                <MdiInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-surface rounded-button hover:bg-primary hover:text-white transition-colors"
                aria-label="تلگرام"
              >
                <MdiTelegram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-surface rounded-button hover:bg-primary hover:text-white transition-colors"
                aria-label="واتساپ"
              >
                <MdiWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} نازی شاپ. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
