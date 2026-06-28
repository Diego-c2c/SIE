import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createSession, listSessions, updateSessionRoster, deleteSession } from '../services/sessionService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
// liste
router.get('/', asyncHandler(async (req, res) => {
  // logs de debug
  console.log('[/api/sessions] GET / START');

  const sessions = await listSessions();
  console.log('[/api/sessions] GET / AFTER listSessions', sessions?.length);

  res.json(sessions);
  console.log('[/api/sessions] GET / RESPONSE SENT');
}));

// création
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createSession(req.body));
  })
);

// roster
router.post(
  '/:id/roster',
  requireAuth,
  requireRole('admin', 'moderator', 'teacher'),
  asyncHandler(async (req, res) => {
    res.json(
      await updateSessionRoster(
        req.params.id,
        req.body.userId,
        req.body.action,
        req.auth.sub
      )
    );
  })
);

// suppression
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    await deleteSession(req.params.id);
    res.status(204).end();
  })
);export default router;
