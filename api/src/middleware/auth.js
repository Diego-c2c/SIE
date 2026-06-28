import { verifyAccessToken } from '../utils/jwt.js';
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try { req.auth = verifyAccessToken(token); next(); } catch { return res.status(401).json({ error: 'Invalid token' }); }
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
