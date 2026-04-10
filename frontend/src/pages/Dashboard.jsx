import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Header from '../components/Header';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Wallet, CreditCard, ShieldCheck, Zap, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#ec4899'];

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const getRiskColor = (level) => ({ low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }[level] || '#10b981');

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading your financial data...</p>
    </div>
  );

  const { overview, topCategories, recentTransactions, activeLoans, alerts, warnings, emiRisks } = data || {};

  return (
    <>
      <Header title="Dashboard" subtitle={`Welcome back! Here's your financial overview — ${format(new Date(), 'MMMM yyyy')}`} />
      <div className="page-content fade-in">

        {/* Critical Warnings */}
        {warnings?.filter(w => w.severity === 'critical').length > 0 && (
          <div style={{ marginBottom: '24px', padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: '700', color: '#ef4444', fontSize: '14px' }}>⚠️ {warnings.filter(w => w.severity === 'critical').length} Critical Alert(s)</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px', marginLeft: '8px' }}>{warnings.filter(w => w.severity === 'critical')[0]?.message}</span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => navigate('/alerts')}>View All</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-4 gap-4 mb-6">
          <div className="stat-card success">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}><Wallet size={22} style={{ color: '#10b981' }} /></div>
            <div className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(overview?.totalBalance)}</div>
            <div className="stat-label">Total Bank Balance</div>
            <div className="stat-change up"><ArrowUpRight size={12} /> Available funds</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}><TrendingUp size={22} style={{ color: 'var(--accent-primary)' }} /></div>
            <div className="stat-value">{formatCurrency(overview?.monthlyIncome)}</div>
            <div className="stat-label">Monthly Income</div>
            <div className="stat-change up"><TrendingUp size={12} /> This month</div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}><TrendingDown size={22} style={{ color: '#ef4444' }} /></div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(overview?.monthlyExpenses)}</div>
            <div className="stat-label">Monthly Expenses</div>
            <div className="stat-change down">
              {overview?.monthlyIncome > 0 ? `${((overview.monthlyExpenses / overview.monthlyIncome) * 100).toFixed(0)}% of income` : 'This month'}
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}><CreditCard size={22} style={{ color: '#f59e0b' }} /></div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(overview?.totalEMI)}</div>
            <div className="stat-label">YEARLY EMI Burden</div>
            <div className="stat-change" style={{ color: '#f59e0b' }}>{overview?.dtiRatio}% DTI ratio</div>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '20px', marginBottom: '24px' }}>

          {/* Spending Breakdown */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div><div className="section-title">Spending Breakdown</div><div className="section-subtitle">This month by category</div></div>
            </div>
            {topCategories?.length > 0 ? (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={topCategories} dataKey="amount" nameKey="_id" cx="50%" cy="50%" outerRadius={65} innerRadius={35} strokeWidth={0}>
                      {topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {topCategories.slice(0, 5).map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i] }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{cat._id}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No spending data</p>}
          </div>

          {/* Recent Transactions */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div><div className="section-title">Recent Transactions</div><div className="section-subtitle">Latest activity</div></div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/transactions')}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions?.slice(0, 5).map((tx, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                      {tx.type === 'credit' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.category} · {format(new Date(tx.transactionDate), 'dd MMM')}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Score + CIBIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Health Score */}
            <div className="glass-card p-6" style={{ flex: 1 }}>
              <div className="section-title mb-4">Financial Health</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '52px', fontWeight: '900', color: getRiskColor(overview?.riskLevel), fontFamily: 'Space Grotesk, sans-serif' }}>{overview?.healthScore || 0}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Health Score / 100</div>
                <span className={`badge badge-${overview?.riskLevel === 'low' ? 'success' : overview?.riskLevel === 'medium' ? 'warning' : 'danger'}`} style={{ fontSize: '12px' }}>
                  {overview?.riskLevel?.toUpperCase()} RISK
                </span>
              </div>
              <div className="progress-bar mt-4">
                <div className="progress-fill" style={{ width: `${overview?.healthScore || 0}%`, background: getRiskColor(overview?.riskLevel) }} />
              </div>
            </div>

            {/* CIBIL */}
            <div className="glass-card p-6" style={{ flex: 1 }}>
              <div className="section-title mb-4">CIBIL Score</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: overview?.cibilScore >= 750 ? '#10b981' : overview?.cibilScore >= 650 ? '#f59e0b' : '#ef4444', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {overview?.cibilScore || '---'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>out of 900</div>
                <span className={`badge ${overview?.cibilScore >= 750 ? 'badge-success' : overview?.cibilScore >= 650 ? 'badge-warning' : 'badge-danger'}`}>
                  {overview?.cibilScore >= 750 ? 'Excellent' : overview?.cibilScore >= 700 ? 'Good' : overview?.cibilScore >= 650 ? 'Fair' : 'Poor'}
                </span>
              </div>
              <button className="btn btn-outline btn-sm btn-full mt-4" onClick={() => navigate('/cibil')}>Full Report →</button>
            </div>
          </div>
        </div>

        {/* Active Loans + Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Active Loans */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div><div className="section-title">Active Loans & EMI</div><div className="section-subtitle">Total outstanding: {formatCurrency(overview?.totalOutstanding)}</div></div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/loans')}>Manage</button>
            </div>
            {activeLoans?.length > 0 ? activeLoans.map((loan, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{loan.loanType} Loan</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{loan.lenderName}</span>
                  </div>
                  <span className={`badge badge-${loan.riskLevel === 'low' ? 'success' : loan.riskLevel === 'medium' ? 'warning' : 'danger'}`}>{loan.riskLevel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>EMI: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(loan.emiAmount)}/mo</strong></span>
                  <span>Outstanding: <strong style={{ color: '#f59e0b' }}>{formatCurrency(loan.outstandingAmount)}</strong></span>
                  <span>{loan.interestRate}% p.a.</span>
                </div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${(loan.paidEmis / loan.totalEmis) * 100}%`, background: 'var(--gradient-primary)' }} />
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{loan.paidEmis}/{loan.totalEmis} EMIs paid</div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active loans</p>}
          </div>

          {/* Alerts */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div><div className="section-title">AI Alerts</div><div className="section-subtitle">{alerts?.length || 0} unread notifications</div></div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/alerts')}>View All</button>
            </div>
            {alerts?.length > 0 ? alerts.slice(0, 5).map((alert, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.2)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`, marginBottom: '8px' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{alert.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.message}</div>
                <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'} mt-1`}>{alert.severity}</span>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <p style={{ fontSize: '13px' }}>No critical alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
