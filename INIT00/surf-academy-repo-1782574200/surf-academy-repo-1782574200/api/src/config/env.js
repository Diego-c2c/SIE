import dotenv from 'dotenv';
dotenv.config({ path: '/app/.env' });
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appName: process.env.APP_NAME || 'surf-academy-platform',
  appUrl: process.env.APP_URL || 'http://localhost:8080',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@surfacademy.local',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456'
};
