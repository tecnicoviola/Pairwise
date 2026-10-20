import React from 'react';
import { JourneyStage, VerificationStatus } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const variantStyles = {
    default: 'bg-pw-blush/80 text-pw-plum border-pw-rose/30',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    neutral: 'bg-pw-ivory text-pw-muted border-pw-border',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-semibold',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const JourneyStageBadge: React.FC<{ stage: JourneyStage }> = ({ stage }) => {
  const map: Record<JourneyStage, { label: string; variant: BadgeProps['variant'] }> = {
    NEW_LEAD: { label: 'New Lead', variant: 'neutral' },
    ONBOARDING: { label: 'Onboarding', variant: 'info' },
    PROFILE_INCOMPLETE: { label: 'Incomplete', variant: 'warning' },
    VERIFICATION_PENDING: { label: 'Verif. Pending', variant: 'warning' },
    PROFILE_VERIFIED: { label: 'Profile Verified', variant: 'success' },
    READY_FOR_MATCHES: { label: 'Ready for Matches', variant: 'success' },
    MATCH_SUGGESTED: { label: 'Match Suggested', variant: 'default' },
    INTRODUCTION_SENT: { label: 'Intro Sent', variant: 'info' },
    FEEDBACK_PENDING: { label: 'Feedback Pending', variant: 'warning' },
    FOLLOW_UP_REQUIRED: { label: 'Follow-up Due', variant: 'danger' },
    CLOSED: { label: 'Closed', variant: 'neutral' },
  };

  const config = map[stage] || { label: stage, variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Verified
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
        Pending ID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
      Unverified
    </span>
  );
};
