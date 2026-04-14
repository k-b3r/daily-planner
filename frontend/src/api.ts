const BASE_URL = 'http://localhost:8000/api/tasks'

export interface Task {
  id: number
  title: string
  date: string
  is_recurring: boolean
  is_done: boolean
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

export async function createTask(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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
