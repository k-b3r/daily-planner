import { useEffect, useState } from 'react'
import Calendar from './Calendar'
import Checklist, { ChecklistSkeleton } from './Checklist'
import ProgressGraph from './ProgressGraph'
import ConsistencyGraph from './ConsistencyGraph'
import HabitsPage from './HabitsPage'
import { fetchTasksForDate, fetchTasksForMonth, fetchRecurringTasks, addTask, createHabitEntry, updateTask, deleteTask, Task, RecurringTask } from './api'
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
  const [view, setView] = useState<'home' | 'habits'>('home')
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [viewMonth, setViewMonth] = useState(toViewMonth(TODAY))
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [dayMap, setDayMap] = useState<DayMap>({})
  const [loading, setLoading] = useState(false)

  function shiftDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const isPast = selectedDate < TODAY
  const isReadOnly = false
  const canAdd = !isPast

  useEffect(() => {
    fetchRecurringTasks().then(setRecurringTasks)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const existing = await fetchTasksForDate(selectedDate)
      const existingTemplateIds = new Set(existing.filter(t => t.recurring_task !== null).map(t => t.recurring_task))
      const weekday = (new Date(selectedDate + 'T00:00:00').getDay() + 6) % 7
      const applicable = recurringTasks.filter(rt =>
        selectedDate >= rt.start_date &&
        (rt.end_date === null || selectedDate <= rt.end_date) &&
        (rt.days.length === 0 || rt.days.includes(weekday))
      )
      const missing = applicable.filter(rt => !existingTemplateIds.has(rt.id))
      const seeded = await Promise.all(
        missing.map(rt => createHabitEntry(rt, selectedDate))
      )
      setTasks([...existing, ...seeded])
      setLoading(false)
    }
    load()
  }, [selectedDate, recurringTasks])

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
    const created = await addTask({ title, date: selectedDate, is_done: false, notes: '' })
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

  if (view === 'habits') {
    return <HabitsPage onBack={() => setView('home')} recurringTasks={recurringTasks} onRecurringTasksChange={setRecurringTasks} />
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Productivity</h1>
        <button onClick={() => setView('habits')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Habits</button>
      </div>
      <ProgressGraph
        completed={selectedCompleted}
        total={tasks.length}
        selectedDate={selectedDate}
        onClick={() => setCalendarOpen(o => !o)}
        isOpen={calendarOpen}
        onPrev={() => { const d = shiftDate(selectedDate, -1); setSelectedDate(d); setViewMonth(toViewMonth(d)) }}
        onNext={() => { const d = shiftDate(selectedDate, 1); setSelectedDate(d); setViewMonth(toViewMonth(d)) }}
      />
      {calendarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCalendarOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 animate-in slide-in-from-top-2 duration-200" onClick={() => setCalendarOpen(false)}>
            <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
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
      <ConsistencyGraph dayMap={dayMap} viewMonth={viewMonth} onSelectDate={setSelectedDate} />
    </div>
  )
}

export default App
