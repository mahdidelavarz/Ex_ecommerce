// src/app.ts
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { corsConfig } from './config/cors';
import { generalLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './config/database';
import authRoutes from './modules/auth/auth.routes';
import cookieParser from 'cookie-parser';
import categoryRoutes from './modules/categories/category.routes';
import brandRoutes from './modules/brands/brand.routes';
import productRoutes from './modules/products/product.routes';
import attributeRoutes from './modules/attributes/attribute.routes';
import variantRoutes from './modules/variants/variant.routes';
import tagRoutes from './modules/tags/tag.routes';



// Import routes
// import authRoutes from './modules/auth/auth.routes';
// import userRoutes from './modules/users/users.routes';
// import productRoutes from './modules/products/products.routes';
// ... other route imports

const app = express();

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());
app.use(corsConfig);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // ← اضافه کن قبل از routes


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

// API routes
const apiPrefix = env.apiPrefix;

// In the routes section:
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/brands`, brandRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/attributes`, attributeRoutes);
app.use(`${apiPrefix}`, variantRoutes);
app.use(`${apiPrefix}/tags`, tagRoutes);


// app.use(`${apiPrefix}/auth`, authRoutes);
// app.use(`${apiPrefix}/users`, userRoutes);
// app.use(`${apiPrefix}/products`, productRoutes);
// ... other routes

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