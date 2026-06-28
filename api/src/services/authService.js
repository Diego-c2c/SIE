// api/src/services/authService.js

import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { signAccessToken } from '../utils/jwt.js';

/**
 * Inscription d'un utilisateur.
 *
 * - Vérifie l'unicité de l'email.
 * - Assigne le rôle "user" (table roles).
 * - Crée le user avec status = 'pending' (validation nécessaire).
 * - Crée un wallet à 0 crédits.
 *
 * Utilisé par POST /api/auth/register (planning public ou admin).
 */
export async function registerUser({
  firstName,
  lastName,
  email,
  password,
  academyMember = false,
}) {
  // On récupère une connexion dédiée pour gérer la transaction.
  const client = await pool.connect();

  try {
    // 1. Démarrer une transaction pour que tout soit atomique.
    await client.query('BEGIN');

    // 2. Normaliser l'email en minuscule.
    const emailNormalized = email.toLowerCase();

    // 3. Vérifier si l'email existe déjà dans la table users.
    const exists = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [emailNormalized]
    );
    if (exists.rowCount) {
      // On jette une erreur HTTP 409 (conflit) si l'email est déjà pris.
      throw Object.assign(new Error('Email already exists'), { status: 409 });
    }

    // 4. Hasher le mot de passe avec bcrypt.
    const hashed = await bcrypt.hash(password, env.bcryptRounds);

    // 5. Récupérer l'id du rôle "user" dans la table roles.
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE code = 'user' LIMIT 1"
    );
    if (!roleResult.rowCount) {
      throw Object.assign(
        new Error('Role "user" not found in roles table'),
        { status: 500 }
      );
    }
    const roleId = roleResult.rows[0].id;

    // 6. Insérer l'utilisateur avec status 'pending' (en attente d'activation).
    const userResult = await client.query(
      `
      INSERT INTO users (
        role_id,
        first_name,
        last_name,
        email,
        password_hash,
        academy_member,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, email, first_name, last_name, academy_member, status
      `,
      [roleId, firstName, lastName, emailNormalized, hashed, academyMember]
    );

    const user = userResult.rows[0];

    // 7. Créer le wallet associé avec un solde initial de 0 crédits.
    await client.query(
      'INSERT INTO wallets (user_id, balance_credits) VALUES ($1, 0)',
      [user.id]
    );

    // 8. Valider la transaction.
    await client.query('COMMIT');

    // 9. Retourner les infos du user sans le password_hash.
    return user;
  } catch (error) {
    // En cas d'erreur, rollback pour ne pas laisser de demi-insert.
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Toujours libérer la connexion.
    client.release();
  }
}

/**
 * Connexion d'un utilisateur.
 *
 * - Charge le user par email + rôle associé.
 * - Vérifie le mot de passe bcrypt.
 * - Vérifie que le status est 'active' (sinon 403).
 * - Génère un JWT avec signAccessToken et renvoie { token, user }.
 *
 * Utilisé par POST /api/auth/login.
 */
export async function loginUser({ email, password }) {
  // 1. Charger le user + rôle depuis la base.
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.email,
      u.password_hash,
      u.status,
      r.code AS role_code
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
    `,
    [email.toLowerCase()]
  );

  // 2. Si aucun utilisateur trouvé, renvoyer 401 (credentials invalides).
  if (!result.rowCount) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const user = result.rows[0];

  // 3. Vérifier le mot de passe avec bcrypt.
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  // 4. Vérifier que le compte est actif.
  if (user.status !== 'active') {
    // Le compte existe mais n'est pas encore activé (admin/modo).
    throw Object.assign(new Error('Account not active yet'), { status: 403 });
  }

  // 5. Générer un token d'accès (JWT) incluant id/email/role.
  const token = signAccessToken(user);

  // 6. Retourner le token + les infos minimales du user au front.
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role_code,
    },
  };
}