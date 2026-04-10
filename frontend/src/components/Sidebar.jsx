import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, BarChart2,
  Bell, Target, PiggyBank, Settings, LogOut, Shield
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
  { label: 'Transactions', icon: <ArrowLeftRight size={18} />, path: '/transactions' },
  { label: 'Loans & EMI', icon: <CreditCard size={18} />, path: '/loans' },
  { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/analytics' },
  { label: 'Alerts', icon: <Bell size={18} />, path: '/alerts' },
  { label: 'Savings Plan', icon: <PiggyBank size={18} />, path: '/savings' },
  { label: 'CIBIL Score', icon: <Target size={18} />, path: '/cibil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const riskColor = {
    low: 'var(--accent-success)',
    medium: 'var(--accent-warning)',
    high: '#f97316',
    critical: 'var(--accent-danger)'
  };

  const riskLevel = user?.financialHealth?.riskLevel || 'low';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--gradient-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💎</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>FinGuard</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Finance</div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '12px', background: 'rgba(99,102,241,0.07)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {user?.userId || '---'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={12} style={{ color: riskColor[riskLevel] }} />
              <span style={{ fontSize: '11px', color: riskColor[riskLevel], fontWeight: '600', textTransform: 'uppercase' }}>{riskLevel} risk</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              CIBIL: <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user?.cibilScore?.score || '---'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-label">Account</div>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />Settings
        </NavLink>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', marginTop: '4px' }}>
          <LogOut size={18} />Logout
        </button>
      </nav>

      {/* Bottom Info */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', margin: '0 12px 12px', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)' }}>
        <div style={{ fontSize: '10px', color: 'var(--accent-success)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>🔒 Bank Linked</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.bankAccounts?.[0]?.bankName || 'No bank linked'}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.bankAccounts?.[0]?.accountNumber || '---'}</div>
      </div>
    </aside>
  );
}
