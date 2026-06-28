import { pool } from '../db/pool.js';
export async function createBooking({ sessionId, userId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sr = await client.query(`SELECT s.id, s.capacity, s.credit_cost, COUNT(b.id) FILTER (WHERE b.status = 'booked')::int AS booked_count FROM activity_sessions s LEFT JOIN bookings b ON b.session_id = s.id WHERE s.id = $1 GROUP BY s.id`, [sessionId]);
    if (!sr.rowCount) throw Object.assign(new Error('Session not found'), { status: 404 });
    const session = sr.rows[0];
    if (session.booked_count >= session.capacity) throw Object.assign(new Error('Session is full'), { status: 409 });
    const existing = await client.query(`SELECT id FROM bookings WHERE session_id = $1 AND user_id = $2 AND status = 'booked'`, [sessionId, userId]);
    if (existing.rowCount) throw Object.assign(new Error('Already booked'), { status: 409 });
    const wr = await client.query('SELECT id, balance_credits FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    if (!wr.rowCount) throw Object.assign(new Error('Wallet not found'), { status: 404 });
    const wallet = wr.rows[0];
    if (Number(wallet.balance_credits) < Number(session.credit_cost)) throw Object.assign(new Error('Insufficient credits'), { status: 409 });
    const nextBalance = Number(wallet.balance_credits) - Number(session.credit_cost);
    await client.query('UPDATE wallets SET balance_credits = $1, updated_at = NOW() WHERE id = $2', [nextBalance, wallet.id]);
    const br = await client.query(`INSERT INTO bookings (session_id, user_id, status, booked_by_user_id) VALUES ($1,$2,'booked',$2) RETURNING *`, [sessionId, userId]);
    await client.query(`INSERT INTO credit_transactions (user_id, wallet_id, related_booking_id, actor_user_id, amount, direction, reason) VALUES ($1,$2,$3,$1,$4,'debit','booking')`, [userId, wallet.id, br.rows[0].id, session.credit_cost]);
    await client.query('COMMIT');
    return { booking: br.rows[0], balance: nextBalance };
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
