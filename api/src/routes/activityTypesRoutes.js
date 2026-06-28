import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listActivityTypes } from '../services/activityTypeService.js';

const router = Router();

/**
 * GET /api/activity-types
 *
 * Retourne la liste des types d'activités disponibles.
 * Accès restreint aux rôles admin / moderator (comme ton back office).
 *
 * Exemple de réponse JSON :
 * [
 *   { "id": "uuid", "code": "surf_beginner", "label": "Surf – Beginner" },
 *   { "id": "uuid", "code": "surf_intermediate", "label": "Surf – Intermediate" },
 *   ...
 * ]
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const types = await listActivityTypes();
    res.json(types);
  })
);

export default router;