import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addCredits, getWallet } from '../services/creditService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/credits/wallet/:userId
 *
 * Retourne le wallet (solde de crédits) d'un utilisateur donné.
 * - Accessible :
 *   - à l'admin,
 *   - au modérateur,
 *   - au user lui-même (req.user.id === userId).
 * - getWallet(userId) doit renvoyer un objet du type :
 *   { balance_credits: number, ... }.
 */
router.get(
  '/wallet/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const requested = req.params.userId;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed =
      req.user.role === 'admin' ||
      req.user.role === 'moderator' ||
      req.user.id === requested;

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const wallet = await getWallet(requested);
    res.json(wallet);
  })
);

/**
 * POST /api/credits/grant
 *
 * Ajoute des crédits à un user via une transaction.
 * - Body attendu :
 *   {
 *     userId: string,
 *     amount: number,
 *     reasonCode?: 'AK1' | 'AK2' | 'AK3' | ...,
 *     reasonText?: string
 *   }
 * - requireAuth + requireRole('admin', 'moderator') :
 *   seuls admin/modo peuvent utiliser cette route.
 * - On passe aussi actorUserId = req.user.id au service addCredits,
 *   pour savoir qui a fait l'opération.
 *
 * addCredits doit :
 *   - insérer dans credit_transactions,
 *   - mettre à jour wallets.balance_credits,
 *   - mettre à jour users.academy_code / academy_member
 *     si reasonCode est AK1/AK2/AK3.
 */
router.post(
  '/grant',
  requireAuth,
  requireRole('admin', 'moderator'),
  asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await addCredits({
      ...req.body,
      actorUserId: req.user.id,
    });

    res.status(201).json(result);
  })
);

export default router;