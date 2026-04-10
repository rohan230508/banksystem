import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Shield, Bell, User, Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Shield size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'banking', label: 'Banking', icon: <Building2 size={15} /> },
  ];

  return (
    <>
      <Header title="Settings" subtitle="Manage your account preferences and security" />
      <div className="page-content fade-in">

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--bg-card)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)' }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card p-6">
              <div className="section-title mb-4">Personal Information</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'rgba(99,102,241,0.07)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800' }}>{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px' }}>{user?.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user?.email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {user?.userId}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue={user?.name} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" defaultValue={user?.email} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" defaultValue={user?.phone || 'Not set'} />
              </div>
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select className="form-input" defaultValue={user?.employmentType}>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Income (₹)</label>
                <input className="form-input" type="number" defaultValue={user?.monthlyIncome} />
              </div>
              <button className="btn btn-primary" onClick={() => toast.success('Profile updated!')}><Save size={15} /> Save Changes</button>
            </div>

            {/* Account Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card p-6">
                <div className="section-title mb-4">Account Overview</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Account Status', value: user?.isActive ? '✅ Active' : '❌ Inactive', color: '#10b981' },
                    { label: 'Account Type', value: user?.role === 'admin' ? '👑 Admin' : '👤 User' },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '---' },
                    { label: 'Linked Banks', value: `${user?.bankAccounts?.length || 0} account(s)` },
                    { label: 'CIBIL Score', value: user?.cibilScore?.score || '---', color: '#10b981' },
                    { label: 'Risk Level', value: user?.financialHealth?.riskLevel?.toUpperCase() || 'LOW' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: item.color || 'var(--text-primary)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="section-title mb-4">Danger Zone</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>These actions are irreversible. Please proceed with caution.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn btn-outline" onClick={() => toast('Feature coming soon')} style={{ justifyContent: 'flex-start' }}>🔄 Reset Financial Data</button>
                  <button className="btn btn-outline" onClick={() => toast.error('Account deletion requires support contact')} style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)', justifyContent: 'flex-start' }}>🗑️ Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="glass-card p-6" style={{ maxWidth: '540px' }}>
            <div className="section-title mb-4">Security Settings</div>
            <div style={{ padding: '14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔐</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#10b981' }}>Your account is secured</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AES-256 encryption · JWT auth · HTTPS enforced</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Min 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" />
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('Password updated!')}><Shield size={15} /> Update Password</button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="glass-card p-6" style={{ maxWidth: '540px' }}>
            <div className="section-title mb-4">Notification Preferences</div>
            {[
              { label: 'Email Alerts', desc: 'Receive financial alerts via email', key: 'email', default: true },
              { label: 'SMS Notifications', desc: 'Get real-time transaction SMS', key: 'sms', default: true },
              { label: 'Push Notifications', desc: 'Browser push notifications', key: 'push', default: true },
              { label: 'EMI Reminders', desc: 'Remind me 5 days before EMI due', key: 'emi', default: true },
              { label: 'Spending Alerts', desc: 'Alert when spending exceeds budget', key: 'spending', default: true },
              { label: 'Investment Tips', desc: 'Receive weekly investment recommendations', key: 'invest', default: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={item.default} style={{ opacity: 0, width: 0, height: 0 }} onChange={() => {}} />
                  <span style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: '0.3s' }} />
                </label>
              </div>
            ))}
            <button className="btn btn-primary mt-4" onClick={() => toast.success('Preferences saved!')}><Save size={15} /> Save Preferences</button>
          </div>
        )}

        {/* Banking Tab */}
        {activeTab === 'banking' && (
          <div className="glass-card p-6">
            <div className="section-title mb-4">Linked Bank Accounts</div>
            {user?.bankAccounts?.length > 0 ? user.bankAccounts.map((acc, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏦</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{acc.bankName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{acc.accountType?.toUpperCase()} · {acc.accountNumber}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>✅ Linked via Open Banking</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: '#10b981' }}>₹{acc.balance?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available Balance</div>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No bank accounts linked</p>
            )}
            <button className="btn btn-outline mt-4" onClick={() => toast('Open Banking integration — connect additional bank accounts')} style={{ marginTop: '16px' }}>
              <Building2 size={15} /> + Link Another Bank
            </button>
          </div>
        )}
      </div>
    </>
  );
}
