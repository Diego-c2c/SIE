import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createSession,
  listSessions,
  updateSessionRoster,
  deleteSession,
  getSessionById,
  updateSession,
  listSessionAttendees, // <-- ajout
} from '../services/sessionService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// liste
router.get(
  '/',
  asyncHandler(async (req, res) => {
    console.log('[/api/sessions] GET / START');

    const sessions = await listSessions();
    console.log('[/api/sessions] GET / AFTER listSessions', sessions?.length);

    res.json(sessions);
    console.log('[/api/sessions] GET / RESPONSE SENT');
  })
);

// lecture d'une session par id
router.get(
  '/:id',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const session = await getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  })
);

// création
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createSession(req.body));
  })
);

// mise à jour
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const updated = await updateSession(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(updated);
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

// liste des inscrits pour une session
router.get(
  '/:id/attendees',
  requireAuth,
  requireRole('admin', 'moderator', 'teacher'),
  asyncHandler(async (req, res) => {
    const attendees = await listSessionAttendees(req.params.id);
    res.json(attendees);
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
);

export default router;