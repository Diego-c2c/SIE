import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.get('/', asyncHandler(async (req, res) => { const db = await pool.query('SELECT NOW() AS now'); res.json({ ok: true, dbTime: db.rows[0].now }); }));
export default router;
