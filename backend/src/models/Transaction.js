const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: {
    type: String,
    enum: ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education',
      'emi', 'insurance', 'investment', 'salary', 'freelance', 'rent', 'travel', 'groceries',
      'fuel', 'dining', 'subscription', 'transfer', 'other'],
    default: 'other'
  },
  subCategory: { type: String },
  description: { type: String, required: true },
  merchant: {
    name: String,
    category: String,
    location: String
  },
  accountId: { type: String },
  bankName: { type: String },
  balanceAfter: { type: Number },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'completed' },
  tags: [String],
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  riskScore: { type: Number, default: 0 },
  isAnomaly: { type: Boolean, default: false },
  anomalyReason: { type: String },
  transactionDate: { type: Date, default: Date.now },
  processedAt: { type: Date },
  metadata: {
    ip: String,
    deviceId: String,
    channel: { type: String, enum: ['mobile', 'web', 'atm', 'pos', 'netbanking', 'upi', 'neft', 'rtgs', 'imps'] }
  }
}, { timestamps: true });

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
