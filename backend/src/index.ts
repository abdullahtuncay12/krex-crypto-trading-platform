import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectRedis } from './config/redis';
import { pool } from './config/database';
import { initializeSubscriptionJobs } from './jobs/subscriptionJobs';
import { initializeSignalJobs } from './jobs/signalJobs';
import { initializeAlertJobs } from './jobs/alertJobs';
import { initializeBotJobs } from './jobs/botJobs';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
  "error": {
    "code": "NOT_FOUND",
    "message": "Route GET / not found",
    "timestamp": "2026-02-22T22:11:01.390Z",
    "requestId": "req_1771798261390_i8htysa0b"
  }
}

// Import routes
import authRoutes from './routes/auth';
import cryptocurrencyRoutes from './routes/cryptocurrencies';
import signalRoutes from './routes/signals';
import subscriptionRoutes from './routes/subscriptions';
import alertRoutes from './routes/alerts';
import botRoutes from './routes/bot';

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Crypto Trading Signals API' });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount cryptocurrency routes
app.use('/api/cryptocurrencies', cryptocurrencyRoutes);

// Mount signal routes
app.use('/api/signals', signalRoutes);

// Mount subscription routes (includes webhook endpoint)
app.use('/api/subscriptions', subscriptionRoutes);

// Mount webhook endpoint at root level for Stripe
app.use('/api/webhooks', subscriptionRoutes);

// Mount alert routes
app.use('/api/alerts', alertRoutes);

// Mount bot trading routes
app.use('/api/bot', botRoutes);

// Import error handling middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional - continue if fails)
    try {
      await connectRedis();
      console.log('Redis connected successfully');
    } catch (redisError) {
      console.warn('Redis connection failed - continuing without cache:', redisError);
    }

    // Test database connection
    try {
      await pool.query('SELECT NOW()');
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      console.log('Please ensure PostgreSQL is running and migrations are executed');
      console.log('Run: cd backend && npm run migrate');
    }

    // Initialize scheduled jobs (optional - continue if fails)
    try {
      initializeSubscriptionJobs();
      initializeSignalJobs();
      initializeAlertJobs();
      initializeBotJobs();
      console.log('Scheduled jobs initialized');
    } catch (jobError) {
      console.warn('Failed to initialize jobs - continuing without background jobs:', jobError);
    }

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode`);
      console.log(`Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
