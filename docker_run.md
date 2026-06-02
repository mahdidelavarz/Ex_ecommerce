# از ریشه پروژه اجرا کن
docker compose up -d postgres        # اول دیتابیس
docker compose up -d --build backend # بعد بک‌اند
docker compose up -d --build frontend # بعد فرانت‌اند

# یا همه با هم
docker compose up -d --build

# ۱. همه کانتینرها رو متوقف و پاک کن
docker compose -f docker-compose.dev.yml down -v

# ۲. مطمئن شو هیچی نمونده
docker ps -a

# ۳. اگه کانتینر قدیمی مونده بود، پاکش کن
docker rm -f ecommerce-db-dev

# ۴. دوباره اجرا کن (با یوزر جدید)
docker compose -f docker-compose.dev.yml up -d postgres

# ۵. چک کن که بالا اومده
docker ps

# ۶. بک‌اند رو اجرا کن
npm run dev