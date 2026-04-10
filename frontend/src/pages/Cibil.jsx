import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Header from '../components/Header';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function Cibil() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getCibil().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const score = data?.score || 0;
  const getScoreColor = (s) => s >= 750 ? '#10b981' : s >= 700 ? '#06b6d4' : s >= 650 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (s) => s >= 750 ? 'Excellent' : s >= 700 ? 'Good' : s >= 650 ? 'Fair' : 'Poor';
  const scorePercent = ((score - 300) / 600) * 100;

  const tips = [
    { tip: 'Pay all EMIs and credit card bills on time', impact: 'Very High', icon: '✅' },
    { tip: 'Keep credit card utilization below 30%', impact: 'High', icon: '💳' },
    { tip: 'Avoid applying for multiple loans simultaneously', impact: 'High', icon: '🚫' },
    { tip: 'Maintain a healthy mix of secured & unsecured loans', impact: 'Medium', icon: '⚖️' },
    { tip: 'Check your credit report regularly for errors', impact: 'Medium', icon: '🔍' },
    { tip: 'Don\'t close old credit cards — maintain credit history', impact: 'Low', icon: '📅' },
  ];

  return (
    <>
      <Header title="CIBIL Score" subtitle="Your creditworthiness report and improvement roadmap" />
      <div className="page-content fade-in">

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* Score Card */}
          <div className="glass-card p-6" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '8px', fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>Your CIBIL Score</div>

            {/* Score Arc */}
            <div style={{ position: 'relative', width: '220px', height: '120px', margin: '0 auto 20px' }}>
              <svg viewBox="0 0 200 110" style={{ width: '100%' }}>
                {/* Background arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="16" strokeLinecap="round" />
                {/* Score arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={getScoreColor(score)}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={`${(scorePercent / 100) * 251.3} 251.3`}
                  style={{ filter: `drop-shadow(0 0 8px ${getScoreColor(score)})`, transition: 'stroke-dasharray 1s ease' }}
                />
                {/* Range markers */}
                {['300', '450', '600', '750', '900'].map((val, i) => (
                  <text key={i} x={20 + i * 40} y="108" fill="#475569" fontSize="9" textAnchor="middle">{val}</text>
                ))}
              </svg>
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: getScoreColor(score), fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>{score}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: getScoreColor(score) }}>{getScoreLabel(score)}</span>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Grade: <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{data?.grade}</strong> · Range: 300–900</div>
            </div>

            {/* Score Ranges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              {[
                { range: '750–900', label: 'Excellent', desc: 'Best loan rates', color: '#10b981' },
                { range: '700–749', label: 'Good', desc: 'Favorable terms', color: '#06b6d4' },
                { range: '650–699', label: 'Fair', desc: 'Standard rates', color: '#f59e0b' },
                { range: '300–649', label: 'Poor', desc: 'High interest / rejection risk', color: '#ef4444' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: score >= Number(r.range.split('–')[0]) && score <= Number(r.range.split('–')[1]) ? `${r.color}18` : 'transparent', borderRadius: '8px', border: score >= Number(r.range.split('–')[0]) && score <= Number(r.range.split('–')[1]) ? `1px solid ${r.color}44` : '1px solid transparent' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: r.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: r.color }}>{r.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>{r.range}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factors */}
          <div className="glass-card p-6">
            <div className="section-title mb-4">Score Factors</div>
            {data?.factors?.map((f, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{f.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>({f.weight}% weight)</span>
                  </div>
                  <span className={`badge badge-${f.status === 'excellent' ? 'success' : f.status === 'good' ? 'info' : f.status === 'fair' ? 'warning' : 'danger'}`}>{f.status}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${f.weight}%`, background: f.status === 'excellent' ? 'var(--gradient-success)' : f.status === 'good' ? 'var(--gradient-cyan)' : f.status === 'fair' ? 'var(--gradient-warning)' : 'var(--gradient-danger)' }} />
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', color: f.impact > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                  {f.impact > 0 ? `+${f.impact}` : f.impact} pts impact
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips to Improve */}
        <div className="glass-card p-6">
          <div className="section-title mb-2">🚀 How to Improve Your Score</div>
          <div className="section-subtitle mb-4">Follow these steps to reach 750+</div>
          <div className="grid grid-3 gap-4">
            {tips.map((t, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{t.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>{t.tip}</div>
                <span className={`badge badge-${t.impact === 'Very High' ? 'danger' : t.impact === 'High' ? 'warning' : t.impact === 'Medium' ? 'info' : 'success'}`}>
                  {t.impact} Impact
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
