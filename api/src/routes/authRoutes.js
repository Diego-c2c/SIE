import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginUser, registerUser } from '../services/authService.js';

const router = Router();

/**
 * POST /api/auth/register
 *
 * Crée un nouvel utilisateur.
 * - Le body doit contenir au moins: { firstName, lastName, email, password, ... }
 * - registerUser s'occupe:
 *   - de hasher le mot de passe,
 *   - d'insérer en base (table users),
 *   - de retourner le user créé (sans le mot de passe).
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    // On renvoie le user créé avec un status 201 (Created)
    res.status(201).json(user);
  })
);

/**
 * POST /api/auth/login
 *
 * Authentifie un utilisateur.
 * - loginUser doit:
 *   - vérifier email + mot de passe,
 *   - retourner { token, user } si OK.
 * - On renvoie tel quel au front :
 *   { token, user }.
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.json(result);
  })
);

export default router;