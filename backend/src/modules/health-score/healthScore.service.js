import * as healthScoreRepo from './healthScore.repository.js';

const MAX_SCORE = 100;

/**
 * Safely normalise a date value from the DB driver (may be a Date object or string).
 */
const formatDateString = (d) => {
  if (!d) return '';
  if (d instanceof Date) {
    try { return d.toISOString().split('T')[0]; } catch { return ''; }
  }
  if (typeof d === 'string') return d.split('T')[0];
  return String(d).split('T')[0];
};

/**
 * Days from today to targetDate (negative = past, 0 = today).
 */
const getDaysDifference = (targetDate) => {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const current = new Date();
  current.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Scoring constants ────────────────────────────────────────────────────────

const DEDUCTIONS = {
  TRIAL_CRITICAL:       15,  // expires today or tomorrow
  TRIAL_WARNING:        10,  // expires in 2–3 days
  TRIAL_INFO:            5,  // expires in 4–7 days
  TRIAL_UNKNOWN_DATE:    5,  // is_trial but no trial_end_date
  OVERLAP_INFO:          0,  // 2 paid subs in same category — informational only, no penalty
  OVERLAP_WARNING:       8,  // 3–4 paid subs in same category
  OVERLAP_CRITICAL:     15,  // 5+ paid subs in same category
};

// ─── Main scoring function ────────────────────────────────────────────────────

export async function calculateFullHealthScore() {
  const data = await healthScoreRepo.getHealthData();

  if (data.length === 0) {
    return {
      score: MAX_SCORE,
      label: 'Excellent',
      total_subscriptions: 0,
      issues: [],
      recommendations: [],
      deductions: [],
    };
  }

  const issues = [];
  const recommendations = [];

  // ── Factor 1 & 2: Active Trial Risk ────────────────────────────────────────
  // Factor 1: Trials with a known end date approaching within 7 days
  // Factor 2: Trials with NO end date — uncontrolled billing risk

  const activeTrials = data.filter((s) => s.is_trial);

  activeTrials.forEach((s) => {
    const dateStr = formatDateString(s.trial_end_date);

    if (!s.trial_end_date) {
      // Factor 2 — Unknown trial end date
      issues.push({
        type: 'trial_unknown_date',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `"${s.name}" is marked as a free trial but has no trial end date recorded.`,
        severity: 'high',
        deduction: DEDUCTIONS.TRIAL_UNKNOWN_DATE,
        issueLabel: 'Free Trial Alert',
      });
      recommendations.push({
        type: 'trial_unknown_date',
        subscription_id: s.id,
        message: `Add a trial end date to "${s.name}" immediately. Without it you have no way to know when auto-billing may start.`,
      });
      return;
    }

    // Factor 1 — Expiry-window tiers
    const days = getDaysDifference(s.trial_end_date);
    if (days === null) return;

    if (days <= 1) {
      const dayLabel = days < 0
        ? `expired on ${dateStr}`
        : days === 0
          ? `expires today (${dateStr})`
          : `expires tomorrow (${dateStr})`;

      const recLabel = days < 0
        ? `"${s.name}" trial expired on ${dateStr}. Cancel immediately to stop any ongoing charges.`
        : days === 0
          ? `"${s.name}" trial expires today. Cancel now if you do not plan to continue to prevent auto-billing.`
          : `"${s.name}" trial expires tomorrow. Cancel now to prevent auto-billing.`;

      issues.push({
        type: 'trial_critical',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `The free trial for "${s.name}" ${dayLabel}.`,
        severity: 'high',
        deduction: DEDUCTIONS.TRIAL_CRITICAL,
        issueLabel: 'Free Trial Alert',
      });
      recommendations.push({
        type: 'trial_critical',
        subscription_id: s.id,
        message: recLabel,
      });

    } else if (days <= 3) {
      issues.push({
        type: 'trial_warning',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `The free trial for "${s.name}" expires in ${days} ${days === 1 ? 'day' : 'days'} (${dateStr}).`,
        severity: 'high',
        deduction: DEDUCTIONS.TRIAL_WARNING,
        issueLabel: 'Free Trial Alert',
      });
      recommendations.push({
        type: 'trial_warning',
        subscription_id: s.id,
        message: `"${s.name}" trial expires in ${days} days. Cancel now if you do not plan to continue to prevent auto-billing.`,
      });

    } else if (days <= 7) {
      issues.push({
        type: 'trial_info',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `The free trial for "${s.name}" expires in ${days} days (${dateStr}).`,
        severity: 'medium',
        deduction: DEDUCTIONS.TRIAL_INFO,
        issueLabel: 'Free Trial Alert',
      });
      recommendations.push({
        type: 'trial_info',
        subscription_id: s.id,
        message: `"${s.name}" trial expires in ${days} days. Decide now whether to continue or cancel before the trial ends.`,
      });
    }
    // Trials > 7 days away: no deduction, no issue
  });

  // ── Factor 3: Category Overlap ──────────────────────────────────────────────
  // Multiple paid subscriptions in the same category = passive leakage risk.

  const paidSubs = data.filter((s) => !s.is_trial);

  const categoryCounts = {};
  paidSubs.forEach((s) => {
    if (s.category) {
      categoryCounts[s.category] = categoryCounts[s.category] || [];
      categoryCounts[s.category].push(s);
    }
  });

  Object.entries(categoryCounts).forEach(([category, subs]) => {
    const listNames = subs.map((s) => s.name).join(', ');
    const count = subs.length;

    if (count >= 5) {
      issues.push({
        type: 'overlap_critical',
        category,
        message: `You have ${count} active paid subscriptions in the "${category}" category.`,
        severity: 'high',
        details: subs.map((s) => s.name),
        deduction: DEDUCTIONS.OVERLAP_CRITICAL,
        issueLabel: 'Tool Overlap',
      });
      recommendations.push({
        type: 'overlap_critical',
        category,
        message: `Immediately audit "${category}" (${listNames}). ${count} tools solving the same problem almost certainly means redundant spend.`,
      });
    } else if (count >= 3) {
      issues.push({
        type: 'overlap_warning',
        category,
        message: `You have ${count} active paid subscriptions in the "${category}" category.`,
        severity: 'medium',
        details: subs.map((s) => s.name),
        deduction: DEDUCTIONS.OVERLAP_WARNING,
        issueLabel: 'Tool Overlap',
      });
      recommendations.push({
        type: 'overlap_warning',
        category,
        message: `Review your "${category}" subscriptions (${listNames}) and consolidate to remove any that are no longer actively used.`,
      });
    } else if (count === 2) {
      issues.push({
        type: 'overlap_info',
        category,
        message: `You have 2 paid subscriptions in the "${category}" category.`,
        severity: 'low',
        details: subs.map((s) => s.name),
        deduction: DEDUCTIONS.OVERLAP_INFO,
        issueLabel: 'Tool Overlap',
      });
      recommendations.push({
        type: 'overlap_info',
        category,
        message: `Verify that you need both "${listNames}" active at the same time. Consider cancelling the one you use less.`,
      });
    }
  });

  // ── Score calculation ───────────────────────────────────────────────────────

  const totalDeductions = issues.reduce((sum, issue) => sum + (issue.deduction ?? 0), 0);
  const finalScore = Math.max(0, Math.min(MAX_SCORE - totalDeductions, MAX_SCORE));

  const label =
    finalScore >= 85 ? 'Excellent' :
    finalScore >= 70 ? 'Good' :
    finalScore >= 50 ? 'Fair' :
    'Poor';

  // Deduction summary grouped by issueLabel for the frontend breakdown card
  const deductionsSummary = {};
  issues.forEach((issue) => {
    if ((issue.deduction ?? 0) > 0) {
      deductionsSummary[issue.issueLabel] = deductionsSummary[issue.issueLabel] || { points: 0, count: 0 };
      deductionsSummary[issue.issueLabel].points += issue.deduction;
      deductionsSummary[issue.issueLabel].count += 1;
    }
  });

  const deductions = Object.entries(deductionsSummary).map(([category, item]) => ({
    category,
    points: item.points,
    count: item.count,
  }));

  return {
    score: finalScore,
    label,
    total_subscriptions: data.length,
    issues,
    recommendations,
    deductions,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getHealthScore() {
  const result = await calculateFullHealthScore();
  return {
    score: result.score,
    label: result.label,
    total_subscriptions: result.total_subscriptions,
  };
}

export async function getHealthBreakdown() {
  return calculateFullHealthScore();
}
