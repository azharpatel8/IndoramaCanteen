import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeConnectionPool } from './db/oracleConnection.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import billingRoutes from './routes/billing.js';
import feedbackRoutes from './routes/feedback.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let connectionPool;

const initializeApp = async () => {
  try {
    connectionPool = await initializeConnectionPool();
    console.log('Oracle Database connection pool initialized');

    app.use((req, res, next) => {
      req.pool = connectionPool;
      next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/orders', authenticateToken, orderRoutes);
    app.use('/api/billing', authenticateToken, billingRoutes);
    app.use('/api/feedback', authenticateToken, feedbackRoutes);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (connectionPool) {
    await connectionPool.close();
  }
  process.exit(0);
});

initializeApp();
