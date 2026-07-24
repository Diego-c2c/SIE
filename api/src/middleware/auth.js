import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware d'authentification.
 *
 * - Attend un header Authorization: Bearer <token>.
 * - Vérifie le token via verifyAccessToken.
 * - Pose req.user = { id, email, role, ... } pour les middlewares suivants.
 *
 * En cas de problème :
 *  - 401 si token manquant ou invalide.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

try {
  const payload = verifyAccessToken(token);

  // payload ou payload.sub manquant → 401 propre
  if (!payload || !payload.sub) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    ...payload,
  };

  next();
} catch (err) {
  return res.status(401).json({ error: 'Invalid token' });
}
}

/**
 * Middleware d'autorisation par rôle.
 *
 * Usage :
 *   router.put('/...', requireAuth, requireRole('admin'), handler)
 *
 * - Vérifie qu'il y a un req.user (set par requireAuth),
 * - Vérifie que req.user.role est dans la liste autorisée.
 * - Sinon, renvoie :
 *    - 401 si pas d'utilisateur,
 *    - 403 si rôle non autorisé.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}