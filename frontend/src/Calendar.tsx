import { DayMap } from './App'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface Props {
  selectedDate: string
  onSelectDate: (date: string) => void
  viewMonth: string // "YYYY-MM"
  onViewMonthChange: (month: string) => void
  dayMap: DayMap
}

function Calendar({ selectedDate, onSelectDate, viewMonth, onViewMonthChange, dayMap }: Props) {
  const today = new Date()
  const todayString = toDateString(today.getFullYear(), today.getMonth(), today.getDate())

  const [viewYear, viewMonthIndex] = viewMonth.split('-').map(Number)
  const month0 = viewMonthIndex - 1 // convert to 0-based for JS Date

  function prevMonth() {
    const d = new Date(viewYear, month0 - 1)
    onViewMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  function nextMonth() {
    const d = new Date(viewYear, month0 + 1)
    onViewMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = new Date(viewYear, month0).toLocaleString('default', {
    month: 'long', year: 'numeric',
  })

  const daysInMonth = new Date(viewYear, month0 + 1, 0).getDate()
  const rawFirst = new Date(viewYear, month0, 1).getDay()
  const firstWeekday = (rawFirst + 6) % 7

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>‹</button>
        <span>{monthLabel}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr = toDateString(viewYear, month0, day)
          const isToday = dateStr === todayString
          const isPast = dateStr < todayString
          const isSelected = dateStr === selectedDate
          const badge = dayMap[dateStr]

          return (
            <button
              key={dateStr}
              className={['calendar-day', isToday ? 'today' : '', isPast ? 'past' : '', isSelected ? 'selected' : ''].join(' ').trim()}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="day-number">{day}</span>
              {badge && badge.total > 0 && (
                <span className="day-badge">{badge.done}/{badge.total}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
