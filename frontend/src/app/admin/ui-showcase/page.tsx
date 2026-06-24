// src/app/admin/ui-showcase/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AdminSidebar from "@/components/layout/AdminSidebar";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorState,
  Input,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TableEmpty,
  TableSkeleton,
  TH,
  THead,
  Textarea,
  Toggle,
  TRow,
} from "@/components/ui";
import {
  LucidePlus,
  LucideSearch,
  MdiCheckCircle,
  MdiPackageVariantClosed,
} from "@/components/icons/Icons";

type DemoForm = {
  name: string;
  email: string;
  category: string;
  bio: string;
};

const PAGE_SIZE = 10;
const sampleTitles = ["رژلب مات", "کرم مرطوب‌کننده", "عطر زنانه", "ریمل حجم‌دهنده", "کرم ضدآفتاب"];

// A synthetic dataset to demonstrate server-style pagination (10 per page).
const allRows = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  title: `${sampleTitles[i % sampleTitles.length]} ${i + 1}`,
  price: ((i + 1) * 137000).toLocaleString("fa-IR"),
  status: i % 3 === 0 ? "inactive" : "active",
}));

export default function UiShowcasePage() {
  const [loading, setLoading] = useState(false);
  const [toggleOn, setToggleOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [tableState, setTableState] = useState<"data" | "loading" | "empty">(
    "data",
  );
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
  const pageRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoForm>({
    defaultValues: { name: "", email: "", category: "", bio: "" },
  });

  const onSubmit = (data: DemoForm) => {
    toast.success(`فرم ارسال شد: ${data.name || "بدون نام"} ✓`);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              کامپوننت‌های مشترک رابط کاربری
            </h1>
            <p className="text-text-secondary mt-1">
              نمایش تمام کامپوننت‌های قابل استفاده مجدد در{" "}
              <code className="text-primary">components/ui</code>
            </p>
          </div>

          {/* Buttons */}
          <Card>
            <Card.Header>
              <Card.Title>دکمه‌ها (Button)</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button>اصلی</Button>
                <Button variant="secondary">ثانویه</Button>
                <Button variant="outline">حاشیه‌دار</Button>
                <Button variant="ghost">شفاف</Button>
                <Button icon={LucidePlus}>با آیکون</Button>
                <Button
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 1500);
                  }}
                >
                  ارسال
                </Button>
                <Button disabled>غیرفعال</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">کوچک</Button>
                <Button size="md">متوسط</Button>
                <Button size="lg">بزرگ</Button>
              </div>
            </Card.Body>
          </Card>

          {/* Badges */}
          <Card>
            <Card.Header>
              <Card.Title>نشان‌ها (Badge)</Card.Title>
            </Card.Header>
            <Card.Body className="flex flex-wrap items-center gap-3">
              <Badge variant="success" icon={MdiCheckCircle}>
                فعال
              </Badge>
              <Badge variant="error">لغو شده</Badge>
              <Badge variant="warning">در انتظار</Badge>
              <Badge variant="info">ارسال شده</Badge>
              <Badge variant="primary">ویژه</Badge>
              <Badge variant="neutral">پیش‌نویس</Badge>
              <Badge variant="success" size="sm">
                کوچک
              </Badge>
            </Card.Body>
          </Card>

          {/* Form fields (react-hook-form wired) */}
          <Card>
            <Card.Header>
              <Card.Title>فیلدهای فرم (Input / Select / Textarea)</Card.Title>
            </Card.Header>
            <Card.Body>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                <Input
                  label="نام"
                  placeholder="نام خود را وارد کنید"
                  icon={LucideSearch}
                  hint="حداقل ۳ کاراکتر"
                  {...register("name", {
                    required: "نام الزامی است",
                    minLength: { value: 3, message: "حداقل ۳ کاراکتر" },
                  })}
                  error={errors.name?.message}
                />
                <Input
                  label="ایمیل"
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  {...register("email", { required: "ایمیل الزامی است" })}
                  error={errors.email?.message}
                />
                <Select
                  label="دسته‌بندی"
                  placeholder="انتخاب کنید"
                  options={[
                    { value: "makeup", label: "آرایشی" },
                    { value: "skincare", label: "مراقبت پوست" },
                    { value: "perfume", label: "عطر" },
                  ]}
                  {...register("category", { required: "دسته الزامی است" })}
                  error={errors.category?.message}
                />
                <Input
                  label="فیلد غیرفعال"
                  placeholder="قابل ویرایش نیست"
                  disabled
                />
                <Textarea
                  label="توضیحات"
                  placeholder="توضیحات محصول..."
                  wrapperClassName="sm:col-span-2"
                  {...register("bio")}
                />
                <div className="sm:col-span-2">
                  <Button type="submit">ثبت فرم</Button>
                </div>
              </form>
            </Card.Body>
          </Card>

          {/* Checkbox & Toggle */}
          <Card>
            <Card.Header>
              <Card.Title>چک‌باکس و سوییچ (Checkbox / Toggle)</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              <Checkbox
                label="قوانین و مقررات را می‌پذیرم"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <Checkbox label="گزینه غیرفعال" disabled />
              <Toggle
                label={toggleOn ? "نمایش در فروشگاه: فعال" : "نمایش در فروشگاه: غیرفعال"}
                checked={toggleOn}
                onChange={(e) => setToggleOn(e.target.checked)}
              />
              <Toggle label="سوییچ غیرفعال" disabled />
            </Card.Body>
          </Card>

          {/* Table */}
          <Card>
            <Card.Header className="flex items-center justify-between gap-3">
              <Card.Title>جدول (Table)</Card.Title>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={tableState === "data" ? "primary" : "outline"}
                  onClick={() => setTableState("data")}
                >
                  داده
                </Button>
                <Button
                  size="sm"
                  variant={tableState === "loading" ? "primary" : "outline"}
                  onClick={() => setTableState("loading")}
                >
                  بارگذاری
                </Button>
                <Button
                  size="sm"
                  variant={tableState === "empty" ? "primary" : "outline"}
                  onClick={() => setTableState("empty")}
                >
                  خالی
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0!">
              <Table>
                <THead>
                  <TH align="right">محصول</TH>
                  <TH align="center" hideBelow="md">
                    قیمت
                  </TH>
                  <TH align="center">وضعیت</TH>
                </THead>
                <TBody>
                  {tableState === "loading" ? (
                    <TableSkeleton rows={3} columns={3} />
                  ) : tableState === "empty" ? (
                    <TableEmpty
                      colSpan={3}
                      message="موردی یافت نشد"
                      icon={MdiPackageVariantClosed}
                    />
                  ) : (
                    pageRows.map((row) => (
                      <TRow key={row.id} hover>
                        <TD align="right" label="محصول">
                          {row.title}
                        </TD>
                        <TD align="center" label="قیمت">
                          {row.price} تومان
                        </TD>
                        <TD align="center" label="وضعیت">
                          <Badge
                            variant={row.status === "active" ? "success" : "neutral"}
                            size="sm"
                          >
                            {row.status === "active" ? "فعال" : "غیرفعال"}
                          </Badge>
                        </TD>
                      </TRow>
                    ))
                  )}
                </TBody>
              </Table>

              {/* Server-style pagination (10 per page) — decoupled sibling of Table */}
              {tableState === "data" && (
                <Pagination
                  meta={{
                    page,
                    limit: PAGE_SIZE,
                    total: allRows.length,
                    totalPages,
                  }}
                  onPageChange={setPage}
                  itemLabel="محصول"
                />
              )}
            </Card.Body>
          </Card>

          {/* ErrorState */}
          <Card>
            <Card.Header>
              <Card.Title>حالت خطا (ErrorState)</Card.Title>
            </Card.Header>
            <Card.Body>
              <ErrorState
                title="خطا در بارگذاری"
                message="دریافت اطلاعات با مشکل مواجه شد."
                onRetry={() => toast("تلاش مجدد")}
              />
            </Card.Body>
          </Card>
        </div>
      </main>
    </div>
  );
}
