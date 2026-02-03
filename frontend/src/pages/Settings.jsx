import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { tagsApi } from '../api/tags';
import NotificationService from '../utils/notifications';

export default function Settings() {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#135bec');
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    setNotificationPermission(NotificationService.getPermission());
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      NotificationService.show('Notifications Enabled', {
        body: 'You will now receive task reminders',
      });
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await tagsApi.create({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      setNewTagColor('#135bec');
      loadTags();
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;

    try {
      await tagsApi.update(editingTag.id, { name: editingTag.name, color: editingTag.color });
      setEditingTag(null);
      loadTags();
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('Delete this tag? It will be removed from all tasks.')) return;

    try {
      await tagsApi.delete(id);
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const PRESET_COLORS = [
    '#135bec', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ];

  return (
    <>
      <Header
        title="Settings"
        leftIcon="settings"
      />
      <main className="flex-1 pb-24">
        {/* Notifications Section */}
        <section className="p-4 border-b border-slate-800">
          <h3 className="text-white text-lg font-bold mb-4">Notifications</h3>

          {!NotificationService.isSupported() ? (
            <div className="bg-slate-800/50 rounded-lg p-4 text-slate-400">
              <span className="material-symbols-outlined mr-2 align-middle">warning</span>
              Notifications are not supported in this browser
            </div>
          ) : notificationPermission === 'granted' ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500">notifications_active</span>
                <div>
                  <p className="text-white font-medium">Notifications Enabled</p>
                  <p className="text-slate-400 text-sm">You'll receive reminders for tasks</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">notifications_off</span>
                <div>
                  <p className="text-white font-medium">Notifications Blocked</p>
                  <p className="text-slate-400 text-sm">Please enable notifications in your browser settings</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">notifications</span>
              Enable Notifications
            </button>
          )}
        </section>

        {/* Tags Section */}
        <section className="p-4">
          <h3 className="text-white text-lg font-bold mb-4">Tags</h3>

          {/* Existing Tags */}
          <div className="space-y-2 mb-4">
            {tags.length === 0 ? (
              <p className="text-slate-400 text-sm">No tags created yet</p>
            ) : (
              tags.map(tag => (
                <div key={tag.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                  {editingTag?.id === tag.id ? (
                    <>
                      <input
                        type="color"
                        value={editingTag.color || '#135bec'}
                        onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateTag}
                        className="text-green-500 hover:text-green-400"
                      >
                        <span className="material-symbols-outlined">check</span>
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color || '#135bec' }}
                      />
                      <span className="flex-1 text-white">{tag.name}</span>
                      <button
                        onClick={() => setEditingTag({ ...tag })}
                        className="text-slate-400 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add New Tag */}
          <div className="bg-slate-800/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-3">Create new tag</p>
            <div className="flex gap-2 mb-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    newTagColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-background-dark' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="p-4 border-t border-slate-800">
          <h3 className="text-white text-lg font-bold mb-4">About</h3>
          <div className="text-slate-400 text-sm space-y-2">
            <p>Tusk - Personal Task Manager</p>
            <p>Version 1.0.0</p>
          </div>
        </section>
      </main>
    </>
  );
}
