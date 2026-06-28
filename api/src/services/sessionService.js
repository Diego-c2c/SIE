import { pool } from '../db/pool.js';

export async function listSessions() {
  const r = await pool.query(`
    SELECT
      s.id,
      at.code AS activity_code,
      at.label AS activity_label,
      s.level,
      s.starts_at,
      s.ends_at,
      s.capacity,
      s.credit_cost,
      s.status,
      CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
      COUNT(b.id) FILTER (WHERE b.status = 'booked') AS booked_count
    FROM activity_sessions s
    JOIN activity_types at ON at.id = s.activity_type_id
    LEFT JOIN users t ON t.id = s.teacher_user_id
    LEFT JOIN bookings b ON b.session_id = s.id
    GROUP BY s.id, at.code, at.label, teacher_name
    ORDER BY s.starts_at ASC
  `);
  return r.rows;
}

function looksLikeUuid(str) {
  return (
    typeof str === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
  );
}

export async function createSession(payload) {
  let {
    activityTypeId,
    activityTypeCode,
    teacherUserId,
    level,
    startsAt,
    capacity,
    creditCost,
  } = payload;

  // Si on reçoit un code au lieu d'un UUID, on traduit
  if (!activityTypeId && activityTypeCode) {
    const r = await pool.query(
      'SELECT id FROM activity_types WHERE code = $1 LIMIT 1',
      [activityTypeCode]
    );
    if (!r.rowCount) {
      throw Object.assign(new Error('Unknown activity type code'), {
        status: 400,
      });
    }
    activityTypeId = r.rows[0].id;
  }

  // Si on a un activityTypeId mais que ce n’est pas un UUID, on tente aussi la traduction
  if (activityTypeId && !looksLikeUuid(activityTypeId)) {
    const r = await pool.query(
      'SELECT id FROM activity_types WHERE code = $1 LIMIT 1',
      [activityTypeId]
    );
    if (!r.rowCount) {
      throw Object.assign(new Error('Unknown activity type identifier'), {
        status: 400,
      });
    }
    activityTypeId = r.rows[0].id;
  }

  if (!activityTypeId) {
    throw Object.assign(new Error('Missing activity type'), { status: 400 });
  }

  // On calcule une heure de fin 2h après startsAt
  const startDate = new Date(startsAt);
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 2);
  const endsAt = endDate.toISOString();

  const res = await pool.query(
    `
    INSERT INTO activity_sessions
      (activity_type_id, teacher_user_id, level, starts_at, ends_at, capacity, credit_cost, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'scheduled')
    RETURNING *
    `,
    [
      activityTypeId,
      teacherUserId || null,
      level || '',
      startsAt,
      endsAt,
      capacity,
      creditCost,
    ]
  );

  return res.rows[0];
}

export async function updateSessionRoster(sessionId, userId, action, actorUserId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (action === 'add') {
      const exists = await client.query(
        'SELECT id FROM bookings WHERE session_id = $1 AND user_id = $2',
        [sessionId, userId]
      );
      if (!exists.rowCount) {
        await client.query(
          `INSERT INTO bookings (session_id, user_id, status, booked_by_user_id)
           VALUES ($1,$2,'booked',$3)`,
          [sessionId, userId, actorUserId]
        );
      }
    } else if (action === 'remove') {
      await client.query(
        `UPDATE bookings
         SET status = 'cancelled', updated_at = NOW()
         WHERE session_id = $1 AND user_id = $2`,
        [sessionId, userId]
      );
    }

    await client.query('COMMIT');
    return { sessionId, userId, action };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export async function deleteSession(sessionId) {
  await pool.query('DELETE FROM activity_sessions WHERE id = $1', [sessionId]);
}