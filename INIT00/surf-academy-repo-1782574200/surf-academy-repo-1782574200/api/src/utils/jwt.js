import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const signAccessToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role_code }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);
