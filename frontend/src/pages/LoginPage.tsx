import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthShell, authInputClass } from '../components/AuthShell';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or username and your password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.login(identifier.trim(), password);
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemo = () => {
    setIdentifier('demo@thedatecrew.com');
    setPassword('matchmaker123');
    setError(null);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your matchmaker workspace."
      footer={
        <>
          New to Pairwise?{' '}
          <Link to="/signup" className="font-semibold text-pw-burgundy hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="identifier" className="block text-xs font-semibold text-pw-text mb-1.5">Email or username</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-pw-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="identifier" type="text" autoComplete="username" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} placeholder="you@agency.com"
              className={`${authInputClass} pl-10`} />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-pw-text mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-pw-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              className={`${authInputClass} pl-10 pr-11`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-pw-muted hover:text-pw-burgundy">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pw-burgundy hover:bg-pw-plum disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 shadow-md shadow-pw-burgundy/20 transition-all">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{isLoading ? 'Signing in…' : 'Sign in'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-pw-rose/50 bg-pw-blush/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-pw-burgundy">
            <Sparkles className="w-3.5 h-3.5 text-pw-rose" /> Assessment demo account
          </span>
          <button type="button" onClick={autofillDemo} className="text-[11px] font-bold text-pw-burgundy underline underline-offset-2 hover:text-pw-plum">
            Fill credentials
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-pw-muted">Fictional demo data only. Sign in with the filled credentials.</p>
      </div>
    </AuthShell>
  );
};
