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
       last_used_date,
       renewal_date,
       DATEDIFF(CURDATE(), last_used_date)  AS days_since_last_use,
       DATEDIFF(renewal_date, CURDATE())    AS days_until_renewal
     FROM subscriptions`,
  );
  return rows;
}

/**
 * Subscriptions that haven't been used in more than `days` days.
 */
export async function getInactiveSubscriptions(days = 30) {
  const [rows] = await pool.query(
    `SELECT *, DATEDIFF(CURDATE(), last_used_date) AS days_inactive
     FROM subscriptions
     WHERE last_used_date IS NOT NULL
       AND DATEDIFF(CURDATE(), last_used_date) > ?
     ORDER BY days_inactive DESC`,
    [days],
  );
  return rows;
}
