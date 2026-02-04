import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { format } from 'date-fns';
import { notesApi } from '../api/notes';
import { tasksApi } from '../api/tasks';

const CATEGORIES = [
  { value: 'personal', label: 'Personal', icon: 'person' },
  { value: 'work', label: 'Work', icon: 'work' },
  { value: 'ideas', label: 'Ideas', icon: 'lightbulb' },
];

function MenuBar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-800/30">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">format_bold</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">format_italic</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">strikethrough_s</span>
      </button>
      <div className="w-px bg-slate-700 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">title</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">format_list_numbered</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('blockquote') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">format_quote</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('codeBlock') ? 'bg-slate-700 text-primary' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined text-lg">code</span>
      </button>
    </div>
  );
}

export default function NoteModal({ isOpen, onClose, onSave, onDelete, note = null, tags = [] }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [tagIds, setTagIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'max-w-none p-4 min-h-[200px] focus:outline-none text-white',
      },
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setCategory(note.category || 'personal');
      setTagIds(note.tags?.map(t => t.id) || []);
      if (editor) {
        editor.commands.setContent(note.content || '');
      }
    } else {
      setTitle('');
      setCategory('personal');
      setTagIds([]);
      if (editor) {
        editor.commands.setContent('');
      }
    }
    setErrors({});
  }, [note, isOpen, editor]);

  useEffect(() => {
    if (note?.id && isOpen) {
      notesApi.get(note.id).then(response => {
        const data = response.data;
        setLinkedTasks(data.linked_tasks || []);
      }).catch(console.error);

      tasksApi.getForDate(format(new Date(), 'yyyy-MM-dd')).then(response => {
        const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];
        setAvailableTasks(allTasks);
      }).catch(console.error);
    } else {
      setLinkedTasks([]);
      setShowTaskPicker(false);
    }
  }, [note?.id, isOpen]);

  const handleTagToggle = (tagId) => {
    setTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      content: editor?.getHTML() || '',
      category,
      tag_ids: tagIds,
    });
  };

  const handleDelete = () => {
    if (note && window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleLinkTask = async (taskId) => {
    if (!note?.id) return;
    try {
      await notesApi.linkTask(note.id, taskId);
      const task = availableTasks.find(t => t.id === taskId);
      if (task) {
        setLinkedTasks(prev => [...prev, task]);
      }
      setShowTaskPicker(false);
    } catch (error) {
      console.error('Failed to link task:', error);
    }
  };

  const handleUnlinkTask = async (taskId) => {
    if (!note?.id) return;
    try {
      await notesApi.unlinkTask(note.id, taskId);
      setLinkedTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to unlink task:', error);
    }
  };

  const getStatusIcon = (status) => {
    const icons = { backlog: 'inbox', in_progress: 'play_circle', partial: 'timelapse', done: 'check_circle' };
    return icons[status] || 'inbox';
  };

  const getStatusColor = (status) => {
    const colors = { backlog: 'text-slate-400', in_progress: 'text-blue-400', partial: 'text-orange-400', done: 'text-green-400' };
    return colors[status] || 'text-slate-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-[430px] max-h-[90vh] bg-background-dark border border-slate-800 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <h2 className="text-white font-semibold">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={handleSubmit}
            className="text-primary font-semibold hover:text-blue-400"
          >
            Save
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="p-4 pb-0">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
              placeholder="Note title"
              className={`w-full bg-slate-800/50 border ${errors.title ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="p-4">
            <label className="text-slate-400 text-sm mb-2 block">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    category === cat.value
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-4 pb-4">
              <label className="text-slate-400 text-sm mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      tagIds.includes(tag.id)
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    style={tagIds.includes(tag.id) && tag.color ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rich Text Editor */}
          <div className="px-4 pb-4">
            <label className="text-slate-400 text-sm mb-2 block">Content</label>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Linked Tasks - only show when editing */}
          {note && (
            <div className="px-4 pb-4">
              <label className="text-slate-400 text-sm mb-2 block">Linked Tasks</label>

              {/* Task list */}
              <div className="space-y-2 mb-3">
                {linkedTasks.length === 0 ? (
                  <p className="text-slate-500 text-sm">No linked tasks</p>
                ) : (
                  linkedTasks.map(task => (
                    <div key={task.id} className="bg-slate-800/50 rounded-lg p-3 group flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-base ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                        </span>
                        <div>
                          <p className="text-white text-sm">{task.title}</p>
                          <p className="text-slate-500 text-xs">
                            {task.status.replace('_', ' ')} · {format(new Date(task.scheduled_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlinkTask(task.id)}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Link task button */}
              <button
                type="button"
                onClick={() => setShowTaskPicker(!showTaskPicker)}
                className="w-full py-2 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Link to task
              </button>

              {/* Task picker dropdown */}
              {showTaskPicker && (
                <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                  {availableTasks.filter(t => !linkedTasks.find(lt => lt.id === t.id)).length === 0 ? (
                    <p className="text-slate-500 text-sm p-3">No tasks available to link</p>
                  ) : (
                    availableTasks
                      .filter(t => !linkedTasks.find(lt => lt.id === t.id))
                      .map(task => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleLinkTask(task.id)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <span className={`material-symbols-outlined text-base ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                          </span>
                          {task.title}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          {note && (
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
              >
                Delete Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
