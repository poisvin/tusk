# Tusk

A personal task management and note-taking application built with Rails 7 and Hotwire. Mobile-first, designed for single-user productivity.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Ruby on Rails 7.1 |
| Language | Ruby 3.3.3 |
| Database | PostgreSQL |
| Frontend | Hotwire (Turbo + Stimulus), Tailwind CSS |
| JSON Serialization | Blueprinter |
| Web Server | Puma |
| Deployment | Fly.io (Singapore region) |
| Testing | RSpec, FactoryBot, Shoulda Matchers |

## Prerequisites

- Ruby 3.3.3
- PostgreSQL
- Bundler

## Getting Started

```bash
# Clone the repo
git clone git@github.com:poisvin/tusk.git
cd tusk

# Install dependencies
bundle install

# Create and set up the database
bin/rails db:create
bin/rails db:migrate

# Start the application (Rails server + Tailwind watcher)
bin/dev
```

The app will be available at `http://localhost:3000`.

## Running Tests

```bash
bundle exec rspec
```

## Features

### Task Management
- Create, edit, and delete tasks with title, description, and scheduled date
- Status tracking: backlog, in_progress, partial, done, blocked, closed
- Priority levels: low, medium, high
- Categories: personal, official
- Time scheduling with start/end times
- Tag assignment for organization
- Task updates/progress notes

### Recurring Tasks
- Recurrence patterns: daily, weekly, monthly, weekdays, weekends
- Weekly day selection for flexible scheduling
- Auto-generates occurrences up to 1 month ahead
- Syncs changes across the recurring series

### Task Carryover
- Automatically carries incomplete tasks to the next day
- Preserves original date for tracking
- Visual indicator on carried-over tasks

### Bulk Operations
- Bulk mark tasks as done
- Bulk move tasks to the next day

### Notes
- Rich text notes with file attachments
- Categories: personal, work, ideas
- Search by title or content
- Link notes to tasks

### Tags
- Color-coded tags shared across tasks and notes
- Manage via settings page

### Calendar
- Week and month views
- Task count indicators per day
- Navigate between dates and reschedule tasks

### Dashboard
- Weekly stats: total, completed, in-progress, blocked, pending, carried-over
- 30-day activity chart: created vs. completed tasks per day

### REST API
Full JSON API under `/api/v1/` for:
- Tasks (CRUD + task updates + linked notes)
- Notes (CRUD + attachment management)
- Tags (CRUD)
- Dashboard stats

## Database Schema

### Core Models

**Task** — title, description, scheduled_date, start/end time, status, priority, category, recurrence, tags, linked notes, task updates

**Note** — title, rich text content, category, tags, file attachments, linked tasks

**Tag** — name (unique), color

**TaskUpdate** — progress notes on a task

### Relationships
- Tasks and Tags: many-to-many
- Notes and Tags: many-to-many
- Notes and Tasks: many-to-many
- Recurring tasks: self-referential parent/children

## Deployment

Deployed on Fly.io. To deploy:

```bash
fly deploy
```

Configuration is in `fly.toml`. Production requires:
- `TUSK_DATABASE_PASSWORD` — PostgreSQL password
- `SECRET_KEY_BASE` — Rails secret key

## Docker

```bash
docker build -t tusk .
docker run -p 3000:3000 tusk
```

## Project Structure

```
app/
├── controllers/
│   ├── api/v1/            # REST API controllers
│   ├── tasks_controller.rb
│   ├── notes_controller.rb
│   ├── tags_controller.rb
│   ├── calendar_controller.rb
│   ├── dashboard_controller.rb
│   └── settings_controller.rb
├── models/
│   ├── task.rb
│   ├── note.rb
│   ├── tag.rb
│   └── task_update.rb
├── services/
│   ├── recurring_task_service.rb
│   └── task_carryover_service.rb
├── blueprints/              # JSON serializers
└── views/
    ├── tasks/
    ├── notes/
    ├── calendar/
    ├── dashboard/
    ├── settings/
    └── shared/              # Shared UI components
```
