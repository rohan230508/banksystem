import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Header from '../components/Header';

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

// All investment options with platform info, annualised return, and compounding frequency
const INVESTMENT_OPTIONS = [
  {
    name: 'S&P 500 Index Fund',
    returns: '10–12%',
    annualRate: 11,
    risk: 'Medium',
    horizon: '5+ years',
    icon: '🌎',
    platforms: ['Zerodha Coin', 'Groww', 'INDmoney'],
    bestFor: 'USD-linked global diversification',
    tag: 'Global',
  },
  {
    name: 'Equity Mutual Fund (SIP)',
    returns: '12–15%',
    annualRate: 13.5,
    risk: 'High',
    horizon: '5+ years',
    icon: '📈',
    platforms: ['Zerodha Coin', 'Kuvera', 'Groww'],
    bestFor: 'Long-term wealth creation',
    tag: 'Top Pick',
  },
  {
    name: 'ELSS Tax Saver Fund',
    returns: '10–14%',
    annualRate: 12,
    risk: 'High',
    horizon: '3+ years',
    icon: '🏛️',
    platforms: ['ET Money', 'Groww', 'Paytm Money'],
    bestFor: 'Tax saving u/s 80C + market returns',
    tag: 'Tax Save',
  },
  {
    name: 'Liquid Mutual Fund',
    returns: '5–7%',
    annualRate: 6,
    risk: 'Low',
    horizon: 'Any',
    icon: '💧',
    platforms: ['Zerodha Coin', 'Paytm Money', 'Kuvera'],
    bestFor: 'Emergency fund parking',
    tag: 'Safe',
  },
  {
    name: 'Fixed Deposit',
    returns: '6.5–7.5%',
    annualRate: 7,
    risk: 'None',
    horizon: '1–5 years',
    icon: '🏦',
    platforms: ['HDFC Bank', 'SBI', 'ICICI Bank'],
    bestFor: 'Guaranteed capital-safe returns',
    tag: 'Guaranteed',
  },
  {
    name: 'PPF (Public Provident Fund)',
    returns: '7.1%',
    annualRate: 7.1,
    risk: 'None',
    horizon: '15 years',
    icon: '🔐',
    platforms: ['SBI', 'Post Office', 'HDFC Bank'],
    bestFor: 'Tax-free long-term savings',
    tag: 'Gov Backed',
  },
];

// Compute month-on-month compounding growth for `months` months
// each month: invest `monthly`, returns compound on total balance
function computeGrowthSeries(monthly, annualRate, months = 12) {
  const monthlyRate = annualRate / 100 / 12;
  const series = [];
  let balance = 0;
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    series.push(parseFloat(balance.toFixed(2)));
  }
  return series;
}

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
  None: '#10b981',
};

const TAG_COLORS = {
  'Top Pick': 'rgba(99,102,241,0.25)',
  'Tax Save': 'rgba(245,158,11,0.2)',
  Global: 'rgba(59,130,246,0.2)',
  Safe: 'rgba(16,185,129,0.2)',
  Guaranteed: 'rgba(16,185,129,0.2)',
  'Gov Backed': 'rgba(139,92,246,0.2)',
};

export default function Savings() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    analyticsAPI
      .getSavingsPlan()
      .then((res) => setPlan(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const surplus = plan?.availableForSavings || 0;
  const savingsRate = plan?.savingsRate || 0;
  const vs10k = plan?.baselineSurplusVs10k ?? null;

  // Only show investment options when surplus > 0 and computed monthly growth > 0
  const suggestableOptions = INVESTMENT_OPTIONS.filter((opt) => {
    const monthlyGrowth = ((surplus * opt.annualRate) / 100) / 12;
    return surplus > 0 && monthlyGrowth > 0;
  });

  if (loading) {
    return (
      <>
        <Header title="Savings Plan" subtitle="Build wealth with AI-powered savings strategies" />
        <div className="page-content fade-in" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your savings plan…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Savings Plan" subtitle="Build wealth with AI-powered savings strategies" />
      <div className="page-content fade-in">

        {/* ── Summary Cards ── */}
        {plan && (
          <div className="grid grid-4 gap-4 mb-6">
            {[
              { label: 'Monthly Income', value: plan.monthlyIncome, color: '#10b981', icon: '💰', sub: 'Gross inflow' },
              { label: 'Monthly Expenses', value: plan.totalExpenses, color: '#ef4444', icon: '🛒', sub: 'Spending tracked' },
              { label: 'EMI Outgo', value: plan.totalEMI, color: '#f59e0b', icon: '📅', sub: 'Active loans' },
              { label: 'Investable Surplus', value: surplus, color: 'var(--accent-primary)', icon: '📈', sub: 'Income − Expenses − EMI' },
            ].map((item, i) => (
              <div key={i} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                <div className="stat-value" style={{ color: item.color, fontSize: '22px' }}>
                  {formatCurrency(item.value)}
                </div>
                <div className="stat-label">{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Savings Rate Analysis ── */}
        {plan && (
          <div className="glass-card p-6 mb-6">
            <div className="section-header">
              <div>
                <div className="section-title">Savings Rate Analysis</div>
                <div className="section-subtitle">
                  Financial experts recommend saving at least 20% of income · ₹10,000/mo minimum baseline
                </div>
              </div>
              <span
                className={`badge ${
                  savingsRate >= 20
                    ? 'badge-success'
                    : savingsRate >= 10
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
                style={{ fontSize: '14px', padding: '6px 14px' }}
              >
                {savingsRate.toFixed(1)}% of income
              </span>
            </div>

            {/* Rate progress bar */}
            <div className="progress-bar" style={{ height: '12px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(savingsRate, 100)}%`,
                  background:
                    savingsRate >= 20
                      ? 'var(--gradient-success)'
                      : savingsRate >= 10
                      ? 'var(--gradient-warning)'
                      : 'var(--gradient-danger)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '6px',
              }}
            >
              <span>0% (Critical)</span>
              <span>10% (Fair)</span>
              <span>20% (Good)</span>
              <span>30%+ (Excellent)</span>
            </div>

            {/* ₹10k baseline indicator */}
            {vs10k !== null && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background:
                    vs10k >= 0
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${vs10k >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '22px' }}>{vs10k >= 0 ? '✅' : '⚠️'}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: vs10k >= 0 ? '#10b981' : '#ef4444' }}>
                    {vs10k >= 0
                      ? `₹${Math.abs(vs10k).toLocaleString('en-IN')} above the ₹10,000 minimum saving baseline`
                      : `₹${Math.abs(vs10k).toLocaleString('en-IN')} below the ₹10,000 minimum saving baseline`}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {vs10k >= 0
                      ? 'Great! You are building meaningful savings each month.'
                      : 'Reduce expenses or EMI burden to reach ₹10,000/mo savings.'}
                  </div>
                </div>
              </div>
            )}

            {/* Allocation Breakdown */}
            {plan.recommendations?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>
                  Recommended Monthly Allocation
                </div>
                <div className="grid grid-2 gap-3">
                  {plan.recommendations.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                      >
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.category}</span>
                        <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                          {formatCurrency(r.allocation)}
                        </span>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: '6px' }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              surplus > 0 ? Math.min((r.allocation / surplus) * 100, 100) : 0
                            }%`,
                            background: `hsl(${i * 80 + 160}, 65%, 55%)`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.description}</div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent-primary)',
                          marginTop: '4px',
                          fontWeight: '600',
                        }}
                      >
                        📍 {r.instrument}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Investment Options ── */}
        <div className="glass-card p-6">
          <div className="section-header mb-4">
            <div>
              <div className="section-title">💡 Recommended Investment Options</div>
              <div className="section-subtitle">
                {surplus > 0
                  ? `AI-curated for your ₹${surplus.toLocaleString('en-IN')}/mo surplus · click a card to see growth projection`
                  : 'Increase your surplus to unlock investment suggestions'}
              </div>
            </div>
            {surplus <= 0 && (
              <span className="badge badge-danger" style={{ fontSize: '13px', padding: '6px 14px' }}>
                No surplus
              </span>
            )}
          </div>

          {surplus <= 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'rgba(239,68,68,0.05)',
                borderRadius: '16px',
                border: '1px dashed rgba(239,68,68,0.3)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😟</div>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px', color: '#ef4444' }}>
                No Investable Surplus
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
                Your monthly income is fully consumed by expenses and EMIs. Reduce at least one cost
                category to free up savings for investment.
              </p>
            </div>
          ) : (
            <div className="grid grid-3 gap-4">
              {suggestableOptions.map((opt, i) => {
                const monthlyInvest = surplus; // invest entire surplus in this option (for illustration)
                const monthlyRawGrowth = (surplus * opt.annualRate) / 100 / 12;
                const series = computeGrowthSeries(surplus, opt.annualRate, 12);
                const nextMonthBalance = series[0];
                const threeMonthBalance = series[2];
                const twelveMonthBalance = series[11];
                const isExpanded = expandedCard === i;

                return (
                  <div
                    key={i}
                    onClick={() => setExpandedCard(isExpanded ? null : i)}
                    style={{
                      padding: '18px',
                      background: isExpanded ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '14px',
                      border: isExpanded
                        ? '1px solid rgba(99,102,241,0.4)'
                        : '1px solid var(--border)',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                        e.currentTarget.style.background = 'rgba(99,102,241,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                  >
                    {/* Tag badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: TAG_COLORS[opt.tag] || 'rgba(99,102,241,0.2)',
                        color: 'var(--text-primary)',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {opt.tag}
                    </div>

                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>{opt.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', paddingRight: '50px' }}>
                      {opt.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {opt.bestFor}
                    </div>

                    {/* Key metrics row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          padding: '8px',
                          background: 'rgba(16,185,129,0.08)',
                          borderRadius: '8px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Annual Returns</div>
                        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>
                          {opt.returns}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '8px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Risk</div>
                        <div
                          style={{
                            fontWeight: '700',
                            fontSize: '14px',
                            color: RISK_COLORS[opt.risk] || '#fff',
                          }}
                        >
                          {opt.risk}
                        </div>
                      </div>
                    </div>

                    {/* Monthly Growth — always visible */}
                    <div
                      style={{
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          marginBottom: '5px',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>Invest/month</span>
                        <span style={{ fontWeight: '700' }}>{formatCurrency(surplus)}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          marginBottom: '5px',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>Month 1 growth</span>
                        <span style={{ fontWeight: '700', color: '#10b981' }}>
                          +{formatCurrency(monthlyRawGrowth.toFixed(2))}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          borderTop: '1px solid rgba(16,185,129,0.2)',
                          paddingTop: '5px',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                          Balance after 1 mo
                        </span>
                        <span style={{ fontWeight: '800', color: '#10b981' }}>
                          {formatCurrency(nextMonthBalance)}
                        </span>
                      </div>
                    </div>

                    {/* Expanded growth projection */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '4px',
                          animation: 'fadeIn 0.3s ease',
                        }}
                      >
                        {/* 3-mo and 12-mo projections */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '12px',
                          }}
                        >
                          {[
                            { label: '3-Month Balance', val: threeMonthBalance, gain: threeMonthBalance - surplus * 3 },
                            { label: '12-Month Balance', val: twelveMonthBalance, gain: twelveMonthBalance - surplus * 12 },
                          ].map((proj, pi) => (
                            <div
                              key={pi}
                              style={{
                                padding: '10px',
                                background: 'rgba(99,102,241,0.08)',
                                borderRadius: '10px',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {proj.label}
                              </div>
                              <div
                                style={{
                                  fontWeight: '800',
                                  fontSize: '15px',
                                  color: 'var(--accent-primary)',
                                }}
                              >
                                {formatCurrency(proj.val.toFixed(0))}
                              </div>
                              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                                +{formatCurrency(proj.gain.toFixed(0))} returns
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Best platforms */}
                        <div style={{ marginBottom: '10px' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              marginBottom: '6px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            🏆 Best Platforms to Invest
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {opt.platforms.map((p, pi) => (
                              <span
                                key={pi}
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(99,102,241,0.15)',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'var(--accent-primary)',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                }}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Investment horizon */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            padding: '8px 0',
                            borderTop: '1px solid var(--border)',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>Recommended Horizon</span>
                          <span style={{ fontWeight: '700' }}>{opt.horizon}</span>
                        </div>
                      </div>
                    )}

                    {/* Expand hint */}
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '6px',
                      }}
                    >
                      {isExpanded ? '▲ Collapse' : '▼ See full projection & platforms'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
