const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');

// @route GET /api/transactions
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, search, startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) query.description = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/transactions
router.post('/', protect, async (req, res) => {
  try {
    const { type, amount, category, description, merchant } = req.body;
    if (!type || !amount || !description) return res.status(400).json({ message: 'type, amount and description required' });

    const riskScore = amount > 50000 ? 75 : amount > 20000 ? 40 : 10;
    const tx = new Transaction({
      transactionId: uuidv4(),
      userId: req.user._id,
      type, amount, category: category || 'other', description,
      merchant, riskScore,
      isAnomaly: riskScore > 60,
      transactionDate: new Date(),
      status: 'completed'
    });
    await tx.save();

    if (riskScore > 60) {
      await new Alert({
        alertId: uuidv4(), userId: req.user._id, type: 'large_transaction',
        severity: 'warning', title: '⚠️ Large Transaction Detected',
        message: `A transaction of ₹${amount.toLocaleString('en-IN')} was flagged for review.`,
        relatedEntityId: tx.transactionId, relatedEntityType: 'transaction'
      }).save();
    }

    res.status(201).json(tx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/transactions/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthly, categoryBreakdown, weeklyTrend] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, transactionDate: { $gte: firstDay } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'debit', transactionDate: { $gte: firstDay } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: req.user._id,
            transactionDate: { $gte: new Date(Date.now() - 7 * 86400000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
            debit: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
            credit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const income = monthly.find(m => m._id === 'credit')?.total || 0;
    const expenses = monthly.find(m => m._id === 'debit')?.total || 0;

    res.json({ income, expenses, savings: income - expenses, categoryBreakdown, weeklyTrend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
