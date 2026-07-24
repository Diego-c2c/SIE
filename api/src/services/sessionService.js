import { pool } from '../db/pool.js';

/**
 * Liste toutes les sessions avec leurs infos dérivées :
 * - code et label d'activité
 * - niveau
 * - dates de début/fin
 * - capacité, coût en crédits
 * - statut
 * - responsable (moderator) : id + nom complet
 * - nombre de réservations (booked_count)
 */
export async function listSessions() {
  const r = await pool.query(`
    SELECT
      s.id,
      at.code  AS activity_code,
      at.label AS activity_label,
      s.level,
      s.starts_at,
      s.ends_at,
      s.capacity,
      s.credit_cost,
      s.status,
      s.teacher_user_id AS moderator_id,                 -- ID du responsable (stocké dans teacher_user_id)
      CONCAT(t.first_name, ' ', t.last_name) AS moderator_name, -- nom affiché
      COUNT(b.id) FILTER (WHERE b.status = 'booked') AS booked_count
    FROM activity_sessions s
    JOIN activity_types at ON at.id = s.activity_type_id
    LEFT JOIN users t ON t.id = s.teacher_user_id
    LEFT JOIN bookings b ON b.session_id = s.id
    GROUP BY s.id, at.code, at.label, moderator_name
    ORDER BY s.starts_at ASC
  `);

  return r.rows;
}

/**
 * Lecture d'une session unique par ID.
 *
 * Renvoie la même structure que listSessions(), mais pour un seul enregistrement.
 * Utile pour la page d'édition (session-edit.html?id=...).
 */
export async function getSessionById(id) {
  const r = await pool.query(
    `
    SELECT
      s.id,
      at.code  AS activity_code,
      at.label AS activity_label,
      s.level,
      s.starts_at,
      s.ends_at,
      s.capacity,
      s.credit_cost,
      s.status,
      s.teacher_user_id AS moderator_id,
      CONCAT(t.first_name, ' ', t.last_name) AS moderator_name,
      COUNT(b.id) FILTER (WHERE b.status = 'booked') AS booked_count
    FROM activity_sessions s
    JOIN activity_types at ON at.id = s.activity_type_id
    LEFT JOIN users t ON t.id = s.teacher_user_id
    LEFT JOIN bookings b ON b.session_id = s.id
    WHERE s.id = $1
    GROUP BY s.id, at.code, at.label, moderator_name
    `,
    [id]
  );

  if (!r.rowCount) return null;
  return r.rows[0];
}

/**
 * Liste les inscrits d'une session donnée.
 *
 * Renvoie un tableau d'objets au format :
 * {
 *   id: string,
 *   firstName: string,
 *   lastName: string,
 *   email: string
 * }
 *
 * Utilisé par GET /api/sessions/:id/attendees pour remplir la liste
 * "Attendees" dans la page d'édition (session-edit.html).
 */
export async function listSessionAttendees(sessionId) {
  const r = await pool.query(
    `
    SELECT
      u.id,
      u.first_name AS "firstName",
      u.last_name  AS "lastName",
      u.email
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    WHERE b.session_id = $1
      AND b.status = 'booked'
    ORDER BY u.last_name ASC, u.first_name ASC
    `,
    [sessionId]
  );

  return r.rows;
}

/**
 * Création d'une nouvelle session (version simple).
 *
 * Payload attendu :
 * {
 *   activityTypeId: string,     // UUID dans activity_types
 *   teacherUserId: string|null, // ici: user responsable (moderator), stocké dans teacher_user_id
 *   level: string,
 *   startsAt: string (ISO),
 *   endsAt: string (ISO),
 *   capacity: number,
 *   creditCost: number,
 *   locationLabel: string
 * }
 *
 * On pose status = 'scheduled' par défaut.
 */
export async function createSession(payload) {
  const {
    activityTypeId,
    teacherUserId,
    level,
    startsAt,
    endsAt,
    capacity,
    creditCost,
    locationLabel,
  } = payload;

  const r = await pool.query(
    `
    INSERT INTO activity_sessions
      (activity_type_id, teacher_user_id, level, starts_at, ends_at, capacity, credit_cost, location_label, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled')
    RETURNING *
    `,
    [
      activityTypeId,
      teacherUserId || null,   // "no one" → null
      level,
      startsAt,
      endsAt,
      capacity,
      creditCost,
      locationLabel,
    ]
  );

  return r.rows[0];
}

/**
 * Mise à jour d'une session existante.
 *
 * Utilisée par la route PUT /api/sessions/:id et la page session-edit.html.
 *
 * Payload attendu (tout optionnel, pour permettre une mise à jour partielle) :
 * {
 *   activityTypeId?: string,
 *   activityTypeCode?: string,
 *   startsAt?: string (ISO),
 *   capacity?: number,
 *   creditCost?: number,
 *   moderatorId?: string|null   // id du user responsable (moderator)
 * }
 *
 * Comportement :
 * - Chaque champ non fourni laisse la valeur actuelle intacte (COALESCE).
 * - moderatorId est écrit dans teacher_user_id en base.
 * - Renvoie la session mise à jour au format complet (via getSessionById).
 */
export async function updateSession(
  id,
  {
    activityTypeId,
    activityTypeCode,
    startsAt,
    capacity,
    creditCost,
    moderatorId,
  }
) {
  // Si activityTypeCode est fourni, on le traduit en id.
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

  const r = await pool.query(
    `
    UPDATE activity_sessions
    SET
      activity_type_id  = COALESCE($2, activity_type_id),
      starts_at         = COALESCE($3, starts_at),
      -- ends_at : à toi de décider si tu recalcules côté backend à partir de starts_at
      capacity          = COALESCE($4, capacity),
      credit_cost       = COALESCE($5, credit_cost),
      teacher_user_id   = COALESCE($6, teacher_user_id)
    WHERE id = $1
    RETURNING id
    `,
    [
      id,
      activityTypeId || null,
      startsAt || null,
      typeof capacity === 'number' && !Number.isNaN(capacity) ? capacity : null,
      typeof creditCost === 'number' && !Number.isNaN(creditCost)
        ? creditCost
        : null,
      moderatorId || null, // "No one" → null en base
    ]
  );

  if (!r.rowCount) return null;

  // On renvoie la session complète (même forme que listSessions / getSessionById)
  return await getSessionById(id);
}

/**
 * Mise à jour du roster (inscription / désinscription d'un utilisateur à une session).
 *
 * - Utilise une transaction explicite pour s'assurer que la création / mise à jour
 *   de booking est atomique.
 * - action = 'add'    → crée un booking si non existant.
 * - action = 'remove' → passe le booking en 'cancelled'.
 *
 * actorUserId : id de l'utilisateur (admin/modo/teacher) qui effectue l'action,
 *               posé par requireAuth (req.user.id) dans la route.
 */
export async function updateSessionRoster(
  sessionId,
  userId,
  action,
  actorUserId
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (action === 'add') {
      // Vérifier si une réservation existe déjà
      const exists = await client.query(
        'SELECT id FROM bookings WHERE session_id = $1 AND user_id = $2',
        [sessionId, userId]
      );

      if (!exists.rowCount) {
        await client.query(
          `
          INSERT INTO bookings (session_id, user_id, status, booked_by_user_id)
          VALUES ($1,$2,'booked',$3)
          `,
          [sessionId, userId, actorUserId]
        );
      }
    } else if (action === 'remove') {
      // Soft delete : passer en 'cancelled'
      await client.query(
        `
        UPDATE bookings
        SET status = 'cancelled',
            updated_at = NOW()
        WHERE session_id = $1 AND user_id = $2
        `,
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
/**
 * Suppression d'une session.
 *
 * - Supprime l'entrée dans activity_sessions.
 * - La gestion des bookings associés se fait via le schéma (ON DELETE CASCADE)
 *   si tu l'as configuré.
 */
export async function deleteSession(sessionId) {
  await pool.query('DELETE FROM activity_sessions WHERE id = $1', [sessionId]);
}