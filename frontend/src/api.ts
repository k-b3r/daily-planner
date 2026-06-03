const BASE_URL = 'http://localhost:8000/api/tasks'

export interface Task {
  id: number
  recurring_task: number | null
  title: string
  date: string
  is_recurring: boolean
  is_done: boolean
  notes: string
  habit_notes: string
  created_at: string
  updated_at: string
  streak: number
}

export interface RecurringTask {
  id: number
  title: string
  days: number[]
  start_date: string
  end_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export async function fetchTasksForDate(date: string): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/?date=${date}`)
  return res.json()
}

export async function fetchTasksForMonth(month: string): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/?month=${month}`)
  return res.json()
}

export async function addTask(data: { title: string; date: string; is_done: boolean; notes: string }): Promise<Task> {
  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, recurring_task: null }),
  })
  return res.json()
}

export async function createHabitEntry(habit: RecurringTask, date: string): Promise<Task> {
  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recurring_task: habit.id, title: habit.title, date, is_done: false, notes: '' }),
  })
  return res.json()
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${BASE_URL}/${id}/`, { method: 'DELETE' })
}

export async function fetchRecurringTasks(): Promise<RecurringTask[]> {
  const res = await fetch(`${BASE_URL}/recurring/`)
  return res.json()
}

export async function addHabit(data: Omit<RecurringTask, 'id' | 'created_at' | 'updated_at'>): Promise<RecurringTask> {
  const res = await fetch(`${BASE_URL}/recurring/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateHabit(id: number, data: Partial<RecurringTask>): Promise<RecurringTask> {
  const res = await fetch(`${BASE_URL}/recurring/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteHabit(id: number): Promise<void> {
  await fetch(`${BASE_URL}/recurring/${id}/`, { method: 'DELETE' })
}
