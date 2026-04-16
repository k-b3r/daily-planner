import { useEffect, useState } from 'react'
import Calendar from './Calendar'
import Checklist, { ChecklistSkeleton } from './Checklist'
import ProgressGraph from './ProgressGraph'
import ConsistencyGraph from './ConsistencyGraph'
import { fetchTasksForDate, fetchTasksForMonth, createTask, updateTask, deleteTask, Task } from './api'
import { RECURRING_TITLES } from './constants'
export type DayMap = Record<string, { done: number; total: number }>

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toViewMonth(dateStr: string): string {
  return dateStr.slice(0, 7)
}

const TODAY = todayString()

function App() {
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [viewMonth, setViewMonth] = useState(toViewMonth(TODAY))
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [dayMap, setDayMap] = useState<DayMap>({})
  const [loading, setLoading] = useState(false)

  const isPast = selectedDate < TODAY
  const isReadOnly = false // temporary: allow ticking any day for testing
  const canAdd = !isPast

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

  const selectedCompleted = tasks.filter(t => t.is_done).length

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Productivity</h1>
      <ProgressGraph
        completed={selectedCompleted}
        total={tasks.length}
        selectedDate={selectedDate}
        onClick={() => setCalendarOpen(o => !o)}
        isOpen={calendarOpen}
      />
      {calendarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCalendarOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="w-full max-w-lg">
              <div className="flex gap-1 mb-2">
                {(['month', 'week'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setCalendarView(v)}
                    className={`px-3 py-1 rounded text-sm transition-colors capitalize ${calendarView === v ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={date => { setSelectedDate(date); setCalendarOpen(false) }}
                viewMonth={viewMonth}
                onViewMonthChange={setViewMonth}
                dayMap={dayMap}
                calendarView={calendarView}
              />
            </div>
          </div>
        </>
      )}
      {loading ? (
        <ChecklistSkeleton rows={3} />
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
      <ConsistencyGraph dayMap={dayMap} viewMonth={viewMonth} />
    </div>
  )
}

export default App
