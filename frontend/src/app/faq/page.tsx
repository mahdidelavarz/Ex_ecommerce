import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import Accordion, { type AccordionItem } from "@/components/content/Accordion";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description:
    "پاسخ پرتکرارترین پرسش‌های شما درباره ثبت سفارش، پرداخت، ارسال و مرجوعی در نازی شاپ.",
  alternates: { canonical: "/faq" },
};

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: "چطور سفارش ثبت کنم؟",
    answer:
      "کالای موردنظر را به سبد خرید اضافه کنید، وارد حساب کاربری شوید، آدرس و اطلاعات گیرنده را تکمیل کرده و پرداخت را نهایی کنید. سفارش شما بلافاصله ثبت می‌شود.",
  },
  {
    question: "چگونه سفارش خود را پیگیری کنم؟",
    answer:
      "پس از ورود به حساب کاربری، از بخش «سفارش‌های من» می‌توانید وضعیت و مراحل ارسال هر سفارش را مشاهده کنید.",
  },
  {
    question: "پرداخت چگونه انجام می‌شود؟",
    answer:
      "پرداخت به‌صورت آنلاین و از طریق درگاه امن زرین‌پال انجام می‌شود. اطلاعات کارت بانکی شما نزد فروشگاه ذخیره نمی‌شود.",
  },
  {
    question: "زمان ارسال سفارش چقدر است؟",
    answer:
      "سفارش‌ها معمولاً ظرف ۱ تا ۲ روز کاری آماده و تحویل شرکت حمل‌ونقل می‌شوند. زمان تحویل بسته به مقصد متفاوت است. جزئیات در صفحه روش‌های ارسال آمده است.",
  },
  {
    question: "آیا امکان مرجوع یا تعویض کالا وجود دارد؟",
    answer:
      "بله، طبق شرایط ذکرشده در صفحه «رویه بازگشت کالا» تا ۷ روز پس از دریافت، در صورت احراز شرایط، امکان مرجوعی فراهم است.",
  },
  {
    question: "آیا کالاها اصل هستند؟",
    answer:
      "بله، نازی شاپ اصالت تمامی محصولات عرضه‌شده را تضمین می‌کند.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <ContentPage
      title="سوالات متداول"
      subtitle="پاسخ پرسش‌های پرتکرار شما را اینجا گردآوری کرده‌ایم."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Accordion items={FAQ_ITEMS} />
    </ContentPage>
  );
}
