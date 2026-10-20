import React, { useState } from 'react';
import { Note, NoteCategory } from '../types';
import { api } from '../services/api';
import { PhoneCall, Users, Bell, MessageSquare, Plus, Clock } from 'lucide-react';

interface NotesSectionProps {
  customerId: string;
  initialNotes?: Note[];
  onNoteAdded?: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  customerId,
  initialNotes = [],
  onNoteAdded,
}) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.notes.create(customerId, content.trim(), category);
      setNotes([res.data, ...notes]);
      setContent('');
      if (onNoteAdded) onNoteAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: NoteCategory) => {
    switch (cat) {
      case 'CALL':
        return <PhoneCall className="w-3.5 h-3.5 text-blue-600" />;
      case 'MEETING':
        return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      case 'FOLLOW_UP':
        return <Bell className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-pw-rose" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-pw-border p-7 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif font-bold text-lg text-pw-text">
          Matchmaker Contact Log & Discovery Notes
        </h3>
        <span className="text-xs text-pw-muted font-medium">
          {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-5 rounded-2xl bg-pw-ivory border border-pw-border">
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-pw-muted">Log Type:</label>
          <div className="flex flex-wrap gap-1.5">
            {(['GENERAL', 'CALL', 'MEETING', 'FOLLOW_UP'] as NoteCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${
                  category === cat
                    ? 'bg-pw-burgundy text-white border-pw-burgundy shadow-sm'
                    : 'bg-white text-pw-muted border-pw-border hover:bg-pw-ivory'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Record notes from a phone consultation, customer meeting, partner feedback, or follow-up action..."
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-pw-border focus:outline-none focus:ring-2 focus:ring-pw-rose/30 focus:border-pw-burgundy bg-white text-pw-text leading-relaxed"
        />

        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-pw-burgundy hover:bg-pw-plum disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            {isSubmitting ? 'Saving Note...' : 'Save Note'}
          </button>
        </div>
      </form>

      {/* Notes Timeline List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-pw-muted text-xs">
            No notes logged for this client yet. Record a call or meeting note above.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl border border-pw-border/70 bg-pw-ivory/40 hover:bg-pw-ivory transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-medium text-pw-text">
                  {getCategoryIcon(note.category)}
                  <span className="uppercase tracking-wider font-bold text-[10px] text-pw-plum">
                    {note.category}
                  </span>
                  {note.matchmaker?.name && (
                    <span className="text-pw-muted">· by {note.matchmaker.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-pw-muted text-[11px]">
                  <Clock className="w-3 h-3 text-pw-rose" />
                  {new Date(note.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-pw-text/90 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;
