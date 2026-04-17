import { completionColor } from './utils'

interface Props {
  completed: number
  total: number
  selectedDate: string
  onClick: () => void
  isOpen: boolean
  onPrev: () => void
  onNext: () => void
}

function ProgressGraph({ completed, total, selectedDate, onClick, isOpen, onPrev, onNext }: Props) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const label = new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onClick}
      className="w-full text-left mt-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:bg-muted/40 active:scale-[0.99] transition-all"
    >
      <div className="flex justify-between items-center text-sm font-semibold mb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            className="text-muted-foreground hover:text-foreground px-2 py-1 text-base transition-colors"
          >‹</button>
          <span>📅</span>
          <span>{label}</span>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            className="text-muted-foreground hover:text-foreground px-2 py-1 text-base transition-colors"
          >›</button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-foreground">{percent}%</span>
          <span className="text-xs">{isOpen ? '▴' : '▾'}</span>
        </div>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: completionColor(completed, total) }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">{completed} of {total} tasks completed</p>
    </button>
  )
}

export default ProgressGraph
