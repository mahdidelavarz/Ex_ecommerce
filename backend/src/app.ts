// src/app.ts
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { corsConfig } from './config/cors';
import { generalLimiter, apiLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/csrf';
import { initializeDatabase } from './config/database';
import authRoutes from './modules/auth/auth.routes';
import cookieParser from 'cookie-parser';
import categoryRoutes from './modules/categories/category.routes';
import brandRoutes from './modules/brands/brand.routes';
import productRoutes from './modules/products/product.routes';
import attributeRoutes from './modules/attributes/attribute.routes';
import variantRoutes from './modules/variants/variant.routes';
import tagRoutes from './modules/tags/tag.routes';
import cartRoutes from './modules/cart/cart.routes';
import couponRoutes from './modules/coupons/coupon.routes';
import orderRoutes from './modules/orders/order.routes';
import PaymentRoutes from './modules/payments/payment.routes';
import shipmentRoutes from './modules/shipments/shipment.routes';
import reviewRoutes from './modules/reviews/review.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import returnRoutes from './modules/returns/return.routes';
import settingRoutes from './modules/settings/setting.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import userRoutes from './modules/users/user.routes';
import blogRoutes from './modules/blog/blog.routes';



const app = express();

// Initialize database
initializeDatabase();

// Security middleware
// HSTS forces browsers to upgrade http→https. On localhost (plain HTTP) this
// "poisons" the browser and breaks all API calls, so only enable it in prod.
app.use(helmet({ hsts: env.nodeEnv === 'production' }));
app.use(corsConfig);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(csrfProtection);


// Logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// Serve local uploads in non-S3 mode. Override Helmet's default
// Cross-Origin-Resource-Policy (same-origin) so the frontend on a different
// origin (:3000) can embed these images served from the API origin (:5000).
if (!env.s3.enabled) {
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(path.resolve(env.upload.path)),
  );
}

// API routes
const apiPrefix = env.apiPrefix;
app.use(apiPrefix, apiLimiter);

// In the routes section:
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/brands`, brandRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/attributes`, attributeRoutes);
app.use(`${apiPrefix}`, variantRoutes);
app.use(`${apiPrefix}/tags`, tagRoutes);
app.use(`${apiPrefix}/cart`, cartRoutes);
app.use(`${apiPrefix}/coupons`, couponRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/payment`, PaymentRoutes);
app.use(`${apiPrefix}/shipments`, shipmentRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/wishlist`, wishlistRoutes);
app.use(`${apiPrefix}/returns`, returnRoutes);
app.use(`${apiPrefix}/settings`, settingRoutes);
app.use(`${apiPrefix}/uploads`, uploadRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/blog-posts`, blogRoutes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;