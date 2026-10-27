import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, UserPlus, AlertCircle, Eye, EyeOff, Car, PlugZap } from 'lucide-react';

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
    <div className="mx-auto max-w-[400px] px-3 py-8 sm:py-16">
      <div className="space-y-6 rounded-card border border-border bg-surface p-6 sm:p-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-primary text-accent">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your VoltSpot Account
          </h1>
          <p className="text-sm text-muted">
            Join as an EV driver or register as a private/commercial charger host.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-control border border-danger/20 bg-danger-bg p-3.5 text-sm text-danger-fg" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              I want to use VoltSpot primarily as:
            </span>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Primary VoltSpot role">
              <button
                type="button"
                onClick={() => setRole('driver')}
                role="radio"
                aria-checked={role === 'driver'}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-control border px-3 text-sm font-semibold transition-colors ${
                  role === 'driver'
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border bg-surface-muted text-muted hover:text-foreground'
                }`}
              >
                <Car className="h-5 w-5" /><span>EV driver</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                role="radio"
                aria-checked={role === 'admin'}
                className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-control border px-3 text-sm font-semibold transition-colors ${
                  role === 'admin'
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border bg-surface-muted text-muted hover:text-foreground'
                }`}
              >
                <PlugZap className="h-5 w-5" /><span>Charger host</span>
              </button>
            </div>
            <span className="mt-1.5 block text-xs text-muted">
              Superadmin privileges are securely provisioned and cannot be self-selected.
            </span>
          </div>

          <div>
            <label htmlFor="signup-name" className="mb-1.5 block text-sm font-semibold text-foreground">
              Full Name / Display Name *
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="min-h-[44px] w-full rounded-control border border-border px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-semibold text-foreground">
              Email Address *
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="min-h-[44px] w-full rounded-control border border-border px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-semibold text-foreground">
              Password * (Min 6 characters)
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="min-h-[44px] w-full rounded-control border border-border px-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-semibold text-foreground">
              Phone Number (For Host Coordination)
            </label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="min-h-[44px] w-full rounded-control border border-border px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 text-accent" />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-1 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
