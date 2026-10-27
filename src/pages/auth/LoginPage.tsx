import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
        if (res.role === 'superadmin') {
          navigate('/superadmin');
        } else if (res.role === 'admin') {
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

  return (
    <div className="mx-auto max-w-[400px] px-3 py-8 sm:py-16">
      {/* Brand card */}
      <div className="space-y-6 rounded-card border border-border bg-surface p-6 sm:p-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-control bg-primary text-accent">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to VoltSpot
          </h1>
          <p className="text-sm text-muted">
            Access driver discovery, charger hosting, or platform oversight.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-control border border-danger/20 bg-danger-bg p-3.5 text-sm text-danger-fg" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-foreground">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="min-h-[44px] w-full rounded-control border border-border px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 text-accent" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-1 text-center text-sm text-muted">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
