import { DayMap } from './App'

interface Props {
  dayMap: DayMap
  viewMonth: string // "YYYY-MM"
}

function ConsistencyGraph({ dayMap, viewMonth }: Props) {
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [year, month] = viewMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${viewMonth}-${String(day).padStart(2, '0')}`
    const entry = dayMap[dateStr]
    const percent = entry && entry.total > 0 ? Math.round((entry.done / entry.total) * 100) : 0
    const tooltip = entry && entry.total > 0 ? `${entry.done}/${entry.total} done` : 'No tasks'
    return { day, dateStr, percent, tooltip }
  })

  return (
    <div className="consistency-graph">
      <p className="consistency-title">Consistency — {viewMonth}</p>
      <div className="consistency-bars">
        {days.map(({ day, dateStr, percent, tooltip }) => (
          <div key={dateStr} className="consistency-bar-wrap">
            <div
              className={['consistency-bar', dateStr === todayString ? 'today' : ''].join(' ').trim()}
              style={{ height: `${percent}%` }}
              title={tooltip}
            />
            {day % 5 === 0 && <span className="bar-label">{day}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConsistencyGraph
