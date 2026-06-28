import { Router } from 'express';

// Routes "feature" de ton API
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import creditRoutes from './creditRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import bookingRoutes from './bookingRoutes.js';

// On crée un routeur Express "principal"
const router = Router();

/**
 * Toutes les routes sont préfixées par /api
 *
 * Exemple :
 *   - /api/health  → healthRoutes
 *   - /api/auth    → authRoutes
 *   - /api/users   → userRoutes
 *   - /api/credits → creditRoutes
 *   - /api/sessions→ sessionRoutes
 *   - /api/bookings→ bookingRoutes
 *
 * C'est ce routeur qui est monté dans app.js via :
 *   app.use(routes);
 */

// Route de santé / ping (ex: GET /api/health)
router.use('/api/health', healthRoutes);

// Authentification (login, refresh, etc.) → /api/auth/...
router.use('/api/auth', authRoutes);

// Gestion des utilisateurs → /api/users/...
router.use('/api/users', userRoutes);

// Gestion des crédits → /api/credits/...
router.use('/api/credits', creditRoutes);

// Gestion des sessions (planning, etc.) → /api/sessions/...
// Inclut : liste, création, édition, roster, suppression, attendees, etc.
router.use('/api/sessions', sessionRoutes);

// Gestion des bookings (réservations) → /api/bookings/...
router.use('/api/bookings', bookingRoutes);

// On exporte ce routeur pour qu'il soit utilisé dans app.js
export default router;