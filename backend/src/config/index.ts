import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',

  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'crypto_signals',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  exchanges: {
    binance: {
      apiKey: process.env.BINANCE_API_KEY || '',
      apiSecret: process.env.BINANCE_API_SECRET || '',
    },
    coinbase: {
      apiKey: process.env.COINBASE_API_KEY || '',
      apiSecret: process.env.COINBASE_API_SECRET || '',
    },
    bybit: {
      apiKey: process.env.BYBIT_API_KEY || '',
      apiSecret: process.env.BYBIT_API_SECRET || '',
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  },

  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '30', 10),
  },

  jobs: {
    signalUpdateIntervalMinutes: parseInt(process.env.SIGNAL_UPDATE_INTERVAL_MINUTES || '60', 10),
    alertCheckIntervalSeconds: parseInt(process.env.ALERT_CHECK_INTERVAL_SECONDS || '60', 10),
  },
};
