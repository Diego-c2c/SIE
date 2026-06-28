import { pool } from '../db/pool.js';
export async function addCredits({ userId, amount, reason, actorUserId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const wr = await client.query('SELECT id, balance_credits FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    if (!wr.rowCount) throw Object.assign(new Error('Wallet not found'), { status: 404 });
    const wallet = wr.rows[0];
    const nextBalance = Number(wallet.balance_credits) + Number(amount);
    await client.query('UPDATE wallets SET balance_credits = $1, updated_at = NOW() WHERE id = $2', [nextBalance, wallet.id]);
    await client.query(`INSERT INTO credit_transactions (user_id, wallet_id, amount, direction, reason, actor_user_id) VALUES ($1,$2,$3,'credit',$4,$5)`, [userId, wallet.id, amount, reason, actorUserId]);
    await client.query('COMMIT');
    return { userId, balance: nextBalance };
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function getWallet(userId) { const r = await pool.query(`SELECT w.user_id, w.balance_credits, u.email FROM wallets w JOIN users u ON u.id = w.user_id WHERE w.user_id = $1`, [userId]); if (!r.rowCount) throw Object.assign(new Error('Wallet not found'), { status: 404 }); return r.rows[0]; }
