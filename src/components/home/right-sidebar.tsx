import { useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";


const RightSidebar = () => {
  return (
    <div className="w-80 p-4 hidden lg:block bg-white dark:bg-gray-950 h-screen sticky top-0 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
      <div className="mt-6">
        <Calendar />
      </div>
    </div>
  )
}

// Calendar component with theme support
const Calendar = () => {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper to generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days = []

    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: new Date(year, month - 1, 30 - firstDayOfMonth + i + 1).getDate(), currentMonth: false })
    }

    // Add days for current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true })
    }

    // Fill remaining slots
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, currentMonth: false })
    }

    return days
  }

  const days = getDaysInMonth(currentMonth)

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
  }

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border border-border p-4 rounded-lg shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <button
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            &lt;
          </button>
          <h3 className="font-medium">
            {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
          </h3>
          <button
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(day => (
            <div key={day} className="text-xs text-muted-foreground font-medium py-1">{day}</div>
          ))}

          {days.map((day, index) => (
            <div
              key={index}
              className={`
                text-sm p-1 rounded-full w-7 h-7 flex items-center justify-center transition-colors cursor-pointer
                ${!day.currentMonth ? 'text-muted-foreground/50' : ''}
                ${day.currentMonth && isToday(day.day) ? 'bg-primary text-primary-foreground' : ''}
                ${day.currentMonth && !isToday(day.day) ? 'hover:bg-muted' : ''}
              `}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default RightSidebar;
