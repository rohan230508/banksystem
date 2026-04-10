/**
 * Open Banking API Simulation Service
 * Simulates fetching account/transaction data from bank APIs
 */

const { v4: uuidv4 } = require('uuid');

const MOCK_BANKS = [
  { id: 'sbi', name: 'State Bank of India', logo: '🏦' },
  { id: 'hdfc', name: 'HDFC Bank', logo: '🏛️' },
  { id: 'icici', name: 'ICICI Bank', logo: '💼' },
  { id: 'axis', name: 'Axis Bank', logo: '🔵' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '🟠' },
];

const TRANSACTION_TEMPLATES = [
  { description: 'Swiggy Order', category: 'dining', type: 'debit', amountRange: [150, 800] },
  { description: 'Zomato Order', category: 'dining', type: 'debit', amountRange: [200, 1000] },
  { description: 'Amazon Shopping', category: 'shopping', type: 'debit', amountRange: [500, 5000] },
  { description: 'Flipkart Purchase', category: 'shopping', type: 'debit', amountRange: [300, 8000] },
  { description: 'Petrol Fill - HPCL', category: 'fuel', type: 'debit', amountRange: [500, 3000] },
  { description: 'BigBasket Groceries', category: 'groceries', type: 'debit', amountRange: [800, 3000] },
  { description: 'Netflix Subscription', category: 'subscription', type: 'debit', amountRange: [649, 649] },
  { description: 'Jio Recharge', category: 'utilities', type: 'debit', amountRange: [239, 999] },
  { description: 'Electricity Bill', category: 'utilities', type: 'debit', amountRange: [800, 4000] },
  { description: 'Salary Credit', category: 'salary', type: 'credit', amountRange: [30000, 120000] },
  { description: 'Uber Cab', category: 'transport', type: 'debit', amountRange: [100, 600] },
  { description: 'PhonePe Transfer', category: 'transfer', type: 'debit', amountRange: [500, 10000] },
  { description: 'ATM Withdrawal', category: 'other', type: 'debit', amountRange: [2000, 10000] },
  { description: 'Medical Consultation', category: 'healthcare', type: 'debit', amountRange: [500, 2000] },
  { description: 'Restaurant Dinner', category: 'dining', type: 'debit', amountRange: [1000, 5000] },
  { description: 'Movie Tickets - BookMyShow', category: 'entertainment', type: 'debit', amountRange: [300, 1200] },
  { description: 'Instamart Groceries', category: 'groceries', type: 'debit', amountRange: [400, 1500] },
  { description: 'Freelance Payment Received', category: 'freelance', type: 'credit', amountRange: [5000, 30000] },
];

const getRandomAmount = (range) => Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

const getRandomDate = (daysBack) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
};

const generateMockTransactions = (userId, count = 60) => {
  const transactions = [];
  const channels = ['upi', 'netbanking', 'pos', 'mobile'];

  for (let i = 0; i < count; i++) {
    const template = TRANSACTION_TEMPLATES[Math.floor(Math.random() * TRANSACTION_TEMPLATES.length)];
    const amount = getRandomAmount(template.amountRange);
    const date = getRandomDate(90);

    transactions.push({
      transactionId: uuidv4(),
      userId,
      type: template.type,
      amount,
      currency: 'INR',
      category: template.category,
      description: template.description,
      merchant: { name: template.description.split(' ')[0], category: template.category },
      status: 'completed',
      transactionDate: date,
      processedAt: date,
      metadata: { channel: channels[Math.floor(Math.random() * channels.length)] },
      riskScore: Math.random() < 0.1 ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
      isAnomaly: false
    });
  }

  return transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
};

const generateMockBankAccounts = (userId) => {
  const bank = MOCK_BANKS[Math.floor(Math.random() * MOCK_BANKS.length)];
  return [{
    accountId: uuidv4(),
    bankName: bank.name,
    accountNumber: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
    accountType: 'savings',
    balance: Math.floor(10000 + Math.random() * 200000),
    isLinked: true,
    linkedAt: new Date()
  }];
};

const generateMockLoans = (userId, monthlyIncome) => {
  const loans = [];
  const loanTypes = [
    { type: 'personal', rate: 14, amount: monthlyIncome * 6 },
    { type: 'home', rate: 8.5, amount: monthlyIncome * 100 },
    { type: 'car', rate: 10.5, amount: monthlyIncome * 20 },
  ];

  const numLoans = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numLoans; i++) {
    const lt = loanTypes[i];
    const tenure = lt.type === 'home' ? 240 : lt.type === 'car' ? 60 : 36;
    const emi = Math.round((lt.amount * lt.rate / 1200) / (1 - Math.pow(1 + lt.rate / 1200, -tenure)));
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12));
    const nextEmi = new Date();
    nextEmi.setDate(5);
    if (nextEmi < new Date()) nextEmi.setMonth(nextEmi.getMonth() + 1);

    loans.push({
      loanId: uuidv4(),
      userId,
      loanType: lt.type,
      lenderName: MOCK_BANKS[Math.floor(Math.random() * MOCK_BANKS.length)].name,
      principalAmount: lt.amount,
      outstandingAmount: Math.round(lt.amount * 0.85),
      interestRate: lt.rate,
      tenureMonths: tenure,
      emiAmount: emi,
      emiDueDate: 5,
      startDate,
      totalEmis: tenure,
      paidEmis: Math.floor(Math.random() * 12),
      missedEmis: Math.random() < 0.2 ? 1 : 0,
      status: 'active',
      nextEmiDate: nextEmi
    });
  }
  return loans;
};

const getAvailableBanks = () => MOCK_BANKS;

module.exports = { generateMockTransactions, generateMockBankAccounts, generateMockLoans, getAvailableBanks };
