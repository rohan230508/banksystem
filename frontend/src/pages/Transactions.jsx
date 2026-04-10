import React, { useEffect, useState } from 'react';
import { transactionAPI } from '../services/api';
import Header from '../components/Header';
import { Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['food','transport','shopping','entertainment','utilities','healthcare','education','emi','insurance','investment','salary','freelance','rent','travel','groceries','fuel','dining','subscription','transfer','other'];

const categoryEmoji = { food:'🍔',transport:'🚗',shopping:'🛍️',entertainment:'🎬',utilities:'💡',healthcare:'🏥',education:'📚',emi:'🏦',salary:'💰',freelance:'💻',rent:'🏠',travel:'✈️',groceries:'🛒',fuel:'⛽',dining:'🍽️',subscription:'📱',transfer:'↔️',other:'📦',insurance:'🛡️',investment:'📈' };

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ category: '', type: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'debit', amount: '', category: 'other', description: '' });
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        transactionAPI.getAll({ page, limit: 15, ...filters }),
        transactionAPI.getSummary()
      ]);
      setTransactions(txRes.data.transactions);
      setTotal(txRes.data.total);
      setSummary(sumRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, filters.category, filters.type]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) { toast.error('Fill all fields'); return; }
    setAdding(true);
    try {
      await transactionAPI.create({ ...form, amount: Number(form.amount) });
      toast.success('Transaction added!');
      setShowModal(false);
      setForm({ type: 'debit', amount: '', category: 'other', description: '' });
      fetchData();
    } catch (e) { toast.error('Failed to add'); }
    finally { setAdding(false); }
  };

  return (
    <>
      <Header title="Transactions" subtitle="All your financial activity in one place" />
      <div className="page-content fade-in">

        {/* Summary */}
        <div className="grid grid-3 gap-4 mb-6">
          <div className="stat-card success">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}><ArrowUpCircle size={22} style={{ color: '#10b981' }} /></div>
            <div className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(summary?.income)}</div>
            <div className="stat-label">Total Income This Month</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}><ArrowDownCircle size={22} style={{ color: '#ef4444' }} /></div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(summary?.expenses)}</div>
            <div className="stat-label">Total Expenses This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', fontSize: '22px' }}>💰</div>
            <div className="stat-value" style={{ color: summary?.savings >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(Math.abs(summary?.savings))}</div>
            <div className="stat-label">{summary?.savings >= 0 ? '✅ Net Savings' : '⚠️ Net Deficit'}</div>
          </div>
        </div>

        {/* Filters + Add */}
        <div className="glass-card p-6 mb-6">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
              <input className="form-input" placeholder="Search transactions..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-outline"><Search size={16} /></button>
            </form>
            <select className="form-input" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} style={{ width: '130px' }}>
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <select className="form-input" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} style={{ width: '150px' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Add Transaction
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="glass-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Channel</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: '20px', width: '100%' }} /></td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length > 0 ? transactions.map((tx, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', flexShrink: 0 }}>
                          {categoryEmoji[tx.category] || '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{tx.description}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.transactionId?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{tx.category}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{format(new Date(tx.transactionDate), 'dd MMM yyyy, HH:mm')}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{tx.metadata?.channel || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td><span className={`badge badge-${tx.status === 'completed' ? 'success' : 'warning'}`}>{tx.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>{page} / {Math.ceil(total / 15)}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add Transaction</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['debit', 'credit'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className={`btn btn-sm ${form.type === t ? (t === 'credit' ? 'btn-success' : 'btn-danger') : 'btn-outline'}`} style={{ flex: 1, justifyContent: 'center' }}>
                      {t === 'credit' ? '↑ Credit' : '↓ Debit'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" placeholder="Enter amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{categoryEmoji[c]} {c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g., Grocery shopping" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={adding}>
                  {adding ? <><div className="loader" />Adding...</> : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
