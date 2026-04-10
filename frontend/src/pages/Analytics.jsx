import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Header from '../components/Header';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Target, Lightbulb, PiggyBank } from 'lucide-react';

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [trend, setTrend] = useState([]);
  const [recs, setRecs] = useState([]);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getMonthlyTrend(),
      analyticsAPI.getRecommendations(),
      analyticsAPI.getSavingsPlan()
    ]).then(([tRes, rRes, sRes]) => {
      // Process trend data
      const trendMap = {};
      tRes.data.trend.forEach(t => {
        const key = `${MONTHS[t._id.month - 1]} ${t._id.year}`;
        if (!trendMap[key]) trendMap[key] = { month: key, income: 0, expense: 0 };
        if (t._id.type === 'credit') trendMap[key].income = t.total;
        else trendMap[key].expense = t.total;
      });
      setTrend(Object.values(trendMap));
      setRecs(rRes.data.recommendations);
      setSavings(sRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="Analytics" subtitle="Deep financial insights powered by AI analysis" />
      <div className="page-content fade-in">

        {/* Monthly Trend Chart */}
        <div className="glass-card p-6 mb-6">
          <div className="section-header">
            <div><div className="section-title">6-Month Income vs Expenses</div><div className="section-subtitle">Track your cash flow over time</div></div>
          </div>
          {loading ? <div className="skeleton" style={{ height: '250px' }} /> : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trend} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#f1f5f9' }} formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

          {/* Savings Plan */}
          {savings && (
            <div className="glass-card p-6">
              <div className="section-header">
                <div>
                  <div className="section-title">💰 Smart Savings Plan</div>
                  <div className="section-subtitle">AI-generated monthly allocation</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Income', value: savings.monthlyIncome, color: '#10b981' },
                  { label: 'Expenses', value: savings.totalExpenses, color: '#ef4444' },
                  { label: 'EMI', value: savings.totalEMI, color: '#f59e0b' },
                  { label: 'Savings Potential', value: savings.availableForSavings, color: 'var(--accent-primary)' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: item.color }}>{formatCurrency(item.value)}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>Recommended Allocation:</div>
              {savings.recommendations.map((r, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600' }}>{r.category}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{formatCurrency(r.allocation)}/mo</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${savings.availableForSavings > 0 ? (r.allocation / savings.availableForSavings * 100) : 0}%`, background: `hsl(${i * 60 + 200}, 70%, 55%)` }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{r.instrument}</div>
                </div>
              ))}
            </div>
          )}

          {/* AI Recommendations */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div>
                <div className="section-title">🤖 AI Recommendations</div>
                <div className="section-subtitle">Personalized financial advice</div>
              </div>
            </div>
            {loading ? <div className="skeleton" style={{ height: '200px' }} /> : recs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                <p style={{ fontSize: '13px' }}>Your finances look healthy!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recs.slice(0, 4).map((rec, i) => (
                  <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${rec.priority === 'high' ? 'rgba(239,68,68,0.2)' : rec.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ fontSize: '24px' }}>{rec.icon}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{rec.title}</span>
                          <span className={`badge badge-${rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'success'}`}>{rec.priority}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{rec.description}</p>
                        {rec.potentialSavings > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                            💚 Potential savings: {formatCurrency(rec.potentialSavings)}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
