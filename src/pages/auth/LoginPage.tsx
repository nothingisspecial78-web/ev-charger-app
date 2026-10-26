import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, LogIn, Sparkles, AlertCircle, Shield, Check } from 'lucide-react';

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
        const cleanEmail = email.toLowerCase().trim();
        if (cleanEmail === 'nothingisspecial78@gmail.com' || cleanEmail.includes('superadmin')) {
          navigate('/superadmin');
        } else if (cleanEmail.includes('owner') || cleanEmail.includes('admin')) {
          navigate('/owner');
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

  const handleFillCredentials = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 px-3 sm:px-0 space-y-6">
      {/* Brand card */}
      <div className="bg-white rounded-3xl border border-border p-5 sm:p-8 shadow-card space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#17231F] tracking-tight">
            Sign in to VoltSpot
          </h1>
          <p className="text-xs text-[#66736D]">
            Access driver discovery, charger hosting, or platform oversight.
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
              placeholder="e.g. nothingisspecial78@gmail.com"
              required
              className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[42px]"
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
              className="w-full text-sm rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[42px]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-bold transition shadow-card flex items-center justify-center gap-2 disabled:opacity-60 min-h-[44px]"
          >
            <LogIn className="w-4 h-4 text-[#C8F169]" />
            <span>{submitting ? 'Authenticating with Supabase...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick credential chips */}
        <div className="pt-4 border-t border-border space-y-2.5">
          <div className="text-[11px] font-bold text-[#66736D] uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#174D3A]" />
            <span>Fill Seed Credentials</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('driver@voltspot.demo', 'Driver123!')}
              className="py-2 px-1 sm:px-2 rounded-xl text-center text-xs font-semibold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition min-h-[38px]"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('owner@voltspot.demo', 'Owner123!')}
              className="py-2 px-1 sm:px-2 rounded-xl text-center text-xs font-semibold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition min-h-[38px]"
            >
              Host
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('nothingisspecial78@gmail.com', 'abdu@1027')}
              className="py-2 px-1 sm:px-2 rounded-xl text-center text-xs font-bold bg-[#EAF3EF] text-[#174D3A] hover:bg-[#C8F169]/30 border border-[#C5DED3] transition min-h-[38px] flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#174D3A]" />
              <span>Admin</span>
            </button>
          </div>
          <div className="text-[11px] text-[#66736D] text-center bg-gray-50 p-2 rounded-lg">
            Superadmin: <span className="font-mono text-[#17231F]">nothingisspecial78@gmail.com</span>
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
