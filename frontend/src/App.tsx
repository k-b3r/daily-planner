import { useEffect, useState } from 'react'
import Calendar from './Calendar'
import Checklist from './Checklist'
import ProgressGraph from './ProgressGraph'
import ConsistencyGraph from './ConsistencyGraph'
import { fetchTasksForDate, fetchTasksForMonth, createTask, updateTask, deleteTask, Task } from './api'
import { RECURRING_TITLES } from './constants'
import './App.css'

export type DayMap = Record<string, { done: number; total: number }>

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toViewMonth(dateStr: string): string {
  return dateStr.slice(0, 7) // "YYYY-MM-DD" → "YYYY-MM"
}

const TODAY = todayString()

function App() {
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [viewMonth, setViewMonth] = useState(toViewMonth(TODAY))
  const [tasks, setTasks] = useState<Task[]>([])
  const [dayMap, setDayMap] = useState<DayMap>({})
  const [loading, setLoading] = useState(false)

  const isPast = selectedDate < TODAY
  const isReadOnly = false // temporary: allow ticking any day for testing
  const canAdd = !isPast

  // Fetch tasks for the selected day
  useEffect(() => {
    async function load() {
      setLoading(true)
      const existing = await fetchTasksForDate(selectedDate)

      const existingTitles = existing.filter(t => t.is_recurring).map(t => t.title)
      const missing = RECURRING_TITLES.filter(title => !existingTitles.includes(title))
      const seeded = await Promise.all(
        missing.map(title =>
          createTask({ title, date: selectedDate, is_recurring: true, is_done: false, notes: '' })
        )
      )

      setTasks([...existing, ...seeded])
      setLoading(false)
    }
    load()
  }, [selectedDate])

  // Fetch all tasks for the visible month → build DayMap for badges + consistency graph
  useEffect(() => {
    async function loadMonth() {
      const monthTasks = await fetchTasksForMonth(viewMonth)
      const map: DayMap = {}
      for (const task of monthTasks) {
        if (!map[task.date]) map[task.date] = { done: 0, total: 0 }
        map[task.date].total++
        if (task.is_done) map[task.date].done++
      }
      setDayMap(map)
    }
    loadMonth()
  }, [viewMonth])

  // After a task is toggled, also update dayMap so badges stay in sync
  function syncDayMap(date: string, updatedTasks: Task[]) {
    const done = updatedTasks.filter(t => t.is_done).length
    const total = updatedTasks.length
    setDayMap(prev => ({ ...prev, [date]: { done, total } }))
  }

  async function handleToggle(id: number, currentDone: boolean) {
    const updated = await updateTask(id, { is_done: !currentDone })
    const nextTasks = tasks.map(t => (t.id === id ? updated : t))
    setTasks(nextTasks)
    syncDayMap(selectedDate, nextTasks)
  }

  async function handleAddTask(title: string) {
    const created = await createTask({ title, date: selectedDate, is_recurring: false, is_done: false, notes: '' })
    const nextTasks = [...tasks, created]
    setTasks(nextTasks)
    syncDayMap(selectedDate, nextTasks)
  }

  async function handleUpdateNotes(id: number, notes: string) {
    const updated = await updateTask(id, { notes })
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
  }

  async function handleDelete(id: number) {
    await deleteTask(id)
    const nextTasks = tasks.filter(t => t.id !== id)
    setTasks(nextTasks)
    syncDayMap(selectedDate, nextTasks)
  }

  const todayTasks = selectedDate === TODAY ? tasks : []
  const todayCompleted = todayTasks.filter(t => t.is_done).length

  return (
    <div className="app">
      <h1>Productivity</h1>
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        viewMonth={viewMonth}
        onViewMonthChange={setViewMonth}
        dayMap={dayMap}
      />
      {loading ? (
        <p style={{ marginTop: 24, color: '#888' }}>Loading…</p>
      ) : (
        <Checklist
          tasks={tasks}
          isReadOnly={isReadOnly}
          isPast={isPast}
          canAdd={canAdd}
          onToggle={handleToggle}
          onAddTask={handleAddTask}
          onUpdateNotes={handleUpdateNotes}
          onDelete={handleDelete}
        />
      )}
      <ProgressGraph completed={todayCompleted} total={todayTasks.length} />
      <ConsistencyGraph dayMap={dayMap} viewMonth={viewMonth} />
    </div>
  )
}

export default App
