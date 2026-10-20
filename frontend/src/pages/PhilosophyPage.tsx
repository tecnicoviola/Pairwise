import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Compass, Scale, ShieldCheck, Sparkles, UserCheck, FileText } from 'lucide-react';

const dimensions: [string, number, string][] = [
  ['Relationship goals & timeline', 15, 'Do both want the same kind of commitment, on a similar timeline?'],
  ['Children & family expectations', 15, 'Alignment on wanting children (Yes / No / Maybe).'],
  ['Location & relocation', 15, 'Same city, or openness to relocate.'],
  ['Career, education & income', 15, 'Education, profession and income, against stated preferences.'],
  ['Language & cultural background', 10, 'Shared mother tongue and languages spoken.'],
  ['Age & height', 15, 'Fit against each person’s stated age and height ranges.'],
  ['Lifestyle, diet & pets', 15, 'Diet, comfort with pets and shared interests.'],
];

const stages = [
  ['Eligibility', 'Removes candidates who clearly cannot match: same person, wrong gender pairing, outside a stated hard age range, or violating a stated dealbreaker. Missing data is treated as unknown, never as a match or a mismatch.'],
  ['Directional scoring', 'Scores each direction separately (customer → candidate, candidate → customer) out of 100 across seven weighted dimensions.'],
  ['Mutual compatibility', 'Combines both directions with a geometric mean, so a high score on one side cannot hide a low score on the other. Large gaps between the two are penalised.'],
  ['Explanation', 'Every result lists what aligns, what differs, and what is still unknown, plus a label: High Potential (80+), Promising (65–79) or Needs Review (below 65).'],
  ['Ranking', 'Results are sorted by mutual score, with deterministic tie-breaking, so the same data always gives the same order.'],
];

const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <section className="rounded-3xl border border-pw-border bg-pw-card p-6 md:p-8 shadow-subtle">
    <h2 className="flex items-center gap-3 font-serif text-2xl text-pw-text mb-4">
      <span className="w-9 h-9 rounded-xl bg-pw-blush flex items-center justify-center"><Icon className="w-4.5 h-4.5 text-pw-burgundy" /></span>
      {title}
    </h2>
    {children}
  </section>
);

export const PhilosophyPage: React.FC = () => (
  <AppLayout>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
      <header className="mb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pw-rose mb-2">Philosophy & rules</p>
        <h1 className="font-serif text-4xl text-pw-text">How Pairwise reaches a recommendation</h1>
        <p className="mt-3 text-pw-muted max-w-2xl">
          A reference for matchmakers. Scores are estimates that support your judgment. They are not predictions of relationship success.
        </p>
      </header>

      <Section icon={Compass} title="The five stages">
        <ol className="space-y-4">
          {stages.map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="w-7 h-7 shrink-0 rounded-full bg-pw-burgundy text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <p className="text-sm text-pw-muted leading-relaxed"><strong className="text-pw-text">{t}.</strong> {d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={Scale} title="Scoring dimensions (100 points per direction)">
        <ul className="divide-y divide-pw-border">
          {dimensions.map(([t, pts, d]) => (
            <li key={t} className="py-3 flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-pw-text">{t}</p><p className="text-xs text-pw-muted mt-0.5">{d}</p></div>
              <span className="shrink-0 rounded-full bg-pw-blush text-pw-burgundy dark:text-pw-rose text-xs font-bold px-3 py-1">{pts} pts</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={UserCheck} title="Stated preferences come first">
        <p className="text-sm text-pw-muted leading-relaxed">
          Each person’s own partner preferences take precedence. For the assessment, male customers also use default signals favouring younger,
          shorter and lower-earning partners and alignment on children, while female customers emphasise profession, values and relocation.
          These are defaults only, and any preference a customer states overrides them. Caste and religion are used only when a customer
          explicitly lists them as a preference.
        </p>
      </Section>

      <Section icon={Sparkles} title="Where AI helps">
        <p className="text-sm text-pw-muted leading-relaxed">
          AI drafts introductions and explanations from known profile facts. It never changes a score and never invents details. If AI is
          unavailable, a built-in template drafts the message instead.
        </p>
      </Section>

      <Section icon={ShieldCheck} title="Human review">
        <p className="text-sm text-pw-muted leading-relaxed flex gap-3">
          <FileText className="w-4 h-4 text-pw-rose shrink-0 mt-0.5" />
          Nothing is recorded until you have read, edited and confirmed the introduction. The introduction is a mock action, so no real email is sent.
        </p>
      </Section>
    </div>
  </AppLayout>
);
