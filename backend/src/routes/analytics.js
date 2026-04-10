const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Alert = require('../models/Alert');
const User = require('../models/User');
const {
  calculateRiskScore,
  generateRecommendations,
  generateSavingsPlan,
  predictEMIRisk,
  analyzeSpendingPatterns,
  simulateCibilScore
} = require('../services/aiService');

// @route GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [transactions, loans, alerts] = await Promise.all([
      Transaction.find({ userId: req.user._id }).sort({ transactionDate: -1 }).limit(100),
      Loan.find({ userId: req.user._id }),
      Alert.find({ userId: req.user._id, isRead: false }).sort({ createdAt: -1 }).limit(10)
    ]);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTx = transactions.filter(tx => new Date(tx.transactionDate) >= firstDay);

    const monthlyIncome = monthlyTx.filter(tx => tx.type === 'credit').reduce((s, tx) => s + tx.amount, 0);
    const monthlyExpenses = monthlyTx.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);
    const totalBalance = req.user.bankAccounts?.reduce((s, acc) => s + (acc.balance || 0), 0) || 0;
    const activeLoans = loans.filter(l => l.status === 'active');
    const totalEMI = activeLoans.reduce((s, l) => s + l.emiAmount, 0);
    const totalOutstanding = activeLoans.reduce((s, l) => s + l.outstandingAmount, 0);

    const { riskScore, riskLevel, warnings, dtiRatio } = calculateRiskScore(req.user, transactions, loans);
    const { categoryTotals, topCategories } = analyzeSpendingPatterns(transactions.slice(0, 30));
    const emiRisks = predictEMIRisk(loans, req.user.monthlyIncome || 50000);

    const cibilScore = simulateCibilScore(req.user, loans, transactions);
    if (cibilScore !== req.user.cibilScore?.score) {
      await User.findByIdAndUpdate(req.user._id, {
        'cibilScore.score': cibilScore,
        'cibilScore.lastUpdated': new Date(),
        'financialHealth.riskLevel': riskLevel,
        'financialHealth.healthScore': 100 - riskScore,
        'financialHealth.debtToIncomeRatio': dtiRatio
      });
    }

    res.json({
      overview: {
        totalBalance, monthlyIncome: req.user.monthlyIncome || monthlyIncome,
        monthlyExpenses, monthlySavings: (req.user.monthlyIncome || monthlyIncome) - monthlyExpenses,
        totalOutstanding, totalEMI, cibilScore, riskLevel, riskScore,
        healthScore: 100 - riskScore, dtiRatio
      },
      topCategories,
      categoryTotals,
      recentTransactions: transactions.slice(0, 8),
      activeLoans,
      alerts,
      warnings,
      emiRisks
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/analytics/recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    const [transactions, loans] = await Promise.all([
      Transaction.find({ userId: req.user._id }).sort({ transactionDate: -1 }).limit(90),
      Loan.find({ userId: req.user._id, status: 'active' })
    ]);
    const recommendations = generateRecommendations(req.user, transactions, loans, null);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/analytics/savings-plan
router.get('/savings-plan', protect, async (req, res) => {
  try {
    const [transactions, loans] = await Promise.all([
      Transaction.find({ userId: req.user._id, type: 'debit', transactionDate: { $gte: new Date(Date.now() - 30 * 86400000) } }),
      Loan.find({ userId: req.user._id, status: 'active' })
    ]);
    const monthlyExpenses = transactions.reduce((s, tx) => s + tx.amount, 0);
    const plan = generateSavingsPlan(req.user.monthlyIncome || 50000, monthlyExpenses, loans);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/analytics/monthly-trend
router.get('/monthly-trend', protect, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trend = await Transaction.aggregate([
      { $match: { userId: req.user._id, transactionDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ trend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/analytics/cibil
router.get('/cibil', protect, async (req, res) => {
  try {
    const [transactions, loans] = await Promise.all([
      Transaction.find({ userId: req.user._id }).limit(50),
      Loan.find({ userId: req.user._id })
    ]);
    const score = simulateCibilScore(req.user, loans, transactions);
    const factors = [
      { name: 'Payment History', weight: 35, status: loans.some(l => l.missedEmis > 0) ? 'poor' : 'excellent', impact: loans.some(l => l.missedEmis > 0) ? -20 : +15 },
      { name: 'Credit Utilization', weight: 30, status: 'good', impact: +10 },
      { name: 'Credit Mix', weight: 10, status: loans.length > 1 ? 'good' : 'fair', impact: loans.length > 1 ? +5 : 0 },
      { name: 'New Credit Inquiries', weight: 10, status: 'excellent', impact: +5 },
      { name: 'Length of Credit History', weight: 15, status: 'fair', impact: +5 }
    ];
    const history = req.user.cibilScore?.history || [];
    res.json({ score, factors, history, lastUpdated: new Date(), grade: score >= 750 ? 'A' : score >= 700 ? 'B' : score >= 650 ? 'C' : 'D' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
