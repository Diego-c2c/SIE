import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';

/**
 * Liste les utilisateurs avec statut "pending"
 * Utilisé pour le bloc "Pending activation" dans l'admin.
 */
export async function listPendingUsers() {
  const r = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      status,
      academy_member,
      created_at
    FROM users
    WHERE status = 'pending'
    ORDER BY created_at ASC
    `
  );
  return r.rows;
}

/**
 * Active un utilisateur (status: pending -> active)
 * Utilisé par le bouton "Activate" dans la liste Pending.
 */
export async function activateUser(userId) {
  const r = await pool.query(
    `
    UPDATE users
    SET status = 'active',
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, status
    `,
    [userId]
  );

  if (!r.rowCount) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  return r.rows[0];
}

/**
 * Liste tous les utilisateurs (pour "All users" dans l'admin).
 * On récupère :
 *  - id, first_name, last_name, email
 *  - status, academy_member, academy_code
 *  - role: code de rôle (user, teacher, moderator, admin)
 */
export async function listUsers() {
  const r = await pool.query(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.status,
      u.academy_member,
      u.academy_code,
      r.code AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    -- optionnel : exclure les users "deleted" si tu fais du soft-delete
    -- WHERE u.status <> 'deleted'
    ORDER BY u.created_at DESC
    `
  );
  return r.rows;
}

/**
 * Met à jour un utilisateur existant (utilisé par l'admin).
 *
 * Payload attendu (admin.html) :
 *  {
 *    firstName: string,
 *    lastName: string,
 *    email: string,
 *    academyMember: boolean,
 *    academyCode?: string | null,   // AK1 / AK2 / AK3 / null
 *    role: 'user' | 'teacher' | 'moderator' | 'admin',
 *    password?: string (optionnel)
 *  }
 *
 * - Hash du mot de passe avec bcrypt (comme registerUser).
 */
export async function updateUser(userId, payload) {
  const {
    firstName,
    lastName,
    email,
    academyMember,
    academyCode,  // <-- il manquait dans ta version
    role,
    password,
  } = payload;

  // 1) Résoudre le rôle via la table roles (champ code)
  const roleRes = await pool.query(
    'SELECT id FROM roles WHERE code = $1 LIMIT 1',
    [role]
  );
  if (!roleRes.rowCount) {
    throw Object.assign(new Error('Unknown role code'), { status: 400 });
  }
  const roleId = roleRes.rows[0].id;

  // 2) Champs à mettre à jour (hors mot de passe)
  const fields = [
    'first_name = $1',
    'last_name = $2',
    'email = $3',
    'academy_member = $4',
    'academy_code = $5',
    'role_id = $6',
    'updated_at = NOW()',
  ];
  const values = [
    firstName,
    lastName,
    email.toLowerCase(),
    !!academyMember,
    academyCode || null,
    roleId,
  ];

  // 3) Password optionnel : si fourni, on le hash avec bcrypt
  if (password && password.trim().length > 0) {
    const hashed = await bcrypt.hash(password, env.bcryptRounds);
    // IMPORTANT : le placeholder doit suivre les indices
    // actuels ($7 car on a déjà 6 valeurs dans values)
    fields.push('password_hash = $7');
    values.push(hashed);
  }

  // 4) Construire la requête avec clause WHERE
  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${values.length + 1}
    RETURNING
      id,
      email,
      first_name,
      last_name,
      academy_member,
      academy_code,
      status
  `;
  values.push(userId);

  const r = await pool.query(sql, values);
  if (!r.rowCount) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  return r.rows[0];
}

/**
 * Supprime un utilisateur (admin).
 *
 * Ici on fait un "soft delete" en mettant status = 'deleted'.
 * Tu peux adapter en DELETE physique si tu préfères.
 */
export async function deleteUser(userId) {
  const r = await pool.query(
    `
    UPDATE users
    SET status = 'deleted',
        updated_at = NOW()
    WHERE id = $1
    `,
    [userId]
  );

  if (!r.rowCount) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
}