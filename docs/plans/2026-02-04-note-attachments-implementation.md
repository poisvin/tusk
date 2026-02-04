# Note Attachments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add file attachment capability to Notes using Active Storage with local disk storage.

**Architecture:** Rails Active Storage for file handling, nested route for attachment deletion, multipart form for uploads, drag & drop UI in NoteModal.

**Tech Stack:** Rails 7 Active Storage, React 18, Axios multipart/form-data

---

## Task 1: Install Active Storage

**Files:**
- Create: `db/migrate/xxx_create_active_storage_tables.rb`
- Modify: `config/environments/development.rb`
- Modify: `config/environments/test.rb`

**Step 1: Install Active Storage**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails active_storage:install`

**Step 2: Run migration**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate`

**Step 3: Verify storage config exists**

Check `config/storage.yml` has local service configured (it does).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: install Active Storage"
```

---

## Task 2: Add Attachments to Note Model

**Files:**
- Modify: `app/models/note.rb`
- Create: `spec/models/note_attachments_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/models/note_attachments_spec.rb
require 'rails_helper'

RSpec.describe 'Note Attachments', type: :model do
  describe 'attachments' do
    it 'can have multiple attachments' do
      note = create(:note)

      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
      note.attachments.attach(
        io: StringIO.new("another file"),
        filename: "test2.txt",
        content_type: "text/plain"
      )

      expect(note.attachments.count).to eq(2)
    end

    it 'destroys attachments when note is destroyed' do
      note = create(:note)
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )

      attachment_id = note.attachments.first.id
      note.destroy

      expect(ActiveStorage::Attachment.exists?(attachment_id)).to be false
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/note_attachments_spec.rb`
Expected: FAIL - undefined method `attachments'

**Step 3: Add attachments to Note model**

```ruby
# app/models/note.rb
class Note < ApplicationRecord
  has_and_belongs_to_many :tags
  has_and_belongs_to_many :tasks
  has_many_attached :attachments

  validates :title, presence: true

  enum :category, { personal: 0, work: 1, ideas: 2 }
end
```

**Step 4: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/note_attachments_spec.rb`
Expected: PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add attachments to Note model"
```

---

## Task 3: Create Attachment Blueprint

**Files:**
- Create: `app/blueprints/attachment_blueprint.rb`

**Step 1: Create blueprint**

```ruby
# app/blueprints/attachment_blueprint.rb
class AttachmentBlueprint < Blueprinter::Base
  identifier :id

  field :filename do |attachment|
    attachment.filename.to_s
  end

  field :content_type do |attachment|
    attachment.content_type
  end

  field :byte_size do |attachment|
    attachment.byte_size
  end

  field :url do |attachment, options|
    Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
  end
end
```

**Step 2: Update NoteBlueprint to include attachments**

```ruby
# app/blueprints/note_blueprint.rb
class NoteBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :content, :category, :created_at, :updated_at
  association :tags, blueprint: TagBlueprint
  association :tasks, blueprint: LinkedTaskBlueprint, name: :linked_tasks

  field :attachments do |note|
    note.attachments.map do |attachment|
      AttachmentBlueprint.render_as_hash(attachment)
    end
  end
end
```

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add AttachmentBlueprint for serializing attachments"
```

---

## Task 4: Update Notes Controller for Attachments

**Files:**
- Modify: `app/controllers/api/v1/notes_controller.rb`
- Create: `spec/requests/api/v1/note_attachments_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/requests/api/v1/note_attachments_spec.rb
require 'rails_helper'

RSpec.describe "Note Attachments API", type: :request do
  describe "POST /api/v1/notes with attachments" do
    it "creates a note with attachments" do
      file = fixture_file_upload(
        Rails.root.join('spec/fixtures/files/test.txt'),
        'text/plain'
      )

      post "/api/v1/notes", params: {
        note: {
          title: "Note with file",
          content: "Content here",
          category: "work",
          attachments: [file]
        }
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["attachments"].length).to eq(1)
      expect(json["attachments"][0]["filename"]).to eq("test.txt")
    end
  end

  describe "PATCH /api/v1/notes/:id with attachments" do
    let(:note) { create(:note) }

    it "adds attachments to existing note" do
      file = fixture_file_upload(
        Rails.root.join('spec/fixtures/files/test.txt'),
        'text/plain'
      )

      patch "/api/v1/notes/#{note.id}", params: {
        note: { attachments: [file] }
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["attachments"].length).to eq(1)
    end
  end

  describe "DELETE /api/v1/notes/:id/attachments/:attachment_id" do
    let(:note) { create(:note) }

    before do
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
    end

    it "removes an attachment from a note" do
      attachment_id = note.attachments.first.id

      delete "/api/v1/notes/#{note.id}/attachments/#{attachment_id}"

      expect(response).to have_http_status(:no_content)
      expect(note.reload.attachments.count).to eq(0)
    end
  end

  describe "GET /api/v1/notes/:id" do
    let(:note) { create(:note) }

    before do
      note.attachments.attach(
        io: StringIO.new("file content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
    end

    it "includes attachments in response" do
      get "/api/v1/notes/#{note.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["attachments"]).to be_an(Array)
      expect(json["attachments"].length).to eq(1)
      expect(json["attachments"][0]).to include(
        "filename" => "test.txt",
        "content_type" => "text/plain"
      )
    end
  end
end
```

**Step 2: Create test fixture file**

Run: `mkdir -p /Users/vinu/src/clients/c9s/tusk/spec/fixtures/files && echo "test file content" > /Users/vinu/src/clients/c9s/tusk/spec/fixtures/files/test.txt`

**Step 3: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/note_attachments_spec.rb`
Expected: FAIL - attachments not in permitted params

**Step 4: Update NotesController**

```ruby
# app/controllers/api/v1/notes_controller.rb
module Api
  module V1
    class NotesController < ApplicationController
      def index
        notes = Note.includes(:tags, :tasks).with_attached_attachments.order(updated_at: :desc)
        notes = notes.where(category: params[:category]) if params[:category].present?
        render json: NoteBlueprint.render(notes)
      end

      def show
        note = Note.includes(:tags, :tasks).with_attached_attachments.find(params[:id])
        render json: NoteBlueprint.render(note)
      end

      def create
        note = Note.new(note_params)
        if note.save
          render json: NoteBlueprint.render(note), status: :created
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        note = Note.find(params[:id])
        if note.update(note_params)
          render json: NoteBlueprint.render(note)
        else
          render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        note = Note.find(params[:id])
        note.destroy
        head :no_content
      end

      def destroy_attachment
        note = Note.find(params[:id])
        attachment = note.attachments.find(params[:attachment_id])
        attachment.purge
        head :no_content
      end

      private

      def note_params
        params.require(:note).permit(:title, :content, :category, tag_ids: [], attachments: [])
      end
    end
  end
end
```

**Step 5: Add route for attachment deletion**

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tasks do
        resources :updates, controller: 'task_updates', only: [:index, :create, :destroy]
        resources :linked_notes, only: [:create, :destroy]
      end
      resources :tags, except: [:show]
      resources :notes do
        delete 'attachments/:attachment_id', to: 'notes#destroy_attachment', on: :member
      end
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
```

**Step 6: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/note_attachments_spec.rb`
Expected: PASS

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add attachment upload and delete to Notes API"
```

---

## Task 5: Update Frontend API Client

**Files:**
- Modify: `frontend/src/api/notes.js`

**Step 1: Update notes API for file uploads**

```javascript
// frontend/src/api/notes.js
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
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add file upload support to notes API client"
```

---

## Task 6: Add Attachments UI to NoteModal

**Files:**
- Modify: `frontend/src/components/NoteModal.jsx`

**Step 1: Add state for attachments**

Add after existing state declarations (around line 87):
```javascript
const [attachments, setAttachments] = useState([]);
const [newFiles, setNewFiles] = useState([]);
const [isDragging, setIsDragging] = useState(false);
```

**Step 2: Update useEffect to load attachments**

Update the existing useEffect that loads note data (around line 99-116):
```javascript
useEffect(() => {
  if (note) {
    setTitle(note.title || '');
    setCategory(note.category || 'personal');
    setTagIds(note.tags?.map(t => t.id) || []);
    setAttachments(note.attachments || []);
    if (editor) {
      editor.commands.setContent(note.content || '');
    }
  } else {
    setTitle('');
    setCategory('personal');
    setTagIds([]);
    setAttachments([]);
    setNewFiles([]);
    if (editor) {
      editor.commands.setContent('');
    }
  }
  setErrors({});
}, [note, isOpen, editor]);
```

**Step 3: Add file handlers**

Add after existing handlers (around line 200):
```javascript
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  setNewFiles(prev => [...prev, ...files]);
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const files = Array.from(e.dataTransfer.files);
  setNewFiles(prev => [...prev, ...files]);
};

const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  setIsDragging(false);
};

const handleRemoveNewFile = (index) => {
  setNewFiles(prev => prev.filter((_, i) => i !== index));
};

const handleDeleteAttachment = async (attachmentId) => {
  if (!note?.id) return;
  try {
    await notesApi.deleteAttachment(note.id, attachmentId);
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  } catch (error) {
    console.error('Failed to delete attachment:', error);
  }
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (contentType) => {
  if (contentType?.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'picture_as_pdf';
  return 'attach_file';
};
```

**Step 4: Update handleSubmit to pass files**

Update the onSave call in handleSubmit:
```javascript
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
  }, newFiles);
};
```

**Step 5: Add Attachments section JSX**

Add after Content editor section (around line 302), before Linked Tasks:
```jsx
{/* Attachments */}
<div className="px-4 pb-4">
  <label className="text-slate-400 text-sm mb-2 block">Attachments</label>

  {/* Drop zone */}
  <div
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onClick={() => document.getElementById('file-input').click()}
    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-3 ${
      isDragging
        ? 'border-primary bg-primary/10'
        : 'border-slate-700 hover:border-slate-600'
    }`}
  >
    <input
      id="file-input"
      type="file"
      multiple
      onChange={handleFileSelect}
      className="hidden"
    />
    <span className="material-symbols-outlined text-3xl text-slate-500 mb-2 block">
      upload_file
    </span>
    <p className="text-slate-400 text-sm">
      Drop files here or click to browse
    </p>
  </div>

  {/* Existing attachments */}
  {attachments.length > 0 && (
    <div className="space-y-2 mb-3">
      {attachments.map(attachment => (
        <div key={attachment.id} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400">
              {getFileIcon(attachment.content_type)}
            </span>
            <div>
              <p className="text-white text-sm">{attachment.filename}</p>
              <p className="text-slate-500 text-xs">{formatFileSize(attachment.byte_size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDeleteAttachment(attachment.id)}
            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  )}

  {/* New files to upload */}
  {newFiles.length > 0 && (
    <div className="space-y-2">
      <p className="text-slate-500 text-xs">Files to upload:</p>
      {newFiles.map((file, index) => (
        <div key={index} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between group border border-primary/30">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              {getFileIcon(file.type)}
            </span>
            <div>
              <p className="text-white text-sm">{file.name}</p>
              <p className="text-slate-500 text-xs">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveNewFile(index)}
            className="text-slate-600 hover:text-red-400"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add attachments UI to NoteModal"
```

---

## Task 7: Update Notes Page to Handle File Uploads

**Files:**
- Modify: `frontend/src/pages/Notes.jsx`

**Step 1: Update handleSaveNote to pass files**

Find the `handleSaveNote` function and update it:
```javascript
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
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: handle file uploads in Notes page"
```

---

## Task 8: Final Testing and Push

**Step 1: Run all backend tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec`
Expected: All tests pass

**Step 2: Manual E2E test**

1. Start backend: `bin/rails s`
2. Start frontend: `cd frontend && npm run dev`
3. Create a new note with attachments
4. Edit note, add more attachments
5. Delete an attachment
6. Verify files are saved and displayed correctly

**Step 3: Push to remote**

```bash
git push origin main
```
