import pool from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Subscription Repository
 * All direct database interactions for subscriptions live here.
 * Services must call this layer — never query the DB directly from services.
 */

/**
 * @returns {Promise<object[]>} All subscriptions ordered by renewal_date
 */
export async function findAll() {
  const [rows] = await pool.query(
    `SELECT * FROM subscriptions ORDER BY renewal_date ASC, created_at DESC`,
  );
  return rows;
}

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM subscriptions WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

/**
 * @param {object} data  Validated subscription fields
 * @returns {Promise<string>} Newly created subscription id
 */
export async function create(data) {
  const id = uuidv4();
  const {
    name,
    cost,
    billing_cycle,
    category = null,
    renewal_date = null,
    is_trial = false,
    trial_end_date = null,
  } = data;

  await pool.query(
    `INSERT INTO subscriptions
       (id, name, cost, billing_cycle, category, renewal_date, is_trial, trial_end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, cost, billing_cycle, category, renewal_date, is_trial ? 1 : 0, trial_end_date],
  );

  return id;
}

/**
 * @param {string} id
 * @param {object} data  Partial subscription fields
 * @returns {Promise<boolean>} True if a row was updated
 */
export async function update(id, data) {
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];

  const [result] = await pool.query(
    `UPDATE subscriptions SET ${fields} WHERE id = ?`,
    values,
  );
  return result.affectedRows > 0;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>} True if a row was deleted
 */
export async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM subscriptions WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
}

/**
 * @param {number} days  Upcoming renewal window (e.g. 7)
 * @returns {Promise<object[]>}
 */
export async function findUpcomingRenewals(days = 7) {
  const [rows] = await pool.query(
    `SELECT * FROM subscriptions
     WHERE renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY renewal_date ASC`,
    [days],
  );
  return rows;
}

/**
 * Fetch active trials ending within the next `days` days.
 * Excludes expired trials (trial_end_date < CURDATE()).
 * Includes trials ending today (DATEDIFF = 0).
 * Computes days_until_expiry and annual_impact in SQL.
 *
 * @param {number} days  Window in days (default 30)
 * @returns {Promise<object[]>}
 */
export async function findTrialWatchlist(days = 30) {
  const [rows] = await pool.query(
    `SELECT
       id,
       name,
       cost,
       billing_cycle,
       category,
       trial_end_date,
       DATEDIFF(trial_end_date, CURDATE()) AS days_until_expiry,
       CASE billing_cycle
         WHEN 'daily'     THEN cost * 365
         WHEN 'weekly'    THEN cost * 52
         WHEN 'monthly'   THEN cost * 12
         WHEN 'quarterly' THEN cost * 4
         WHEN 'yearly'    THEN cost
         ELSE 0
       END AS annual_impact
     FROM subscriptions
     WHERE is_trial = 1
       AND trial_end_date IS NOT NULL
       AND trial_end_date >= CURDATE()
       AND trial_end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY trial_end_date ASC`,
    [days],
  );
  return rows;
}
