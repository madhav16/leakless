/**
 * Shared format utilities.
 * Currency, date, and time helpers used across all features.
 */

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} [currency='INR']
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string for display.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDate(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

/**
 * Get days until a future date (negative if past).
 * @param {string|Date} date
 * @returns {number}
 */
export function getDaysUntil(date) {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get a human-readable renewal label.
 * @param {string|Date} renewalDate
 */
export function getRenewalLabel(renewalDate) {
  const days = getDaysUntil(renewalDate);
  if (days === null) return 'No renewal date';
  if (days < 0)  return `Overdue by ${Math.abs(days)} days`;
  if (days === 0) return 'Renews today';
  if (days === 1) return 'Renews tomorrow';
  if (days <= 7)  return `Renews in ${days} days`;
  return `Renews ${formatDate(renewalDate)}`;
}
