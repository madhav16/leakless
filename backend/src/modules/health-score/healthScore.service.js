import * as healthScoreRepo from './healthScore.repository.js';

const MAX_SCORE = 100;

const formatDateString = (d) => {
  if (!d) return '';
  if (d instanceof Date) {
    try {
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }
  if (typeof d === 'string') {
    return d.split('T')[0];
  }
  return String(d).split('T')[0];
};

const getMonthlyCost = (s) => {
  const cost = parseFloat(s.cost);
  if (s.is_trial) return 0;
  switch (s.billing_cycle) {
    case 'daily': return cost * 30;
    case 'weekly': return cost * 4.33;
    case 'monthly': return cost;
    case 'quarterly': return cost / 3;
    case 'yearly': return cost / 12;
    default: return 0;
  }
};

const getDaysDifference = (targetDate) => {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const current = new Date();
  current.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export async function calculateFullHealthScore() {
  const data = await healthScoreRepo.getHealthData();

  if (data.length === 0) {
    return {
      score: MAX_SCORE,
      label: 'Excellent',
      total_subscriptions: 0,
      total_monthly_spend: 0,
      issues: [],
      recommendations: [],
      deductions: [],
    };
  }

  const issues = [];
  const recommendations = [];

  // 1. ACTIVE TRIALS ANALYSIS
  const activeTrials = data.filter((s) => s.is_trial);
  activeTrials.forEach((s) => {
    if (s.trial_end_date) {
      const days = getDaysDifference(s.trial_end_date);
      if (days === null) return;

      const dateStr = formatDateString(s.trial_end_date);

      if (days <= 1) {
        const msg = days < 0 
          ? `The free trial for "${s.name}" expired on ${dateStr} and might have auto-renewed.`
          : days === 0 
            ? `The free trial for "${s.name}" expires today (${dateStr}).`
            : `The free trial for "${s.name}" expires tomorrow (${dateStr}).`;
        
        const recMsg = days < 0
          ? `"${s.name}" trial expired on ${dateStr}. Cancel now if you do not plan to continue to avoid further charges.`
          : days === 0
            ? `"${s.name}" trial expires today. Cancel now if you do not plan to continue to prevent auto-billing.`
            : `"${s.name}" trial expires tomorrow. Cancel now if you do not plan to continue to prevent auto-billing.`;

        issues.push({
          type: 'trial_critical',
          subscription_id: s.id,
          subscription_name: s.name,
          message: msg,
          severity: 'high',
          deduction: 15,
          issueLabel: 'Free Trial Alert',
        });
        recommendations.push({
          type: 'trial_critical',
          subscription_id: s.id,
          message: recMsg,
        });
      } else if (days <= 3) {
        issues.push({
          type: 'trial_warning',
          subscription_id: s.id,
          subscription_name: s.name,
          message: `The free trial for "${s.name}" expires in ${days} days.`,
          severity: 'high',
          deduction: 10,
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
          message: `The free trial for "${s.name}" expires in ${days} days.`,
          severity: 'medium',
          deduction: 3,
          issueLabel: 'Free Trial Alert',
        });
        recommendations.push({
          type: 'trial_info',
          subscription_id: s.id,
          message: `Review usage of "${s.name}" before renewal to determine if you want to keep it.`,
        });
      }
    } else {
      issues.push({
        type: 'trial_missing_date',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `Free trial for "${s.name}" is missing a trial end date.`,
        severity: 'medium',
        deduction: 2,
        issueLabel: 'Missing Data',
      });
      recommendations.push({
        type: 'trial_missing_date',
        subscription_id: s.id,
        message: `Add a trial end date to "${s.name}" to track its upcoming billing.`,
      });
    }
  });

  // 2. UPCOMING RENEWALS ANALYSIS
  const paidSubs = data.filter((s) => !s.is_trial);
  paidSubs.forEach((s) => {
    if (s.renewal_date) {
      const days = getDaysDifference(s.renewal_date);
      if (days === null) return;

      const dateStr = formatDateString(s.renewal_date);

      if (days < 0) {
        issues.push({
          type: 'renewal_overdue',
          subscription_id: s.id,
          subscription_name: s.name,
          message: `The renewal date for "${s.name}" is overdue (${dateStr}).`,
          severity: 'medium',
          deduction: 0, // removed per user instruction
          issueLabel: 'Renewal Reminder',
        });
        recommendations.push({
          type: 'renewal_overdue',
          subscription_id: s.id,
          message: `Update the renewal date for "${s.name}" (last set to ${dateStr}) to keep your billing alerts accurate.`,
        });
      } else if (days <= 3) {
        const msg = days === 0
          ? `Paid subscription "${s.name}" is renewing today.`
          : days === 1
            ? `Paid subscription "${s.name}" is renewing tomorrow.`
            : `Paid subscription "${s.name}" is renewing in ${days} days.`;

        const recMsg = days === 0
          ? `"${s.name}" renews today for ₹${parseFloat(s.cost).toFixed(2)}. Review whether it is still necessary before renewal.`
          : days === 1
            ? `"${s.name}" renews tomorrow for ₹${parseFloat(s.cost).toFixed(2)}. Review whether it is still necessary before renewal.`
            : `"${s.name}" renews in ${days} days for ₹${parseFloat(s.cost).toFixed(2)}. Review whether it is still necessary before renewal.`;

        issues.push({
          type: 'renewal_imminent',
          subscription_id: s.id,
          subscription_name: s.name,
          message: msg,
          severity: 'medium',
          deduction: 2,
          issueLabel: 'Renewal Reminder',
        });
        recommendations.push({
          type: 'renewal_imminent',
          subscription_id: s.id,
          message: recMsg,
        });
      }
    } else {
      issues.push({
        type: 'renewal_missing_date',
        subscription_id: s.id,
        subscription_name: s.name,
        message: `Paid subscription "${s.name}" has no renewal date specified.`,
        severity: 'medium',
        deduction: 2,
        issueLabel: 'Missing Data',
      });
      recommendations.push({
        type: 'renewal_missing_date',
        subscription_id: s.id,
        message: `Add a renewal date to "${s.name}" to enable future payment alerts.`,
      });
    }
  });

  // 3. DUPLICATE CATEGORIES ANALYSIS
  const categoryCounts = {};
  paidSubs.forEach((s) => {
    if (s.category) {
      categoryCounts[s.category] = categoryCounts[s.category] || [];
      categoryCounts[s.category].push(s);
    }
  });

  Object.entries(categoryCounts).forEach(([category, subs]) => {
    const listNames = subs.map((s) => s.name).join(', ');
    if (subs.length >= 5) {
      issues.push({
        type: 'duplicate_critical',
        category,
        message: `You have ${subs.length} active paid subscriptions in the "${category}" category.`,
        severity: 'high',
        details: subs.map((s) => s.name),
        deduction: 10,
        issueLabel: 'Tool Overlap Alert',
      });
      recommendations.push({
        type: 'duplicate_critical',
        category,
        message: `Perform an immediate audit in the "${category}" category (${listNames}) to eliminate redundant tools.`,
      });
    } else if (subs.length >= 3) {
      issues.push({
        type: 'duplicate_warning',
        category,
        message: `You have ${subs.length} active paid subscriptions in the "${category}" category.`,
        severity: 'medium',
        details: subs.map((s) => s.name),
        deduction: 5,
        issueLabel: 'Tool Overlap Alert',
      });
      recommendations.push({
        type: 'duplicate_warning',
        category,
        message: `Consolidate your subscriptions under the "${category}" category (${listNames}) to avoid overlaps.`,
      });
    } else if (subs.length === 2) {
      issues.push({
        type: 'duplicate_info',
        category,
        message: `You have 2 paid subscriptions in the "${category}" category.`,
        severity: 'low',
        details: subs.map((s) => s.name),
        deduction: 2,
        issueLabel: 'Tool Overlap Alert',
      });
      recommendations.push({
        type: 'duplicate_info',
        category,
        message: `Review "${category}" subscriptions (${listNames}) to make sure you need both active tools.`,
      });
    }
  });

  // 4. MONTHLY SPENDING THRESHOLDS
  const totalMonthlySpend = data.reduce((sum, s) => sum + getMonthlyCost(s), 0);
  if (totalMonthlySpend > 10000) {
    issues.push({
      type: 'spend_critical',
      message: `Your total monthly spend of ₹${totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} exceeds the informational budget limit of ₹10,000.`,
      severity: 'high',
      deduction: 10,
      issueLabel: 'Spend Budget Warning',
    });
    recommendations.push({
      type: 'spend_critical',
      message: `Review high-cost recurring subscriptions to reduce your monthly spend below ₹10,000.`,
    });
  } else if (totalMonthlySpend > 5000) {
    issues.push({
      type: 'spend_warning',
      message: `Your total monthly spend of ₹${totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} exceeds the informational budget limit of ₹5,000.`,
      severity: 'medium',
      deduction: 5,
      issueLabel: 'Spend Budget Warning',
    });
    recommendations.push({
      type: 'spend_warning',
      message: `Audit non-essential categories to adjust your recurring spend below ₹5,000.`,
    });
  }

  // Calculate final score based on all deductions
  let totalDeductions = 0;
  issues.forEach((issue) => {
    totalDeductions += issue.deduction;
  });

  const finalScore = Math.max(0, Math.min(MAX_SCORE - totalDeductions, MAX_SCORE));

  const label =
    finalScore >= 85 ? 'Excellent' :
    finalScore >= 70 ? 'Good' :
    finalScore >= 50 ? 'Fair' :
    'Poor';

  // Group deductions for frontend display (only include categories with > 0 deduction points)
  const deductionsSummary = {};
  issues.forEach((issue) => {
    if (issue.deduction > 0) {
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
    total_monthly_spend: parseFloat(totalMonthlySpend.toFixed(2)),
    issues,
    recommendations,
    deductions,
  };
}

export async function getHealthScore() {
  const result = await calculateFullHealthScore();
  return {
    score: result.score,
    label: result.label,
    total_subscriptions: result.total_subscriptions,
  };
}

export async function getHealthBreakdown() {
  const result = await calculateFullHealthScore();
  return result;
}
