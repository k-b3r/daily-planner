import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { completionColor } from './utils'

interface Props {
  completed: number
  total: number
  selectedDate: string
  onClick: () => void
  isOpen: boolean
}

function ProgressGraph({ completed, total, selectedDate, onClick, isOpen }: Props) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const label = new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onClick}
      className="w-full text-left mt-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:bg-muted/40 active:scale-[0.99] transition-all"
    >
      <div className="flex justify-between items-center text-sm font-semibold mb-2">
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>{label}</span>
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
