const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Alert = require('../models/Alert');
const { generateToken } = require('../middleware/auth');
const { generateMockTransactions, generateMockBankAccounts, generateMockLoans } = require('../services/bankingService');
const { simulateCibilScore } = require('../services/aiService');

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, monthlyIncome, employmentType } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const userId = `USR${Date.now().toString().slice(-8)}`;
    const user = new User({ userId, name, email, password, phone, monthlyIncome: monthlyIncome || 50000, employmentType: employmentType || 'salaried' });

    // Simulate Open Banking link
    user.bankAccounts = generateMockBankAccounts(user._id);
    user.cibilScore = {
      score: Math.floor(650 + Math.random() * 200),
      lastUpdated: new Date(),
      history: [{ score: 720, date: new Date(Date.now() - 90 * 86400000), remarks: 'Initial assessment' }]
    };

    await user.save();

    // Generate mock financial data
    const mockTransactions = generateMockTransactions(user._id, 60);
    const mockLoans = generateMockLoans(user._id, monthlyIncome || 50000);
    await Transaction.insertMany(mockTransactions);
    for (const loan of mockLoans) await new Loan(loan).save();

    // Update CIBIL
    const allLoans = await Loan.find({ userId: user._id });
    const allTx = await Transaction.find({ userId: user._id });
    user.cibilScore.score = simulateCibilScore(user, allLoans, allTx);
    await user.save();

    // Welcome alert
    await new Alert({
      alertId: uuidv4(), userId: user._id, type: 'income_credited',
      severity: 'info', title: '🎉 Welcome to FinGuard!',
      message: `Your account has been set up successfully. Bank account linked and financial data imported.`,
      actionRequired: false
    }).save();

    const token = generateToken(user._id);
    res.status(201).json({ token, user, message: 'Account created and bank linked successfully' });
  } catch (error) {
    console.error('Register error details:', error.stack);
    res.status(500).json({ message: 'Server error during registration', error: error.message, stack: error.stack });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({ token, user, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
