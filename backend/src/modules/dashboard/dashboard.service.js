import * as dashboardRepo from './dashboard.repository.js';

/**
 * Dashboard Service
 */

export async function getDashboardStats() {
  const [summary, monthlySpend, spendByCategory] = await Promise.all([
    dashboardRepo.getSummaryStats(),
    dashboardRepo.getTotalMonthlySpend(),
    dashboardRepo.getSpendingByCategory(),
  ]);

  return {
    summary: {
      ...summary,
      total_monthly_spend: monthlySpend,
      total_annual_spend: +(monthlySpend * 12).toFixed(2),
    },
    spending_by_category: spendByCategory,
  };
}

export async function getSpendingTrends() {
  // TODO: implement month-over-month trend data
  return { message: 'Spending trends — coming soon' };
}
