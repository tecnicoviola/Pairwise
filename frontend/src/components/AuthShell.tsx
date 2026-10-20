import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { PairwiseLogo } from './PairwiseLogo';
import { ThemeToggle } from './ThemeToggle';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const points = [
  { icon: Compass, title: 'Understand each person', text: 'Profiles, preferences and relationship goals in one calm workspace.' },
  { icon: Sparkles, title: 'Explainable compatibility', text: 'Every score comes with reasons, differences and open questions.' },
  { icon: ShieldCheck, title: 'Human-reviewed introductions', text: 'You edit and confirm every message before it is recorded.' },
];

/** Split-screen layout shared by the sign-in and sign-up pages. */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-pw-ivory">
    {/* Brand panel */}
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#5b2a3f] via-[#642D43] to-[#3a1827] text-white p-12">
      <div className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full border border-white/10" />
      <div className="absolute -top-8 -right-8 w-[18rem] h-[18rem] rounded-full border border-white/10" />
      <div className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-white/[0.04]" />
      <Link to="/" className="relative z-10 w-fit" aria-label="Pairwise home">
        <PairwiseLogo size="md" variant="full" theme="dark" />
      </Link>
      <div className="relative z-10 max-w-md">
        <h2 className="font-serif text-4xl leading-tight mb-3">
          Great connections begin with <em className="text-[#E5A4B2]">understanding.</em>
        </h2>
        <p className="text-sm text-white/70 mb-10">Thoughtful matches. Human-first decisions.</p>
        <ul className="space-y-6">
          {points.map(({ icon: Icon, title: t, text }) => (
            <li key={t} className="flex gap-4">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#E5A4B2]" />
              </span>
              <span>
                <span className="block font-semibold text-sm">{t}</span>
                <span className="block text-xs text-white/65 mt-0.5">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative z-10 text-[11px] text-white/45">Pairwise supports human judgment. It does not replace it.</p>
    </aside>

    {/* Form panel */}
    <main className="flex flex-col p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-pw-muted hover:text-pw-plum transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex justify-center mb-6">
            <PairwiseLogo size="md" variant="full" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-pw-text">{title}</h1>
          <p className="text-sm text-pw-muted mt-1.5 mb-7">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-sm text-pw-muted">{footer}</div>
        </div>
      </div>
    </main>
  </div>
);

export const authInputClass =
  'w-full rounded-xl border border-pw-border bg-pw-card px-4 py-3 text-sm text-pw-text placeholder:text-pw-muted/60 focus:outline-none focus:ring-2 focus:ring-pw-rose/50 focus:border-pw-rose transition';
