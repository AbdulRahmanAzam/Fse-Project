import { useState } from 'react'
import { useTheme } from '../components/theme/theme-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Upload,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { Link, useNavigate } from 'react-router-dom'

// Types for special dates
interface SpecialDate {
  day: number;
  month: number;
  year: number;
  title: string;
}

// Types for event data
interface EventData {
  title: string;
  description: string;
  link: string;
  image: File | null;
}

// Type for Post
interface Post {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    role: string;
    avatar?: string;
  };
  community: {
    id: number;
    name: string;
    tags: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  image?: string;
}

interface Community {
  id: number;
  name: string;
  description: string;
  tags: string;
  members: number;
  isMember: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

const HomePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto py-4 px-2">
          <FeedComponent />
        </div>
      </main>

      {/* Right Sidebar with Calendar */}
      <RightSidebar />
    </div>
  )
}

const useCommunitiesQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mycommunities'],
    queryFn: () => api.get('user/communities')
  })
  return { data: (data?.data?.communities || []) as Community[], isLoading, error, refetch }
}

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { data: communities, isLoading, error, refetch } = useCommunitiesQuery();

  return (
    <div className="w-64 p-4 hidden md:block bg-white dark:bg-gray-950 h-screen sticky top-0">
      <div className="flex items-center mb-8">
        <img src="../src/assets/genz-logo2.png" alt="" className='w-10 h-10' />
        <h1 className="text-2xl font-bold">GenZ Scholars</h1>
        <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
      </div>

      <nav className="space-y-2">
        <NavItem icon="🏠" label="Home" href="/" active />
        <NavItem icon="👤" label="Profile" href="/profile" />
        <NavItem icon="🔍" label="Explore Communities" href="/communities" />
        <NavItem icon="🤝" label="Friends" href="/friends" />
      </nav>

      
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">My Communities</h2>
        <div className="space-y-3">
          {error ? (
            <div className='flex flex-col gap-2'>
              <p className="text-sm text-red-500 dark:text-red-400">Error loading communities</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-10 rounded-lg" />
            ))
          ) : communities.length > 0 ? (
            communities.map((community) => (
              <CommunityItem key={community.id} community={community} />
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No communities found</p>
          )}
        </div>
        <Button
          variant="link"
          className="mt-4 w-full text-sm text-primary flex justify-center py-2"
          onClick={() => navigate('/profile')}
        >
          See All
        </Button>
      </div>
    </div>
  )
}

const NavItem = ({ icon, label, href, active = false }: { icon: string; label: string; href: string; active?: boolean }) => {
  return (
    <Link
      to={href}
      className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 ${active ? 'bg-gray-100 dark:bg-gray-900' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      <span className={`${active ? 'font-medium' : ''}`}>{label}</span>
    </Link>
  )
}

const CommunityItem = ({ community }: { community: Community }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      className="flex items-center w-full justify-start py-7"
      onClick={() => navigate(`/community/${community.id}`)}
    >
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
      <div className="ml-2">
        <p className="text-sm font-medium">{community.name}</p>
        <p className="text-xs text-gray-500">{community.members} members</p>
      </div>
    </Button>
  )
}

const VoteButtons = ({
  post,
  handleVote
}: {
  post: Post,
  handleVote: (postId: number, voteType: 'up' | 'down') => void
}) => {
  return (
    <Button
      variant="ghost"
      className="flex px-1 hover:bg-accent/50"
    >
      <div
        className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", post.userVote === 'up' && 'text-green-500')}
        onClick={() => handleVote(post.id, 'up')}
      >
        <ArrowUp className="w-4 h-4" />
      </div>
      <span className="text-sm">{post.upvotes - post.downvotes}</span>
      <div
        className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", post.userVote === 'down' && 'text-red-500')}
        onClick={() => handleVote(post.id, 'down')}
      >
        <ArrowDown className="w-4 h-4" />
      </div>
    </Button>
  )
}

const PostOverview = ({
  post,
  handleVote,
}: {
  post: Post,
  handleVote: (postId: number, voteType: 'up' | 'down') => void,
}) => {
  const voteDifference = post.upvotes - post.downvotes;
  const [isOpen, setIsOpen] = useState(voteDifference >= 0);

  return (
    <div className="flex items-start gap-1">
      {!isOpen && <div className='flex items-center gap-1'>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-0 w-6 h-6 flex items-center justify-center hover:bg-accent/50"
          onClick={() => setIsOpen(true)}
        >
          +
        </Button>
        <p className='text-sm text-muted-foreground'>Post hidden</p>
      </div>}

      <div className="flex-1">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <CollapsibleContent>
            <article key={post.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {post.image ? (
                    <img src={post.image} alt="Post" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="rounded-full w-5 h-5 bg-gray-300" />
                  )}
                  <Button variant="link" className="text-sm">{post.community.name}</Button>
                  <Label className="text-sm text-gray-500">{formatTime(new Date(post.createdAt))}</Label>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent/50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsOpen(false)}>
                      Hide post
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Save
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col justify-between my-2 space-y-2">
                <h1 className="text-lg font-bold truncate">{post.title}</h1>
                <p className="line-clamp-5 text-sm text-gray-700 dark:text-gray-300">{post.content}</p>
              </div>

              {post.image && (
                <div className="rounded-lg overflow-hidden mb-4">
                  <img src={post.image} alt="Post" className="w-full" />
                </div>
              )}

              <div className="flex items-center space-x-1">
                <VoteButtons post={post} handleVote={handleVote} />
                <Button
                  variant="ghost"
                  className="text-sm text-gray-500"
                  onClick={() => { }}
                >
                  Comments
                </Button>
              </div>
            </article>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

const usePostsQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/post/relevant')
  })
  return { data: (data?.data?.posts || []) as Post[], isLoading, error, refetch }
}

const FeedComponent = () => {
  const { toast } = useToast()
  const { data: posts, isLoading, error, refetch } = usePostsQuery();

  const queryClient = useQueryClient();

  const { mutate: votePost } = useMutation({
    mutationFn: ({ postId, voteType }: { postId: number, voteType: 'up' | 'down' }) => {
      return api.post(`/post/${voteType === 'up' ? 'upvote' : 'downvote'}/${postId}`);
    },
    onMutate: async ({ postId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any) => {
        const updatedPosts = old?.data?.posts?.map((post: Post) => {
          if (post.id === postId) {
            const isSameVote = post.userVote === voteType;
            const isSwitchingVote = post.userVote && post.userVote !== voteType;

            return {
              ...post,
              upvotes: post.upvotes +
                (voteType === 'up' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              downvotes: post.downvotes +
                (voteType === 'down' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              userVote: isSameVote ? undefined : voteType,
            };
          }
          return post;
        }) || [];

        return { data: { posts: updatedPosts } };
      });

      return { previousPosts };
    },
    onError: (error, _variables, context) => {
      if (context?.previousPosts)
        queryClient.setQueryData(['posts'], context.previousPosts);

      error.stack && console.log(error.stack);
      toast({
        title: 'Error',
        description: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    votePost({ postId, voteType });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className='flex flex-col gap-4 items-center justify-center'>
          <p className='text-red-500'>Error loading posts</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className='flex flex-col gap-4'>
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} className='w-full h-32 rounded-lg' />
          ))}
        </div>
      ) : posts.length > 0 ? (
        posts.map((post, index) => <PostOverview key={index} post={post} handleVote={handleVote} />)
      ) : (
        <div className='flex flex-col gap-4 items-center justify-center'>
          <p className='text-gray-500'>Nothing here yet...</p>
          <p className='text-gray-500'>Join a community to see posts!</p>
        </div>
      )}
    </div>
  );
};

// Helper function to format time (e.g., "2d ago")
const formatTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
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

export default HomePage 