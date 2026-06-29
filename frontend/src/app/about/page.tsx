import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "درباره فروشگاه اینترنتی نازی شاپ، زمینه فعالیت، اهداف و راه‌های ارتباطی.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const name = settings.company_name || "نازی شاپ";

  return (
    <ContentPage
      title="درباره ما"
      subtitle={`آشنایی بیشتر با فروشگاه ${name}`}
    >
      <h2>ما که هستیم؟</h2>
      <p>
        {name} یک فروشگاه اینترنتی فعال در زمینه عرضه محصولات آرایشی و بهداشتی
        اصل و باکیفیت است. هدف ما فراهم کردن تجربه‌ای آسان، مطمئن و لذت‌بخش از
        خرید آنلاین برای شماست.
      </p>

      <h2>زمینه فعالیت</h2>
      <p>
        ما با گردآوری مجموعه‌ای از برندهای معتبر و محصولات متنوع، تلاش می‌کنیم
        نیازهای شما را با بهترین قیمت و سریع‌ترین ارسال پاسخ دهیم. تضمین اصالت
        کالا و پشتیبانی صادقانه، اصول همیشگی ماست.
      </p>

      <h2>چرا {name}؟</h2>
      <ul>
        <li>تضمین اصالت و کیفیت کالا</li>
        <li>پرداخت امن از طریق درگاه معتبر</li>
        <li>ارسال سریع به سراسر کشور</li>
        <li>پشتیبانی پاسخگو و خوش‌برخورد</li>
      </ul>

      <h2>راه‌های ارتباطی</h2>
      <p>
        خوشحال می‌شویم نظرات و پیشنهادهای شما را بشنویم. برای ارتباط با ما به صفحه{" "}
        <a href="/contact">تماس با ما</a> مراجعه کنید
        {settings.company_email ? (
          <>
            {" "}یا از طریق ایمیل{" "}
            <a href={`mailto:${settings.company_email}`}>
              {settings.company_email}
            </a>{" "}
            در ارتباط باشید
          </>
        ) : null}
        .
      </p>
    </ContentPage>
  );
}
