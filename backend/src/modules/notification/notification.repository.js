import pool from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Notification Repository
 */

export async function findAll({ unreadOnly = false } = {}) {
  const where = unreadOnly ? 'WHERE is_read = 0' : '';
  const [rows] = await pool.query(
    `SELECT n.*, s.name AS subscription_name
     FROM notifications n
     JOIN subscriptions s ON s.id = n.subscription_id
     ${where}
     ORDER BY n.created_at DESC`,
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function create(data) {
  const id = uuidv4();
  const { subscription_id, type, message } = data;
  await pool.query(
    `INSERT INTO notifications (id, subscription_id, type, message) VALUES (?, ?, ?, ?)`,
    [id, subscription_id, type, message],
  );
  return id;
}

export async function markAsRead(ids) {
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`,
    ids,
  );
  return result.affectedRows;
}

export async function markAllAsRead() {
  const [result] = await pool.query(
    `UPDATE notifications SET is_read = 1 WHERE is_read = 0`,
  );
  return result.affectedRows;
}

export async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM notifications WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
}

export async function countUnread() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0`,
  );
  return rows[0].count;
}
