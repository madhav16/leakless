import * as dashboardRepo from './dashboard.repository.js';

/**
 * Dashboard Service
 */

export async function getDashboardStats() {
  const [summary, monthlySpend, annualSpend, spendByCategory, topCostDrivers] = await Promise.all([
    dashboardRepo.getSummaryStats(),
    dashboardRepo.getTotalMonthlySpend(),
    dashboardRepo.getTotalAnnualSpend(),
    dashboardRepo.getSpendingByCategory(),
    dashboardRepo.getTopCostDrivers(),
  ]);
  return {
    summary: {
      ...summary,
      total_monthly_spend: monthlySpend,
      total_annual_spend: +(annualSpend.toFixed(2)),
    },
    spending_by_category: spendByCategory,
    top_cost_drivers: topCostDrivers,
  };
}

export async function getSpendingTrends() {
  // TODO: implement month-over-month trend data
  return { message: 'Spending trends — coming soon' };
}
