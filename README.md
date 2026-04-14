# Daily Planner

A daily task and habit tracker with a calendar UI and a real-time completion graph.

## Features

- **Monthly calendar** — click any day to load its checklist; today is highlighted; past days are read-only
- **Daily checklist** — recurring habits + one-off tasks per day, each with an optional note
- **Progress graph** — live % completion for today's tasks

## Stack

| Layer | Tech |
|-------|------|
| Backend | Django 6 + Django REST Framework |
| Auth | djangorestframework-simplejwt |
| Frontend | React 19 + Vite |
| Database | SQLite (dev) |

## Getting started

**Requirements:** Python 3.12+, Node 18+, [uv](https://github.com/astral-sh/uv), [pnpm](https://pnpm.io)

```bash
# Clone
git clone https://github.com/k-b3r/daily-planner.git
cd daily-planner

# Backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver

# Frontend (separate terminal)
cd frontend
pnpm install
pnpm dev
```

App: http://localhost:5173 — API: http://localhost:8000

## API

Base path: `/api/tasks/`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/` | list tasks |
| POST | `/api/tasks/` | create task |
| GET | `/api/tasks/{id}/` | retrieve task |
| PUT | `/api/tasks/{id}/` | update task |
| DELETE | `/api/tasks/{id}/` | delete task |
