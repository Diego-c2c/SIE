import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createSession, listSessions, updateSessionRoster } from '../services/sessionService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/', asyncHandler(async (req, res) => res.json(await listSessions())));
router.post('/', requireAuth, requireRole('admin', 'moderator'), asyncHandler(async (req, res) => res.status(201).json(await createSession(req.body))));
router.post('/:id/roster', requireAuth, requireRole('admin', 'moderator', 'teacher'), asyncHandler(async (req, res) => res.json(await updateSessionRoster(req.params.id, req.body.userId, req.body.action, req.auth.sub))));
export default router;
