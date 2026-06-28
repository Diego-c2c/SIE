import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addCredits, getWallet } from '../services/creditService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/wallet/:userId', requireAuth, asyncHandler(async (req, res) => {
  const requested = req.params.userId;
  const allowed = req.auth.role === 'admin' || req.auth.role === 'moderator' || req.auth.sub === requested;
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  res.json(await getWallet(requested));
}));
router.post('/grant', requireAuth, requireRole('admin', 'moderator'), asyncHandler(async (req, res) => res.status(201).json(await addCredits({ ...req.body, actorUserId: req.auth.sub }))));
export default router;
