const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Loan = require('../models/Loan');
const Alert = require('../models/Alert');

// @route GET /api/loans
router.get('/', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const totalOutstanding = loans.filter(l => l.status === 'active').reduce((s, l) => s + l.outstandingAmount, 0);
    const totalEMI = loans.filter(l => l.status === 'active').reduce((s, l) => s + l.emiAmount, 0);
    res.json({ loans, totalOutstanding, totalEMI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/loans
router.post('/', protect, async (req, res) => {
  try {
    const { loanType, lenderName, principalAmount, interestRate, tenureMonths, startDate } = req.body;
    if (!loanType || !lenderName || !principalAmount || !interestRate || !tenureMonths)
      return res.status(400).json({ message: 'All loan fields are required' });

    const monthlyRate = interestRate / 1200;
    const emiAmount = Math.round((principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenureMonths)));

    const nextEmi = new Date();
    nextEmi.setDate(5);
    if (nextEmi <= new Date()) nextEmi.setMonth(nextEmi.getMonth() + 1);

    const dtiRatio = (emiAmount / (req.user.monthlyIncome || 50000)) * 100;

    const loan = new Loan({
      loanId: uuidv4(), userId: req.user._id, loanType, lenderName,
      principalAmount, outstandingAmount: principalAmount, interestRate,
      tenureMonths, emiAmount, totalEmis: tenureMonths, paidEmis: 0, missedEmis: 0,
      startDate: startDate || new Date(), nextEmiDate: nextEmi, status: 'active',
      riskLevel: dtiRatio > 40 ? 'high' : dtiRatio > 25 ? 'medium' : 'low'
    });
    await loan.save();

    if (dtiRatio > 40) {
      await new Alert({
        alertId: uuidv4(), userId: req.user._id, type: 'emi_due',
        severity: 'warning', title: '⚠️ High EMI Burden',
        message: `New ${loanType} loan EMI of ₹${emiAmount.toLocaleString('en-IN')} added. Total EMI burden may exceed safe limits.`,
        actionRequired: true, actionText: 'View Loan Summary'
      }).save();
    }

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/loans/:id/pay-emi
router.put('/:id/pay-emi', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ loanId: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    loan.paidEmis += 1;
    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - (loan.emiAmount * 0.7));
    loan.emiHistory.push({ month: new Date(), amountPaid: loan.emiAmount, dueAmount: loan.emiAmount, paidOn: new Date(), status: 'paid' });

    const nextEmi = new Date(loan.nextEmiDate);
    nextEmi.setMonth(nextEmi.getMonth() + 1);
    loan.nextEmiDate = nextEmi;

    if (loan.paidEmis >= loan.totalEmis) loan.status = 'closed';
    await loan.save();

    res.json({ message: 'EMI paid successfully', loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/loans/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Loan.findOneAndDelete({ loanId: req.params.id, userId: req.user._id });
    res.json({ message: 'Loan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
