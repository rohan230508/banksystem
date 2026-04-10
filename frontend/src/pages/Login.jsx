import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheck, TrendingUp, Zap, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';

const features = [
  { icon: <ShieldCheck size={20} />, title: 'Bank-Level Security', desc: 'AES-256 encryption & JWT auth' },
  { icon: <TrendingUp size={20} />, title: 'AI Risk Analysis', desc: 'Real-time financial health scoring' },
  { icon: <Zap size={20} />, title: 'Smart Alerts', desc: 'Proactive warnings before you overspend' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-glow" style={{ top: '-100px', left: '-100px' }} />
        <div className="auth-glow" style={{ bottom: '-150px', right: '-50px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💎</div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>FinGuard AI</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
            Your AI-Powered<br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financial Guardian</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.7' }}>
            Monitor, protect and grow your finances with real-time AI analysis. Stay ahead of risks before they happen.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: 'rgba(99,102,241,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your FinGuard account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <><div className="loader" />Signing in...</> : <>Sign In <ChevronRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>
                Register free →
              </Link>
            </p>
          </div>

          <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={14} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Protected by 256-bit SSL encryption & RBI compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
