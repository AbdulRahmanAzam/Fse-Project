import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { CalendarIcon, LinkIcon, Upload } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SpecialDate {
  day: number;
  month: number;
  year: number;
  title: string;
}

interface EventData {
  title: string;
  description: string;
  link: string;
  image: File | null;
}

const RightSidebar = () => {
  const [showEventsDialog, setShowEventsDialog] = useState(false);

  return (
    <div className="w-80 p-4 hidden lg:block bg-white dark:bg-gray-950 h-screen sticky top-0 overflow-y-auto">
      {/* Calendar Component */}
      <div className="mt-6">
        <Calendar />
      </div>

      {/* View All Events Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => setShowEventsDialog(true)}
          className="w-full"
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          View All Events
        </Button>
      </div>

      {/* All Events Dialog */}
      <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upcoming University Events</DialogTitle>
            <DialogDescription>
              All planned events for the upcoming weeks
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 180px)' }}>
            <AllEvents />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add the AllEvents component
const AllEvents = () => {
  // Get all events from specialDates in the Calendar component
  // For demo purposes, we'll create mock events
  const events = [
    {
      id: '1',
      title: 'Tech Conference',
      description: 'Join us for the annual university tech conference featuring industry leaders and innovative showcases from our students.',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaCUyMGNvbmZlcmVuY2V8ZW58MHx8MHx8fDA%3D'
    },
    {
      id: '2',
      title: 'Cultural Festival',
      description: 'Experience diverse cultural performances, food stalls, and interactive exhibits celebrating our multicultural campus community.',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVzdGl2YWx8ZW58MHx8MHx8fDA%3D'
    },
    {
      id: '3',
      title: 'Alumni Networking Night',
      description: 'Connect with successful alumni, build your professional network, and explore potential career opportunities.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
      image: 'https://images.unsplash.com/photo-1539127670104-5bc08f3d0ff6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmV0d29ya2luZyUyMGV2ZW50fGVufDB8fDB8fHww'
    },
    {
      id: '4',
      title: 'Hackathon 2023',
      description: 'Put your coding skills to the test in this 48-hour hackathon. Solve real-world problems and compete for amazing prizes.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 12),
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFja2F0aG9ufGVufDB8fDB8fHww'
    },
    {
      id: '5',
      title: 'Research Symposium',
      description: 'Discover groundbreaking research from our faculty and students. Poster presentations and keynote speakers from various disciplines.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 18),
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzZWFyY2h8ZW58MHx8MHx8fDA%3D'
    }
  ];

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 py-2">
      {sortedEvents.map(event => (
        <div
          key={event.id}
          className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="sm:w-1/3 h-40 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {event.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm">{event.description}</p>

            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="default">
                <CalendarIcon className="mr-2 h-3 w-3" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar component with theme support
const Calendar = () => {
  const { theme } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    link: '',
    image: null
  })

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Set special dates for university events
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([
    { day: 25, month: new Date().getMonth(), year: new Date().getFullYear(), title: "Tech Conference" }
  ])

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

  const isSpecialDay = (day: number) => {
    return specialDates.some(date =>
      date.day === day &&
      date.month === currentMonth.getMonth() &&
      date.year === currentMonth.getFullYear()
    )
  }

  const handleDayDoubleClick = (day: number) => {
    if (!day) return

    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setEventDate(selectedDate)
    setShowEventDialog(true)
  }

  const handleCreateEvent = () => {
    console.log("Event created:", { date: eventDate, ...eventData })
    // Here you would typically save this to your backend
    // For now, we'll just add it to our special dates
    if (eventDate) {
      const newSpecialDate: SpecialDate = {
        day: eventDate.getDate(),
        month: eventDate.getMonth(),
        year: eventDate.getFullYear(),
        title: eventData.title
      }

      setSpecialDates([...specialDates, newSpecialDate])
    }

    // Reset form
    setEventData({
      title: '',
      description: '',
      link: '',
      image: null
    })
    setShowEventDialog(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventData({ ...eventData, image: e.target.files[0] })
    }
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
                ${day.currentMonth && isSpecialDay(day.day) ? 'bg-blue-600 text-white' : ''}
                ${day.currentMonth && !isToday(day.day) && !isSpecialDay(day.day) ? 'hover:bg-muted' : ''}
              `}
              onDoubleClick={() => day.currentMonth && handleDayDoubleClick(day.day)}
            >
              {day.day}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>Double-click on a date to add an event</p>
        </div>
      </div>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create University Event</DialogTitle>
            <DialogDescription>
              {eventDate ? (
                <>Add details for event on {eventDate.toLocaleDateString()}</>
              ) : (
                <>Select a date to add an event</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                className="col-span-3"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-desc" className="text-right">
                Description
              </Label>
              <Textarea
                id="event-desc"
                className="col-span-3"
                value={eventData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventData({ ...eventData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-link" className="text-right">
                Link
              </Label>
              <div className="col-span-3 flex">
                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <Input
                  id="event-link"
                  className="rounded-l-none"
                  placeholder="https://"
                  value={eventData.link}
                  onChange={(e) => setEventData({ ...eventData, link: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Label
                  htmlFor="event-image"
                  className="flex items-center gap-2 p-2 border border-dashed border-input rounded-md hover:bg-muted cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{eventData.image ? eventData.image.name : "Upload event image"}</span>
                  <Input
                    id="event-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RightSidebar;
