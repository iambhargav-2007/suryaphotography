import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Base Route (Health check)
app.get('/', (req, res) => {
  res.send('Surya Photography Backend API is running...');
});

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
