import { pool } from '../db/pool.js';

/**
 * Liste tous les types d'activité.
 *
 * Renvoie un tableau d'objets au format :
 * {
 *   id: string,
 *   code: string,
 *   label: string
 * }
 *
 * Utilisé par la page d'édition pour remplir le menu déroulant "Activity".
 */
export async function listActivityTypes() {
  const r = await pool.query(
    `
    SELECT
      id,
      code,
      label
    FROM activity_types
    ORDER BY label ASC
    `
  );

  return r.rows;
}

/**
 * Permet, si besoin, de retrouver un type d'activité par son code.
 * Utile si tu veux factoriser la logique de traduction code -> id.
 */
export async function findActivityTypeByCode(code) {
  const r = await pool.query(
    `
    SELECT
      id,
      code,
      label
    FROM activity_types
    WHERE code = $1
    LIMIT 1
    `,
    [code]
  );

  if (!r.rowCount) return null;
  return r.rows[0];
}