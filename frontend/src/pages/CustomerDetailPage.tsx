import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Customer, MatchRecommendation, JourneyStage, VerificationStatus } from '../types';
import { AppLayout } from '../components/AppLayout';
import { JourneyStageBadge, VerificationBadge } from '../components/Badge';
import { NotesSection } from '../components/NotesSection';
import { SendMatchModal } from '../components/SendMatchModal';
import {
  ArrowLeft,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  Compass,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Send,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'matches' | 'biodata' | 'notes'>('matches');
  const [requireVerifiedOnly, setRequireVerifiedOnly] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<MatchRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatchRecordId, setSelectedMatchRecordId] = useState<string | undefined>(undefined);

  // Fetch Customer Details
  const { data: customerData, isLoading: isCustomerLoading, error: customerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.customers.getById(id!),
    enabled: !!id,
  });

  // Fetch Existing Matches for this Customer
  const { data: matchesData, refetch: refetchMatches } = useQuery({
    queryKey: ['customerMatches', id],
    queryFn: () => api.matches.listForCustomer(id!),
    enabled: !!id,
  });

  // Mutation to run algorithm and generate recommendations
  const generateMutation = useMutation({
    mutationFn: () =>
      api.matches.generate(id!, {
        limit: 15,
        requireVerifiedOnly,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMatches', id] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });

  // Mutation to update journey stage
  const updateStageMutation = useMutation({
    mutationFn: (newStage: JourneyStage) =>
      api.customers.update(id!, { journeyStage: newStage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const customer = customerData?.data;
  const existingMatches = matchesData?.data || [];

  if (isCustomerLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pw-burgundy" />
        </div>
      </AppLayout>
    );
  }

  if (customerError || !customer) {
    return (
      <AppLayout>
        <div className="bg-white rounded-3xl border border-pw-border p-12 text-center max-w-xl mx-auto shadow-card">
          <h2 className="font-serif text-2xl font-bold text-pw-text">Client Record Not Found</h2>
          <p className="text-sm text-pw-muted mt-2">The client could not be located or you lack permissions.</p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pw-burgundy text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleOpenSendModal = (rec: MatchRecommendation) => {
    setSelectedRecommendation(rec);
    const matchedRecord = existingMatches.find((m) => m.candidateId === rec.candidateId);
    setSelectedMatchRecordId(matchedRecord?.id);
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      {/* Back Link Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pw-muted hover:text-pw-plum transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Client Directory
        </Link>
      </div>

      {/* Customer Header Banner */}
      <div className="bg-white rounded-3xl border border-pw-border p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-pw-plum text-white flex items-center justify-center font-serif font-bold text-xl shadow-md shrink-0">
              {customer.firstName[0]}
              {customer.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-pw-text">
                  {customer.firstName} {customer.lastName}
                </h1>
                <span className="text-sm font-semibold text-pw-muted">
                  ({customer.age} years · {customer.gender === 'MALE' ? 'Male' : 'Female'})
                </span>
                <VerificationBadge status={customer.verificationStatus} />
              </div>

              <p className="text-sm text-pw-muted mt-1">
                {customer.designation} at <strong className="font-semibold text-pw-text">{customer.currentCompany}</strong> ·{' '}
                <span>{customer.city}, {customer.country}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-pw-muted mt-2.5">
                <span className="bg-pw-ivory px-2.5 py-1 rounded-md border border-pw-border font-medium">
                  Height: <strong>{customer.height} cm</strong>
                </span>
                <span className="bg-pw-ivory px-2.5 py-1 rounded-md border border-pw-border font-medium">
                  Income: <strong>₹{(customer.income / 100000).toFixed(1)} LPA</strong>
                </span>
                <span className="bg-pw-ivory px-2.5 py-1 rounded-md border border-pw-border font-medium">
                  Mother Tongue: <strong>{customer.motherTongue}</strong>
                </span>
                <span className="bg-pw-ivory px-2.5 py-1 rounded-md border border-pw-border font-medium">
                  Goal: <strong>{customer.relationshipGoals}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Journey Stage Progression Selector */}
          <div className="p-4 rounded-2xl bg-pw-ivory border border-pw-border shrink-0 space-y-2 lg:min-w-[240px]">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-pw-plum">Stage Status:</span>
              <JourneyStageBadge stage={customer.journeyStage} />
            </div>
            <select
              value={customer.journeyStage}
              onChange={(e) => updateStageMutation.mutate(e.target.value as JourneyStage)}
              disabled={updateStageMutation.isPending}
              className="w-full text-xs py-2 px-3 rounded-xl border border-pw-border bg-white text-pw-text font-medium focus:outline-none focus:ring-2 focus:ring-pw-rose/30"
            >
              <option value="NEW_LEAD">New Lead</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="PROFILE_INCOMPLETE">Profile Incomplete</option>
              <option value="VERIFICATION_PENDING">Verification Pending</option>
              <option value="PROFILE_VERIFIED">Profile Verified</option>
              <option value="READY_FOR_MATCHES">Ready for Matches</option>
              <option value="MATCH_SUGGESTED">Match Suggested</option>
              <option value="INTRODUCTION_SENT">Introduction Sent</option>
              <option value="FEEDBACK_PENDING">Feedback Pending</option>
              <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-pw-border/70 pt-4 flex gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('matches')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'matches'
                ? 'border-pw-burgundy text-pw-burgundy'
                : 'border-transparent text-pw-muted hover:text-pw-text'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Match Recommendations</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-pw-blush text-pw-plum text-[10px]">
              {existingMatches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('biodata')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'biodata'
                ? 'border-pw-burgundy text-pw-burgundy'
                : 'border-transparent text-pw-muted hover:text-pw-text'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Complete Biodata & Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-pw-burgundy text-pw-burgundy'
                : 'border-transparent text-pw-muted hover:text-pw-text'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Notes & Activity History</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATCH RECOMMENDATIONS */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Algorithm Engine Execution Banner */}
          <div className="bg-white rounded-3xl border border-pw-border p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h3 className="font-serif font-bold text-lg text-pw-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pw-rose" />
                Custom Matching Engine (5-Stage Evaluation)
              </h3>
              <p className="text-xs text-pw-muted mt-1">
                Computes two-way compatibility across 7 weighted dimensions and prevents one-sided score inflation via geometric mean.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-pw-text font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireVerifiedOnly}
                  onChange={(e) => setRequireVerifiedOnly(e.target.checked)}
                  className="rounded text-pw-burgundy focus:ring-pw-rose"
                />
                <span>Strict Verified Only</span>
              </label>

              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pw-burgundy hover:bg-pw-plum disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-pw-burgundy/15 transition-all hover:scale-105"
              >
                <Sparkles className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                {generateMutation.isPending ? 'Evaluating 100+ Candidates...' : 'Generate Ranked Matches'}
              </button>
            </div>
          </div>

          {/* Recommendations Render List */}
          {existingMatches.length === 0 && !generateMutation.data ? (
            <div className="bg-white rounded-3xl border border-pw-border p-16 text-center shadow-card">
              <Sparkles className="w-12 h-12 text-pw-rose mx-auto mb-4" />
              <h3 className="font-serif font-bold text-xl text-pw-text">
                Ready to Run Pairwise Engine
              </h3>
              <p className="text-xs text-pw-muted max-w-md mx-auto mt-2 mb-8">
                Click 'Generate Ranked Matches' to evaluate {customer.firstName}'s biodata against the pool of 100+ candidates using bidirectional scoring.
              </p>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-pw-burgundy hover:bg-pw-plum text-white text-xs font-semibold shadow-md shadow-pw-burgundy/20"
              >
                <Sparkles className="w-4 h-4" />
                Generate Matches Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(generateMutation.data?.data
                ? generateMutation.data.data
                : existingMatches.map((m) => ({
                    candidateId: m.candidateId,
                    candidateSummary: {
                      id: m.candidate.id,
                      firstName: m.candidate.firstName,
                      lastName: m.candidate.lastName,
                      age: m.candidate.age,
                      gender: m.candidate.gender,
                      city: m.candidate.city,
                      country: m.candidate.country,
                      designation: m.candidate.designation,
                      currentCompany: m.candidate.currentCompany,
                      degree: m.candidate.degree,
                      height: m.candidate.height,
                      verificationStatus: m.candidate.verificationStatus,
                      journeyStage: m.candidate.journeyStage,
                    },
                    overallScore: m.overallScore,
                    customerToCandidateScore: m.customerToCandidateScore,
                    candidateToCustomerScore: m.candidateToCustomerScore,
                    compatibilityLabel: m.compatibilityLabel,
                    positiveReasons: m.positiveReasons,
                    potentialMismatches: m.potentialMismatches,
                    unknownDetails: m.unknownDetails,
                    verificationStatus: m.candidate.verificationStatus,
                    conciseExplanation: m.aiExplanation || '',
                  }))
              ).map((rec: any, idx: number) => {
                const existingMatchRecord = existingMatches.find(
                  (m) => m.candidateId === rec.candidateId
                );
                const isSent = existingMatchRecord?.status === 'SENT';

                return (
                  <div
                    key={rec.candidateId}
                    className="bg-white rounded-3xl border border-pw-border p-6 sm:p-7 shadow-card hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Left: Candidate Summary & Signals */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-pw-blush text-pw-burgundy font-serif font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <h3 className="font-serif font-bold text-xl text-pw-text">
                            {rec.candidateSummary.firstName} {rec.candidateSummary.lastName}
                          </h3>
                          <span className="text-xs text-pw-muted font-medium">
                            ({rec.candidateSummary.age} yrs · {rec.candidateSummary.city})
                          </span>
                          <VerificationBadge status={rec.verificationStatus} />
                          {isSent && (
                            <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                              <Send className="w-3 h-3" />
                              Intro Sent
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-pw-muted mt-1.5">
                          {rec.candidateSummary.designation} at <strong>{rec.candidateSummary.currentCompany}</strong> ·{' '}
                          {rec.candidateSummary.degree} · {rec.candidateSummary.height} cm
                        </p>

                        {/* Recommendation Rationale */}
                        <p className="text-xs text-pw-text bg-pw-ivory p-4 rounded-2xl border border-pw-border mt-4 leading-relaxed">
                          {rec.conciseExplanation}
                        </p>

                        {/* Positive Alignment Points */}
                        {rec.positiveReasons?.length > 0 && (
                          <div className="mt-4">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block mb-1.5">
                              Positive Mutual Alignment:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.positiveReasons.map((reason: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Potential Mismatches / Review Points */}
                        {rec.potentialMismatches?.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block mb-1.5">
                              Areas for Matchmaker Discussion:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.potentialMismatches.map((mismatch: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  {mismatch}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Radial Compatibility Score & Send Action */}
                      <div className="flex flex-col items-center justify-between shrink-0 p-6 rounded-2xl bg-pw-ivory border border-pw-border lg:min-w-[240px]">
                        {/* Radial Ring Score Display */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#E8DFDA"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke={rec.overallScore >= 80 ? '#642D43' : '#B87988'}
                              strokeWidth="8"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * rec.overallScore) / 100}
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-serif font-bold text-2xl text-pw-burgundy leading-none">
                              {rec.overallScore}%
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-pw-muted mt-1">
                              Mutual Fit
                            </span>
                          </div>
                        </div>

                        <span
                          className={`mt-2 text-xs font-bold px-3 py-0.5 rounded-full ${
                            rec.overallScore >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.overallScore >= 65
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.compatibilityLabel}
                        </span>

                        {/* Directional breakdown */}
                        <div className="mt-4 pt-3 border-t border-pw-border w-full text-xs text-pw-muted space-y-1.5">
                          <div className="flex justify-between">
                            <span>{customer.firstName} ➔ Candidate:</span>
                            <strong className="text-pw-text">{rec.customerToCandidateScore}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Candidate ➔ {customer.firstName}:</span>
                            <strong className="text-pw-text">{rec.candidateToCustomerScore}%</strong>
                          </div>
                        </div>

                        {/* Send Match Action */}
                        <button
                          onClick={() => handleOpenSendModal(rec)}
                          className={`w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 ${
                            isSent
                              ? 'bg-white text-pw-text border border-pw-border hover:bg-pw-ivory'
                              : 'bg-pw-burgundy text-white hover:bg-pw-plum'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isSent ? 'Resend / Edit Intro' : 'Send Match'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETE BIODATA & PARTNER PREFERENCES */}
      {activeTab === 'biodata' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal & Family Background */}
          <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-pw-text flex items-center gap-2.5 border-b border-pw-border pb-3">
              <User className="w-4 h-4 text-pw-rose" />
              Personal & Family Biodata
            </h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-pw-muted block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-pw-text text-sm">
                  {new Date(customer.dateOfBirth).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Height</span>
                <span className="font-semibold text-pw-text text-sm">{customer.height} cm</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Marital Status</span>
                <span className="font-semibold text-pw-text text-sm">{customer.maritalStatus.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Mother Tongue</span>
                <span className="font-semibold text-pw-text text-sm">{customer.motherTongue}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Languages Known</span>
                <span className="font-semibold text-pw-text text-sm">
                  {customer.languagesKnown?.join(', ') || 'English, Hindi'}
                </span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Siblings</span>
                <span className="font-semibold text-pw-text text-sm">{customer.numberOfSiblings}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Religion</span>
                <span className="font-semibold text-pw-text text-sm">{customer.religion || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Community / Caste</span>
                <span className="font-semibold text-pw-text text-sm">{customer.caste || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-pw-text flex items-center gap-2.5 border-b border-pw-border pb-3">
              <GraduationCap className="w-4 h-4 text-pw-rose" />
              Education & Career
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-pw-muted block mb-0.5">Undergraduate Institution</span>
                <span className="font-serif font-bold text-pw-text text-base">
                  {customer.undergraduateCollege}
                </span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Degree</span>
                <span className="font-semibold text-pw-text text-sm">{customer.degree}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-pw-muted block mb-0.5">Current Company</span>
                  <span className="font-semibold text-pw-text text-sm">{customer.currentCompany}</span>
                </div>
                <div>
                  <span className="text-pw-muted block mb-0.5">Designation</span>
                  <span className="font-semibold text-pw-text text-sm">{customer.designation}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-pw-border/70">
                <span className="text-pw-muted block mb-0.5">Annual Compensation</span>
                <span className="font-serif font-bold text-pw-burgundy text-lg">
                  ₹{(customer.income / 100000).toFixed(1)} Lakhs ({customer.incomePeriod})
                </span>
              </div>
            </div>
          </div>

          {/* Future Plans, Diet & Values */}
          <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-pw-text flex items-center gap-2.5 border-b border-pw-border pb-3">
              <Compass className="w-4 h-4 text-pw-rose" />
              Future Plans & Values
            </h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-pw-muted block mb-0.5">Want Children</span>
                <span className="font-semibold text-pw-text text-sm">{customer.wantChildren}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Open to Relocation</span>
                <span className="font-semibold text-pw-text text-sm">{customer.openToRelocation}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Open to Pets</span>
                <span className="font-semibold text-pw-text text-sm">{customer.openToPets}</span>
              </div>
              <div>
                <span className="text-pw-muted block mb-0.5">Dietary Lifestyle</span>
                <span className="font-semibold text-pw-text text-sm">{customer.diet || 'Not specified'}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-pw-border/70">
                <span className="text-pw-muted block mb-2">Hobbies & Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {customer.hobbies?.map((hobby, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-pw-ivory text-pw-text border border-pw-border text-xs font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Partner Preferences */}
          <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-pw-text flex items-center gap-2.5 border-b border-pw-border pb-3">
              <Heart className="w-4 h-4 text-pw-rose" />
              Stated Partner Preferences
            </h3>

            {customer.partnerPreferences ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-pw-muted block mb-0.5">Age Range</span>
                    <span className="font-semibold text-pw-text text-sm">
                      {customer.partnerPreferences.preferredAgeMin || '21'} -{' '}
                      {customer.partnerPreferences.preferredAgeMax || '45'} years
                    </span>
                  </div>
                  <div>
                    <span className="text-pw-muted block mb-0.5">Height Range</span>
                    <span className="font-semibold text-pw-text text-sm">
                      {customer.partnerPreferences.preferredHeightMin || '150'} -{' '}
                      {customer.partnerPreferences.preferredHeightMax || '195'} cm
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-pw-muted block mb-0.5">Preferred Locations</span>
                  <span className="font-semibold text-pw-text text-sm">
                    {customer.partnerPreferences.preferredCities?.join(', ') || 'Any metropolitan area'}
                  </span>
                </div>

                <div>
                  <span className="text-pw-muted block mb-0.5">Explicit Dealbreakers</span>
                  <span className="font-bold text-rose-700 text-sm">
                    {customer.partnerPreferences.dealbreakers?.join(', ') || 'None specified'}
                  </span>
                </div>

                {customer.partnerPreferences.specialNotes && (
                  <div className="pt-2 border-t border-pw-border/70">
                    <span className="text-pw-muted block mb-0.5">Matchmaker Guidance</span>
                    <p className="text-pw-text italic leading-relaxed">
                      "{customer.partnerPreferences.specialNotes}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-pw-muted italic">No custom preferences recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTES & ACTIVITY HISTORY */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <NotesSection
              customerId={customer.id}
              initialNotes={customer.notes}
              onNoteAdded={() => {
                queryClient.invalidateQueries({ queryKey: ['customer', id] });
              }}
            />
          </div>

          {/* Activity Event Log */}
          <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card">
            <h3 className="font-serif font-bold text-lg text-pw-text mb-4">
              System Audit Timeline
            </h3>
            <div className="space-y-4">
              {customer.activities && customer.activities.length > 0 ? (
                customer.activities.map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-pw-rose pl-3 py-1 space-y-0.5">
                    <p className="font-bold text-pw-plum">{act.eventType}</p>
                    <p className="text-pw-muted">{act.description}</p>
                    <span className="text-[10px] text-pw-muted/70 block">
                      {new Date(act.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-pw-muted">No timeline events recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Match Modal */}
      {selectedRecommendation && (
        <SendMatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={customer}
          recommendation={selectedRecommendation}
          matchRecordId={selectedMatchRecordId}
          onMatchSent={() => {
            queryClient.invalidateQueries({ queryKey: ['customerMatches', id] });
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
          }}
        />
      )}
    </AppLayout>
  );
};

export default CustomerDetailPage;
