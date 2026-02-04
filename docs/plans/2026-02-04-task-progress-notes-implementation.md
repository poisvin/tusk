# Task Progress Notes & Note Linking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add progress tracking to tasks with quick timestamped notes and two-way linking between Tasks and Notes.

**Architecture:** New TaskUpdate model for progress notes, join table for Task-Note linking, nested routes for APIs, frontend components for progress notes in TaskModal and linked tasks in NoteModal.

**Tech Stack:** Rails 7 API, PostgreSQL, React 18, Blueprinter, date-fns

---

## Task 1: Create TaskUpdate Model

**Files:**
- Create: `db/migrate/XXXXXX_create_task_updates.rb`
- Create: `app/models/task_update.rb`
- Create: `spec/models/task_update_spec.rb`
- Create: `spec/factories/task_updates.rb`
- Modify: `app/models/task.rb`

**Step 1: Write failing test**

```ruby
# spec/models/task_update_spec.rb
require 'rails_helper'

RSpec.describe TaskUpdate, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:content) }
  end

  describe 'associations' do
    it { should belong_to(:task) }
  end

  describe 'ordering' do
    it 'orders by created_at descending (newest first)' do
      task = create(:task)
      old_update = create(:task_update, task: task, created_at: 2.hours.ago)
      new_update = create(:task_update, task: task, created_at: 1.hour.ago)

      expect(task.task_updates).to eq([new_update, old_update])
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/task_update_spec.rb`
Expected: FAIL - uninitialized constant TaskUpdate

**Step 3: Generate migration**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g migration CreateTaskUpdates task:references content:text`

**Step 4: Update migration for null constraint**

```ruby
# db/migrate/XXXXXX_create_task_updates.rb
class CreateTaskUpdates < ActiveRecord::Migration[7.1]
  def change
    create_table :task_updates do |t|
      t.references :task, null: false, foreign_key: true
      t.text :content, null: false

      t.timestamps
    end
  end
end
```

**Step 5: Create model**

```ruby
# app/models/task_update.rb
class TaskUpdate < ApplicationRecord
  belongs_to :task

  validates :content, presence: true

  default_scope { order(created_at: :desc) }
end
```

**Step 6: Create factory**

```ruby
# spec/factories/task_updates.rb
FactoryBot.define do
  factory :task_update do
    task
    content { "Progress update" }
  end
end
```

**Step 7: Update Task model**

```ruby
# app/models/task.rb - add after line 6 (after recurrence_children)
has_many :task_updates, dependent: :destroy
```

**Step 8: Run migration and tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/task_update_spec.rb`
Expected: PASS

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: add TaskUpdate model for progress notes"
```

---

## Task 2: Create Notes-Tasks Join Table

**Files:**
- Create: `db/migrate/XXXXXX_create_notes_tasks_join_table.rb`
- Modify: `app/models/task.rb`
- Modify: `app/models/note.rb`
- Create: `spec/models/task_note_linking_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/models/task_note_linking_spec.rb
require 'rails_helper'

RSpec.describe 'Task-Note Linking', type: :model do
  describe 'Task' do
    it 'can have many linked notes' do
      task = create(:task)
      note1 = create(:note)
      note2 = create(:note)

      task.notes << note1
      task.notes << note2

      expect(task.notes).to contain_exactly(note1, note2)
    end
  end

  describe 'Note' do
    it 'can have many linked tasks' do
      note = create(:note)
      task1 = create(:task)
      task2 = create(:task)

      note.tasks << task1
      note.tasks << task2

      expect(note.tasks).to contain_exactly(task1, task2)
    end
  end

  describe 'bidirectional linking' do
    it 'reflects link from both sides' do
      task = create(:task)
      note = create(:note)

      task.notes << note

      expect(note.tasks).to include(task)
      expect(task.notes).to include(note)
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/task_note_linking_spec.rb`
Expected: FAIL - undefined method `notes' for Task

**Step 3: Generate join table migration**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g migration CreateJoinTableNotesTasks notes tasks`

**Step 4: Update migration with indexes**

```ruby
# db/migrate/XXXXXX_create_join_table_notes_tasks.rb
class CreateJoinTableNotesTasks < ActiveRecord::Migration[7.1]
  def change
    create_join_table :notes, :tasks do |t|
      t.index [:note_id, :task_id], unique: true
      t.index [:task_id, :note_id]
    end
  end
end
```

**Step 5: Update Task model**

```ruby
# app/models/task.rb - add after task_updates association
has_and_belongs_to_many :notes
```

**Step 6: Update Note model**

```ruby
# app/models/note.rb - add after tags association
has_and_belongs_to_many :tasks
```

**Step 7: Run migration and tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/task_note_linking_spec.rb`
Expected: PASS

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add Task-Note bidirectional linking"
```

---

## Task 3: Create TaskUpdates API Controller

**Files:**
- Create: `app/controllers/api/v1/task_updates_controller.rb`
- Create: `app/blueprints/task_update_blueprint.rb`
- Create: `spec/requests/api/v1/task_updates_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing test**

```ruby
# spec/requests/api/v1/task_updates_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::TaskUpdates", type: :request do
  let(:task) { create(:task) }

  describe "GET /api/v1/tasks/:task_id/updates" do
    it "returns task updates newest first" do
      old_update = create(:task_update, task: task, content: "First", created_at: 2.hours.ago)
      new_update = create(:task_update, task: task, content: "Second", created_at: 1.hour.ago)

      get "/api/v1/tasks/#{task.id}/updates"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
      expect(json[0]["content"]).to eq("Second")
      expect(json[1]["content"]).to eq("First")
    end
  end

  describe "POST /api/v1/tasks/:task_id/updates" do
    it "creates a new task update" do
      post "/api/v1/tasks/#{task.id}/updates", params: {
        task_update: { content: "Started working on this" }
      }

      expect(response).to have_http_status(:created)
      expect(task.task_updates.count).to eq(1)
      expect(task.task_updates.first.content).to eq("Started working on this")
    end

    it "returns error for blank content" do
      post "/api/v1/tasks/#{task.id}/updates", params: {
        task_update: { content: "" }
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/tasks/:task_id/updates/:id" do
    it "deletes a task update" do
      update = create(:task_update, task: task)

      delete "/api/v1/tasks/#{task.id}/updates/#{update.id}"

      expect(response).to have_http_status(:no_content)
      expect(TaskUpdate.exists?(update.id)).to be false
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/task_updates_spec.rb`
Expected: FAIL - No route matches

**Step 3: Add routes**

```ruby
# config/routes.rb - replace resources :tasks with:
resources :tasks do
  resources :updates, controller: 'task_updates', only: [:index, :create, :destroy]
  resources :linked_notes, only: [:create, :destroy]
end
```

**Step 4: Create blueprint**

```ruby
# app/blueprints/task_update_blueprint.rb
class TaskUpdateBlueprint < Blueprinter::Base
  identifier :id

  fields :content, :created_at
end
```

**Step 5: Create controller**

```ruby
# app/controllers/api/v1/task_updates_controller.rb
module Api
  module V1
    class TaskUpdatesController < ApplicationController
      before_action :set_task

      def index
        updates = @task.task_updates
        render json: TaskUpdateBlueprint.render(updates)
      end

      def create
        update = @task.task_updates.build(task_update_params)
        if update.save
          render json: TaskUpdateBlueprint.render(update), status: :created
        else
          render json: { errors: update.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        update = @task.task_updates.find(params[:id])
        update.destroy
        head :no_content
      end

      private

      def set_task
        @task = Task.find(params[:task_id])
      end

      def task_update_params
        params.require(:task_update).permit(:content)
      end
    end
  end
end
```

**Step 6: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/task_updates_spec.rb`
Expected: PASS

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add TaskUpdates API endpoints"
```

---

## Task 4: Create LinkedNotes API Controller

**Files:**
- Create: `app/controllers/api/v1/linked_notes_controller.rb`
- Create: `spec/requests/api/v1/linked_notes_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/requests/api/v1/linked_notes_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::LinkedNotes", type: :request do
  let(:task) { create(:task) }
  let(:note) { create(:note) }

  describe "POST /api/v1/tasks/:task_id/linked_notes" do
    it "links a note to a task" do
      post "/api/v1/tasks/#{task.id}/linked_notes", params: {
        note_id: note.id
      }

      expect(response).to have_http_status(:created)
      expect(task.notes).to include(note)
      expect(note.tasks).to include(task)
    end

    it "does not duplicate links" do
      task.notes << note

      post "/api/v1/tasks/#{task.id}/linked_notes", params: {
        note_id: note.id
      }

      expect(response).to have_http_status(:ok)
      expect(task.notes.count).to eq(1)
    end
  end

  describe "DELETE /api/v1/tasks/:task_id/linked_notes/:id" do
    it "unlinks a note from a task" do
      task.notes << note

      delete "/api/v1/tasks/#{task.id}/linked_notes/#{note.id}"

      expect(response).to have_http_status(:no_content)
      expect(task.notes).not_to include(note)
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/linked_notes_spec.rb`
Expected: FAIL - No route matches (partially, routes exist but controller doesn't)

**Step 3: Create controller**

```ruby
# app/controllers/api/v1/linked_notes_controller.rb
module Api
  module V1
    class LinkedNotesController < ApplicationController
      before_action :set_task

      def create
        note = Note.find(params[:note_id])

        if @task.notes.include?(note)
          render json: { message: "Note already linked" }, status: :ok
        else
          @task.notes << note
          render json: NoteBlueprint.render(note), status: :created
        end
      end

      def destroy
        note = @task.notes.find(params[:id])
        @task.notes.delete(note)
        head :no_content
      end

      private

      def set_task
        @task = Task.find(params[:task_id])
      end
    end
  end
end
```

**Step 4: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/linked_notes_spec.rb`
Expected: PASS

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add LinkedNotes API endpoints"
```

---

## Task 5: Update Task and Note Show Endpoints

**Files:**
- Modify: `app/blueprints/task_blueprint.rb`
- Modify: `app/blueprints/note_blueprint.rb`
- Modify: `app/controllers/api/v1/tasks_controller.rb`
- Modify: `app/controllers/api/v1/notes_controller.rb`

**Step 1: Update TaskBlueprint**

```ruby
# app/blueprints/task_blueprint.rb
class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :scheduled_date, :start_time, :end_time,
         :status, :priority, :category, :recurrence, :remind, :carried_over,
         :original_date, :weekly_days, :recurrence_parent_id, :created_at, :updated_at

  association :tags, blueprint: TagBlueprint
  association :task_updates, blueprint: TaskUpdateBlueprint
  association :notes, blueprint: NoteBlueprint, name: :linked_notes
end
```

**Step 2: Create LinkedTaskBlueprint to avoid circular reference**

```ruby
# app/blueprints/linked_task_blueprint.rb
class LinkedTaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :status, :scheduled_date
end
```

**Step 3: Update NoteBlueprint**

```ruby
# app/blueprints/note_blueprint.rb
class NoteBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :content, :category, :created_at, :updated_at
  association :tags, blueprint: TagBlueprint
  association :tasks, blueprint: LinkedTaskBlueprint, name: :linked_tasks
end
```

**Step 4: Update TasksController#show to include associations**

```ruby
# app/controllers/api/v1/tasks_controller.rb - update show method
def show
  task = Task.includes(:tags, :task_updates, :notes).find(params[:id])
  render json: TaskBlueprint.render(task)
end
```

**Step 5: Update NotesController#show to include associations**

```ruby
# app/controllers/api/v1/notes_controller.rb - update show method
def show
  note = Note.includes(:tags, :tasks).find(params[:id])
  render json: NoteBlueprint.render(note)
end
```

**Step 6: Test manually**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails c`
```ruby
task = Task.create!(title: "Test", scheduled_date: Date.today)
task.task_updates.create!(content: "Progress 1")
note = Note.create!(title: "Meeting notes")
task.notes << note
puts TaskBlueprint.render(task)
```
Expected: JSON includes task_updates and linked_notes

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: include task_updates and linked_notes in API responses"
```

---

## Task 6: Update Frontend API Client

**Files:**
- Modify: `frontend/src/api/tasks.js`

**Step 1: Add new API methods**

```javascript
// frontend/src/api/tasks.js
import client from './client';

export const tasksApi = {
  getForDate: (date) => client.get('/tasks', { params: { date } }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (task) => client.post('/tasks', { task }),
  update: (id, task) => client.patch(`/tasks/${id}`, { task }),
  delete: (id) => client.delete(`/tasks/${id}`),

  // Task Updates (progress notes)
  getUpdates: (taskId) => client.get(`/tasks/${taskId}/updates`),
  addUpdate: (taskId, content) => client.post(`/tasks/${taskId}/updates`, { task_update: { content } }),
  deleteUpdate: (taskId, updateId) => client.delete(`/tasks/${taskId}/updates/${updateId}`),

  // Linked Notes
  linkNote: (taskId, noteId) => client.post(`/tasks/${taskId}/linked_notes`, { note_id: noteId }),
  unlinkNote: (taskId, noteId) => client.delete(`/tasks/${taskId}/linked_notes/${noteId}`),
};
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add task updates and linked notes to frontend API client"
```

---

## Task 7: Add Progress Notes Section to TaskModal

**Files:**
- Modify: `frontend/src/components/TaskModal.jsx`

**Step 1: Add state and imports**

At the top of the component, add:
```javascript
import { formatDistanceToNow } from 'date-fns';
```

Inside the component function, add state:
```javascript
const [taskUpdates, setTaskUpdates] = useState([]);
const [linkedNotes, setLinkedNotes] = useState([]);
const [newUpdateContent, setNewUpdateContent] = useState('');
const [showNotePicker, setShowNotePicker] = useState(false);
const [availableNotes, setAvailableNotes] = useState([]);
```

**Step 2: Add useEffect to load task details when editing**

```javascript
useEffect(() => {
  if (task?.id && isOpen) {
    // Load full task details including updates and linked notes
    tasksApi.get(task.id).then(response => {
      const data = JSON.parse(response.data);
      setTaskUpdates(data.task_updates || []);
      setLinkedNotes(data.linked_notes || []);
    }).catch(console.error);

    // Load available notes for linking
    notesApi.getAll().then(response => {
      setAvailableNotes(response.data || []);
    }).catch(console.error);
  } else {
    setTaskUpdates([]);
    setLinkedNotes([]);
    setNewUpdateContent('');
  }
}, [task?.id, isOpen]);
```

**Step 3: Add handlers**

```javascript
const handleAddUpdate = async () => {
  if (!newUpdateContent.trim() || !task?.id) return;

  try {
    const response = await tasksApi.addUpdate(task.id, newUpdateContent.trim());
    const newUpdate = JSON.parse(response.data);
    setTaskUpdates(prev => [newUpdate, ...prev]);
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
```

**Step 4: Add Progress Notes section JSX after Status section**

```jsx
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
      {/* Combine and sort by date */}
      {[
        ...taskUpdates.map(u => ({ type: 'update', data: u, date: new Date(u.created_at) })),
        ...linkedNotes.map(n => ({ type: 'note', data: n, date: new Date(n.created_at) }))
      ]
        .sort((a, b) => b.date - a.date)
        .map((item, index) => (
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
```

**Step 5: Add imports at top of file**

```javascript
import { tasksApi } from '../api/tasks';
import { notesApi } from '../api/notes';
```

**Step 6: Test in browser**

Run both servers and test:
1. Create a task
2. Open task for editing
3. Add progress notes
4. Link a note
5. Verify notes appear newest first

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Progress Notes section to TaskModal"
```

---

## Task 8: Add Linked Tasks Section to NoteModal

**Files:**
- Modify: `frontend/src/components/NoteModal.jsx`
- Modify: `frontend/src/api/notes.js`

**Step 1: Add API methods for note-side linking**

```javascript
// frontend/src/api/notes.js
import client from './client';

export const notesApi = {
  getAll: (category) => client.get('/notes', { params: { category } }),
  get: (id) => client.get(`/notes/${id}`),
  create: (note) => client.post('/notes', { note }),
  update: (id, note) => client.patch(`/notes/${id}`, { note }),
  delete: (id) => client.delete(`/notes/${id}`),

  // Linked Tasks (link from note side uses task's endpoint)
  linkTask: (noteId, taskId) => client.post(`/tasks/${taskId}/linked_notes`, { note_id: noteId }),
  unlinkTask: (noteId, taskId) => client.delete(`/tasks/${taskId}/linked_notes/${noteId}`),
};
```

**Step 2: Add state and imports to NoteModal**

```javascript
import { formatDistanceToNow, format } from 'date-fns';
import { notesApi } from '../api/notes';
import { tasksApi } from '../api/tasks';

// Inside component:
const [linkedTasks, setLinkedTasks] = useState([]);
const [availableTasks, setAvailableTasks] = useState([]);
const [showTaskPicker, setShowTaskPicker] = useState(false);
```

**Step 3: Add useEffect to load note details**

```javascript
useEffect(() => {
  if (note?.id && isOpen) {
    notesApi.get(note.id).then(response => {
      const data = JSON.parse(response.data);
      setLinkedTasks(data.linked_tasks || []);
    }).catch(console.error);

    // Load available tasks for linking
    tasksApi.getForDate(format(new Date(), 'yyyy-MM-dd')).then(response => {
      const allTasks = [...(response.data.tasks || []), ...(response.data.carried_over || [])];
      setAvailableTasks(allTasks);
    }).catch(console.error);
  } else {
    setLinkedTasks([]);
  }
}, [note?.id, isOpen]);
```

**Step 4: Add handlers**

```javascript
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
  const icons = {
    backlog: 'inbox',
    in_progress: 'play_circle',
    partial: 'timelapse',
    done: 'check_circle'
  };
  return icons[status] || 'inbox';
};

const getStatusColor = (status) => {
  const colors = {
    backlog: 'text-slate-400',
    in_progress: 'text-blue-400',
    partial: 'text-orange-400',
    done: 'text-green-400'
  };
  return colors[status] || 'text-slate-400';
};
```

**Step 5: Add Linked Tasks section JSX before Delete button**

```jsx
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
```

**Step 6: Test in browser**

1. Create a note
2. Open note for editing
3. Link tasks to note
4. Verify tasks appear with status

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Linked Tasks section to NoteModal"
```

---

## Task 9: Final Testing and Commit

**Step 1: Run all backend tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec`
Expected: All tests pass

**Step 2: Manual E2E test**

1. Start backend: `bin/rails s`
2. Start frontend: `cd frontend && npm run dev`
3. Create a task
4. Add progress notes
5. Create a note
6. Link note to task (from task modal)
7. Verify note shows in task's progress notes
8. Open note, verify task appears in linked tasks
9. Unlink from note side, verify removed from both

**Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete task progress notes and note linking feature"
```

**Step 4: Push to remote**

```bash
git push origin main
```
