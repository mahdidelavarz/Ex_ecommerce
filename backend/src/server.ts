import 'reflect-metadata';
import type { Server } from 'http';
import app from './app';
import { env } from './config/env';
import { initializeDatabase } from './config/database';
import { logger } from './shared/utils/logger';

const PORT = env.port;

let server: Server | undefined;

const shutdown = (exitCode: number): void => {
  if (!server) {
    process.exit(exitCode);
  }

  server.close(() => {
    process.exit(exitCode);
  });
};

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();

    server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}${env.apiPrefix}`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  console.error('UNHANDLED REJECTION! Shutting down...');
  shutdown(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  shutdown(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

void startServer();

export default server;
