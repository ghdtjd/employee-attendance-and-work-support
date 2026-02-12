import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarProps {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  hasEvent?: (date: Date) => boolean
}

export function Calendar({ mode = 'single', selected, onSelect, className, hasEvent }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selected || new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    console.log("=== Calendar handleDateClick ===")
    console.log("  day:", day)
    console.log("  currentDate:", currentDate)
    console.log("  newDate:", newDate)
    onSelect?.(newDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentDate.getMonth() &&
      selected.getFullYear() === currentDate.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <Button
        key={day}
        variant={isSelected(day) ? 'default' : 'ghost'}
        className={cn(
          'h-9 w-9 p-0 font-normal relative',
          isToday(day) && !isSelected(day) && 'bg-accent text-accent-foreground',
          isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
        onClick={() => handleDateClick(day)}
      >
        <span>{day}</span>
        {hasEvent?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) && (
          <div className={cn(
            "absolute bottom-1 w-1 h-1 rounded-full",
            isSelected(day) ? "bg-primary-foreground" : "bg-primary"
          )} />
        )}
      </Button>
    )
  }

  return (
    <div className={cn('p-3', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-9 w-9 text-center text-[0.8rem] font-normal text-muted-foreground flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>
      </div>
    </div>
  )
}
