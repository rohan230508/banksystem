const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'overspending', 'emi_due', 'emi_missed', 'low_balance', 'high_risk_transaction',
      'credit_limit_breach', 'cibil_drop', 'anomaly_detected', 'debt_trap_warning',
      'savings_goal', 'investment_opportunity', 'budget_exceeded', 'income_credited',
      'large_transaction', 'unusual_activity'
    ],
    required: true
  },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionRequired: { type: Boolean, default: false },
  actionText: { type: String },
  relatedEntityId: { type: String },
  relatedEntityType: { type: String, enum: ['transaction', 'loan', 'account', 'goal'] },
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  readAt: { type: Date },
  expiresAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

alertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
