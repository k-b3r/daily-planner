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
    const tooltip = entry && entry.total > 0 ? `${entry.done}/${entry.total} done` : 'No tasks'
    const color = entry && entry.total > 0 ? completionColor(entry.done, entry.total) : undefined
    return { day, dateStr, percent, tooltip, color }
  })

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <p className="text-sm font-semibold">Consistency — {viewMonth}</p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

export default ConsistencyGraph
