import client from './client';

export const notesApi = {
  getAll: (category) => client.get('/notes', { params: { category } }),
  get: (id) => client.get(`/notes/${id}`),

  create: (note, files = []) => {
    if (files.length === 0) {
      return client.post('/notes', { note });
    }
    const formData = new FormData();
    formData.append('note[title]', note.title);
    formData.append('note[content]', note.content || '');
    formData.append('note[category]', note.category);
    if (note.tag_ids) {
      note.tag_ids.forEach(id => formData.append('note[tag_ids][]', id));
    }
    files.forEach(file => formData.append('note[attachments][]', file));
    return client.post('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  update: (id, note, newFiles = []) => {
    if (newFiles.length === 0) {
      return client.patch(`/notes/${id}`, { note });
    }
    const formData = new FormData();
    formData.append('note[title]', note.title);
    formData.append('note[content]', note.content || '');
    formData.append('note[category]', note.category);
    if (note.tag_ids) {
      note.tag_ids.forEach(id => formData.append('note[tag_ids][]', id));
    }
    newFiles.forEach(file => formData.append('note[attachments][]', file));
    return client.patch(`/notes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  delete: (id) => client.delete(`/notes/${id}`),

  // Attachments
  deleteAttachment: (noteId, attachmentId) =>
    client.delete(`/notes/${noteId}/attachments/${attachmentId}`),

  // Linked Tasks
  linkTask: (noteId, taskId) => client.post(`/tasks/${taskId}/linked_notes`, { note_id: noteId }),
  unlinkTask: (noteId, taskId) => client.delete(`/tasks/${taskId}/linked_notes/${noteId}`),
};
