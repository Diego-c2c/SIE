import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginUser, registerUser } from '../services/authService.js';
const router = Router();
router.post('/register', asyncHandler(async (req, res) => res.status(201).json(await registerUser(req.body))));
router.post('/login', asyncHandler(async (req, res) => res.json(await loginUser(req.body))));
export default router;
