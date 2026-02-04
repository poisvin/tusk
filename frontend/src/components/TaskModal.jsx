import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { tasksApi } from '../api/tasks';
import { notesApi } from '../api/notes';

const CATEGORIES = [
  { value: 'personal', label: 'Personal' },
  { value: 'official', label: 'Official' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
];

const RECURRENCES = [
  { value: 'one_time', label: 'One time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const WEEK_DAYS = [
  { value: 'sunday', label: 'Sun' },
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
];

const STATUSES = [
  { value: 'backlog', label: 'Backlog', icon: 'inbox', color: 'text-slate-400' },
  { value: 'in_progress', label: 'In Progress', icon: 'play_circle', color: 'text-blue-400' },
  { value: 'partial', label: 'Partial', icon: 'timelapse', color: 'text-orange-400' },
  { value: 'done', label: 'Done', icon: 'check_circle', color: 'text-green-400' },
];

function MenuBar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-800/30">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-base">format_bold</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-base">format_italic</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-base">format_list_bulleted</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-base">format_list_numbered</span>
      </button>
    </div>
  );
}

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task = null, tags = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    category: 'personal',
    priority: 'medium',
    recurrence: 'one_time',
    weekly_days: [],
    status: 'backlog',
    remind: false,
    tag_ids: [],
  });

  const [errors, setErrors] = useState({});
  const [taskUpdates, setTaskUpdates] = useState([]);
  const [linkedNotes, setLinkedNotes] = useState([]);
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [showNotePicker, setShowNotePicker] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'max-w-none p-3 min-h-[80px] focus:outline-none text-white',
      },
    },
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        scheduled_date: task.scheduled_date || format(new Date(), 'yyyy-MM-dd'),
        start_time: task.start_time ? task.start_time.slice(11, 16) : '',
        end_time: task.end_time ? task.end_time.slice(11, 16) : '',
        category: task.category || 'personal',
        priority: task.priority || 'medium',
        recurrence: task.recurrence || 'one_time',
        weekly_days: task.weekly_days || [],
        status: task.status || 'backlog',
        remind: task.remind || false,
        tag_ids: task.tags?.map(t => t.id) || [],
      });
      if (editor) {
        editor.commands.setContent(task.description || '');
      }
    } else {
      setFormData({
        title: '',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '',
        end_time: '',
        category: 'personal',
        priority: 'medium',
        recurrence: 'one_time',
        weekly_days: [],
        status: 'backlog',
        remind: false,
        tag_ids: [],
      });
      if (editor) {
        editor.commands.setContent('');
      }
    }
    setErrors({});
  }, [task, isOpen, editor]);

  useEffect(() => {
    if (task?.id && isOpen) {
      tasksApi.get(task.id).then(response => {
        const data = response.data;
        setTaskUpdates(data.task_updates || []);
        setLinkedNotes(data.linked_notes || []);
      }).catch(console.error);

      notesApi.getAll().then(response => {
        setAvailableNotes(response.data || []);
      }).catch(console.error);
    } else {
      setTaskUpdates([]);
      setLinkedNotes([]);
      setNewUpdateContent('');
      setShowNotePicker(false);
    }
  }, [task?.id, isOpen]);

  const handleWeekDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      weekly_days: prev.weekly_days.includes(day)
        ? prev.weekly_days.filter(d => d !== day)
        : [...prev.weekly_days, day],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleAddUpdate = async () => {
    if (!newUpdateContent.trim() || !task?.id) return;
    try {
      const response = await tasksApi.addUpdate(task.id, newUpdateContent.trim());
      setTaskUpdates(prev => [response.data, ...prev]);
      setNewUpdateContent('');
    } catch (error) {
      console.error('Failed to add update:', error);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    if (!task?.id) return;
    try {
      await tasksApi.deleteUpdate(task.id, updateId);
      setTaskUpdates(prev => prev.filter(u => u.id !== updateId));
    } catch (error) {
      console.error('Failed to delete update:', error);
    }
  };

  const handleLinkNote = async (noteId) => {
    if (!task?.id) return;
    try {
      await tasksApi.linkNote(task.id, noteId);
      const note = availableNotes.find(n => n.id === noteId);
      if (note) {
        setLinkedNotes(prev => [note, ...prev]);
      }
      setShowNotePicker(false);
    } catch (error) {
      console.error('Failed to link note:', error);
    }
  };

  const handleUnlinkNote = async (noteId) => {
    if (!task?.id) return;
    try {
      await tasksApi.unlinkNote(task.id, noteId);
      setLinkedNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to unlink note:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      description: editor?.getHTML() || '',
    };
    if (submitData.start_time) {
      submitData.start_time = `${submitData.scheduled_date}T${submitData.start_time}:00`;
    } else {
      submitData.start_time = null;
    }
    if (submitData.end_time) {
      submitData.end_time = `${submitData.scheduled_date}T${submitData.end_time}:00`;
    } else {
      submitData.end_time = null;
    }

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-[430px] max-h-[90vh] bg-background-dark border border-slate-800 rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <h2 className="text-white font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={handleSubmit}
            className="text-primary font-semibold hover:text-blue-400"
          >
            Save
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task title"
              className={`w-full bg-slate-800/50 border ${errors.title ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description with Rich Text */}
          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Description (optional)</label>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden focus-within:border-primary">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Date</label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Time Range */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Start Time</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">End Time</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    formData.category === cat.value
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    formData.priority === p.value
                      ? `bg-slate-800 border-slate-600 ${p.color}`
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status - only show when editing */}
          {task && (
            <div className="mb-4">
              <label className="text-slate-400 text-sm mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: s.value }))}
                    className={`py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      formData.status === s.value
                        ? `bg-slate-800 border-slate-600 ${s.color}`
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Notes - only show when editing */}
          {task && (
            <div className="mb-4">
              <label className="text-slate-400 text-sm mb-2 block">Progress Notes</label>

              {/* Add note input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newUpdateContent}
                  onChange={(e) => setNewUpdateContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUpdate())}
                  placeholder="Add a note..."
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddUpdate}
                  disabled={!newUpdateContent.trim()}
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotePicker(!showNotePicker)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Link a note"
                >
                  <span className="material-symbols-outlined text-base">attach_file</span>
                </button>
              </div>

              {/* Note picker dropdown */}
              {showNotePicker && (
                <div className="mb-3 bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                  {availableNotes.filter(n => !linkedNotes.find(ln => ln.id === n.id)).length === 0 ? (
                    <p className="text-slate-500 text-sm p-3">No notes available to link</p>
                  ) : (
                    availableNotes
                      .filter(n => !linkedNotes.find(ln => ln.id === n.id))
                      .map(note => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleLinkNote(note.id)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base text-slate-500">description</span>
                          {note.title}
                        </button>
                      ))
                  )}
                </div>
              )}

              {/* Updates and linked notes list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[
                  ...taskUpdates.map(u => ({ type: 'update', data: u, date: new Date(u.created_at) })),
                  ...linkedNotes.map(n => ({ type: 'note', data: n, date: new Date(n.created_at) }))
                ]
                  .sort((a, b) => b.date - a.date)
                  .map((item) => (
                    item.type === 'update' ? (
                      <div key={`update-${item.data.id}`} className="bg-slate-800/50 rounded-lg p-3 group">
                        <p className="text-white text-sm">{item.data.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-slate-500 text-xs">
                            {formatDistanceToNow(item.date, { addSuffix: true })}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteUpdate(item.data.id)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={`note-${item.data.id}`} className="bg-slate-800/50 rounded-lg p-3 group border border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">description</span>
                          <span className="text-white text-sm font-medium flex-1">{item.data.title}</span>
                          <button
                            type="button"
                            onClick={() => handleUnlinkNote(item.data.id)}
                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <span className="text-slate-500 text-xs">
                          Linked {formatDistanceToNow(item.date, { addSuffix: true })}
                        </span>
                      </div>
                    )
                  ))
                }

                {taskUpdates.length === 0 && linkedNotes.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-2">No progress notes yet</p>
                )}
              </div>
            </div>
          )}

          {/* Recurrence */}
          <div className="mb-4">
            <label className="text-slate-400 text-sm mb-2 block">Repeat</label>
            <select
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            >
              {RECURRENCES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Weekly Days Selector - only show when weekly is selected */}
          {formData.recurrence === 'weekly' && (
            <div className="mb-4">
              <label className="text-slate-400 text-sm mb-2 block">On which days?</label>
              <div className="flex gap-1">
                {WEEK_DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleWeekDayToggle(day.value)}
                    className={`flex-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                      formData.weekly_days.includes(day.value)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {formData.weekly_days.length === 0 && (
                <p className="text-slate-500 text-xs mt-1">Select at least one day (defaults to same day each week)</p>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-4">
              <label className="text-slate-400 text-sm mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.tag_ids.includes(tag.id)
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    style={formData.tag_ids.includes(tag.id) && tag.color ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder */}
          <div className="mb-4 flex items-center justify-between">
            <label className="text-white">Remind me</label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, remind: !prev.remind }))}
              className={`w-12 h-6 rounded-full transition-all ${
                formData.remind ? 'bg-primary' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                formData.remind ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Delete Button - only when editing */}
          {task && onDelete && (
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                  }
                }}
                className="w-full py-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">delete</span>
                Delete Task
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
