import { useState } from 'react'
import { Task } from './api'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { NotebookPen } from 'lucide-react'

export function ChecklistSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface Props {
  tasks: Task[]
  isReadOnly: boolean
  isPast: boolean
  canAdd: boolean
  onToggle: (id: number, currentDone: boolean) => void
  onAddTask: (title: string) => void
  onUpdateNotes: (id: number, notes: string) => void
  onDelete: (id: number) => void
}

function NoteField({ id, notes, isReadOnly, onUpdateNotes, onClose }: { id: number; notes: string; isReadOnly: boolean; onUpdateNotes: (id: number, notes: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(notes)
  return (
    <Textarea
      className="mt-2 text-sm min-h-[60px]"
      placeholder="Add a note…"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => { onUpdateNotes(id, value); onClose() }}
      disabled={isReadOnly}
    />
  )
}

function Checklist({ tasks, isReadOnly, isPast, canAdd, onToggle, onAddTask, onUpdateNotes, onDelete }: Props) {
  const [newTask, setNewTask] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const recurring = tasks.filter(t => t.is_recurring)
  const oneOff = tasks.filter(t => !t.is_recurring)
  const completed = tasks.filter(t => t.is_done).length

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    onAddTask(newTask.trim())
    setNewTask('')
  }

  function toggleExpand(id: number) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">{completed} / {tasks.length} done</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {[...recurring, ...oneOff].map(task => (
          <div key={task.id}>
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 cursor-pointer text-sm ${task.is_done ? 'line-through text-muted-foreground' : ''}`}>
                <Checkbox
                  checked={task.is_done}
                  onCheckedChange={() => onToggle(task.id, task.is_done)}
                  disabled={isReadOnly}
                />
                {task.title}
                {task.notes && (
                  <span className="relative group/note -mt-2 -ml-1">
                    <NotebookPen className="w-3 h-3 text-muted-foreground cursor-default" />
                    <span className="absolute bottom-full left-0 mb-1 w-48 bg-popover text-popover-foreground text-[11px] px-2 py-1.5 rounded shadow whitespace-pre-wrap opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none z-10">
                      {task.notes}
                    </span>
                  </span>
                )}
                {task.is_recurring && (
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">recurring</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground" onClick={() => toggleExpand(task.id)}>
                  {expandedId === task.id ? 'hide note' : 'note'}
                </Button>
                {!task.is_recurring && !isReadOnly && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id)}>
                    ✕
                  </Button>
                )}
              </div>
            </div>
            {expandedId === task.id && (
              <NoteField id={task.id} notes={task.notes} isReadOnly={isReadOnly} onUpdateNotes={onUpdateNotes} onClose={() => setExpandedId(null)} />
            )}
          </div>
        ))}

        {canAdd && (
          <form onSubmit={handleAdd} className="flex gap-2 mt-2">
            <Input
              placeholder="Add a task for this day…"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" size="sm">Add</Button>
          </form>
        )}

        {isPast && <p className="text-xs text-muted-foreground mt-1">Past day — read only</p>}
      </CardContent>
    </Card>
  )
}

export default Checklist
