import pool from '../../config/db.js';

/**
 * Health Score Repository
 * Queries to power subscription health calculations.
 */

/**
 * Fetch all data needed to compute the health score.
 */
export async function getHealthData() {
  const [rows] = await pool.query(
    `SELECT
       id,
       name,
       cost,
       billing_cycle,
       is_trial,
       trial_end_date,
       renewal_date,
       category,
       DATEDIFF(renewal_date, CURDATE()) AS days_until_renewal
     FROM subscriptions`,
  );
  return rows;
}

