/**
 * AI Financial Analysis Service
 * Simulates AI/ML predictions for financial risk, recommendations,
 * spending analysis, and credit assessment.
 */

const analyzeSpendingPatterns = (transactions) => {
  const categoryTotals = {};
  const monthlyTotals = {};

  transactions.forEach(tx => {
    if (tx.type === 'debit') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      const month = new Date(tx.transactionDate).toISOString().slice(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
    }
  });

  const categories = Object.entries(categoryTotals).map(([name, amount]) => ({ name, amount }));
  categories.sort((a, b) => b.amount - a.amount);

  return { categoryTotals, monthlyTotals, topCategories: categories.slice(0, 5) };
};

const calculateRiskScore = (user, transactions, loans) => {
  let riskScore = 0;
  const warnings = [];

  // Debt-to-income ratio
  const monthlyIncome = user.monthlyIncome || 1;
  const totalEMI = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.emiAmount, 0);
  const dtiRatio = (totalEMI / monthlyIncome) * 100;

  if (dtiRatio > 50) { riskScore += 40; warnings.push({ type: 'HIGH_DTI', message: `EMI burden is ${dtiRatio.toFixed(1)}% of income — critically high`, severity: 'critical' }); }
  else if (dtiRatio > 35) { riskScore += 25; warnings.push({ type: 'MEDIUM_DTI', message: `EMI burden is ${dtiRatio.toFixed(1)}% of income — above recommended 35%`, severity: 'warning' }); }

  // CIBIL check
  const cibil = user.cibilScore?.score || 750;
  if (cibil < 600) { riskScore += 30; warnings.push({ type: 'LOW_CIBIL', message: `CIBIL score ${cibil} is critically low`, severity: 'critical' }); }
  else if (cibil < 700) { riskScore += 15; warnings.push({ type: 'MEDIUM_CIBIL', message: `CIBIL score ${cibil} needs improvement`, severity: 'warning' }); }

  // Missed EMIs
  const totalMissed = loans.reduce((sum, l) => sum + (l.missedEmis || 0), 0);
  if (totalMissed > 3) { riskScore += 25; warnings.push({ type: 'MISSED_EMI', message: `${totalMissed} missed EMIs detected — high default risk`, severity: 'critical' }); }
  else if (totalMissed > 0) { riskScore += 10; warnings.push({ type: 'SOME_MISSED_EMI', message: `${totalMissed} missed EMI(s) detected`, severity: 'warning' }); }

  // Spending anomaly
  const last30Days = transactions.filter(tx => {
    const date = new Date(tx.transactionDate);
    return (Date.now() - date) < 30 * 24 * 60 * 60 * 1000 && tx.type === 'debit';
  });
  const monthSpend = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
  if (monthSpend > monthlyIncome * 0.9) {
    riskScore += 20;
    warnings.push({ type: 'OVERSPENDING', message: `Spending ₹${monthSpend.toLocaleString('en-IN')} is ${((monthSpend / monthlyIncome) * 100).toFixed(0)}% of income`, severity: 'critical' });
  }

  const level = riskScore >= 60 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : 'low';
  return { riskScore: Math.min(riskScore, 100), riskLevel: level, warnings, dtiRatio: dtiRatio.toFixed(2) };
};

const generateRecommendations = (user, transactions, loans, budget) => {
  const recommendations = [];
  const monthlyIncome = user.monthlyIncome || 1;

  // Spending recommendations
  const { categoryTotals } = analyzeSpendingPatterns(transactions);
  const diningSpend = categoryTotals['dining'] || 0;
  const shoppingSpend = categoryTotals['shopping'] || 0;
  const entertainmentSpend = categoryTotals['entertainment'] || 0;

  if (diningSpend > monthlyIncome * 0.15)
    recommendations.push({ type: 'reduce_spending', priority: 'high', title: 'Reduce Dining Expenses', description: `You're spending ₹${diningSpend.toLocaleString('en-IN')} on dining. Try cooking at home to save 40-50%.`, potentialSavings: diningSpend * 0.4, icon: '🍽️' });

  if (shoppingSpend > monthlyIncome * 0.2)
    recommendations.push({ type: 'reduce_spending', priority: 'medium', title: 'Curb Impulse Shopping', description: `Shopping at ₹${shoppingSpend.toLocaleString('en-IN')} is high. Use a 24-hour rule before non-essential purchases.`, potentialSavings: shoppingSpend * 0.3, icon: '🛍️' });

  // Loan restructuring
  const highInterestLoans = loans.filter(l => l.interestRate > 15 && l.status === 'active');
  if (highInterestLoans.length > 0)
    highInterestLoans.forEach(loan => {
      recommendations.push({ type: 'loan_restructure', priority: 'high', title: `Refinance ${loan.loanType} Loan`, description: `Your ${loan.loanType} loan has ${loan.interestRate}% interest. Refinancing could save ₹${Math.round(loan.outstandingAmount * 0.03).toLocaleString('en-IN')}+ per year.`, potentialSavings: loan.outstandingAmount * 0.03 / 12, icon: '🏦' });
    });

  // Savings plan
  const totalEMI = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.emiAmount, 0);
  const totalMonthlySpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const surplus = monthlyIncome - totalEMI - totalMonthlySpend;
  if (surplus > 5000)
    recommendations.push({ type: 'investment', priority: 'high', title: 'Invest Your Surplus', description: `You have ₹${surplus.toLocaleString('en-IN')} monthly surplus. Consider SIP in mutual funds for long-term wealth creation.`, potentialSavings: surplus * 12, icon: '📈' });

  // CIBIL improvement
  const cibil = user.cibilScore?.score || 750;
  if (cibil < 720)
    recommendations.push({ type: 'credit_improvement', priority: 'medium', title: 'Improve CIBIL Score', description: `Your score of ${cibil} can be improved by paying EMIs on time, reducing credit utilization below 30%, and avoiding multiple loan applications.`, potentialSavings: 0, icon: '⭐' });

  return recommendations.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
};

const generateSavingsPlan = (monthlyIncome, expenses, loans) => {
  const totalEMI = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.emiAmount, 0);

  // Investable Surplus = income minus ALL outflows (expenses + EMI)
  const totalOutflow = expenses + totalEMI;
  const availableForSavings = monthlyIncome - totalOutflow;

  // Savings Rate as % of actual monthly income (standard financial metric)
  // Also track vs ₹10,000 baseline — the minimum meaningful monthly saving threshold
  const savingsRate = monthlyIncome > 0 ? (Math.max(0, availableForSavings) / monthlyIncome) * 100 : 0;
  const baselineSurplusVs10k = availableForSavings - 10000; // +ve = above baseline, -ve = below

  const plan = {
    monthlyIncome,
    totalExpenses: expenses,
    totalEMI,
    totalOutflow,
    availableForSavings: Math.max(0, availableForSavings),
    savingsRate: Math.max(0, savingsRate),
    baselineSurplusVs10k, // how far above/below the ₹10k baseline
    recommendations: []
  };

  if (availableForSavings > 0) {
    plan.recommendations.push({ category: 'Emergency Fund', allocation: availableForSavings * 0.3, description: '3-6 months expenses as safety net', instrument: 'Liquid Mutual Fund / FD' });
    plan.recommendations.push({ category: 'SIP Investment', allocation: availableForSavings * 0.4, description: 'Long-term wealth creation via equity SIP', instrument: 'Equity Mutual Funds' });
    plan.recommendations.push({ category: 'Short-term Goals', allocation: availableForSavings * 0.2, description: 'Vacation, gadgets, or other goals', instrument: 'Recurring Deposit / ELSS' });
    plan.recommendations.push({ category: 'Insurance Premium', allocation: availableForSavings * 0.1, description: 'Life + health cover for protection', instrument: 'Term Insurance / Health Insurance' });
  }

  return plan;
};

const predictEMIRisk = (loans, monthlyIncome) => {
  const risks = [];
  const now = new Date();

  loans.filter(l => l.status === 'active').forEach(loan => {
    const nextEmi = new Date(loan.nextEmiDate);
    const daysUntilDue = Math.ceil((nextEmi - now) / (1000 * 60 * 60 * 24));
    const emiToIncomeRatio = (loan.emiAmount / monthlyIncome) * 100;

    if (daysUntilDue <= 5 && daysUntilDue >= 0)
      risks.push({ loanId: loan.loanId, loanType: loan.loanType, daysUntilDue, emiAmount: loan.emiAmount, severity: 'critical', message: `${loan.loanType} EMI of ₹${loan.emiAmount.toLocaleString('en-IN')} due in ${daysUntilDue} day(s)` });

    if (emiToIncomeRatio > 20)
      risks.push({ loanId: loan.loanId, loanType: loan.loanType, emiToIncomeRatio, emiAmount: loan.emiAmount, severity: 'warning', message: `${loan.loanType} EMI takes ${emiToIncomeRatio.toFixed(1)}% of your income` });

    if (loan.missedEmis > 0)
      risks.push({ loanId: loan.loanId, loanType: loan.loanType, missedEmis: loan.missedEmis, severity: 'critical', message: `${loan.loanType} has ${loan.missedEmis} missed EMI(s) — risk of NPA` });
  });

  return risks;
};

const simulateCibilScore = (user, loans, transactions) => {
  let score = 750;
  const totalMissed = loans.reduce((s, l) => s + (l.missedEmis || 0), 0);
  score -= totalMissed * 20;
  const activeLoanCount = loans.filter(l => l.status === 'active').length;
  if (activeLoanCount > 4) score -= 30;
  const recentMonthSpend = transactions.filter(tx => {
    return tx.type === 'debit' && (Date.now() - new Date(tx.transactionDate)) < 30 * 86400000;
  }).reduce((s, tx) => s + tx.amount, 0);
  if (recentMonthSpend > (user.monthlyIncome || 50000) * 0.9) score -= 20;
  return Math.min(900, Math.max(300, score));
};

module.exports = {
  analyzeSpendingPatterns,
  calculateRiskScore,
  generateRecommendations,
  generateSavingsPlan,
  predictEMIRisk,
  simulateCibilScore
};
