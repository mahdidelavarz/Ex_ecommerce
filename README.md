```markdown
# Nazi Shop - Full-Stack E-Commerce Platform

A complete, production-ready e-commerce platform built with Next.js 16, Express.js, TypeORM, and PostgreSQL.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Express](https://img.shields.io/badge/Express-4.18-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Admin Panel](#-admin-panel)
- [Development](#-development)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### 🛍️ Storefront
- **Product Catalog** - Browse products with filtering, sorting, and search
- **Product Variants** - Support for multiple variants (size, color, storage) per product
- **Shopping Cart** - Guest and authenticated cart with merge on login
- **Wishlist** - Save products for later
- **Product Reviews** - 5-star rating system with helpful votes
- **Coupon System** - Percentage, fixed amount, and free shipping coupons
- **Order Tracking** - Real-time order status updates
- **RTL Support** - Full Persian (Farsi) language and RTL layout
- **Dark Mode** - Light/dark theme with system preference detection
- **Responsive Design** - Mobile-first design for all screen sizes

### 🔐 Authentication
- **OTP Login** - Passwordless authentication via SMS
- **JWT Tokens** - Access + Refresh token rotation
- **Role-Based Access** - Customer, Admin, Support roles
- **Profile Management** - Complete user profile with addresses

### 🛠️ Admin Panel
- **Dashboard** - Overview of orders, products, users
- **Product Management** - Full CRUD with variants, images, attributes
- **Category & Brand Management** - Hierarchical categories
- **Order Management** - Status updates, payment/shipment tracking
- **Coupon Management** - Create and manage discount codes
- **Review Moderation** - Approve, reject, and reply to reviews
- **Returns Management** - Process return requests and refunds
- **Inventory Tracking** - Automatic stock management with logs

### 🏗️ Architecture
- **Feature-Based Structure** - Clean separation of concerns
- **TypeORM Entities** - 30+ well-designed database entities
- **RESTful API** - Consistent API design with proper error handling
- **Docker Support** - Full containerization for development and production
- **Type Safety** - End-to-end TypeScript

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | React framework with SSR/SSG |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| React Query (TanStack) | Server state management |
| Zustand | Client state management |
| Axios | HTTP client |
| React Hook Form + Zod | Form validation |
| React Hot Toast | Notifications |
| Iconify | Icons |
| next-themes | Dark/Light mode |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | HTTP framework |
| TypeScript | Type safety |
| TypeORM | ORM for PostgreSQL |
| PostgreSQL | Database |
| JSON Web Token | Authentication |
| Bcrypt | Password/OTP hashing |
| Kavenegar | SMS service |

### DevOps
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nodemon | Development hot reload |

---

## 📁 Project Structure

```
nazi-shop/
├── backend/                          # Express API
│   ├── src/
│   │   ├── config/                   # App configuration
│   │   │   ├── database.ts           # TypeORM DataSource
│   │   │   ├── env.ts               # Environment validation
│   │   │   └── cors.ts              # CORS setup
│   │   ├── database/
│   │   │   ├── entities/            # TypeORM entities (30+)
│   │   │   ├── migrations/          # Database migrations
│   │   │   └── base.entity.ts       # Base entity with timestamps
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts      # Global error handler
│   │   │   ├── validate.ts          # Zod validation
│   │   │   └── rateLimiter.ts       # Rate limiting
│   │   ├── modules/
│   │   │   ├── auth/                # Authentication module
│   │   │   ├── categories/          # Category management
│   │   │   ├── brands/              # Brand management
│   │   │   ├── products/            # Product management
│   │   │   ├── attributes/          # Product attributes
│   │   │   ├── variants/            # Product variants
│   │   │   ├── tags/                # Tag management
│   │   │   ├── cart/                # Shopping cart
│   │   │   ├── coupons/             # Coupon management
│   │   │   ├── orders/              # Order management
│   │   │   ├── payments/            # Payment tracking
│   │   │   ├── shipments/           # Shipment tracking
│   │   │   ├── reviews/             # Product reviews
│   │   │   ├── wishlist/            # User wishlist
│   │   │   └── returns/             # Return management
│   │   ├── shared/
│   │   │   ├── types/               # Shared TypeScript types
│   │   │   ├── utils/               # Utilities (logger, pagination, etc.)
│   │   │   └── constants/           # Enums and messages
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js App
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── (auth)/              # Authentication pages
│   │   │   ├── (admin)/             # Admin panel pages
│   │   │   ├── (profile)/           # User profile pages
│   │   │   ├── products/            # Public product pages
│   │   │   ├── cart/                # Cart page
│   │   │   ├── checkout/            # Checkout page
│   │   │   ├── orders/              # Order tracking
│   │   │   ├── wishlist/            # Wishlist page
│   │   │   ├── returns/             # Returns page
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Homepage
│   │   │   └── globals.css          # Global styles + design tokens
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   └── layout/              # Layout components
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/                # Auth (store, hooks, services)
│   │   │   ├── categories/          # Categories
│   │   │   ├── brands/              # Brands
│   │   │   ├── products/            # Products
│   │   │   ├── attributes/          # Attributes
│   │   │   ├── variants/            # Variants
│   │   │   ├── tags/                # Tags
│   │   │   ├── cart/                # Cart (store, hooks, drawer)
│   │   │   ├── coupons/             # Coupons
│   │   │   ├── orders/              # Orders
│   │   │   ├── payments/            # Payments
│   │   │   ├── shipments/           # Shipments
│   │   │   ├── reviews/             # Reviews
│   │   │   └── wishlist/            # Wishlist
│   │   ├── lib/                     # Library configs
│   │   │   ├── api-client.ts        # Axios instance
│   │   │   └── query-provider.tsx    # React Query provider
│   │   └── utils/                   # Utility functions
│   │       ├── formatPrice.ts        # Persian price formatting
│   │       ├── formatDate.ts         # Persian date formatting
│   │       └── toPersianDigits.ts    # Number conversion
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                # Production Docker setup
├── docker-compose.dev.yml            # Development Docker setup
├── .env.example                      # Environment variables template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Docker** & **Docker Compose** (or local PostgreSQL)
- **npm** or **yarn**

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone <repository-url>
cd nazi-shop

# 2. Set up environment variables
cp .env.example backend/.env
cp .env.example frontend/.env.local

# 3. Start all services
docker compose up -d --build

# 4. Visit the app
# Frontend: http://nazishop.ir
# Backend API: http://nazishop.ir/api/v1
```

### Development Setup (Hot Reload)

```bash
# Terminal 1: Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d postgres

# Terminal 2: Start Backend (with hot reload)
cd backend
npm install
npm run dev

# Terminal 3: Start Frontend (with fast refresh)
cd frontend
npm install
npm run dev
```

### Database Setup

The database tables are auto-created in development mode (`synchronize: true`). For production, use migrations:

```bash
cd backend

# Generate migration
npm run migration:generate --name=InitialMigration

# Run migrations
npm run migration:run
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password
DB_NAME=ecommerce
DB_SSL=false

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OTP
OTP_EXPIRATION_MINUTES=2
OTP_MAX_ATTEMPTS=3

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# SMS (Kavenegar)
KAVENEGAR_API_KEY=your-api-key
KAVENEGAR_SENDER=10008663
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🗄️ Database Schema

The project includes 30+ TypeORM entities covering all e-commerce domains:

### Core Entities
| Entity | Description |
|--------|-------------|
| `users` | User accounts with roles |
| `user_addresses` | Multiple addresses per user |
| `categories` | Hierarchical product categories |
| `brands` | Product brands |
| `products` | Product catalog |
| `product_images` | Product image gallery |

### Product Configuration
| Entity | Description |
|--------|-------------|
| `attributes` | Product attributes (color, size, etc.) |
| `attribute_values` | Attribute values (red, XL, 256GB) |
| `product_variants` | SKU-level product variants |
| `variant_attribute_values` | Variant-attribute mapping |
| `variant_images` | Variant-specific images |
| `tags` | Product tags |
| `product_tags` | Product-tag mapping |

### Commerce
| Entity | Description |
|--------|-------------|
| `carts` | Shopping carts (guest + user) |
| `cart_items` | Cart line items |
| `coupons` | Discount coupons |
| `coupon_products` | Product-specific coupons |
| `coupon_categories` | Category-specific coupons |
| `orders` | Customer orders |
| `order_items` | Order line items (snapshots) |
| `payments` | Payment records |
| `shipments` | Shipment tracking |

### Engagement
| Entity | Description |
|--------|-------------|
| `reviews` | Product reviews |
| `wishlists` | User wishlists |
| `returns` | Return requests |
| `return_items` | Return line items |
| `inventory_logs` | Stock change audit trail |

### Authentication
| Entity | Description |
|--------|-------------|
| `otp_codes` | One-time passwords |
| `refresh_tokens` | JWT refresh tokens |
| `login_logs` | Login audit trail |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require: `Authorization: Bearer <token>` header OR `accessToken` cookie.

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to phone |
| POST | `/auth/verify-otp` | Verify OTP & login |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/categories` | List categories |
| GET | `/categories/tree` | Category tree |
| GET | `/categories/:slug` | Single category |
| GET | `/brands` | List brands |
| GET | `/products` | List products (filterable) |
| GET | `/products/:slug` | Single product |
| GET | `/products/:slug/related` | Related products |
| GET | `/products/filters` | Product filters |
| GET | `/products/:id/variants` | Product variants |
| GET | `/attributes` | List attributes |
| GET | `/tags` | List tags |
| GET | `/reviews/product/:id` | Product reviews |

### Protected Endpoints (Customer)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Current user |
| POST | `/auth/logout` | Logout |
| PUT | `/auth/profile` | Complete profile |
| PATCH | `/auth/profile` | Update profile |
| GET | `/cart` | Get cart |
| POST | `/cart/items` | Add to cart |
| PATCH | `/cart/items/:id` | Update cart item |
| DELETE | `/cart/items/:id` | Remove from cart |
| DELETE | `/cart` | Clear cart |
| POST | `/cart/merge` | Merge guest cart |
| POST | `/coupons/validate` | Validate coupon |
| POST | `/orders` | Place order |
| GET | `/orders` | My orders |
| GET | `/orders/:id` | Order detail |
| POST | `/orders/:id/cancel` | Cancel order |
| POST | `/reviews` | Create review |
| PATCH | `/reviews/:id` | Update review |
| DELETE | `/reviews/:id` | Delete review |
| POST | `/reviews/:id/helpful` | Mark helpful |
| GET | `/wishlist` | My wishlist |
| POST | `/wishlist` | Add to wishlist |
| DELETE | `/wishlist/:id` | Remove from wishlist |
| POST | `/returns` | Create return |
| GET | `/returns` | My returns |

### Admin Endpoints

All endpoints under categories, brands, products, attributes, tags, coupons, orders, reviews have admin CRUD operations with `Admin` role requirement.

---

## 🛠️ Admin Panel

Access the admin panel at: `http://localhost:3000/admin`

### Features:
- **Dashboard** - Overview stats
- **Categories** - Tree management with drag-drop sort
- **Brands** - Brand CRUD with logo
- **Products** - Full product management with tabs:
  - Basic info, images, variants, SEO
- **Attributes** - Dynamic attribute creation with values
- **Tags** - Tag management with inline editing
- **Coupons** - Discount code management
- **Orders** - Order processing workflow:
  - Status updates, payment/shipment tracking
- **Reviews** - Review moderation with replies
- **Returns** - Return request processing

### First Admin User:
```bash
# Promote first user to admin via database:
docker exec -it ecommerce-db-dev psql -U postgres -d ecommerce \
  -c "UPDATE users SET role = 'admin' WHERE phone_number = '09123456789';"
```

---

## 💻 Development

### Code Quality
- **TypeScript** throughout - no `any` types
- **Feature-based** architecture
- **Service-Repository** pattern in backend
- **Custom hooks** for business logic in frontend
- **Zod validation** for all inputs
- **Consistent error handling** with custom error classes

### Naming Conventions
- **Files**: `kebab-case` (e.g., `product.service.ts`)
- **Classes**: `PascalCase` (e.g., `ProductService`)
- **Functions/Variables**: `camelCase` (e.g., `findProductById`)
- **Components**: `PascalCase` (e.g., `ProductCard.tsx`)
- **Database columns**: `snake_case`

### Design System
- **CSS Custom Properties** for theming
- **Tailwind CSS v4** with `@theme` directives
- **Vazirmatn** Persian font
- **RTL** layout with logical properties
- **Dark/Light** mode support
- **Semantic HTML** throughout

---

## 🚢 Deployment

### Production Docker

```bash
# Build and start production containers
docker compose up -d --build

# The app will be available at:
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

### Manual Deployment

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Production Checklist
- [ ] Set strong JWT secrets (64+ characters)
- [ ] Enable `DB_SSL=true`
- [ ] Set `NODE_ENV=production`
- [ ] Disable `synchronize` in TypeORM
- [ ] Run migrations instead of sync
- [ ] Set proper `CORS_ORIGIN`
- [ ] Configure rate limiting
- [ ] Set up HTTPS
- [ ] Configure proper logging

---

## 🏗️ Architecture Decisions

### Why Feature-Based Structure?
Each module contains everything it needs: types, services, hooks, components. This makes the codebase scalable and maintainable.

### Why TypeORM over Prisma?
TypeORM's decorator-based entities work better with class-validator and provide more flexibility for complex e-commerce queries.

### Why Cookie + Bearer Token Auth?
Access tokens in httpOnly cookies (XSS protection) with refresh tokens in memory/store. Supports both browser and API clients.

### Why Immutable Order Snapshots?
Order items copy product data at purchase time - prices and product details won't change even if products are updated later.

### Why Separate Variants Entity?
Products can have multiple SKUs (different colors/sizes) with individual pricing, stock, and images.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Vazirmatn Font](https://github.com/rastikerdar/vazirmatn) - Persian font
- [Iconify](https://iconify.design/) - Icon library
- [Kavenegar](https://kavenegar.com/) - SMS service

---

**Built with ❤️ for the Persian e-commerce community.**
