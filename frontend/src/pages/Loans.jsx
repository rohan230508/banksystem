import React, { useEffect, useState } from 'react';
import { loanAPI } from '../services/api';
import Header from '../components/Header';
import { Plus, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function Loans() {
  const [data, setData] = useState({ loans: [], totalOutstanding: 0, totalEMI: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ loanType: 'personal', lenderName: '', principalAmount: '', interestRate: '', tenureMonths: '' });
  const [adding, setAdding] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await loanAPI.getAll(); setData(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const calcEMI = () => {
    const { principalAmount: p, interestRate: r, tenureMonths: n } = form;
    if (!p || !r || !n) return 0;
    const monthlyRate = r / 1200;
    return Math.round((p * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await loanAPI.create({ ...form, principalAmount: Number(form.principalAmount), interestRate: Number(form.interestRate), tenureMonths: Number(form.tenureMonths) });
      toast.success('Loan added successfully!');
      setShowModal(false);
      setForm({ loanType: 'personal', lenderName: '', principalAmount: '', interestRate: '', tenureMonths: '' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add loan'); }
    finally { setAdding(false); }
  };

  const handlePayEMI = async (id, lenderName) => {
    setPayingId(id);
    try {
      await loanAPI.payEMI(id);
      toast.success(`EMI paid for ${lenderName}!`);
      fetchData();
    } catch (e) { toast.error('EMI payment failed'); }
    finally { setPayingId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this loan?')) return;
    try { await loanAPI.delete(id); toast.success('Loan removed'); fetchData(); }
    catch (e) { toast.error('Failed'); }
  };

  return (
    <>
      <Header title="Loans & EMI" subtitle="Manage all your loans, track EMIs and reduce debt burden" />
      <div className="page-content fade-in">

        {/* Summary */}
        <div className="grid grid-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', fontSize: '22px' }}>🏦</div>
            <div className="stat-value">{data.loans.filter(l => l.status === 'active').length}</div>
            <div className="stat-label">Active Loans</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', fontSize: '22px' }}>📅</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(data.totalEMI)}</div>
            <div className="stat-label">Monthly EMI Total</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', fontSize: '22px' }}>💳</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(data.totalOutstanding)}</div>
            <div className="stat-label">Total Outstanding Debt</div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Loan</button>
        </div>

        {/* Loans List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />)}
          </div>
        ) : data.loans.length === 0 ? (
          <div className="glass-card p-6" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ marginBottom: '8px' }}>No Loans Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You're debt-free or add a loan to start tracking.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.loans.map((loan, i) => (
              <div key={i} className="glass-card p-6" style={{ borderLeft: `4px solid ${loan.riskLevel === 'low' ? '#10b981' : loan.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'capitalize' }}>{loan.loanType} Loan</h3>
                      <span className={`badge badge-${loan.status === 'active' ? 'success' : loan.status === 'closed' ? 'info' : 'danger'}`}>{loan.status}</span>
                      <span className={`badge badge-${loan.riskLevel === 'low' ? 'success' : loan.riskLevel === 'medium' ? 'warning' : 'danger'}`}>{loan.riskLevel} risk</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{loan.lenderName} · {loan.interestRate}% p.a.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {loan.status === 'active' && (
                      <button className="btn btn-success btn-sm" onClick={() => handlePayEMI(loan.loanId, loan.lenderName)} disabled={payingId === loan.loanId}>
                        {payingId === loan.loanId ? <><div className="loader" />Paying...</> : <><CheckCircle size={14} />Pay EMI</>}
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(loan.loanId)} style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-4 gap-4" style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Principal</div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>{formatCurrency(loan.principalAmount)}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding</div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: '#f59e0b' }}>{formatCurrency(loan.outstandingAmount)}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly EMI</div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent-primary)' }}>{formatCurrency(loan.emiAmount)}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Due</div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{loan.nextEmiDate ? format(new Date(loan.nextEmiDate), 'dd MMM yyyy') : '---'}</div>
                  </div>
                </div>

                {/* EMI Progress */}
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Repayment Progress</span>
                  <span style={{ fontWeight: '600' }}>{loan.paidEmis}/{loan.totalEmis} EMIs · {((loan.paidEmis / loan.totalEmis) * 100).toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(loan.paidEmis / loan.totalEmis) * 100}%`, background: loan.missedEmis > 0 ? 'var(--gradient-danger)' : 'var(--gradient-primary)' }} />
                </div>

                {loan.missedEmis > 0 && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>{loan.missedEmis} missed EMI(s) — This may hurt your CIBIL score!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Loan</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="grid grid-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Loan Type</label>
                  <select className="form-input" value={form.loanType} onChange={e => setForm({ ...form, loanType: e.target.value })}>
                    {['personal','home','car','education','business','gold','credit_card','other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lender Name</label>
                  <input className="form-input" placeholder="HDFC Bank" value={form.lenderName} onChange={e => setForm({ ...form, lenderName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Principal Amount (₹)</label>
                  <input className="form-input" type="number" placeholder="500000" value={form.principalAmount} onChange={e => setForm({ ...form, principalAmount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Interest Rate (% p.a.)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="12.5" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tenure (Months)</label>
                  <input className="form-input" type="number" placeholder="36" value={form.tenureMonths} onChange={e => setForm({ ...form, tenureMonths: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated EMI</label>
                  <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', fontWeight: '700', color: 'var(--accent-primary)', fontSize: '15px' }}>
                    {formatCurrency(calcEMI())}/mo
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={adding}>
                  {adding ? <><div className="loader" />Adding...</> : 'Add Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
