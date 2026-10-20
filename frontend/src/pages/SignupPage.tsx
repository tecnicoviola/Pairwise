import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuthShell, authInputClass } from '../components/AuthShell';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Form { name: string; email: string; username: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Form, string>>;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(f.username.trim())) e.username = '3–30 characters: letters, numbers, dot, dash or underscore.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}

export const SignupPage: React.FC = () => {
  const [form, setForm] = useState<Form>({ name: '', email: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setServerError(null);
    if (Object.keys(v).length) return;
    setIsLoading(true);
    try {
      const res = await api.auth.register({
        name: form.name.trim(), email: form.email.trim(), username: form.username.trim(), password: form.password,
      });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const field = (id: keyof Form, label: string, type = 'text', auto?: string, placeholder?: string) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-pw-text mb-1.5">{label}</label>
      <input id={id} type={type} autoComplete={auto} value={form[id]} onChange={set(id)} placeholder={placeholder}
        aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `${id}-err` : undefined} className={authInputClass} />
      {errors[id] && <p id={`${id}-err`} className="mt-1 text-[11px] text-rose-600">{errors[id]}</p>}
    </div>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up a matchmaker workspace in under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-pw-burgundy hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {serverError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{serverError}</span>
          </div>
        )}
        {field('name', 'Full name', 'text', 'name', 'Asha Verma')}
        {field('email', 'Work email', 'email', 'email', 'you@agency.com')}
        {field('username', 'Username', 'text', 'username', 'asha.verma')}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-pw-text mb-1.5">Password</label>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password}
              onChange={set('password')} placeholder="At least 8 characters" aria-invalid={!!errors.password}
              className={`${authInputClass} pr-11`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-pw-muted hover:text-pw-burgundy">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>}
        </div>
        {field('confirm', 'Confirm password', showPassword ? 'text' : 'password', 'new-password')}

        <button type="submit" disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pw-burgundy hover:bg-pw-plum disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 shadow-md shadow-pw-burgundy/20 transition-all">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isLoading ? 'Creating account…' : 'Create account'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
        <p className="text-[11px] text-pw-muted text-center">New accounts start with an empty workspace plus any unassigned profiles.</p>
      </form>
    </AuthShell>
  );
};
