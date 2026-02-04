# Task Progress Notes & Note Linking Design

**Date:** 2026-02-04
**Status:** Approved

## Overview

Add progress tracking to tasks with quick timestamped notes and two-way linking between Tasks and Notes.

## Data Model

### New: TaskUpdate model

```ruby
# db/migrate/xxx_create_task_updates.rb
create_table :task_updates do |t|
  t.references :task, null: false, foreign_key: true
  t.text :content, null: false
  t.timestamps
end
```

### New: notes_tasks join table

```ruby
# db/migrate/xxx_create_notes_tasks_join_table.rb
create_join_table :notes, :tasks do |t|
  t.index [:note_id, :task_id], unique: true
  t.index [:task_id, :note_id]
end
```

### Model associations

```ruby
# app/models/task.rb
has_many :task_updates, dependent: :destroy
has_and_belongs_to_many :notes

# app/models/note.rb
has_and_belongs_to_many :tasks

# app/models/task_update.rb (new)
class TaskUpdate < ApplicationRecord
  belongs_to :task
  validates :content, presence: true
end
```

## API Endpoints

### Task Updates (progress notes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/:task_id/updates` | Add a progress note |
| GET | `/api/v1/tasks/:task_id/updates` | List updates (newest first) |
| DELETE | `/api/v1/tasks/:task_id/updates/:id` | Remove a note |

### Task-Note Linking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/:task_id/linked_notes` | Link a note to task |
| DELETE | `/api/v1/tasks/:task_id/linked_notes/:note_id` | Unlink a note |

### Enhanced existing endpoints

- `GET /api/v1/tasks/:id` - Include `task_updates` and `linked_notes` in response
- `GET /api/v1/notes/:id` - Include `linked_tasks` in response

## UI Design

### Task Modal - Progress Notes Section

Location: After Status field (last section before save button)

```
┌─────────────────────────────────────────┐
│ Progress Notes                          │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────┐ [Add]   │
│ │ Add a note...               │ [📎]    │
│ └─────────────────────────────┘         │
├─────────────────────────────────────────┤
│ "Waiting on API response"               │
│ 2 hours ago                             │
├─────────────────────────────────────────┤
│ "Completed step 1"                      │
│ 5 hours ago                             │
├─────────────────────────────────────────┤
│ 📄 Meeting Notes (linked)        [x]    │
│ Yesterday                               │
└─────────────────────────────────────────┘
```

**Behavior:**
- Text input with Add button for quick notes
- 📎 button opens dropdown to select existing Notes to link
- Progress notes show content + relative timestamp
- Linked notes show as cards with note title and unlink [x] button
- All items sorted newest first (mixed together by timestamp)
- Always visible regardless of task status

### Notes Page - Linked Tasks Section

```
┌─────────────────────────────────────────┐
│ Linked Tasks                            │
├─────────────────────────────────────────┤
│ ☑ Review Q1 report          [x]         │
│   In Progress · Feb 4                   │
├─────────────────────────────────────────┤
│ ☐ Team standup              [x]         │
│   Backlog · Feb 5                       │
└─────────────────────────────────────────┘
│ [+ Link to task]                        │
└─────────────────────────────────────────┘
```

**Behavior:**
- Shows task title, status icon, and scheduled date
- [x] button to unlink
- "+ Link to task" button to search and link existing tasks

## Out of Scope

- Rich text in progress notes (plain text only)
- Editing progress notes (append-only)
- Attachments/files
