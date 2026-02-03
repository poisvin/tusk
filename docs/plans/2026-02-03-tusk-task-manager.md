# Tusk Task Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal task manager with daily tasks, scheduling, reminders, and notes - mobile and desktop friendly.

**Architecture:** Rails 7 API-only backend with PostgreSQL. React frontend (Vite) with Tailwind CSS. Browser notifications for reminders. Single-user app (no auth initially).

**Tech Stack:** Rails 7 API, PostgreSQL, React 18, Vite, Tailwind CSS, Material Symbols icons, TipTap (rich text editor)

---

## Phase 1: Project Setup

### Task 1: Convert Rails to API Mode and Setup PostgreSQL

**Files:**
- Modify: `config/application.rb`
- Modify: `config/database.yml`
- Modify: `Gemfile`

**Step 1: Update Gemfile for API mode and add necessary gems**

```ruby
# Remove these gems (comment out):
# gem "sprockets-rails"
# gem "importmap-rails"
# gem "turbo-rails"
# gem "stimulus-rails"
# gem "jbuilder"

# Add these gems:
gem "rack-cors"
gem "blueprinter"  # JSON serialization
```

**Step 2: Run bundle install**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle install`

**Step 3: Update config/application.rb for API mode**

Change `class Application < Rails::Application` block to include:
```ruby
config.api_only = true
```

**Step 4: Configure database.yml for PostgreSQL**

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: tusk_development

test:
  <<: *default
  database: tusk_test

production:
  <<: *default
  database: tusk_production
  username: tusk
  password: <%= ENV["TUSK_DATABASE_PASSWORD"] %>
```

**Step 5: Create database**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:create`

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: configure Rails as API-only with PostgreSQL"
```

---

### Task 2: Setup React Frontend with Vite

**Files:**
- Create: `frontend/` directory with Vite React app

**Step 1: Create Vite React app**

Run: `cd /Users/vinu/src/clients/c9s/tusk && npm create vite@latest frontend -- --template react`

**Step 2: Install dependencies**

Run: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm install`

**Step 3: Install Tailwind CSS**

Run: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`

**Step 4: Configure tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}
```

**Step 5: Update src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

**Step 6: Add Material Symbols to index.html**

Add to `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />
```

**Step 7: Install additional dependencies**

Run: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm install axios react-router-dom date-fns @tiptap/react @tiptap/starter-kit`

**Step 8: Verify frontend runs**

Run: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm run dev`
Expected: Vite dev server starts on http://localhost:5173

**Step 9: Commit**

```bash
git add -A && git commit -m "feat: setup React frontend with Vite and Tailwind"
```

---

### Task 3: Configure CORS for API

**Files:**
- Create: `config/initializers/cors.rb`

**Step 1: Create CORS configuration**

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:5173", "http://127.0.0.1:5173"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: configure CORS for frontend"
```

---

## Phase 2: Database Models

### Task 4: Create Tag Model

**Files:**
- Create: `db/migrate/xxx_create_tags.rb`
- Create: `app/models/tag.rb`
- Create: `spec/models/tag_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/models/tag_spec.rb
require 'rails_helper'

RSpec.describe Tag, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_uniqueness_of(:name) }
  end

  describe 'attributes' do
    it 'has name and color' do
      tag = Tag.new(name: 'sales', color: '#ff5733')
      expect(tag.name).to eq('sales')
      expect(tag.color).to eq('#ff5733')
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/tag_spec.rb`
Expected: FAIL - Tag model doesn't exist

**Step 3: Generate model and migration**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g model Tag name:string color:string`

**Step 4: Add validations to model**

```ruby
# app/models/tag.rb
class Tag < ApplicationRecord
  validates :name, presence: true, uniqueness: true
end
```

**Step 5: Run migration and tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/tag_spec.rb`
Expected: PASS

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Tag model"
```

---

### Task 5: Create Task Model

**Files:**
- Create: `db/migrate/xxx_create_tasks.rb`
- Create: `app/models/task.rb`
- Create: `spec/models/task_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/models/task_spec.rb
require 'rails_helper'

RSpec.describe Task, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:scheduled_date) }
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(backlog: 0, in_progress: 1, partial: 2, done: 3) }
    it { should define_enum_for(:priority).with_values(low: 0, medium: 1, high: 2) }
    it { should define_enum_for(:category).with_values(personal: 0, official: 1) }
    it { should define_enum_for(:recurrence).with_values(none: 0, daily: 1, weekly: 2, monthly: 3) }
  end

  describe 'associations' do
    it { should have_and_belong_to_many(:tags) }
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/task_spec.rb`
Expected: FAIL - Task model doesn't exist

**Step 3: Generate model**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g model Task title:string description:text scheduled_date:date start_time:time end_time:time status:integer priority:integer category:integer recurrence:integer remind:boolean carried_over:boolean original_date:date`

**Step 4: Create join table for tasks_tags**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g migration CreateJoinTableTasksTags tasks tags`

**Step 5: Update Task model**

```ruby
# app/models/task.rb
class Task < ApplicationRecord
  has_and_belongs_to_many :tags

  validates :title, presence: true
  validates :scheduled_date, presence: true

  enum status: { backlog: 0, in_progress: 1, partial: 2, done: 3 }
  enum priority: { low: 0, medium: 1, high: 2 }
  enum category: { personal: 0, official: 1 }
  enum recurrence: { none: 0, daily: 1, weekly: 2, monthly: 3 }

  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :incomplete, -> { where.not(status: :done) }
  scope :carried_over, -> { where(carried_over: true) }
end
```

**Step 6: Run migration and tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/task_spec.rb`
Expected: PASS

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Task model with status, priority, category, recurrence"
```

---

### Task 6: Create Note Model

**Files:**
- Create: `db/migrate/xxx_create_notes.rb`
- Create: `app/models/note.rb`
- Create: `spec/models/note_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/models/note_spec.rb
require 'rails_helper'

RSpec.describe Note, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
  end

  describe 'enums' do
    it { should define_enum_for(:category).with_values(personal: 0, work: 1, ideas: 2) }
  end

  describe 'associations' do
    it { should have_and_belong_to_many(:tags) }
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/models/note_spec.rb`
Expected: FAIL

**Step 3: Generate model**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g model Note title:string content:text category:integer`

**Step 4: Create join table**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails g migration CreateJoinTableNotesTags notes tags`

**Step 5: Update Note model**

```ruby
# app/models/note.rb
class Note < ApplicationRecord
  has_and_belongs_to_many :tags

  validates :title, presence: true

  enum category: { personal: 0, work: 1, ideas: 2 }
end
```

**Step 6: Run migration and tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails db:migrate && bundle exec rspec spec/models/note_spec.rb`
Expected: PASS

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Note model"
```

---

## Phase 3: API Endpoints

### Task 7: Tasks API Controller

**Files:**
- Create: `app/controllers/api/v1/tasks_controller.rb`
- Create: `app/blueprints/task_blueprint.rb`
- Create: `spec/requests/api/v1/tasks_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing request spec**

```ruby
# spec/requests/api/v1/tasks_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::Tasks", type: :request do
  describe "GET /api/v1/tasks" do
    it "returns tasks for a specific date" do
      task = Task.create!(title: "Test task", scheduled_date: Date.today)
      get "/api/v1/tasks", params: { date: Date.today.to_s }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["tasks"].length).to eq(1)
    end
  end

  describe "POST /api/v1/tasks" do
    it "creates a new task" do
      post "/api/v1/tasks", params: {
        task: { title: "New task", scheduled_date: Date.today, category: "personal" }
      }

      expect(response).to have_http_status(:created)
      expect(Task.count).to eq(1)
    end
  end

  describe "PATCH /api/v1/tasks/:id" do
    it "updates task status" do
      task = Task.create!(title: "Test", scheduled_date: Date.today)
      patch "/api/v1/tasks/#{task.id}", params: { task: { status: "done" } }

      expect(response).to have_http_status(:ok)
      expect(task.reload.status).to eq("done")
    end
  end

  describe "DELETE /api/v1/tasks/:id" do
    it "deletes a task" do
      task = Task.create!(title: "Test", scheduled_date: Date.today)
      delete "/api/v1/tasks/#{task.id}"

      expect(response).to have_http_status(:no_content)
      expect(Task.count).to eq(0)
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/tasks_spec.rb`
Expected: FAIL - No route matches

**Step 3: Add routes**

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tasks
      resources :tags
      resources :notes
    end
  end
end
```

**Step 4: Create blueprint**

```ruby
# app/blueprints/task_blueprint.rb
class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :scheduled_date, :start_time, :end_time,
         :status, :priority, :category, :recurrence, :remind, :carried_over,
         :original_date, :created_at, :updated_at

  association :tags, blueprint: TagBlueprint
end
```

```ruby
# app/blueprints/tag_blueprint.rb
class TagBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :color
end
```

**Step 5: Create controller**

```ruby
# app/controllers/api/v1/tasks_controller.rb
module Api
  module V1
    class TasksController < ApplicationController
      def index
        date = params[:date] ? Date.parse(params[:date]) : Date.today
        tasks = Task.for_date(date).includes(:tags)
        carried_over = Task.carried_over.where(scheduled_date: date).includes(:tags)

        render json: {
          tasks: TaskBlueprint.render_as_hash(tasks),
          carried_over: TaskBlueprint.render_as_hash(carried_over)
        }
      end

      def show
        task = Task.find(params[:id])
        render json: TaskBlueprint.render(task)
      end

      def create
        task = Task.new(task_params)
        if task.save
          render json: TaskBlueprint.render(task), status: :created
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        task = Task.find(params[:id])
        if task.update(task_params)
          render json: TaskBlueprint.render(task)
        else
          render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        task = Task.find(params[:id])
        task.destroy
        head :no_content
      end

      private

      def task_params
        params.require(:task).permit(
          :title, :description, :scheduled_date, :start_time, :end_time,
          :status, :priority, :category, :recurrence, :remind, :carried_over,
          :original_date, tag_ids: []
        )
      end
    end
  end
end
```

**Step 6: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/tasks_spec.rb`
Expected: PASS

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Tasks API with CRUD endpoints"
```

---

### Task 8: Tags API Controller

**Files:**
- Create: `app/controllers/api/v1/tags_controller.rb`
- Create: `spec/requests/api/v1/tags_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/requests/api/v1/tags_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::Tags", type: :request do
  describe "GET /api/v1/tags" do
    it "returns all tags" do
      Tag.create!(name: "sales", color: "#ff0000")
      get "/api/v1/tags"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end
  end

  describe "POST /api/v1/tags" do
    it "creates a tag" do
      post "/api/v1/tags", params: { tag: { name: "marketing", color: "#00ff00" } }

      expect(response).to have_http_status(:created)
      expect(Tag.count).to eq(1)
    end
  end
end
```

**Step 2: Create controller**

```ruby
# app/controllers/api/v1/tags_controller.rb
module Api
  module V1
    class TagsController < ApplicationController
      def index
        tags = Tag.all
        render json: TagBlueprint.render(tags)
      end

      def create
        tag = Tag.new(tag_params)
        if tag.save
          render json: TagBlueprint.render(tag), status: :created
        else
          render json: { errors: tag.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        tag = Tag.find(params[:id])
        tag.destroy
        head :no_content
      end

      private

      def tag_params
        params.require(:tag).permit(:name, :color)
      end
    end
  end
end
```

**Step 3: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/tags_spec.rb`
Expected: PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Tags API"
```

---

### Task 9: Notes API Controller

**Files:**
- Create: `app/controllers/api/v1/notes_controller.rb`
- Create: `app/blueprints/note_blueprint.rb`
- Create: `spec/requests/api/v1/notes_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/requests/api/v1/notes_spec.rb
require 'rails_helper'

RSpec.describe "Api::V1::Notes", type: :request do
  describe "GET /api/v1/notes" do
    it "returns all notes" do
      Note.create!(title: "Meeting notes", content: "Discussed project", category: "work")
      get "/api/v1/notes"

      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /api/v1/notes" do
    it "creates a note" do
      post "/api/v1/notes", params: {
        note: { title: "New note", content: "Content here", category: "personal" }
      }

      expect(response).to have_http_status(:created)
    end
  end
end
```

**Step 2: Create blueprint and controller**

```ruby
# app/blueprints/note_blueprint.rb
class NoteBlueprint < Blueprinter::Base
  identifier :id
  fields :title, :content, :category, :created_at, :updated_at
  association :tags, blueprint: TagBlueprint
end
```

```ruby
# app/controllers/api/v1/notes_controller.rb
module Api
  module V1
    class NotesController < ApplicationController
      def index
        notes = Note.includes(:tags)
        notes = notes.where(category: params[:category]) if params[:category].present?
        render json: NoteBlueprint.render(notes)
      end

      def show
        note = Note.find(params[:id])
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

      private

      def note_params
        params.require(:note).permit(:title, :content, :category, tag_ids: [])
      end
    end
  end
end
```

**Step 3: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/requests/api/v1/notes_spec.rb`
Expected: PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Notes API"
```

---

### Task 10: Task Carryover Service

**Files:**
- Create: `app/services/task_carryover_service.rb`
- Create: `spec/services/task_carryover_service_spec.rb`

**Step 1: Write failing test**

```ruby
# spec/services/task_carryover_service_spec.rb
require 'rails_helper'

RSpec.describe TaskCarryoverService do
  describe '.process' do
    it 'carries over incomplete tasks from yesterday' do
      yesterday_task = Task.create!(
        title: "Incomplete task",
        scheduled_date: Date.yesterday,
        status: :backlog
      )

      TaskCarryoverService.process(Date.today)

      carried = Task.where(scheduled_date: Date.today, carried_over: true)
      expect(carried.count).to eq(1)
      expect(carried.first.original_date).to eq(Date.yesterday)
    end

    it 'does not carry over completed tasks' do
      Task.create!(
        title: "Done task",
        scheduled_date: Date.yesterday,
        status: :done
      )

      TaskCarryoverService.process(Date.today)

      carried = Task.where(scheduled_date: Date.today, carried_over: true)
      expect(carried.count).to eq(0)
    end
  end
end
```

**Step 2: Create service**

```ruby
# app/services/task_carryover_service.rb
class TaskCarryoverService
  def self.process(target_date)
    new(target_date).process
  end

  def initialize(target_date)
    @target_date = target_date
  end

  def process
    incomplete_tasks.find_each do |task|
      next if already_carried?(task)

      task.update!(
        scheduled_date: @target_date,
        carried_over: true,
        original_date: task.original_date || task.scheduled_date_was
      )
    end
  end

  private

  def incomplete_tasks
    Task.where(scheduled_date: ...@target_date)
        .where.not(status: :done)
  end

  def already_carried?(task)
    task.carried_over? && task.scheduled_date == @target_date
  end
end
```

**Step 3: Run tests**

Run: `cd /Users/vinu/src/clients/c9s/tusk && bundle exec rspec spec/services/task_carryover_service_spec.rb`
Expected: PASS

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add TaskCarryoverService for carrying over incomplete tasks"
```

---

## Phase 4: Frontend Core Components

### Task 11: Setup App Shell and Routing

**Files:**
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/pages/Today.jsx`
- Create: `frontend/src/pages/Calendar.jsx`
- Create: `frontend/src/pages/Notes.jsx`
- Create: `frontend/src/pages/Settings.jsx`
- Create: `frontend/src/components/Layout.jsx`
- Create: `frontend/src/components/BottomNav.jsx`

**Step 1: Create Layout component**

```jsx
// frontend/src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="dark bg-background-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden border-x border-slate-800">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
```

**Step 2: Create BottomNav component**

```jsx
// frontend/src/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'home', label: 'Today' },
  { to: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { to: '/notes', icon: 'notes', label: 'Notes' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-background-dark/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-6 pb-2 z-10">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

**Step 3: Create placeholder pages**

```jsx
// frontend/src/pages/Today.jsx
export default function Today() {
  return <div className="p-4 text-white">Today Page</div>;
}

// frontend/src/pages/Calendar.jsx
export default function Calendar() {
  return <div className="p-4 text-white">Calendar Page</div>;
}

// frontend/src/pages/Notes.jsx
export default function Notes() {
  return <div className="p-4 text-white">Notes Page</div>;
}

// frontend/src/pages/Settings.jsx
export default function Settings() {
  return <div className="p-4 text-white">Settings Page</div>;
}
```

**Step 4: Setup routing in App.jsx**

```jsx
// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Today from './pages/Today';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="notes" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Step 5: Verify app runs**

Run: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm run dev`
Expected: App loads with bottom navigation working

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: setup app shell with routing and bottom navigation"
```

---

### Task 12: Create API Client

**Files:**
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/api/tasks.js`
- Create: `frontend/src/api/tags.js`
- Create: `frontend/src/api/notes.js`

**Step 1: Create base client**

```javascript
// frontend/src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
```

**Step 2: Create tasks API**

```javascript
// frontend/src/api/tasks.js
import client from './client';

export const tasksApi = {
  getForDate: (date) => client.get('/tasks', { params: { date } }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (task) => client.post('/tasks', { task }),
  update: (id, task) => client.patch(`/tasks/${id}`, { task }),
  delete: (id) => client.delete(`/tasks/${id}`),
};
```

**Step 3: Create tags API**

```javascript
// frontend/src/api/tags.js
import client from './client';

export const tagsApi = {
  getAll: () => client.get('/tags'),
  create: (tag) => client.post('/tags', { tag }),
  delete: (id) => client.delete(`/tags/${id}`),
};
```

**Step 4: Create notes API**

```javascript
// frontend/src/api/notes.js
import client from './client';

export const notesApi = {
  getAll: (category) => client.get('/notes', { params: { category } }),
  get: (id) => client.get(`/notes/${id}`),
  create: (note) => client.post('/notes', { note }),
  update: (id, note) => client.patch(`/notes/${id}`, { note }),
  delete: (id) => client.delete(`/notes/${id}`),
};
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add API client and service modules"
```

---

### Task 13: Build Today Page

**Files:**
- Modify: `frontend/src/pages/Today.jsx`
- Create: `frontend/src/components/Header.jsx`
- Create: `frontend/src/components/ProgressCard.jsx`
- Create: `frontend/src/components/TaskItem.jsx`
- Create: `frontend/src/components/TaskSection.jsx`
- Create: `frontend/src/components/FloatingAddButton.jsx`

**Step 1: Create Header component**

```jsx
// frontend/src/components/Header.jsx
export default function Header({ title, leftIcon, rightAction }) {
  return (
    <header className="sticky top-0 z-10 flex items-center bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
      <div className="text-white flex size-12 shrink-0 items-center">
        <span className="material-symbols-outlined text-[28px]">{leftIcon}</span>
      </div>
      <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        {title}
      </h2>
      <div className="flex w-12 items-center justify-end">
        {rightAction}
      </div>
    </header>
  );
}
```

**Step 2: Create ProgressCard component**

```jsx
// frontend/src/components/ProgressCard.jsx
export default function ProgressCard({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="p-4">
      <div className="bg-primary/20 rounded-xl p-5 border border-primary/20">
        <div className="flex flex-col gap-3">
          <div className="flex gap-6 justify-between items-center">
            <p className="text-white text-base font-semibold">Daily Progress</p>
            <p className="text-primary text-sm font-bold">{completed}/{total}</p>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[#92a4c9] text-xs font-medium uppercase tracking-wider">
            {percentage}% of tasks completed
          </p>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Create TaskItem component**

```jsx
// frontend/src/components/TaskItem.jsx
export default function TaskItem({ task, onToggle, isCarriedOver }) {
  const isDone = task.status === 'done';

  return (
    <div className="flex items-center gap-4 bg-background-dark px-4 min-h-[72px] py-2 justify-between border-b border-slate-800/50">
      <div className="flex items-center gap-4">
        <div className="flex size-7 items-center justify-center">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggle(task.id, isDone ? 'backlog' : 'done')}
            className="h-6 w-6 rounded border-[#324467] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-primary focus:outline-none transition-all"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className={`text-base font-medium leading-normal line-clamp-1 ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          <p className={`text-sm font-normal leading-normal line-clamp-2 ${isDone ? 'text-slate-600' : 'text-[#92a4c9]'}`}>
            {task.description || (task.start_time && `${task.start_time} - ${task.end_time}`)}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {isCarriedOver ? (
          <div className="text-orange-500 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">history</span>
          </div>
        ) : isDone ? (
          <div className="text-slate-600 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">done_all</span>
          </div>
        ) : task.remind ? (
          <div className="text-primary flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">schedule</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

**Step 4: Create TaskSection component**

```jsx
// frontend/src/components/TaskSection.jsx
import TaskItem from './TaskItem';

export default function TaskSection({ title, tasks, onToggle, isCarriedOver }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <section className="mt-4">
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        {title}
      </h3>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          isCarriedOver={isCarriedOver}
        />
      ))}
    </section>
  );
}
```

**Step 5: Create FloatingAddButton component**

```jsx
// frontend/src/components/FloatingAddButton.jsx
export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform z-20"
    >
      <span className="material-symbols-outlined text-[32px]">add</span>
    </button>
  );
}
```

**Step 6: Update Today page**

```jsx
// frontend/src/pages/Today.jsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';
import ProgressCard from '../components/ProgressCard';
import TaskSection from '../components/TaskSection';
import FloatingAddButton from '../components/FloatingAddButton';
import { tasksApi } from '../api/tasks';

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [carriedOver, setCarriedOver] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksApi.getForDate(today);
      setTasks(response.data.tasks || []);
      setCarriedOver(response.data.carried_over || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, newStatus) => {
    try {
      await tasksApi.update(id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length + carriedOver.length;

  return (
    <>
      <Header
        title="Today"
        leftIcon="calendar_today"
        rightAction={
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-800 text-white hover:bg-slate-700">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        }
      />

      <main className="flex-1 pb-24">
        <ProgressCard completed={completedCount} total={totalCount} />

        <TaskSection
          title="Carried Over from Yesterday"
          tasks={carriedOver}
          onToggle={handleToggle}
          isCarriedOver
        />

        <TaskSection
          title="Today's Tasks"
          tasks={tasks}
          onToggle={handleToggle}
        />

        {!loading && tasks.length === 0 && carriedOver.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <span className="material-symbols-outlined text-6xl mb-4 block">task_alt</span>
            <p>No tasks for today</p>
            <p className="text-sm">Tap + to add a task</p>
          </div>
        )}
      </main>

      <FloatingAddButton onClick={() => console.log('Add task')} />
    </>
  );
}
```

**Step 7: Verify Today page renders**

Run both servers:
- Backend: `cd /Users/vinu/src/clients/c9s/tusk && bin/rails s`
- Frontend: `cd /Users/vinu/src/clients/c9s/tusk/frontend && npm run dev`

Expected: Today page shows with progress card and empty state

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: build Today page with task list and progress card"
```

---

## Phase 5: Task Creation Modal (Continue similarly...)

### Task 14: Create Task Modal Component

(Continue with remaining tasks for modal, calendar page, notes page, reminders, etc.)

---

## Summary of Remaining Tasks

- **Task 14-16:** Task creation/edit modal with form fields
- **Task 17-19:** Calendar page with week/month view
- **Task 20-22:** Notes page with rich text editor
- **Task 23-24:** Carry-over tasks view
- **Task 25-26:** Browser notifications for reminders
- **Task 27-28:** Settings page (tags management)
- **Task 29-30:** Recurring tasks logic
- **Task 31:** Final polish and responsive testing

---

## Next Steps After Plan Approval

1. Initialize beads for ticket tracking: `bd init`
2. Create tickets from this plan using beads
3. Execute plan using subagent-driven or parallel session approach
