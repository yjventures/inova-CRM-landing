import dotenv from 'dotenv';
dotenv.config();

// ✅ Main configuration object
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  FILES_HARD_DELETE: process.env.FILES_HARD_DELETE === 'true',
  TZ: process.env.TZ || 'Australia/Sydney',
};

// ✅ Alias for backward compatibility
// This ensures imports like `import { env } from '../config/env'` still work.
export const env = ENV;

// ✅ Optional: default export (nice for quick imports)
export default ENV;
