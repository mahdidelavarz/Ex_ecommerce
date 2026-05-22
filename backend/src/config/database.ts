// src/config/database.ts
import { DataSource } from 'typeorm';
import { env } from './env';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  synchronize: env.nodeEnv === 'development',
  logging: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  entities: [join(__dirname, '../database/entities/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../database/migrations/**/*.{ts,js}')],
  subscribers: [],
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    
    if (env.nodeEnv === 'development') {
      console.log('📊 Database connection established');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};