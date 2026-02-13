# Stimulus Migration Design

**Goal:** Migrate Tusk from React frontend to pure Rails with Stimulus/Turbo

**Date:** 2026-02-09

---

## Architecture Overview

**Tech Stack Migration:**
- React → Rails Views (ERB) + Stimulus + Turbo
- React Router → Rails routes + Turbo Drive
- Axios → Turbo Frames + standard Rails forms
- Recharts → Chart.js with Stimulus controller
- Tiptap → Action Text (Trix)
- Tailwind CSS → Tailwind CSS (keep as-is)
- date-fns → Rails helpers + minimal JS

**Directory Structure:**
```
app/
├── controllers/
│   ├── tasks_controller.rb
│   ├── notes_controller.rb
│   ├── calendar_controller.rb
│   ├── dashboard_controller.rb
│   └── settings_controller.rb
├── views/
│   ├── layouts/
│   │   ├── application.html.erb
│   │   ├── mobile.html.erb
│   │   └── desktop.html.erb
│   ├── tasks/
│   ├── notes/
│   ├── calendar/
│   └── dashboard/
├── javascript/
│   └── controllers/
│       ├── task_item_controller.js
│       ├── modal_controller.js
│       ├── chart_controller.js
│       ├── calendar_controller.js
│       └── responsive_controller.js
```

---

## Pages & Routes

```ruby
Rails.application.routes.draw do
  root "tasks#index"

  resources :tasks do
    member do
      post :toggle_status
      post :add_update
      delete :delete_update
      post :link_note
      delete :unlink_note
    end
  end

  resources :notes
  resource :calendar, only: [:show]
  resource :dashboard, only: [:show]
  resource :settings, only: [:show, :update]
  resources :tags
end
```

**View Mapping:**

| React Page | Rails View |
|------------|------------|
| Tasks.jsx | tasks/index.html.erb |
| Dashboard.jsx | dashboard/show.html.erb |
| Calendar.jsx | calendar/show.html.erb |
| Notes.jsx | notes/index.html.erb |
| Settings.jsx | settings/show.html.erb |

---

## Stimulus Controllers

| Controller | Purpose |
|------------|---------|
| modal_controller.js | Open/close modals, backdrop clicks, escape key |
| task_item_controller.js | Checkbox toggle, status cycling |
| calendar_controller.js | Week/month navigation, date selection |
| chart_controller.js | Initialize Chart.js |
| form_controller.js | Category/priority toggles, weekly days |
| search_controller.js | Filter notes, toggle search |
| tabs_controller.js | Week/month view toggle |
| sidebar_controller.js | Collapse/expand, localStorage persistence |
| responsive_controller.js | Set viewport cookie |

---

## Layouts & Responsive Design

**Layout Detection:**
1. JavaScript sets `viewport=mobile|desktop` cookie based on screen width (breakpoint: 1280px)
2. ApplicationController reads cookie, renders appropriate layout

**Mobile Layout:** Header + main content + bottom nav
**Desktop Layout:** Sidebar + main content

---

## Modals with Turbo Frames

- Modal container with turbo-frame for content
- Links target the frame and trigger modal open
- Form submission closes modal via Turbo Stream

---

## Rich Text & Charts

**Action Text:** Task descriptions and Note content use `has_rich_text`

**Chart.js:** Dashboard monthly chart rendered via Stimulus controller with data passed via `data-*` attributes

---

## Migration Steps

1. Set up Rails frontend stack (importmap, Turbo, Stimulus, Tailwind)
2. Add Action Text
3. Create layouts (mobile, desktop, shared partials)
4. Build pages: Tasks → Notes → Calendar → Dashboard → Settings
5. Add Stimulus controllers
6. Test all functionality
7. Delete frontend/ directory
8. Update Dockerfile
9. Deploy
