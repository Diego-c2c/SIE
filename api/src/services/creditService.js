import { pool } from '../db/pool.js';

/**
 * Ajoute des crédits à un wallet utilisateur.
 *
 * Paramètres (via /api/credits/grant) :
 *  {
 *    userId: string,
 *    amount: number,
 *    reasonCode?: string,  // ex: "AK1", "AK2", "AK3"
 *    reasonText?: string,  // commentaire libre optionnel
 *    actorUserId: string   // admin/modo qui fait l'opération
 *  }
 *
 * Effets :
 *  - verrouille le wallet (FOR UPDATE),
 *  - met à jour balance_credits,
 *  - insère une ligne dans credit_transactions
 *    avec une colonne reason NON NULL,
 *  - si reasonCode est AK1/AK2/AK3 :
 *      - met à jour users.academy_code,
 *      - met academy_member = true,
 *  - retourne { userId, balance }.
 */
export async function addCredits({ userId, amount, reasonCode, reasonText, actorUserId }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Verrouiller le wallet de l'utilisateur (FOR UPDATE)
    const wr = await client.query(
      'SELECT id, balance_credits FROM wallets WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    if (!wr.rowCount) {
      throw Object.assign(new Error('Wallet not found'), { status: 404 });
    }
    const wallet = wr.rows[0];

    // 2) Calculer le nouveau solde
    const nextBalance = Number(wallet.balance_credits) + Number(amount);

    // 3) Mettre à jour le wallet
    await client.query(
      `
      UPDATE wallets
      SET balance_credits = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [nextBalance, wallet.id]
    );

    // 4) Construire une raison NON NULL pour la transaction
    //    - reasonText prioritaire si présent
    //    - sinon on se base sur reasonCode
    //    - sinon fallback générique
    const reason =
      (reasonText && reasonText.trim()) ||
      (reasonCode && `Code ${reasonCode}`) ||
      'Manual grant';

    // 5) Insérer une transaction de crédit
    await client.query(
      `
      INSERT INTO credit_transactions (
        user_id,
        wallet_id,
        amount,
        direction,
        reason,
        actor_user_id
      )
      VALUES ($1, $2, $3, 'credit', $4, $5)
      `,
      [userId, wallet.id, amount, reason, actorUserId]
    );

    // 6) Si reasonCode est AK1/AK2/AK3, marquer l'utilisateur comme Academy X
    if (reasonCode === 'AK1' || reasonCode === 'AK2' || reasonCode === 'AK3') {
      await client.query(
        `
        UPDATE users
        SET academy_code = $2,
            academy_member = true,
            updated_at = NOW()
        WHERE id = $1
        `,
        [userId, reasonCode]
      );
    }

    // 7) Valider la transaction
    await client.query('COMMIT');

    // 8) Retourner le nouveau solde
    return { userId, balance: nextBalance };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Récupère le wallet d'un utilisateur
 * Retourne :
 *  { user_id, balance_credits, email }
 */
export async function getWallet(userId) {
  const r = await pool.query(
    `
    SELECT
      w.user_id,
      w.balance_credits,
      u.email
    FROM wallets w
    JOIN users u ON u.id = w.user_id
    WHERE w.user_id = $1
    `,
    [userId]
  );

  if (!r.rowCount) {
    throw Object.assign(new Error('Wallet not found'), { status: 404 });
  }

  return r.rows[0];
}

export async function setWalletBalance({ userId, targetBalance, actorUserId }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verrouiller le wallet
    const wr = await client.query(
      'SELECT id, balance_credits FROM wallets WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    if (!wr.rowCount) {
      throw Object.assign(new Error('Wallet not found'), { status: 404 });
    }
    const wallet = wr.rows[0];

    const current = Number(wallet.balance_credits) || 0;
    const target = Number(targetBalance);
    const delta = target - current;

    // Si pas de changement, on ne fait rien
    if (delta === 0) {
      await client.query('ROLLBACK');
      return { userId, balance: current };
    }

    const nextBalance = target;

    // Mettre à jour le wallet
    await client.query(
      `
      UPDATE wallets
      SET balance_credits = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [nextBalance, wallet.id]
    );

    // Insérer une transaction de crédit/débit
    const direction = delta > 0 ? 'credit' : 'debit';
    const amount = Math.abs(delta);
    const reason = 'Admin set balance';

    await client.query(
      `
      INSERT INTO credit_transactions (
        user_id,
        wallet_id,
        amount,
        direction,
        reason,
        actor_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [userId, wallet.id, amount, direction, reason, actorUserId]
    );

    await client.query('COMMIT');

    return { userId, balance: nextBalance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}