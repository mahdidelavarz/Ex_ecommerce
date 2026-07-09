"use client";

import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import { Card, PageHeader } from "@/components/ui";
import {
  LucideSearch,
  MdiCheckCircle,
  MdiImageMultiple,
  MdiInformation,
  MdiPackageVariant,
  MdiShape,
  MdiTagMultiple,
} from "@/components/icons/Icons";

const productSteps = [
  {
    title: "۱. دسته‌بندی را بسازید",
    text: "اول ساختار دسته‌بندی را کامل کنید تا محصول از ابتدا در جای درست قرار بگیرد. برای دسته‌های اصلی والد را خالی بگذارید و برای زیرشاخه‌ها فقط یکی از دسته‌های اصلی فعال را به عنوان والد انتخاب کنید.",
  },
  {
    title: "۲. برند را اضافه کنید",
    text: "اگر محصول برند مشخصی دارد، قبل از ثبت محصول برند را بسازید. نام برند باید همان چیزی باشد که مشتری جستجو می‌کند و لوگو بهتر است آدرس یک تصویر تمیز، خوانا و بدون پس‌زمینه شلوغ باشد.",
  },
  {
    title: "۳. محصول را ثبت کنید",
    text: "در فرم محصول، عنوان، دسته‌بندی، برند، توضیح کوتاه، توضیحات کامل و مشخصات فنی را وارد کنید. ابتدا محصول را به صورت پیش‌نویس نگه دارید و بعد از تکمیل تصویر و واریانت‌ها آن را منتشر کنید.",
  },
  {
    title: "۴. تصاویر محصول را کامل کنید",
    text: "حداقل یک تصویر اصلی انتخاب کنید و برای هر تصویر متن جایگزین بنویسید. اگر چند تصویر دارید، تصویر اول باید واضح‌ترین نمای محصول باشد و بقیه تصاویر جزئیات، بسته‌بندی، بافت یا زاویه‌های دیگر را نشان بدهند.",
  },
  {
    title: "۵. واریانت‌ها را اضافه کنید",
    text: "بعد از ایجاد محصول، وارد تب واریانت‌ها شوید و برای هر ترکیب رنگ، سایز یا ویژگی قابل فروش یک واریانت جدا بسازید. SKU، قیمت فروش، قیمت خرید، موجودی و هشدار موجودی را دقیق وارد کنید.",
  },
  {
    title: "۶. وضعیت انتشار را بررسی کنید",
    text: "وقتی دسته، برند، تصاویر، واریانت فعال، قیمت و موجودی درست شد، وضعیت محصول را فعال و منتشر کنید. محصول بدون واریانت یا تصویر مناسب بهتر است منتشر نشود.",
  },
];

const seoGuides = [
  {
    label: "عنوان سئو محصول",
    value: "نام محصول + ویژگی مهم + برند. مثال: کرم آبرسان پوست خشک لافارر حجم ۷۵ میلی‌لیتر",
  },
  {
    label: "توضیحات سئو محصول",
    value: "یک جمله طبیعی ۱۲۰ تا ۱۶۰ کاراکتری درباره کاربرد، مزیت اصلی و مناسب بودن محصول. از تکرار پشت سر هم کلمات کلیدی پرهیز کنید.",
  },
  {
    label: "عنوان سئو دسته‌بندی",
    value: "نام دسته + عبارت خرید یا قیمت. مثال: خرید رژ لب جامد و مایع با رنگ‌بندی متنوع",
  },
  {
    label: "توضیحات سئو دسته‌بندی",
    value: "توضیح کوتاه درباره نوع محصولات داخل دسته، مخاطب مناسب و دلیل انتخاب از فروشگاه.",
  },
  {
    label: "متن جایگزین تصویر",
    value: "توصیف واقعی تصویر، نه فقط کلمه کلیدی. مثال: نمای روبه‌روی کرم آبرسان لافارر مخصوص پوست خشک",
  },
];

const imageRules = [
  {
    title: "محصولات",
    text: "فرمت پیشنهادی WebP یا JPG، اندازه حداقل ۱۰۰۰ در ۱۰۰۰ پیکسل و نسبت مربع ۱:۱. تصویر باید روشن، شارپ، بدون واترمارک و با پس‌زمینه ساده باشد.",
  },
  {
    title: "گالری محصول",
    text: "برای جزئیات می‌توانید از نسبت ۴:۵ یا ۱:۱ استفاده کنید، اما همه تصاویر یک محصول بهتر است از نظر نور، کادر و رنگ هماهنگ باشند.",
  },
  {
    title: "دسته‌بندی تصویری",
    text: "برای دسته‌هایی که در بنر، صفحه دسته یا بخش‌های ویترینی نمایش داده می‌شوند از تصویر ۱۶:۹ یا ۴:۳ با حداقل عرض ۱۲۰۰ پیکسل استفاده کنید.",
  },
  {
    title: "آیکون دسته‌بندی",
    text: "برای دسته‌های کوچک، فهرستی یا زیرشاخه‌هایی که فقط در منو و کارت‌های کوچک دیده می‌شوند آیکون Iconify کافی است و تصویر لازم نیست.",
  },
  {
    title: "لوگوی برند",
    text: "لوگو بهتر است PNG یا WebP شفاف، حداقل ۴۰۰ در ۴۰۰ پیکسل و با فضای خالی مناسب اطراف نشان برند باشد.",
  },
];

const categoryMediaRules = [
  "دسته‌های اصلی و قابل نمایش در صفحه خانه یا صفحه دسته‌بندی بهتر است تصویر داشته باشند.",
  "دسته‌هایی که مفهوم بصری مشخص دارند، مثل آرایش صورت، مراقبت پوست، عطر یا لوازم برقی، با تصویر بهتر فهمیده می‌شوند.",
  "زیرشاخه‌های کاربردی و کوتاه مثل رژ لب، کرم ضدآفتاب، ریمل یا شامپو می‌توانند فقط آیکون داشته باشند.",
  "برای دسته‌هایی که در منوی فشرده یا لیست سریع استفاده می‌شوند آیکون سبک‌تر و خواناتر از تصویر است.",
  "در فرم دسته‌بندی فقط یکی از تصویر یا آیکون را انتخاب کنید؛ همزمان هر دو را وارد نکنید.",
];

const variantTips = [
  "برای هر رنگ، سایز، حجم یا مدل قابل انتخاب یک واریانت جدا بسازید.",
  "SKU باید یکتا، کوتاه و قابل ردیابی باشد؛ مثلا LAF-HYD-75-DRY.",
  "قیمت قبل از تخفیف فقط وقتی وارد شود که از قیمت فروش بیشتر است.",
  "قیمت خرید را برای محاسبه سود دقیق وارد کنید، حتی اگر به مشتری نمایش داده نمی‌شود.",
  "هشدار موجودی را برای کالاهای پرفروش بالاتر تنظیم کنید تا قبل از اتمام کامل موجودی اقدام شود.",
];

function GuideCard({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: typeof MdiInformation;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function AdminHelpPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();

  return (
    <AdminPage
      maxWidth="5xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="راهنمای پنل مدیریت"
          subtitle="مراحل استاندارد ثبت دسته‌بندی، برند، محصول، تصاویر، واریانت و سئو"
          icon={MdiInformation}
        />
      }
    >
      <div className="space-y-5 pb-6">
        <GuideCard title="مسیر درست افزودن محصول جدید" icon={MdiPackageVariant}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {productSteps.map((step) => (
              <div key={step.title} className="rounded-card bg-surface-raised p-4">
                <h3 className="font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{step.text}</p>
              </div>
            ))}
          </div>
        </GuideCard>

        <GuideCard title="دسته‌بندی و برند" icon={MdiShape}>
          <div className="space-y-4 text-sm leading-7 text-text-secondary">
            <p>
              دسته‌بندی‌ها باید مثل نقشه فروشگاه باشند: کوتاه، قابل فهم و بدون تکرار. نام
              دسته را طوری بنویسید که مشتری همان عبارت را در سایت یا گوگل جستجو می‌کند.
            </p>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {categoryMediaRules.map((rule) => (
                <li key={rule} className="flex gap-2 rounded-card bg-surface-raised p-3">
                  <MdiCheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <p>
              برای برندها نام رسمی، توضیح کوتاه و لوگوی تمیز کافی است. اگر لوگوی باکیفیت
              ندارید، بهتر است برند را بدون لوگو منتشر کنید تا تصویر نامناسب ظاهر فروشگاه را
              ضعیف نکند.
            </p>
          </div>
        </GuideCard>

        <GuideCard title="تصاویر و فایل‌های قابل قبول" icon={MdiImageMultiple}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {imageRules.map((rule) => (
              <div key={rule.title} className="rounded-card border border-border p-4">
                <h3 className="font-semibold text-text-primary">{rule.title}</h3>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{rule.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-card bg-warning-light p-4 text-sm leading-7 text-warning">
            حجم هر تصویر را تا حد امکان زیر ۵۰۰ کیلوبایت نگه دارید. فرمت WebP معمولا بهترین
            تعادل بین کیفیت و سرعت را می‌دهد؛ اگر تصویر شفافیت ندارد، JPG هم مناسب است.
          </p>
        </GuideCard>

        <GuideCard title="واریانت‌ها، قیمت و موجودی" icon={MdiTagMultiple}>
          <ul className="space-y-2 text-sm leading-7 text-text-secondary">
            {variantTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <MdiCheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </GuideCard>

        <GuideCard title="راهنمای نوشتن سئو" icon={LucideSearch}>
          <div className="space-y-3">
            {seoGuides.map((item) => (
              <div key={item.label} className="rounded-card bg-surface-raised p-4">
                <h3 className="font-semibold text-text-primary">{item.label}</h3>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            متن سئو را برای انسان بنویسید، نه فقط برای موتور جستجو. از کلمات واقعی محصول،
            برند، کاربرد، نوع پوست یا ویژگی اصلی استفاده کنید و از تکرار غیرطبیعی عبارت‌ها
            خودداری کنید.
          </p>
        </GuideCard>
      </div>
    </AdminPage>
  );
}
