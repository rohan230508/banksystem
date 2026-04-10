import React, { useEffect, useState } from 'react';
import { Bell, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    alertAPI.getAll({ unread: true }).then(res => setUnread(res.data.unreadCount)).catch(() => {});
  }, []);

  return (
    <header className="header">
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Time */}
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: 'var(--accent-success)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live
        </div>

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          style={{ position: 'relative', width: '38px', height: '38px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: 'var(--accent-danger)', borderRadius: '50%', fontSize: '10px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', display: 'none' }}>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <div style={{ width: '36px', height: '36px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
