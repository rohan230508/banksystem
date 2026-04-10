import React, { useEffect, useState } from 'react';
import { alertAPI } from '../services/api';
import Header from '../components/Header';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const severityConfig = {
  info: { icon: <Info size={16} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  warning: { icon: <AlertTriangle size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  critical: { icon: <AlertCircle size={16} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertAPI.getAll();
      setAlerts(res.data.alerts);
      setUnreadCount(res.data.unreadCount);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const markRead = async (id) => {
    try { await alertAPI.markRead(id); fetchAlerts(); }
    catch (e) { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try { await alertAPI.markAllRead(); toast.success('All marked as read'); fetchAlerts(); }
    catch (e) { toast.error('Failed'); }
  };

  const dismiss = async (id) => {
    try { await alertAPI.dismiss(id); fetchAlerts(); }
    catch (e) { toast.error('Failed'); }
  };

  return (
    <>
      <Header title="Alerts & Notifications" subtitle="Stay informed about your financial activity" />
      <div className="page-content fade-in">

        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
              🔔 {unreadCount} Unread
            </div>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
        </div>

        {/* Alerts */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card p-6" style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>All Clear!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No alerts. Your finances are looking great.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert, i) => {
              const cfg = severityConfig[alert.severity] || severityConfig.info;
              return (
                <div key={i} style={{
                  padding: '16px 20px',
                  background: alert.isRead ? 'var(--bg-card)' : cfg.bg,
                  border: `1px solid ${alert.isRead ? 'var(--border)' : cfg.border}`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  opacity: alert.isRead ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{alert.title}</span>
                      <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}`}>{alert.severity}</span>
                      {!alert.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{alert.message}</p>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {!alert.isRead && (
                      <button onClick={() => markRead(alert.alertId)} className="btn btn-outline btn-sm" title="Mark as read">
                        <CheckCheck size={13} />
                      </button>
                    )}
                    <button onClick={() => dismiss(alert.alertId)} className="btn btn-outline btn-sm" title="Dismiss" style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
