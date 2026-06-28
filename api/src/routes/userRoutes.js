import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { activateUser, listPendingUsers, listUsers } from '../services/userService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/', requireAuth, requireRole('admin', 'moderator'), asyncHandler(async (req, res) => res.json(await listUsers())));
router.get('/pending', requireAuth, requireRole('admin', 'moderator'), asyncHandler(async (req, res) => res.json(await listPendingUsers())));
router.post('/:id/activate', requireAuth, requireRole('admin', 'moderator'), asyncHandler(async (req, res) => res.json(await activateUser(req.params.id))));
export default router;
