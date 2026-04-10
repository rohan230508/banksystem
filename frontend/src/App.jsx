import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Savings from './pages/Savings';
import Cibil from './pages/Cibil';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading FinGuard...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><AppLayout><Transactions /></AppLayout></PrivateRoute>} />
      <Route path="/loans" element={<PrivateRoute><AppLayout><Loans /></AppLayout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AppLayout><Analytics /></AppLayout></PrivateRoute>} />
      <Route path="/alerts" element={<PrivateRoute><AppLayout><Alerts /></AppLayout></PrivateRoute>} />
      <Route path="/savings" element={<PrivateRoute><AppLayout><Savings /></AppLayout></PrivateRoute>} />
      <Route path="/cibil" element={<PrivateRoute><AppLayout><Cibil /></AppLayout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#131929',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#131929' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#131929' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
