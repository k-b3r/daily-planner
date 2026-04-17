import { DayMap } from './App'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { completionColor } from './utils'

interface Props {
  dayMap: DayMap
  viewMonth: string
}

function ConsistencyGraph({ dayMap, viewMonth }: Props) {
  const [year, month] = viewMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${viewMonth}-${String(day).padStart(2, '0')}`
    const entry = dayMap[dateStr]
    const percent = entry && entry.total > 0 ? Math.round((entry.done / entry.total) * 100) : 0
    const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' })
    const tooltip = entry && entry.total > 0 ? `${dateLabel} · ${entry.done}/${entry.total} done` : `${dateLabel} · No tasks`
    const color = entry && entry.total > 0 ? completionColor(entry.done, entry.total) : undefined
    return { day, dateStr, percent, tooltip, color }
  })

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <p className="text-sm font-semibold">Consistency — {viewMonth}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {/* Y-axis */}
          <div className="flex flex-col justify-between text-[10px] text-muted-foreground h-20 pr-1 text-right select-none">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>

          {/* Chart area */}
          <div className="relative flex-1">
            {/* Guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-dashed border-border/50 h-0" />
              <div className="border-t border-dashed border-border/50 h-0" />
              <div className="border-t border-border/50 h-0" />
            </div>

            <div className="flex items-end gap-[3px] h-20">
              {days.map(({ day, dateStr, percent, tooltip, color }) => (
                <div
                  key={dateStr}
                  className="relative flex flex-col items-center justify-end h-full flex-1 group"
                  title={tooltip}
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 group-hover:brightness-75"
                    style={{
                      height: `${percent}%`,
                      minHeight: percent > 0 ? '3px' : '0',
                      backgroundColor: color ?? 'hsl(0,0%,88%)',
                    }}
                  />
                  {day % 5 === 0 && (
                    <span className="absolute -bottom-4 text-[10px] text-muted-foreground">{day}</span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {tooltip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConsistencyGraph
