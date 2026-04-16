import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { completionColor } from './utils'

interface Props {
  completed: number
  total: number
  selectedDate: string
}

function ProgressGraph({ completed, total, selectedDate }: Props) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const label = new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%`, backgroundColor: completionColor(completed, total) }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{completed} of {total} tasks completed</p>
      </CardContent>
    </Card>
  )
}

export default ProgressGraph
