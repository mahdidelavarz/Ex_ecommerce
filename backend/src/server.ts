// src/server.ts
import 'reflect-metadata';
import app from './app';
import { env } from './config/env';
import { logger } from './shared/utils/logger';

const PORT = env.port;

const server = app.listen(PORT, () => {
  logger.info(`✅ Server running in ${env.nodeEnv} mode on port ${PORT}`);
  logger.info(`📍 API available at http://localhost:${PORT}${env.apiPrefix}`);
  logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default server;