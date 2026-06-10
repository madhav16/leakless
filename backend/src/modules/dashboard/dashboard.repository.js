import pool from '../../config/db.js';

/**
 * Dashboard Repository
 * Aggregation queries for the dashboard overview.
 */

/**
 * Total monthly spend (normalized from all billing cycles).
 */
export async function getTotalMonthlySpend() {
  const [rows] = await pool.query(
    `SELECT
       SUM(
         CASE billing_cycle
           WHEN 'daily'     THEN cost * 30
           WHEN 'weekly'    THEN cost * 4.33
           WHEN 'monthly'   THEN cost
           WHEN 'quarterly' THEN cost / 3
           WHEN 'yearly'    THEN cost / 12
           ELSE 0
         END
       ) AS total_monthly
     FROM subscriptions
     WHERE is_trial = 0`,
  );
  return parseFloat(rows[0].total_monthly ?? 0);
}

/**
 * Total annualized spend (accurate per billing cycle, excludes trials).
 */
export async function getTotalAnnualSpend() {
  const [rows] = await pool.query(
    `SELECT
       SUM(
         CASE billing_cycle
           WHEN 'daily'     THEN cost * 365
           WHEN 'weekly'    THEN cost * 52
           WHEN 'monthly'   THEN cost * 12
           WHEN 'quarterly' THEN cost * 4
           WHEN 'yearly'    THEN cost
           ELSE 0
         END
       ) AS total_annual
     FROM subscriptions
     WHERE is_trial = 0`,
  );
  return parseFloat(rows[0].total_annual ?? 0);
}

/**
 * Top 5 highest-cost subscriptions by annualized spend (excludes trials).
 */
export async function getTopCostDrivers() {
  const [rows] = await pool.query(
    `SELECT
       id,
       name,
       cost,
       billing_cycle,
       category,
       CASE billing_cycle
         WHEN 'daily'     THEN cost * 365
         WHEN 'weekly'    THEN cost * 52
         WHEN 'monthly'   THEN cost * 12
         WHEN 'quarterly' THEN cost * 4
         WHEN 'yearly'    THEN cost
         ELSE 0
       END AS annual_cost
     FROM subscriptions
     WHERE is_trial = 0
     ORDER BY annual_cost DESC
     LIMIT 5`,
  );
  return rows;
}

/**
 * Spending grouped by category.
 */
export async function getSpendingByCategory() {
  const [rows] = await pool.query(
    `SELECT
       category,
       COUNT(*) AS subscription_count,
       SUM(cost) AS total_cost
     FROM subscriptions
     GROUP BY category
     ORDER BY total_cost DESC`,
  );
  return rows;
}

/**
 * Summary counts.
 */
export async function getSummaryStats() {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*)                            AS total_subscriptions,
       SUM(is_trial = 1)                  AS active_trials,
       SUM(is_trial = 0)                  AS paid_subscriptions,
       SUM(renewal_date < CURDATE())       AS overdue_renewals
     FROM subscriptions`,
  );
  return rows[0];
}
