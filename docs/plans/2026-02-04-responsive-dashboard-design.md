# Responsive Dashboard Design

**Date:** 2026-02-04
**Status:** Approved

## Overview

Add responsive desktop/tablet layout with a Dashboard page. Mobile keeps current layout, desktop/tablet gets 3-column layout with sidebar navigation.

## Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px - 1279px | 3-column compressed |
| Desktop | >= 1280px | 3-column full |

## Desktop/Tablet Layout

```
┌─────────┬────────────────────────┬──────────┐
│  Left   │                        │  Right   │
│ Sidebar │     Main Content       │ Sidebar  │
│  (nav)  │                        │(widgets) │
│ 64/200px│      flex-1            │  280px   │
└─────────┴────────────────────────┴──────────┘
```

### Left Sidebar (Collapsible)
- Collapsed: 64px (icons only)
- Expanded: 200px (icons + labels)
- Nav items: Dashboard, Tasks, Calendar, Notes, Settings
- Toggle button at bottom
- Persists state in localStorage

### Right Sidebar (Widgets)
- Width: 280px
- Contains: Quick Note, Daily Progress

## Dashboard Page

### Header
- Title: "Today's Focus"
- Subtitle: "You have X tasks to complete today"
- Filters button

### Carried Over Section
- Orange/warning styling
- Shows tasks where `carried_over: true`
- Only visible if carried over tasks exist

### Today's Schedule Section
- Date display (e.g., "Wednesday, Feb 4")
- Tasks ordered by time
- Shows status icon, title, time, tags
- "+ Add task to schedule" link

## Widgets

### Quick Note
- Simple text area (no rich text)
- "Save Note" button
- Creates new note titled "Quick Note - [date]"
- Auto-saves draft to localStorage
- Clears after saving

### Daily Progress
- Visual progress bar
- "X of Y done" display
- Encouraging message based on progress

## New Components

```
frontend/src/
├── components/
│   ├── layouts/
│   │   ├── MobileLayout.jsx      # Current Layout renamed
│   │   ├── DesktopLayout.jsx     # 3-column layout
│   │   ├── Sidebar.jsx           # Left nav
│   │   └── RightSidebar.jsx      # Widgets container
│   ├── widgets/
│   │   ├── QuickNote.jsx
│   │   └── DailyProgress.jsx
├── hooks/
│   └── useResponsive.js          # Breakpoint detection
├── pages/
│   └── Dashboard.jsx             # New page
```

## Responsive Behavior

- Mobile: Uses MobileLayout (bottom nav, single column)
- Desktop/Tablet: Uses DesktopLayout (sidebar nav, 3 columns)
- Layout switching handled in App.jsx based on useResponsive hook
- Shared components (TaskItem, TaskModal, etc.) work in both layouts

## Existing Features to Integrate

- Task listing with status icons
- Carried over tasks display
- Task ordering by time
- Task modal for create/edit
- All status types (backlog, in_progress, partial, blocked, done, closed)
- Tags display
- Priority indicators
