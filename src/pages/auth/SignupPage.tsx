import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, UserPlus, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'driver' | 'admin'>('driver');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signup(name, email, password, role, phone);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      } else {
        if (role === 'admin') {
          navigate('/owner');
        } else {
          navigate('/chargers');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 px-3 sm:px-0 space-y-6">
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-9 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#174D3A] to-[#1F6B50] text-[#C8F169] flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Create your VoltSpot Account
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D]">
            Join as an EV driver or register as a private/commercial charger host.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              I want to use VoltSpot primarily as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 min-h-[44px] ${
                  role === 'driver'
                    ? 'bg-[#174D3A] text-white border-[#174D3A] shadow-xs'
                    : 'bg-[#F5F7F4] text-[#66736D] border-border hover:text-[#17231F]'
                }`}
              >
                <span>🚗 EV Driver</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 min-h-[44px] ${
                  role === 'admin'
                    ? 'bg-[#174D3A] text-white border-[#174D3A] shadow-xs'
                    : 'bg-[#F5F7F4] text-[#66736D] border-border hover:text-[#17231F]'
                }`}
              >
                <span>⚡ Charger Host</span>
              </button>
            </div>
            <span className="text-[10px] text-[#66736D] mt-1.5 block">
              Superadmin privileges are securely provisioned and cannot be self-selected.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Full Name / Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Password * (Min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Phone Number (For Host Coordination)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-[#174D3A] min-h-[44px] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-extrabold transition-all shadow-card hover:shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60 min-h-[46px] group"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#C8F169] group-hover:translate-x-0.5 transition-transform" />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#66736D] pt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-[#174D3A] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
