import React, { useState, useEffect } from 'react';
import { MatchRecommendation, Customer } from '../types';
import { api } from '../services/api';
import { Sparkles, Send, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface SendMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  recommendation: MatchRecommendation;
  matchRecordId?: string;
  onMatchSent: (updatedMatch: any) => void;
}

export const SendMatchModal: React.FC<SendMatchModalProps> = ({
  isOpen,
  onClose,
  customer,
  recommendation,
  matchRecordId,
  onMatchSent,
}) => {
  const [message, setMessage] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [draftSource, setDraftSource] = useState<'ai' | 'fallback' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generate or pre-fill draft when modal opens
  useEffect(() => {
    if (isOpen && matchRecordId) {
      handleFetchDraft();
    }
  }, [isOpen, matchRecordId]);

  const handleFetchDraft = async () => {
    if (!matchRecordId) return;
    setIsGeneratingDraft(true);
    setError(null);
    try {
      const res = await api.matches.getDraft(matchRecordId);
      setMessage(res.data.draftMessage);
      setDraftSource(res.data.source);
    } catch (err: any) {
      console.warn('Using default message format');
      setMessage(
        `Hi ${customer.firstName},\n\nI would love to introduce you to ${recommendation.candidateSummary.firstName}, who is a ${recommendation.candidateSummary.designation} at ${recommendation.candidateSummary.currentCompany} in ${recommendation.candidateSummary.city}.\n\nBased on your preferences, you share strong compatibility (${recommendation.overallScore}% mutual fit), especially in ${recommendation.positiveReasons.slice(0, 2).join(' and ') || 'lifestyle values'}.\n\nLet me know if you would like to proceed with an introduction!\n\nWarm regards,\nPairwise Matchmaking Team`
      );
      setDraftSource('fallback');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSend = async () => {
    if (!matchRecordId) {
      setError('Match ID is missing. Please regenerate recommendations.');
      return;
    }
    if (!message.trim()) {
      setError('Introduction message cannot be empty.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const res = await api.matches.send(matchRecordId, message.trim());
      setSuccessMessage('Mock introduction confirmed and successfully recorded!');
      setTimeout(() => {
        onMatchSent(res.data);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send introduction');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-pw-plum/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-pw-border overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-pw-border bg-pw-ivory flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-xl text-pw-text">
              Review & Prepare Introduction
            </h3>
            <p className="text-xs text-pw-muted mt-0.5">
              Introducing <strong className="text-pw-text">{recommendation.candidateSummary.firstName}</strong> to{' '}
              <strong className="text-pw-text">{customer.firstName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-pw-muted hover:text-pw-text hover:bg-pw-ivory transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 space-y-5">
          {/* Candidate Snapshot Card */}
          <div className="p-4 rounded-2xl bg-pw-ivory border border-pw-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-pw-text text-base">
                  {recommendation.candidateSummary.firstName} {recommendation.candidateSummary.lastName}
                </h4>
                <span className="text-xs text-pw-muted">
                  ({recommendation.candidateSummary.age} yrs · {recommendation.candidateSummary.city})
                </span>
              </div>
              <p className="text-xs text-pw-muted mt-0.5">
                {recommendation.candidateSummary.designation} at {recommendation.candidateSummary.currentCompany}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-pw-blush text-pw-plum border border-pw-rose/30">
                {recommendation.overallScore}% Mutual Fit
              </span>
              <p className="text-[10px] text-pw-muted mt-0.5">{recommendation.compatibilityLabel}</p>
            </div>
          </div>

          {/* AI Draft Controls & Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pw-muted">
                Personalized Introduction Email
              </span>
              {draftSource && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-pw-blush text-pw-plum border border-pw-rose/30 font-semibold">
                  <Sparkles className="w-3 h-3 text-pw-rose" />
                  {draftSource === 'ai' ? 'OpenAI Grounded' : 'Deterministic Template'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFetchDraft}
              disabled={isGeneratingDraft}
              className="inline-flex items-center gap-1 text-xs text-pw-burgundy hover:text-pw-plum font-bold"
            >
              <RefreshCw className={`w-3 h-3 ${isGeneratingDraft ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {/* Message Textarea */}
          <div className="relative">
            {isGeneratingDraft ? (
              <div className="h-48 rounded-2xl border border-pw-border bg-pw-ivory flex flex-col items-center justify-center text-pw-muted text-xs gap-2">
                <Sparkles className="w-5 h-5 text-pw-rose animate-spin" />
                <span>Generating grounded introduction draft...</span>
              </div>
            ) : (
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Review and edit the introduction message..."
                className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-pw-border focus:outline-none focus:ring-2 focus:ring-pw-rose/30 focus:border-pw-burgundy text-pw-text leading-relaxed font-sans bg-white"
              />
            )}
          </div>

          <div className="flex items-start gap-2.5 text-xs text-pw-muted bg-pw-ivory p-3.5 rounded-xl border border-pw-border">
            <AlertCircle className="w-4 h-4 text-pw-rose shrink-0 mt-0.5" />
            <span>
              <strong>Human-in-the-loop:</strong> Matchmakers review all drafts before sending. Confirming this action marks the match status as <strong>SENT</strong>, updates the customer journey stage, and creates an audit record.
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 bg-pw-ivory border-t border-pw-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-pw-muted hover:bg-white border border-pw-border transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || isGeneratingDraft || !message.trim() || !!successMessage}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-pw-burgundy hover:bg-pw-plum disabled:opacity-50 shadow-md shadow-pw-burgundy/15 transition-all hover:scale-105"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? 'Recording Introduction...' : 'Confirm & Send Mock Introduction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMatchModal;
