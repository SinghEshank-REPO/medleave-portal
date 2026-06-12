import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root or local folder
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config(); // Fallback to local .env

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production-12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'mock',
    API_KEY: process.env.CLOUDINARY_API_KEY || 'mock',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || 'mock'
  },
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || 'mock'
  }
};
