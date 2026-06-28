import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createBooking } from '../services/bookingService.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/', requireAuth, asyncHandler(async (req, res) => res.status(201).json(await createBooking({ sessionId: req.body.sessionId, userId: req.auth.sub }))));
export default router;
