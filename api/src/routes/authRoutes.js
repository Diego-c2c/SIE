import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginUser, registerUser } from '../services/authService.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    // Comme avant : on renvoie le user créé, status 201
    res.status(201).json(user);
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    // loginUser renvoie déjà { token, user }
    const result = await loginUser(req.body);
    // On renvoie tel quel au front : { token, user }
    res.json(result);
  })
);

export default router;