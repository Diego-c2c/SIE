import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import creditRoutes from './creditRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import bookingRoutes from './bookingRoutes.js';

const router = Router();

// Toutes les routes sont préfixées par /api
router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/credits', creditRoutes);
router.use('/api/sessions', sessionRoutes);
router.use('/api/bookings', bookingRoutes);

export default router;