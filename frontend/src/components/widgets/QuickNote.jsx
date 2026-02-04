import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { notesApi } from '../../api/notes';

const STORAGE_KEY = 'quick-note-draft';

export default function QuickNote() {
  const [content, setContent] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, content);
    if (content) {
      setLastSaved(new Date());
    }
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const title = `Quick Note - ${format(new Date(), 'MMM d, yyyy h:mm a')}`;
      await notesApi.create({
        title,
        content: `<p>${content}</p>`,
        category: 'personal',
      });
      setContent('');
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary">edit_note</span>
        <h3 className="text-white font-semibold">Quick Note</h3>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Jot down a quick thought or idea..."
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary resize-none h-24"
      />

      <div className="flex items-center justify-between mt-3">
        {lastSaved && content ? (
          <span className="text-slate-500 text-xs">Draft saved</span>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
