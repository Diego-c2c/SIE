import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createSession,
  listSessions,
  updateSessionRoster,
  deleteSession,
  getSessionById,
  updateSession,
  listSessionAttendees,
} from '../services/sessionService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/sessions
 *
 * Liste toutes les sessions (planning).
 * Route publique pour l'instant.
 */
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

/**
 * GET /api/sessions/:id
 *
 * Lecture d'une session par id.
 * Réservé aux admin et moderators.
 */
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

/**
 * POST /api/sessions
 *
 * Création d'une nouvelle session.
 * Réservé aux admin et moderators.
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const created = await createSession(req.body);
    res.status(201).json(created);
  })
);

/**
 * PUT /api/sessions/:id
 *
 * Mise à jour d'une session (dates, capacité, credits, moderatorId, etc.).
 * Réservé aux admin et moderators.
 */
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

/**
 * POST /api/sessions/:id/roster
 *
 * Gestion du roster (inscrits) pour une session.
 * Réservé aux admin, moderators et teachers.
 *
 * Body attendu:
 *   {
 *     "userId": "<id de l'élève>",
 *     "action": "add" | "remove" | ...
 *   }
 *
 * Le 4e paramètre de updateSessionRoster reçoit l'id de
 * l'utilisateur qui effectue l'action via req.user.id.
 */
router.post(
  '/:id/roster',
  requireAuth,
  requireRole('admin', 'moderator', 'teacher'),
  asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const { userId, action } = req.body;

    // utilisateur courant posé par requireAuth
    const performedByUserId = req.user.id; // <-- CORRECTION ICI

    const result = await updateSessionRoster(
      sessionId,
      userId,
      action,
      performedByUserId
    );

    res.json(result);
  })
);

/**
 * GET /api/sessions/:id/attendees
 *
 * Liste des inscrits pour une session.
 * Réservé aux admin, moderators, teachers.
 */
router.get(
  '/:id/attendees',
  requireAuth,
  requireRole('admin', 'moderator', 'teacher'),
  asyncHandler(async (req, res) => {
    const attendees = await listSessionAttendees(req.params.id);
    res.json(attendees);
  })
);

/**
 * DELETE /api/sessions/:id
 *
 * Suppression d'une session.
 * Réservé aux admin et moderators.
 */
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