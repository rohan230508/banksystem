const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  panCard: { type: String },
  aadharNumber: { type: String },
  dateOfBirth: { type: Date },
  monthlyIncome: { type: Number, default: 0 },
  employmentType: { type: String, enum: ['salaried', 'self-employed', 'business', 'unemployed'], default: 'salaried' },
  bankAccounts: [{
    accountId: String,
    bankName: String,
    accountNumber: String,
    accountType: { type: String, enum: ['savings', 'current', 'salary'] },
    balance: { type: Number, default: 0 },
    isLinked: { type: Boolean, default: false },
    linkedAt: Date
  }],
  creditCards: [{
    cardId: String,
    bankName: String,
    cardNumber: String,
    creditLimit: Number,
    usedLimit: Number,
    dueDate: Date,
    minimumDue: Number
  }],
  cibilScore: {
    score: { type: Number, default: 0 },
    lastUpdated: Date,
    history: [{
      score: Number,
      date: Date,
      remarks: String
    }]
  },
  financialHealth: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    healthScore: { type: Number, default: 100 },
    debtToIncomeRatio: { type: Number, default: 0 },
    savingsRate: { type: Number, default: 0 }
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tokens: [{
    token: String,
    issuedAt: Date,
    expiresAt: Date
  }]
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);
