// src/components/home/NewsletterSignup.tsx
"use client";

import { useState } from "react";
import { MdiCheckCircle, MdiEmail } from "@/components/icons/Icons";

/**
 * Newsletter band. Submission is client-side only for now (no backend
 * endpoint yet) — validates the address and shows a success state.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("لطفاً یک ایمیل معتبر وارد کنید");
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary-light to-secondary-light px-6 py-12 md:px-12 md:py-16">
          {/* Soft decorative glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/4 h-56 w-56 rounded-full bg-secondary/25 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-secondary-hover">
              <span className="h-px w-8 bg-secondary" aria-hidden />
              خبرنامه
              <span className="h-px w-8 bg-secondary" aria-hidden />
            </p>
            <h2 className="text-2xl font-bold text-text-primary md:text-3xl">
              از تخفیف‌ها زودتر باخبر شوید
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              عضویت در خبرنامه نازی شاپ؛ بدون اسپم، فقط پیشنهادهای ویژه و ترندهای زیبایی
            </p>

            {submitted ? (
              <p className="mt-7 flex items-center gap-2 rounded-full bg-success-light px-5 py-3 text-sm font-bold text-success">
                <MdiCheckCircle className="h-5 w-5" />
                عضویت شما با موفقیت ثبت شد
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-7 flex w-full flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <MdiEmail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-label="آدرس ایمیل"
                    className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-5 text-left text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 shrink-0 cursor-pointer rounded-full bg-primary px-8 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  عضویت در خبرنامه
                </button>
              </form>
            )}
            {error && !submitted && (
              <p className="mt-3 text-xs font-medium text-error">{error}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
