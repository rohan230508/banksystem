import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ChevronRight, Building2, Eye, EyeOff, Lock } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    monthlyIncome: '', employmentType: 'salaried'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('🎉 Account created & bank linked!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-glow" style={{ top: '-100px', left: '-100px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>💎</div>
            <span style={{ fontSize: '22px', fontWeight: '800' }}>WealthLens</span>
          </div>
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
            Join 50,000+ users<br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>managing smarter</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', lineHeight: '1.7' }}>
            Link your bank accounts securely via Open Banking. Get instant AI-powered insights on your financial health.
          </p>

          {/* Steps visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Create your secure account', 'Verify income & employment', 'Link bank via Open Banking API', 'Get your AI financial report'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i < 2 ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: '14px', color: i < 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? 'var(--accent-primary)' : 'var(--border)', transition: 'background 0.3s' }} />
              ))}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
              {step === 1 ? 'Create Account' : 'Financial Profile'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              {step === 1 ? 'Step 1 of 2 — Basic Information' : 'Step 2 of 2 — Income & Employment'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Rajesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="rajesh@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: '44px' }} required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Continue <ChevronRight size={16} /></button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Monthly Income (₹)</label>
                <input className="form-input" type="number" placeholder="50000" value={form.monthlyIncome} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select className="form-input" value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>

              <div style={{ padding: '14px', background: 'rgba(99,102,241,0.07)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-primary)' }}>Open Banking Integration</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your bank accounts will be auto-linked securely via RBI-approved Open Banking APIs after registration.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <><div className="loader" />Creating Account...</> : <>Create Account <ChevronRight size={16} /></>}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>Sign in →</Link>
          </p>

          <div style={{ marginTop: '20px', padding: '10px 12px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={13} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Your data is encrypted & never shared with third parties</span>
          </div>
        </div>
      </div>
    </div>
  );
}
