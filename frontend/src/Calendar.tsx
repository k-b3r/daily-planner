import { useState, useEffect } from 'react'
import { DayMap } from './App'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { completionColor } from './utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleString('default', { month: 'short', day: 'numeric' })
}

function currentWeekMonday(): string {
  const d = new Date()
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  selectedDate: string
  onSelectDate: (date: string) => void
  viewMonth: string
  onViewMonthChange: (month: string) => void
  dayMap: DayMap
  calendarView: 'month' | 'week'
}

function Calendar({ selectedDate, onSelectDate, viewMonth, onViewMonthChange, dayMap, calendarView }: Props) {
  const today = new Date()
  const todayString = toDateString(today.getFullYear(), today.getMonth(), today.getDate())

  const [selectedWeek, setSelectedWeek] = useState(currentWeekMonday)

  const [viewYear, viewMonthIndex] = viewMonth.split('-').map(Number)
  const month0 = viewMonthIndex - 1

  useEffect(() => {
    setSelectedWeek(currentWeekMonday())
  }, [calendarView, viewMonth])

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
  const firstOfMonth = `${viewMonth}-01`
  const lastOfMonth = `${viewMonth}-${String(daysInMonth).padStart(2, '0')}`

  // Build week rows for the current viewMonth
  function buildWeeks(): string[] {
    const rawFirst = new Date(viewYear, month0, 1).getDay()
    const offset = (rawFirst + 6) % 7
    const weeks: string[] = []
    let cursor = new Date(viewYear, month0, 1 - offset)
    while (true) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      weeks.push(iso)
      const sunOfWeek = addDays(iso, 6)
      cursor.setDate(cursor.getDate() + 7)
      const nextIso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      if (nextIso > lastOfMonth && sunOfWeek >= lastOfMonth) break
    }
    return weeks
  }

  const weeks = buildWeeks()

  // Month grid cells
  const rawFirst = new Date(viewYear, month0, 1).getDay()
  const firstWeekday = (rawFirst + 6) % 7
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <Card>
      <CardContent className="pt-3 pb-2 px-3">
        {/* Header — month nav always visible */}
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={prevMonth}>‹</Button>
          <span className="text-sm font-semibold">{monthLabel}</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={nextMonth}>›</Button>
        </div>

        {/* Month view */}
        {calendarView === 'month' && (
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAYS.map(d => (
              <div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>
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
                  onClick={() => onSelectDate(dateStr)}
                  className={[
                    'flex flex-col items-center justify-center rounded py-0.5 text-xs leading-tight transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                    isToday && !isSelected ? 'font-bold text-primary' : '',
                    isPast && !isSelected ? 'text-muted-foreground' : '',
                  ].join(' ')}
                >
                  <span>{day}</span>
                  {badge && badge.total > 0 && (
                    <span className="text-[10px]" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : completionColor(badge.done, badge.total) }}>
                      {badge.done}/{badge.total}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Week view */}
        {calendarView === 'week' && (
          <>
            {/* Week range row */}
            <div className="flex gap-1 mb-2">
              {weeks.map(mondayStr => {
                const sunStr = addDays(mondayStr, 6)
                const displayStart = mondayStr < firstOfMonth ? firstOfMonth : mondayStr
                const displayEnd = sunStr > lastOfMonth ? lastOfMonth : sunStr

                let done = 0; let total = 0
                for (let i = 0; i <= 6; i++) {
                  const d = addDays(mondayStr, i)
                  if (d >= firstOfMonth && d <= lastOfMonth) {
                    const entry = dayMap[d]
                    if (entry) { done += entry.done; total += entry.total }
                  }
                }

                const isSelected = selectedWeek === mondayStr
                const startDay = new Date(displayStart + 'T00:00:00').getDate()
                const endDay = new Date(displayEnd + 'T00:00:00').getDate()

                return (
                  <button
                    key={mondayStr}
                    onClick={() => setSelectedWeek(mondayStr)}
                    className={[
                      'flex-1 flex flex-col items-center px-1 py-1.5 rounded text-[10px] leading-tight transition-colors',
                      isSelected ? 'bg-muted font-medium' : 'hover:bg-muted/60 text-muted-foreground',
                    ].join(' ')}
                  >
                    <span>{startDay} – {endDay}</span>
                    {total > 0 && (
                      <span className="text-[10px] mt-0.5" style={{ color: completionColor(done, total) }}>
                        {done}/{total}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Horizontal day strip for selected week */}
            <div className="grid grid-cols-7 gap-0.5 text-center border-t pt-2">
              {DAYS.map(d => (
                <div key={d} className="text-[10px] text-muted-foreground py-0.5">{d}</div>
              ))}
              {Array.from({ length: 7 }, (_, i) => {
                const dateStr = addDays(selectedWeek, i)
                const day = new Date(dateStr + 'T00:00:00').getDate()
                const isToday = dateStr === todayString
                const isPast = dateStr < todayString
                const isSelected = dateStr === selectedDate
                const badge = dayMap[dateStr]

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    className={[
                      'flex flex-col items-center justify-center rounded py-0.5 text-xs leading-tight transition-colors',
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                      isToday && !isSelected ? 'font-bold text-primary' : '',
                      isPast && !isSelected ? 'text-muted-foreground' : '',
                    ].join(' ')}
                  >
                    <span>{day}</span>
                    {badge && badge.total > 0 && (
                      <span className="text-[10px]" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : completionColor(badge.done, badge.total) }}>
                        {badge.done}/{badge.total}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default Calendar
