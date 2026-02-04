import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';
import FloatingAddButton from '../components/FloatingAddButton';
import NoteModal from '../components/NoteModal';
import { notesApi } from '../api/notes';
import { tagsApi } from '../api/tags';

const CATEGORIES = [
  { value: null, label: 'All', icon: 'folder' },
  { value: 'personal', label: 'Personal', icon: 'person' },
  { value: 'work', label: 'Work', icon: 'work' },
  { value: 'ideas', label: 'Ideas', icon: 'lightbulb' },
];

const CATEGORY_COLORS = {
  personal: 'bg-blue-500/10 text-blue-400',
  work: 'bg-green-500/10 text-green-400',
  ideas: 'bg-purple-500/10 text-purple-400',
};

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadNotes();
    loadTags();
  }, [selectedCategory]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesApi.getAll(selectedCategory);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleNoteClick = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleSaveNote = async (noteData, files = []) => {
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, noteData, files);
      } else {
        await notesApi.create(noteData, files);
      }
      setModalOpen(false);
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await notesApi.delete(id);
      setModalOpen(false);
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getPreview = (content, maxLength = 100) => {
    const text = stripHtml(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      stripHtml(note.content).toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Header
        title="Notes Repository"
        leftIcon="notes"
        rightAction={
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined">
              {showSearch ? 'close' : 'search'}
            </span>
          </button>
        }
      />

      <main className="flex-1 pb-24">
        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value || 'all'}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Count */}
        <div className="px-4 py-2">
          <p className="text-slate-500 text-sm">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Notes Grid */}
        <div className="px-4 pb-4">
          {loading ? (
            <div className="text-center text-slate-400 py-12">
              <span className="material-symbols-outlined text-4xl mb-2 block animate-spin">progress_activity</span>
              <p>Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <span className="material-symbols-outlined text-6xl mb-4 block">notes</span>
              {searchQuery ? (
                <p>No notes matching "{searchQuery}"</p>
              ) : (
                <>
                  <p>No notes yet</p>
                  <p className="text-sm">Tap + to create a note</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  className="bg-[#1a2333] border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white font-semibold text-base line-clamp-1">
                      {note.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[note.category] || CATEGORY_COLORS.personal}`}>
                      {note.category}
                    </span>
                  </div>

                  {note.content && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                      {getPreview(note.content)}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {format(new Date(note.updated_at), 'MMM d, yyyy')}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                            style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingAddButton onClick={handleAddNote} />

      <NoteModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        note={editingNote}
        tags={tags}
      />
    </>
  );
}
