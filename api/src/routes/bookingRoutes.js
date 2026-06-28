import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createBooking } from '../services/bookingService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/bookings
 *
 * Crée une réservation pour une session donnée.
 * Body attendu :
 *  {
 *    sessionId: string
 *  }
 *
 * - requireAuth : seul un utilisateur authentifié peut réserver.
 * - userId est pris depuis req.user.id (posé par requireAuth).
 */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionId } = req.body;

    const booking = await createBooking({
      sessionId,
      userId: req.user.id,
    });

    res.status(201).json(booking);
  })
);

export default router;