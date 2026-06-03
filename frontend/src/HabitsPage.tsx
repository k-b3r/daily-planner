import { useState } from 'react'
import { RecurringTask, addHabit, updateHabit, deleteHabit } from './api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  onBack: () => void
  recurringTasks: RecurringTask[]
  onRecurringTasksChange: (tasks: RecurringTask[]) => void
}

function DaySelector({ selected, onChange }: { selected: number[]; onChange: (days: number[]) => void }) {
  const isEveryDay = selected.length === 0

  function toggleDay(i: number) {
    if (selected.includes(i)) {
      onChange(selected.filter(d => d !== i))
    } else {
      onChange([...selected, i].sort())
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`px-2 py-0.5 rounded text-xs transition-colors ${isEveryDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
      >
        Every day
      </button>
      {DAYS.map((day, i) => (
        <button
          key={day}
          type="button"
          onClick={() => { if (isEveryDay) { onChange([i]); return; } toggleDay(i) }}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${!isEveryDay && selected.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          {day}
        </button>
      ))}
    </div>
  )
}

function HabitRow({ habit, onUpdate, onDelete }: { habit: RecurringTask; onUpdate: (h: RecurringTask) => void; onDelete: () => void }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(habit.title)
  const [notes, setNotes] = useState(habit.notes)
  const [pendingDays, setPendingDays] = useState<number[]>(habit.days)
  const [pendingEndDate, setPendingEndDate] = useState<string>(habit.end_date ?? '')
  const [settingEnd, setSettingEnd] = useState(false)
  const [confirmAction, setConfirmAction] = useState<null | 'days' | 'endDate'>(null)

  const daysChanged = JSON.stringify(pendingDays) !== JSON.stringify(habit.days)
  const endDateChanged = pendingEndDate !== (habit.end_date ?? '')

  async function saveTitle() {
    if (title.trim() && title !== habit.title) {
      const updated = await updateHabit(habit.id, { title: title.trim() })
      onUpdate(updated)
    }
    setEditingTitle(false)
  }

  async function saveNotes() {
    if (notes !== habit.notes) {
      const updated = await updateHabit(habit.id, { notes })
      onUpdate(updated)
    }
  }

  async function applyDays() {
    const updated = await updateHabit(habit.id, { days: pendingDays })
    onUpdate(updated)
    setConfirmAction(null)
  }

  async function applyEndDate() {
    const updated = await updateHabit(habit.id, { end_date: pendingEndDate || null })
    onUpdate(updated)
    setConfirmAction(null)
    setSettingEnd(false)
  }

  function cancelDays() {
    setPendingDays(habit.days)
    setConfirmAction(null)
  }

  function cancelEndDate() {
    setPendingEndDate(habit.end_date ?? '')
    setConfirmAction(null)
  }

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between gap-2">
        {editingTitle ? (
          <Input
            className="h-7 text-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => e.key === 'Enter' && saveTitle()}
            autoFocus
          />
        ) : (
          <span className="text-sm font-medium cursor-pointer hover:text-muted-foreground" onClick={() => setEditingTitle(true)}>
            {habit.title}
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0" onClick={onDelete}>✕</Button>
      </div>

      <DaySelector selected={pendingDays} onChange={setPendingDays} />
      {daysChanged && (
        <div className="flex gap-2">
          <Button size="sm" className="h-6 text-xs px-2" onClick={() => setConfirmAction('days')}>Apply</Button>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={cancelDays}>Cancel</Button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{habit.start_date}</span>
        <span>→</span>
        {pendingEndDate ? (
          <>
            <input
              type="date"
              className="bg-transparent border-b border-border text-xs focus:outline-none"
              value={pendingEndDate}
              min={habit.start_date}
              onChange={e => setPendingEndDate(e.target.value)}
            />
            <button className="hover:text-foreground" onClick={() => setPendingEndDate('')}>Ongoing</button>
          </>
        ) : settingEnd ? (
          <input
            type="date"
            className="bg-transparent border-b border-border text-xs focus:outline-none"
            min={habit.start_date}
            autoFocus
            onBlur={() => { if (!pendingEndDate) setSettingEnd(false) }}
            onChange={e => { if (e.target.value) setPendingEndDate(e.target.value) }}
          />
        ) : (
          <button className="hover:text-foreground underline underline-offset-2" onClick={() => setSettingEnd(true)}>Ongoing</button>
        )}
      </div>
      {endDateChanged && (
        <div className="flex gap-2">
          <Button size="sm" className="h-6 text-xs px-2" onClick={() => setConfirmAction('endDate')}>Apply</Button>
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={cancelEndDate}>Cancel</Button>
        </div>
      )}

      <Textarea
        className="text-xs min-h-[48px] resize-none"
        placeholder="Add a note…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={saveNotes}
      />

      <AlertDialog open={confirmAction === 'days'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update habit schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              Future task entries outside the new day schedule will be deleted. Past entries are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDays}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyDays}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'endDate'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update end date?</AlertDialogTitle>
            <AlertDialogDescription>
              Future task entries outside the new date range will be deleted. Past entries are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEndDate}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyEndDate}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function HabitsPage({ onBack, recurringTasks, onRecurringTasksChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDays, setNewDays] = useState<number[]>([])
  const [newStartDate, setNewStartDate] = useState(todayString())
  const [newEndDate, setNewEndDate] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const habit = await addHabit({
      title: newTitle.trim(),
      days: newDays,
      start_date: newStartDate,
      end_date: newEndDate || null,
      notes: newNotes,
    })
    onRecurringTasksChange([...recurringTasks, habit])
    setNewTitle('')
    setNewDays([])
    setNewStartDate(todayString())
    setNewEndDate('')
    setNewNotes('')
    setAdding(false)
  }

  function handleUpdate(updated: RecurringTask) {
    onRecurringTasksChange(recurringTasks.map(h => h.id === updated.id ? updated : h))
  }

  async function handleDelete(id: number) {
    await deleteHabit(id)
    onRecurringTasksChange(recurringTasks.filter(h => h.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Habits</h1>
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
      </div>

      <Card>
        <CardContent className="pb-2">
          {recurringTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No habits yet. Add one below.</p>
          )}
          {recurringTasks.map(habit => (
            <HabitRow key={habit.id} habit={habit} onUpdate={handleUpdate} onDelete={() => setConfirmDelete(habit.id)} />
          ))}
        </CardContent>
      </Card>

      <div className="mt-3">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add habit
          </button>
        ) : (
          <Card>
            <CardContent className="pt-4">
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <Input
                  placeholder="Habit name…"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="text-sm"
                  autoFocus
                />
                <DaySelector selected={newDays} onChange={setNewDays} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>From</span>
                  <input
                    type="date"
                    className="bg-transparent border-b border-border text-xs focus:outline-none"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                  />
                  <span>→</span>
                  {newEndDate ? (
                    <>
                      <input
                        type="date"
                        className="bg-transparent border-b border-border text-xs focus:outline-none"
                        value={newEndDate}
                        min={newStartDate}
                        onChange={e => setNewEndDate(e.target.value)}
                      />
                      <button type="button" className="hover:text-foreground" onClick={() => setNewEndDate('')}>Ongoing</button>
                    </>
                  ) : (
                    <button type="button" className="hover:text-foreground underline underline-offset-2" onClick={() => setNewEndDate(newStartDate)}>Ongoing</button>
                  )}
                </div>
                <Textarea
                  className="text-xs min-h-[48px] resize-none"
                  placeholder="Add a note…"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Add habit</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={confirmDelete !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              Future task entries for this habit will be deleted. Past entries are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HabitsPage
