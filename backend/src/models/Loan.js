const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanType: {
    type: String,
    enum: ['home', 'personal', 'car', 'education', 'business', 'gold', 'credit_card', 'other'],
    required: true
  },
  lenderName: { type: String, required: true },
  principalAmount: { type: Number, required: true },
  outstandingAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  emiAmount: { type: Number, required: true },
  emiDueDate: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'closed', 'defaulted', 'restructured', 'npa'],
    default: 'active'
  },
  missedEmis: { type: Number, default: 0 },
  paidEmis: { type: Number, default: 0 },
  totalEmis: { type: Number },
  prepaymentPenalty: { type: Number, default: 0 },
  insuranceCovered: { type: Boolean, default: false },
  collateral: { type: String },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  nextEmiDate: { type: Date },
  emiHistory: [{
    month: Date,
    amountPaid: Number,
    dueAmount: Number,
    paidOn: Date,
    status: { type: String, enum: ['paid', 'missed', 'partial', 'upcoming'] },
    penaltyCharged: Number
  }],
  notes: { type: String }
}, { timestamps: true });

loanSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Loan', loanSchema);
