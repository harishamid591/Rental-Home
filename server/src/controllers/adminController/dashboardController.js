import Joi from "joi";
import { getMonthlyAggregates } from "../../helpers/dashboardHelper.js";

const yearlySchema = Joi.object({
  year: Joi.number().integer().min(2000).optional(),
});

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { summary } = await getMonthlyAggregates(month, year);

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getYearlyFinancials = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Map each month to a promise calling getMonthlyAggregates
    const monthPromises = months.map((month) =>
      getMonthlyAggregates(month, year).then(({ totals }) => ({
        month,
        totalRent: totals.income,
        totalExpenses: totals.ownerRent + totals.electricity + totals.maintenance + (totals.other || 0),
        totalProfit: totals.profit,
      }))
    );

    // Wait for all months in parallel
    const yearlyData = await Promise.all(monthPromises);

    return res.json(yearlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
