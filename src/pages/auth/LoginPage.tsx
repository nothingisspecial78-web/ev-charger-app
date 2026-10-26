import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      } else {
        if (email.includes('owner') || email.includes('admin')) {
          navigate('/owner');
        } else if (email.includes('superadmin')) {
          navigate('/superadmin');
        } else {
          navigate('/chargers');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (role: 'driver' | 'admin' | 'superadmin') => {
    switchDemoRole(role);
    if (role === 'admin') navigate('/owner');
    else if (role === 'superadmin') navigate('/superadmin');
    else navigate('/chargers');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand card */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#17231F] tracking-tight">
            Sign in to VoltSpot
          </h1>
          <p className="text-xs text-[#66736D]">
            Access driver discovery, charger hosting, and session requests.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. driver@voltspot.demo"
              required
              className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-bold transition shadow-card flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4 text-[#C8F169]" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* 1-Click Quick Demo Personas */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="text-[11px] font-bold text-[#66736D] uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#174D3A]" />
            <span>One-Click Hackathon Personas</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('driver')}
              className="py-2 px-2 rounded-xl text-center text-xs font-semibold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-2 rounded-xl text-center text-xs font-semibold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition"
            >
              Host
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('superadmin')}
              className="py-2 px-2 rounded-xl text-center text-xs font-semibold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#66736D]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-[#174D3A] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
