# Productivity App

## What it is
A daily task/habit tracker with a calendar UI and a real-time completion graph.

## Features
- **Calendar grid** (monthly view) — click any day to load its checklist
  - Today is highlighted
  - Past days are read-only (no editing)
- **Daily checklist** — two kinds of tasks per day:
  - Recurring tasks: same fixed list every day (habits)
  - One-off tasks: added manually for a specific day only
  - Each task (recurring or one-off) can have a **note**
  - Notes on recurring tasks are **per-day** — "Morning workout" on Apr 9 has its own note, independent of Apr 10
  - In the DB, recurring tasks are stored as one row per day (same title, different date) so notes and done-state are isolated per day
- **Progress graph** (bottom of page) — shows % of today's tasks completed, updates in real-time as items are checked

## Stack
| Layer | Tech |
|-------|------|
| Backend | Django 6 + Django REST Framework |
| Auth | djangorestframework-simplejwt |
| CORS | django-cors-headers |
| Frontend | React 19 + Vite (in `frontend/`) |
| Package mgr (JS) | pnpm |
| Package mgr (Py) | uv |
| DB | SQLite (dev) |

## Structure
```
productivity/
  config/          Django project config (settings, urls, wsgi, asgi)
  tasks/           Tasks REST API app (models, views, serializers, urls)
  frontend/        React app
    src/
    vercel.json    SPA routing for Vercel deploy
  manage.py
  pyproject.toml
```

## API
Base path: `/api/tasks/`
- `GET    /api/tasks/`        list all tasks
- `POST   /api/tasks/`        create task
- `GET    /api/tasks/{id}/`   retrieve
- `PUT    /api/tasks/{id}/`   update
- `DELETE /api/tasks/{id}/`   delete

## Dev
```bash
# Backend
uv run python manage.py runserver

# Frontend
cd frontend && pnpm dev
```
Frontend runs on http://localhost:5173, backend on http://localhost:8000.
CORS is configured to allow requests between the two in development.
