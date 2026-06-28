import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { signAccessToken } from '../utils/jwt.js';
export async function registerUser({ firstName, lastName, email, password, academyMember = false }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const emailNormalized = email.toLowerCase();
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [emailNormalized]);
    if (exists.rowCount) throw Object.assign(new Error('Email already exists'), { status: 409 });
    const hashed = await bcrypt.hash(password, env.bcryptRounds);
    const roleResult = await client.query("SELECT id FROM roles WHERE code = 'user' LIMIT 1");
    const userResult = await client.query(`INSERT INTO users (role_id, first_name, last_name, email, password_hash, academy_member, status) VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id, email, first_name, last_name, academy_member, status`, [roleResult.rows[0].id, firstName, lastName, emailNormalized, hashed, academyMember]);
    await client.query('INSERT INTO wallets (user_id, balance_credits) VALUES ($1, 0)', [userResult.rows[0].id]);
    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function loginUser({ email, password }) {
  const result = await pool.query(`SELECT u.id, u.email, u.password_hash, u.status, r.code AS role_code FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = $1`, [email.toLowerCase()]);
  if (!result.rowCount) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  if (user.status !== 'active') throw Object.assign(new Error('Account not active yet'), { status: 403 });
  return { token: signAccessToken(user), user: { id: user.id, email: user.email, role: user.role_code } };
}
