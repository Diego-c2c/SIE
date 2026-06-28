import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  activateUser,
  listPendingUsers,
  listUsers,
  updateUser,
  deleteUser,
} from '../services/userService.js';
import { setWalletBalance } from '../services/creditService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/users
 * Liste tous les utilisateurs (admin + moderator).
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const users = await listUsers();
    res.json(users);
  })
);

/**
 * GET /api/users/pending
 * Liste des comptes en attente d'activation (admin + moderator).
 */
router.get(
  '/pending',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const pending = await listPendingUsers();
    res.json(pending);
  })
);

/**
 * POST /api/users/:id/activate
 * Activation d'un user pending (admin + moderator).
 */
router.post(
  '/:id/activate',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    const user = await activateUser(req.params.id);
    res.json(user);
  })
);

/**
 * PUT /api/users/:id
 * Mise à jour d'un utilisateur (profil, rôle, academy_code).
 * Réservé aux admins.
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const updated = await updateUser(req.params.id, req.body);
    res.json(updated);
  })
);

/**
 * PUT /api/users/:id/wallet
 * Met à jour le solde du wallet d'un utilisateur (set balance).
 *
 * Body attendu :
 *  {
 *    balance: number
 *  }
 *
 * Réservé aux admins.
 */
router.put(
  '/:id/wallet',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { balance } = req.body;

    if (balance == null || isNaN(Number(balance))) {
      return res.status(400).json({ error: 'Invalid balance' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const actorUserId = req.user.id;

    const result = await setWalletBalance({
      userId,
      targetBalance: Number(balance),
      actorUserId,
    });

    res.json(result);
  })
);

/**
 * DELETE /api/users/:id
 * Suppression (soft delete) d'un utilisateur.
 * Réservé aux admins.
 */
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    await deleteUser(req.params.id);
    res.status(204).end();
  })
);

export default router;