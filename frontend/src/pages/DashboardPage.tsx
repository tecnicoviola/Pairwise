import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Customer, JourneyStage, VerificationStatus } from '../types';
import { AppLayout } from '../components/AppLayout';
import { JourneyStageBadge, VerificationBadge } from '../components/Badge';
import {
  Users,
  UserCheck,
  Sparkles,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  MapPin,
  Briefcase,
  Calendar,
  Activity,
} from 'lucide-react';

/** Turns enum values like NEVER_MARRIED into "Never Married" for display. */
const formatMaritalStatus = (status?: string): string =>
  status ? status.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') : '—';

export const DashboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [journeyStage, setJourneyStage] = useState<string>('ALL');
  const [verificationStatus, setVerificationStatus] = useState<string>('ALL');
  const [gender, setGender] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', search, journeyStage, verificationStatus, gender, sortBy, sortOrder, page],
    queryFn: () =>
      api.customers.list({
        search,
        journeyStage,
        verificationStatus,
        gender,
        sortBy,
        sortOrder,
        page,
        limit: 12,
      }),
  });

  const customers = data?.data || [];
  const stats = data?.stats || {
    totalCustomers: 0,
    verifiedProfiles: 0,
    readyForMatches: 0,
    pendingFollowUps: 0,
  };
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  return (
    <AppLayout>
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-pw-rose block mb-1">
            Matchmaker Workspace
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-pw-text">
            Client Directory & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-pw-muted mt-1">
            Review your assigned clients, monitor journey stages, and run custom algorithm matches.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-pw-border text-xs text-pw-muted shadow-subtle shrink-0">
          <Activity className="w-3.5 h-3.5 text-pw-rose" />
          <span>Active Pipeline: <strong>{stats.totalCustomers} Clients</strong></span>
        </div>
      </div>

      {/* Match Insights Metrics Banner (Inspired by Image 5) */}
      <div className="bg-white rounded-3xl border border-pw-border p-6 shadow-card mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-pw-border">
          <div>
            <h2 className="font-serif font-bold text-xl text-pw-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pw-rose" />
              Matchmaker Insights & Opportunities
            </h2>
            <p className="text-xs text-pw-muted mt-1">
              Deterministic compatibility engine evaluates two-way lifestyle and value alignment.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-pw-ivory text-pw-plum border border-pw-border font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100+ Candidate Pool Ready
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div className="border-r border-pw-border/60 last:border-none pr-4">
            <span className="text-xs uppercase font-bold tracking-wider text-pw-muted block mb-1">
              Total Clients
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-pw-text">{stats.totalCustomers}</span>
              <span className="text-[11px] text-pw-muted">profiles</span>
            </div>
          </div>

          <div className="border-r border-pw-border/60 last:border-none pr-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 block mb-1">
              Verified Profiles
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-emerald-800">{stats.verifiedProfiles}</span>
              <span className="text-[11px] text-emerald-600 font-medium">IDs confirmed</span>
            </div>
          </div>

          <div className="border-r border-pw-border/60 last:border-none pr-4">
            <span className="text-xs uppercase font-bold tracking-wider text-pw-burgundy block mb-1">
              Ready for Matches
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-pw-burgundy">{stats.readyForMatches}</span>
              <span className="text-[11px] text-pw-muted">active queue</span>
            </div>
          </div>

          <div className="pr-4">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700 block mb-1">
              Follow-ups Due
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-amber-800">{stats.pendingFollowUps}</span>
              <span className="text-[11px] text-amber-600 font-medium">action needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-2xl border border-pw-border p-4 mb-6 shadow-subtle">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-pw-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by client name, city, designation, or company..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-pw-border focus:outline-none focus:ring-2 focus:ring-pw-rose/30 focus:border-pw-burgundy bg-pw-ivory/50"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-pw-ivory px-3 py-2 rounded-xl border border-pw-border text-xs">
              <Filter className="w-3.5 h-3.5 text-pw-muted" />
              <select
                value={journeyStage}
                onChange={(e) => {
                  setJourneyStage(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none focus:outline-none text-pw-text font-medium cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                <option value="READY_FOR_MATCHES">Ready for Matches</option>
                <option value="MATCH_SUGGESTED">Match Suggested</option>
                <option value="INTRODUCTION_SENT">Intro Sent</option>
                <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-pw-ivory px-3 py-2 rounded-xl border border-pw-border text-xs">
              <select
                value={verificationStatus}
                onChange={(e) => {
                  setVerificationStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none focus:outline-none text-pw-text font-medium cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="PENDING">Pending</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-pw-ivory px-3 py-2 rounded-xl border border-pw-border text-xs">
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none focus:outline-none text-pw-text font-medium cursor-pointer"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-pw-ivory px-3 py-2 rounded-xl border border-pw-border text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-pw-muted" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                className="bg-transparent border-none focus:outline-none text-pw-text font-medium cursor-pointer"
              >
                <option value="createdAt-desc">Newest Added</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="age-asc">Age (Youngest first)</option>
                <option value="lastContactDate-desc">Recent Contact</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List Content */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-pw-border p-16 text-center shadow-card">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pw-burgundy mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider text-pw-muted">Loading assigned clients...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-6 text-center text-rose-700 text-sm">
          Failed to load clients: {(error as any)?.message || 'Server error'}.
          <button
            onClick={() => refetch()}
            className="mt-3 block mx-auto px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pw-border p-16 text-center shadow-card">
          <Users className="w-10 h-10 text-pw-muted/40 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-pw-text">No Clients Match Filter</h3>
          <p className="text-xs text-pw-muted max-w-sm mx-auto mt-1">
            Try adjusting your search query or reset filter dropdowns to view clients.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-pw-border shadow-card overflow-hidden">
          <div className="divide-y divide-pw-border/70">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-5 sm:p-6 hover:bg-pw-ivory/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >
                {/* Left: Avatar & Bio Information */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pw-blush/80 border border-pw-rose/30 flex items-center justify-center text-pw-burgundy font-serif font-bold text-base shrink-0 shadow-sm">
                    {c.firstName[0]}
                    {c.lastName[0]}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/customers/${c.id}`}
                        className="font-serif font-bold text-pw-text text-base hover:text-pw-burgundy transition-colors"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                      <span className="text-xs text-pw-muted font-medium">
                        ({c.age} yrs · {c.gender === 'MALE' ? 'Male' : 'Female'})
                      </span>
                      <VerificationBadge status={c.verificationStatus} />
                      <JourneyStageBadge stage={c.journeyStage} />
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-pw-muted mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-pw-rose" />
                        {c.city}, {c.country}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-pw-text">
                        {formatMaritalStatus(c.maritalStatus)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-pw-rose" />
                        {c.designation} at {c.currentCompany}
                      </span>
                      <span className="font-medium text-pw-text">
                        ₹{(c.income / 100000).toFixed(1)} LPA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Contact Status & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-pw-border/70">
                  <div className="text-left sm:text-right text-xs text-pw-muted">
                    {c.lastContactDate ? (
                      <span className="flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3 h-3 text-pw-rose" />
                        Contacted {new Date(c.lastContactDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span>No contact logged</span>
                    )}
                  </div>

                  <Link
                    to={`/customers/${c.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-pw-burgundy hover:bg-pw-plum shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <span>View Profile & Matches</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-pw-ivory/50 border-t border-pw-border flex items-center justify-between text-xs text-pw-muted">
              <span>
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
                {pagination.total} clients)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-pw-border bg-white text-pw-text font-medium hover:bg-pw-ivory disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3.5 py-1.5 rounded-lg border border-pw-border bg-white text-pw-text font-medium hover:bg-pw-ivory disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default DashboardPage;
