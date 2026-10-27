import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, LogIn, Sparkles, AlertCircle, Shield, Check, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
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
    <div className="max-w-md mx-auto py-8 sm:py-16 px-3 sm:px-0 space-y-6">
      {/* Brand card */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-9 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#174D3A] to-[#1F6B50] text-[#C8F169] flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Sign in to VoltSpot
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D]">
            Access driver discovery, charger hosting, or platform oversight.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-extrabold transition-all shadow-card hover:shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60 min-h-[46px] group"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-[#C8F169] group-hover:translate-x-0.5 transition-transform" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Seed Credentials for Reviewers / Evaluators */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="text-[11px] font-extrabold text-[#174D3A] uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Account Fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('driver@voltspot.demo', 'Driver123!')}
              className="py-2.5 px-2 rounded-xl text-center text-xs font-bold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition min-h-[40px]"
            >
              🚗 Driver
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('owner@voltspot.demo', 'Owner123!')}
              className="py-2.5 px-2 rounded-xl text-center text-xs font-bold bg-[#F5F7F4] hover:bg-[#EAF3EF] hover:text-[#174D3A] border border-border transition min-h-[40px]"
            >
              ⚡ Host
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('nothingisspecial78@gmail.com', 'abdu@1027')}
              className="py-2.5 px-2 rounded-xl text-center text-xs font-bold bg-[#EAF3EF] text-[#174D3A] hover:bg-[#C8F169]/30 border border-[#C5DED3] transition min-h-[40px] flex items-center justify-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-[#174D3A]" />
              <span>Admin</span>
            </button>
          </div>

          <p className="text-[11px] text-[#66736D] text-center">
            Click any button above to auto-fill verified credentials.
          </p>
        </div>

        <div className="text-center text-xs text-[#66736D] pt-1">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-extrabold text-[#174D3A] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
