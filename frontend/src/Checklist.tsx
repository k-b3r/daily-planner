import { useState } from 'react'
import { Task } from './api'

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
    <div className="checklist">
      <p className="checklist-progress">{completed} / {tasks.length} done</p>

      {[...recurring, ...oneOff].map(task => (
        <div key={task.id} className="checklist-item">
          <div className="checklist-row">
            <label className={task.is_done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => onToggle(task.id, task.is_done)}
                disabled={isReadOnly}
              />
              {task.title}
            </label>
            <div className="checklist-actions">
              {task.is_recurring && <span className="tag">recurring</span>}
              <button className="btn-note" onClick={() => toggleExpand(task.id)}>
                {expandedId === task.id ? 'hide note' : 'note'}
              </button>
              {!task.is_recurring && !isReadOnly && (
                <button className="btn-delete" onClick={() => onDelete(task.id)}>✕</button>
              )}
            </div>
          </div>

          {expandedId === task.id && (
            <textarea
              className="task-notes"
              placeholder="Add a note…"
              value={task.notes}
              onChange={e => onUpdateNotes(task.id, e.target.value)}
              disabled={isReadOnly}
            />
          )}
        </div>
      ))}

      {canAdd && (
        <form onSubmit={handleAdd} className="checklist-form">
          <input
            type="text"
            placeholder="Add a task for this day…"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}

      {isPast && <p className="readonly-notice">Past day — read only</p>}
    </div>
  )
}

export default Checklist
