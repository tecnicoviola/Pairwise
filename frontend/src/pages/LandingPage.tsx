import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReveal } from '../hooks/useReveal';
import { PairwiseLogo } from '../components/PairwiseLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  ArrowRight, Compass, Sparkles, UserCheck, FileText, ShieldCheck, Scale, MessageCircleHeart,
  Layers, CheckCircle2, HelpCircle, AlertTriangle, Menu, X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Small presentational pieces (all data on this page is fictional)    */
/* ------------------------------------------------------------------ */

const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-10 h-10 text-sm' }) => (
  <span
    aria-hidden="true"
    className={`shrink-0 rounded-full bg-gradient-to-br from-pw-rose to-pw-burgundy text-white font-serif font-semibold flex items-center justify-center ring-2 ring-pw-card ${className}`}
  >
    {name.charAt(0)}
  </span>
);

const ScoreRing: React.FC<{ value: number; size?: number }> = ({ value, size = 92 }) => {
  const r = 42;
  const c = 2 * Math.PI * r;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Illustrative compatibility estimate: ${value} out of 100`}>
      <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-pw-blush" />
        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
          className="stroke-pw-burgundy dark:stroke-pw-rose"
          style={{ strokeDasharray: `${on ? (c * value) / 100 : 0} ${c}`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl font-bold text-pw-text leading-none">{value}</span>
        <span className="text-[9px] uppercase tracking-wider text-pw-muted mt-0.5">estimate</span>
      </div>
    </div>
  );
};

interface Node { name: string; meta: string; score: number; label: string; x: number; y: number; delay: string }
const NODES: Node[] = [
  { name: 'Ananya', meta: 'Product designer · Pune', score: 92, label: 'High potential', x: 24, y: 12, delay: '0s' },
  { name: 'Ishita', meta: 'Data scientist · Mumbai', score: 88, label: 'Promising', x: 80, y: 20, delay: '0.8s' },
  { name: 'Kavya', meta: 'Architect · Bengaluru', score: 85, label: 'Promising', x: 86, y: 66, delay: '1.4s' },
  { name: 'Riya', meta: 'Physician · Pune', score: 79, label: 'Worth a look', x: 52, y: 90, delay: '0.4s' },
  { name: 'Sneha', meta: 'Lawyer · Mumbai', score: 76, label: 'Worth a look', x: 14, y: 68, delay: '1.1s' },
];

/** Hub-and-spoke compatibility visual: one customer at the centre, ranked candidates around them. */
const CompatibilityHub: React.FC = () => (
  <div className="relative w-full max-w-[34rem] mx-auto aspect-square" aria-label="Illustrative compatibility map with fictional profiles">
    {/* Arch backdrop */}
    <div className="absolute inset-x-[8%] top-0 bottom-0 rounded-t-[999px] rounded-b-[2.5rem] bg-gradient-to-b from-pw-blush via-pw-sand/80 to-transparent opacity-80" />
    <div className="absolute inset-x-[18%] top-[6%] bottom-[8%] rounded-t-[999px] rounded-b-[2rem] border border-pw-rose/25" />

    {/* Connectors */}
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {NODES.map((n) => (
        <line key={n.name} x1="50" y1="50" x2={n.x} y2={n.y} stroke="rgb(var(--pw-rose))" strokeWidth="0.35"
          strokeDasharray="1.6 1.6" className="animate-dash" opacity="0.8" />
      ))}
    </svg>

    {/* Pulse rings */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <span className="absolute -inset-16 rounded-full border border-pw-rose/40 animate-ring" />
      <span className="absolute -inset-16 rounded-full border border-pw-rose/30 animate-ring" style={{ animationDelay: '1.6s' }} />
    </div>

    {/* Centre customer */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 rounded-2xl bg-pw-card border border-pw-border shadow-card p-3.5 text-center z-10">
      <div className="flex justify-center -mt-9 mb-2"><Avatar name="Aarav" className="w-12 h-12 text-lg" /></div>
      <p className="text-[9px] uppercase tracking-widest text-pw-rose font-bold">Customer</p>
      <p className="font-serif font-semibold text-pw-text">Aarav, 31</p>
      <p className="text-[11px] text-pw-muted">Product manager · Mumbai</p>
      <p className="mt-2 text-[10px] text-pw-burgundy bg-pw-blush rounded-full px-2 py-0.5 inline-block">Ready for matches</p>
    </div>

    {/* Candidates */}
    {NODES.map((n) => (
      <div key={n.name} className="absolute -translate-x-1/2 -translate-y-1/2 animate-float" style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: n.delay }}>
        <div className="w-[7.4rem] sm:w-36 rounded-xl bg-pw-card border border-pw-border shadow-subtle p-2.5">
          <div className="flex items-center gap-2">
            <Avatar name={n.name} className="w-8 h-8 text-xs" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-pw-text leading-tight">{n.name}</p>
              <p className="text-[9px] text-pw-muted leading-tight truncate">{n.meta}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-pw-burgundy">{n.score}%</span>
            <span className="text-[9px] text-pw-muted">{n.label}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const steps = [
  { icon: UserCheck, title: 'Understand each person', text: 'Review profile details, individual preferences and relationship goals before looking at a single candidate.', tag: 'Profiles & preferences' },
  { icon: Compass, title: 'Explore compatibility', text: 'Browse ranked recommendations with clear reasons, differences and open questions behind every estimate.', tag: 'Explainable scoring' },
  { icon: FileText, title: 'Make thoughtful introductions', text: 'Review a drafted introduction, edit it in your own voice, and confirm before anything is recorded.', tag: 'Human-reviewed' },
];

const principles = [
  { icon: Layers, title: 'Explainable compatibility', text: 'Scores arrive with the reasons behind them, so you can agree, adjust or disagree.' },
  { icon: Scale, title: 'Individual preferences', text: 'Each person’s stated preferences carry weight, in both directions.' },
  { icon: ShieldCheck, title: 'Human-reviewed introductions', text: 'Nothing is recorded until a matchmaker has read, edited and confirmed it.' },
  { icon: Compass, title: 'Contextual profile information', text: 'Background, lifestyle and goals sit beside the numbers, not behind them.' },
  { icon: MessageCircleHeart, title: 'Thoughtful communication', text: 'Introductions are drafted from known facts and never invent details.' },
];

/* ------------------------------------------------------------------ */

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  useReveal();

  const primaryHref = isAuthenticated ? '/dashboard' : '/login';
  const navLinks = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#approach', label: 'Our approach' },
    { href: '#preview', label: 'Preview' },
  ];

  return (
    <div className="min-h-screen bg-pw-ivory text-pw-text overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-pw-ivory/85 backdrop-blur-md border-b border-pw-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
          <Link to="/" aria-label="Pairwise home"><PairwiseLogo size="md" variant="full" /></Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-pw-muted">
            {navLinks.map((l) => <a key={l.href} href={l.href} className="hover:text-pw-plum transition-colors">{l.label}</a>)}
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {!isAuthenticated && (
              <Link to="/login" className="hidden sm:inline text-xs font-semibold text-pw-muted hover:text-pw-plum px-2">Sign in</Link>
            )}
            <Link to={isAuthenticated ? '/dashboard' : '/signup'}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-pw-burgundy hover:bg-pw-plum shadow-md shadow-pw-burgundy/15 transition-all hover:scale-[1.02]">
              {isAuthenticated ? 'Go to workspace' : 'Create account'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button type="button" className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-full border border-pw-border text-pw-muted"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Mobile" className="md:hidden border-t border-pw-border bg-pw-ivory px-4 py-4 flex flex-col gap-3 text-sm font-medium">
            {navLinks.map((l) => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-1 text-pw-muted hover:text-pw-plum">{l.label}</a>)}
            <Link to={primaryHref} className="mt-1 inline-flex justify-center rounded-full bg-pw-burgundy text-white py-2.5 text-sm font-semibold">
              {isAuthenticated ? 'Go to workspace' : 'Sign in'}
            </Link>
            {!isAuthenticated && <Link to="/signup" className="text-center text-pw-burgundy font-semibold py-1">Create account</Link>}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-[1.02fr_1fr] gap-14 items-center">
        <div className="absolute -z-0 -top-10 -left-24 w-80 h-80 rounded-full bg-pw-blush/60 blur-3xl" aria-hidden="true" />
        <div className="relative z-10">
          <p className="animate-fade-up inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-pw-rose mb-6">
            <span className="w-8 h-px bg-pw-rose" /> A more thoughtful way to connect
          </p>
          <h1 className="animate-fade-up font-serif text-5xl sm:text-6xl lg:text-[4.2rem] leading-[1.05] font-bold text-pw-text" style={{ animationDelay: '0.08s' }}>
            Great connections begin with <em className="text-pw-burgundy dark:text-pw-rose not-italic italic">understanding.</em>
          </h1>
          <p className="animate-fade-up mt-6 text-lg text-pw-muted max-w-xl leading-relaxed" style={{ animationDelay: '0.16s' }}>
            Pairwise is a human-first matchmaking workspace. It brings profiles, explainable compatibility and thoughtful introductions together, so matchmakers can decide with confidence.
          </p>
          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.24s' }}>
            <Link to={primaryHref} className="inline-flex items-center gap-2 rounded-full bg-pw-burgundy hover:bg-pw-plum text-white px-7 py-3.5 text-sm font-semibold shadow-lg shadow-pw-burgundy/20 transition-all hover:scale-[1.02]">
              Enter workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-pw-border bg-pw-card/70 text-pw-text hover:border-pw-rose px-7 py-3.5 text-sm font-semibold transition-colors">
              Discover Pairwise
            </a>
          </div>
          <p className="animate-fade-up mt-7 font-script text-2xl text-pw-rose" style={{ animationDelay: '0.32s' }}>
            Thoughtful matches. Human-first decisions.
          </p>
        </div>
        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <CompatibilityHub />
          <p className="mt-4 text-center text-[11px] text-pw-muted">Illustrative visual with fictional people, not live data.</p>
        </div>
      </section>

      {/* Values strip */}
      <section aria-label="Principles" className="border-y border-pw-border bg-pw-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid sm:grid-cols-3 gap-4 text-center sm:text-left">
          {[['Shared values', 'Beyond first impressions'], ['Mutual fit', 'Scored in both directions'], ['Human review', 'You decide, always']].map(([t, s]) => (
            <div key={t} className="flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="w-4 h-4 text-pw-rose shrink-0" />
              <p className="text-sm"><span className="font-semibold text-pw-text">{t}</span> <span className="text-pw-muted">· {s}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works – vertical timeline */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="reveal text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pw-rose mb-3">How Pairwise works</p>
          <h2 className="font-serif text-4xl md:text-5xl text-pw-text">Three steps, one calm workflow</h2>
        </div>
        <ol className="relative">
          <span className="absolute left-5 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-pw-rose/0 via-pw-rose/50 to-pw-rose/0" aria-hidden="true" />
          {steps.map((s, i) => (
            <li key={s.title} className="reveal relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-16 pb-14 last:pb-0" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 w-10 h-10 rounded-full bg-pw-burgundy text-white font-serif font-bold flex items-center justify-center ring-8 ring-pw-ivory">{i + 1}</span>
              <div className={`${i % 2 === 0 ? 'md:text-right md:pr-6' : 'md:col-start-2 md:pl-6'}`}>
                <span className={`inline-flex items-center gap-2 mb-3 text-pw-rose ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <s.icon className="w-5 h-5" /><span className="text-[11px] font-bold uppercase tracking-widest">{s.tag}</span>
                </span>
                <h3 className="font-serif text-2xl text-pw-text mb-2">{s.title}</h3>
                <p className="text-pw-muted leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why this could work – sketch-style paired profiles */}
      <section className="bg-pw-sand/60 border-y border-pw-border py-20 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pw-rose mb-3">Compatibility, explained</p>
            <h2 className="font-serif text-4xl md:text-5xl text-pw-text">See why two people might work</h2>
          </div>
          <div className="reveal grid md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
            {[
              { n: 'Aarav, 31', c: 'Pune', intent: 'Looking for a committed relationship that leads to marriage.', matters: ['Honest, steady communication', 'Building a home together'], why: 'Clear about what he wants and values partnership.' },
              { n: 'Ananya, 29', c: 'Pune', intent: 'Ready for a long-term partnership and a shared future.', matters: ['Clear, open communication', 'Teamwork and growing together'], why: 'Values partnership and communicates plainly.' },
            ].map((p, idx) => (
              <article key={p.n} className={`paper rounded-2xl border border-pw-border shadow-card p-6 ${idx === 0 ? '-rotate-1' : 'rotate-1'} transition-transform hover:rotate-0`}>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar name={p.n} className="w-14 h-14 text-xl" />
                  <div><h3 className="font-serif text-xl font-semibold text-pw-text">{p.n}</h3><p className="text-xs text-pw-muted">{p.c}</p></div>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-pw-rose">Relationship intent</p>
                <p className="font-script text-xl text-pw-text leading-snug mb-3 underline decoration-pw-gold/70 decoration-2 underline-offset-4">{p.intent}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-pw-rose">What matters to me</p>
                <ul className="font-script text-xl text-pw-text mb-4">{p.matters.map((m) => <li key={m}>• {m}</li>)}</ul>
                <div className="rounded-lg border border-pw-border bg-pw-card/70 p-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-pw-burgundy dark:text-pw-rose">Why this could work</p>
                  <p className="font-script text-lg text-pw-text leading-snug">{p.why}</p>
                </div>
              </article>
            ))}
            {/* centre annotations – placed after the cards in DOM, ordered in the middle column */}
          </div>
          <div className="reveal mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3 font-script text-2xl text-pw-rose" aria-label="Annotations">
            <span>↔ aligned on direction</span><span>↔ shared values</span><span>↔ similar priorities</span>
          </div>
          <p className="mt-6 text-center text-[11px] text-pw-muted">Illustrative example with fictional people.</p>
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="reveal text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pw-rose mb-3">Inside the workspace</p>
          <h2 className="font-serif text-4xl md:text-5xl text-pw-text">A recommendation you can reason about</h2>
        </div>
        <div className="reveal rounded-3xl border border-pw-border bg-pw-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-pw-border bg-pw-sand/50">
            <span className="w-2.5 h-2.5 rounded-full bg-pw-rose/60" /><span className="w-2.5 h-2.5 rounded-full bg-pw-gold/60" /><span className="w-2.5 h-2.5 rounded-full bg-pw-border" />
            <span className="ml-3 text-[11px] text-pw-muted">Illustrative preview · fictional data</span>
          </div>
          <div className="p-6 md:p-8 grid md:grid-cols-[auto_1fr] gap-8">
            <div className="flex md:flex-col items-center gap-5">
              <ScoreRing value={92} />
              <div>
                <p className="text-xs font-bold text-pw-burgundy dark:text-pw-rose uppercase tracking-wider">High potential</p>
                <p className="text-[11px] text-pw-muted max-w-[11rem]">A compatibility estimate to inform your judgment, not a guarantee.</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Avatar name="Ananya" className="w-11 h-11" />
                <div><p className="font-serif text-lg font-semibold text-pw-text">Ananya, 29</p><p className="text-xs text-pw-muted">Product designer · Pune · Verified</p></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2"><CheckCircle2 className="w-3.5 h-3.5" /> Aligned</p>
                  <ul className="space-y-1 text-xs text-emerald-900/80"><li>Both want children</li><li>Both open to relocating</li><li>Shared language: Hindi, English</li></ul>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> Differences</p>
                  <ul className="space-y-1 text-xs text-amber-900/80"><li>Different diet preferences</li><li>Age gap near upper range</li></ul>
                </div>
                <div className="rounded-xl bg-sky-50 border border-sky-100 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-sky-700 mb-2"><HelpCircle className="w-3.5 h-3.5" /> Still unknown</p>
                  <ul className="space-y-1 text-xs text-sky-900/80"><li>Pet preference not stated</li><li>Family expectations</li></ul>
                </div>
              </div>
              <p className="mt-5 text-xs text-pw-muted">The matchmaker reviews this, edits the introduction, and confirms before anything is recorded.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Human-first approach */}
      <section id="approach" className="bg-gradient-to-b from-[#4a2438] to-[#341624] text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E5A4B2] mb-3">Our approach</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">Algorithms assist. People decide.</h2>
            <p className="mt-4 text-white/70 leading-relaxed">Pairwise supports a matchmaker’s judgment. It never promises perfect matches or guaranteed outcomes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {principles.map((p, i) => (
              <div key={p.title} className="reveal rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] transition-colors" style={{ transitionDelay: `${i * 80}ms` }}>
                <p.icon className="w-5 h-5 text-[#E5A4B2] mb-4" />
                <h3 className="font-serif text-xl mb-1.5">{p.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center py-20 md:py-28">
        <div className="reveal">
          <div className="flex justify-center mb-6"><PairwiseLogo size="lg" variant="mark" /></div>
          <h2 className="font-serif text-4xl md:text-5xl text-pw-text mb-4">Ready to match with more care?</h2>
          <p className="text-pw-muted mb-8">Open your workspace and review your next introduction.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={primaryHref} className="inline-flex items-center gap-2 rounded-full bg-pw-burgundy hover:bg-pw-plum text-white px-8 py-3.5 text-sm font-semibold shadow-lg shadow-pw-burgundy/20 transition-all hover:scale-[1.02]">
              Enter workspace <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link to="/signup" className="inline-flex items-center rounded-full border border-pw-border bg-pw-card/70 px-8 py-3.5 text-sm font-semibold text-pw-text hover:border-pw-rose transition-colors">Create account</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pw-border bg-pw-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-sm">
            <PairwiseLogo size="md" variant="full" />
            <p className="mt-3 text-xs text-pw-muted leading-relaxed">A human-first compatibility workspace for matchmakers. Thoughtful matches. Human-first decisions.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-pw-muted">
            <a href="#how-it-works" className="hover:text-pw-plum">How it works</a>
            <a href="#approach" className="hover:text-pw-plum">Our approach</a>
            <Link to="/login" className="hover:text-pw-plum">Sign in</Link>
            <Link to="/signup" className="hover:text-pw-plum">Create account</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};
